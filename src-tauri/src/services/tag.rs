use rusqlite::params;
use ulid::Ulid;
use crate::models::tag::Tag;
use crate::services::database::DatabaseService;
use crate::errors::Result;
use serde::Serialize;

#[derive(Serialize)]
pub struct TagWithCount {
    pub id: String,
    pub name: String,
    pub color: String,
    pub note_count: i64,
}

pub struct TagService<'a> {
    db: &'a DatabaseService,
}

impl<'a> TagService<'a> {
    pub fn new(db: &'a DatabaseService) -> Self {
        Self { db }
    }

    pub fn create_tag(&self, name: String, color: Option<String>) -> Result<Tag> {
        let id = Ulid::new().to_string();
        let color = color.unwrap_or_else(|| "#3b82f6".to_string()); // Default blue
        
        let conn = self.db.connection();
        conn.execute(
            "INSERT INTO tags (id, name, color) VALUES (?, ?, ?)",
            params![id, name, color],
        )?;

        Ok(Tag { id, name, color })
    }

    pub fn list_tags(&self) -> Result<Vec<TagWithCount>> {
        let conn = self.db.connection();
        let mut stmt = conn.prepare(
            "SELECT t.id, t.name, t.color, (SELECT COUNT(*) FROM note_tags WHERE tag_id = t.id) as note_count 
             FROM tags t"
        )?;

        let tag_iter = stmt.query_map([], |row| {
            Ok(TagWithCount {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
                note_count: row.get(3)?,
            })
        })?;

        let mut tags = Vec::new();
        for tag in tag_iter {
            tags.push(tag?);
        }

        Ok(tags)
    }

    pub fn add_tag_to_note(&self, note_id: String, tag_id: String) -> Result<()> {
        let conn = self.db.connection();
        conn.execute(
            "INSERT OR IGNORE INTO note_tags (note_id, tag_id) VALUES (?, ?)",
            params![note_id, tag_id],
        )?;
        Ok(())
    }

    pub fn remove_tag_from_note(&self, note_id: String, tag_id: String) -> Result<()> {
        let conn = self.db.connection();
        conn.execute(
            "DELETE FROM note_tags WHERE note_id = ? AND tag_id = ?",
            params![note_id, tag_id],
        )?;
        Ok(())
    }

    pub fn get_note_tags(&self, note_id: String) -> Result<Vec<Tag>> {
        let conn = self.db.connection();
        let mut stmt = conn.prepare(
            "SELECT t.id, t.name, t.color 
             FROM tags t 
             JOIN note_tags nt ON t.id = nt.tag_id 
             WHERE nt.note_id = ?"
        )?;

        let tag_iter = stmt.query_map(params![note_id], |row| {
            Ok(Tag {
                id: row.get(0)?,
                name: row.get(1)?,
                color: row.get(2)?,
            })
        })?;

        let mut tags = Vec::new();
        for tag in tag_iter {
            tags.push(tag?);
        }

        Ok(tags)
    }
}
