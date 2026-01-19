use rusqlite::{params, Row};
use ulid::Ulid;
use crate::models::note::{Note, NoteSummary};
use crate::services::database::DatabaseService;
use crate::errors::{AppError, Result};

pub struct NoteService<'a> {
    db: &'a DatabaseService,
}

impl<'a> NoteService<'a> {
    pub fn new(db: &'a DatabaseService) -> Self {
        Self { db }
    }

    pub fn create_note(&self, folder_id: Option<String>, title: String, content: String) -> Result<Note> {
        let id = Ulid::new().to_string();
        let now = chrono::Utc::now().timestamp_millis();
        
        let conn = self.db.connection();
        conn.execute(
            "INSERT INTO notes (id, folder_id, title, content, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)",
            params![id, folder_id, title, content, now, now],
        )?;

        Ok(Note {
            id,
            folder_id,
            title,
            content,
            created_at: now,
            updated_at: now,
        })
    }

    pub fn get_note(&self, id: String) -> Result<Note> {
        let conn = self.db.connection();
        let note = conn.query_row(
            "SELECT id, folder_id, title, content, created_at, updated_at FROM notes WHERE id = ?",
            params![id],
            |row| self.map_row_to_note(row),
        ).map_err(|_| AppError::NotFound(format!("Note with id {} not found", id)))?;

        Ok(note)
    }

    pub fn update_note(&self, id: String, title: Option<String>, content: Option<String>, folder_id: Option<Option<String>>) -> Result<Note> {
        let now = chrono::Utc::now().timestamp_millis();
        let conn = self.db.connection();

        // Get current note
        let mut note = self.get_note(id.clone())?;

        let mut query = String::from("UPDATE notes SET updated_at = ?");
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![Box::new(now)];

        if let Some(t) = title {
            query.push_str(", title = ?");
            params_vec.push(Box::new(t.clone()));
            note.title = t;
        }
        if let Some(c) = content {
            query.push_str(", content = ?");
            params_vec.push(Box::new(c.clone()));
            note.content = c;
        }
        if let Some(f) = folder_id {
            query.push_str(", folder_id = ?");
            params_vec.push(Box::new(f.clone()));
            note.folder_id = f;
        }

        query.push_str(" WHERE id = ?");
        params_vec.push(Box::new(id));

        let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();
        conn.execute(&query, params_refs.as_slice())?;

        note.updated_at = now;
        Ok(note)
    }

    pub fn delete_note(&self, id: String) -> Result<()> {
        let conn = self.db.connection();
        let affected = conn.execute("DELETE FROM notes WHERE id = ?", params![id])?;
        
        if affected == 0 {
            return Err(AppError::NotFound(format!("Note with id {} not found", id)));
        }
        Ok(())
    }

    pub fn list_notes(&self, folder_id: Option<String>, tag_id: Option<String>, limit: i32, offset: i32) -> Result<(Vec<NoteSummary>, i64)> {
        let conn = self.db.connection();
        
        let mut query = String::from("SELECT n.id, n.folder_id, n.title, substr(n.content, 1, 200) as excerpt, n.updated_at FROM notes n");
        let mut count_query = String::from("SELECT COUNT(*) FROM notes n");
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = Vec::new();
        let mut where_clauses = Vec::new();

        if let Some(t) = tag_id {
            query.push_str(" JOIN note_tags nt ON n.id = nt.note_id");
            count_query.push_str(" JOIN note_tags nt ON n.id = nt.note_id");
            where_clauses.push("nt.tag_id = ?");
            params_vec.push(Box::new(t));
        }

        if let Some(f) = folder_id {
            where_clauses.push("n.folder_id = ?");
            params_vec.push(Box::new(f));
        } else if where_clauses.is_empty() {
            // Only enforce root-only filtering if No Tag is selected.
            // If a tag is selected but no folder, we want notes from ALL folders with that tag.
            where_clauses.push("n.folder_id IS NULL");
        }

        if !where_clauses.is_empty() {
            let where_str = format!(" WHERE {}", where_clauses.join(" AND "));
            query.push_str(&where_str);
            count_query.push_str(&where_str);
        }

        query.push_str(" ORDER BY n.updated_at DESC LIMIT ? OFFSET ?");
        
        let params_refs_count: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();
        let total: i64 = conn.query_row(&count_query, params_refs_count.as_slice(), |row| row.get(0))?;

        params_vec.push(Box::new(limit));
        params_vec.push(Box::new(offset));

        let params_refs_query: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();
        let mut stmt = conn.prepare(&query)?;
        let note_iter = stmt.query_map(params_refs_query.as_slice(), |row| {
            Ok(NoteSummary {
                id: row.get(0)?,
                folder_id: row.get(1)?,
                title: row.get(2)?,
                excerpt: row.get(3)?,
                updated_at: row.get(4)?,
            })
        })?;

        let mut notes = Vec::new();
        for note in note_iter {
            notes.push(note?);
        }

        Ok((notes, total))
    }

    fn map_row_to_note(&self, row: &Row) -> rusqlite::Result<Note> {
        Ok(Note {
            id: row.get(0)?,
            folder_id: row.get(1)?,
            title: row.get(2)?,
            content: row.get(3)?,
            created_at: row.get(4)?,
            updated_at: row.get(5)?,
        })
    }
}
