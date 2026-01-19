use rusqlite::params;
use crate::models::note::NoteSummary;
use crate::services::database::DatabaseService;
use crate::errors::Result;
use serde::Serialize;

#[derive(Serialize)]
pub struct Backlink {
    pub source_id: String,
    pub source_title: String,
    pub context: Option<String>,
}

pub struct BacklinkService<'a> {
    db: &'a DatabaseService,
}

impl<'a> BacklinkService<'a> {
    pub fn new(db: &'a DatabaseService) -> Self {
        Self { db }
    }

    /// Links two notes together. Directional: source mentions target.
    pub fn add_link(&self, source_id: String, target_id: String, context: Option<String>) -> Result<()> {
        let conn = self.db.connection();
        conn.execute(
            "INSERT OR REPLACE INTO backlinks (source_id, target_id, context) VALUES (?, ?, ?)",
            params![source_id, target_id, context],
        )?;
        Ok(())
    }

    /// Removes a link between two notes.
    pub fn remove_link(&self, source_id: String, target_id: String) -> Result<()> {
        let conn = self.db.connection();
        conn.execute(
            "DELETE FROM backlinks WHERE source_id = ? AND target_id = ?",
            params![source_id, target_id],
        )?;
        Ok(())
    }

    /// Clears allOutgoing links from a note (used before re-scanning content).
    pub fn clear_outgoing_links(&self, source_id: String) -> Result<()> {
        let conn = self.db.connection();
        conn.execute("DELETE FROM backlinks WHERE source_id = ?", params![source_id])?;
        Ok(())
    }

    /// Gets all notes that point TO the specified note.
    pub fn get_backlinks(&self, target_id: String) -> Result<Vec<Backlink>> {
        let conn = self.db.connection();
        let mut stmt = conn.prepare(
            "SELECT b.source_id, n.title, b.context 
             FROM backlinks b 
             JOIN notes n ON b.source_id = n.id 
             WHERE b.target_id = ?"
        )?;

        let link_iter = stmt.query_map(params![target_id], |row| {
            Ok(Backlink {
                source_id: row.get(0)?,
                source_title: row.get(1)?,
                context: row.get(2)?,
            })
        })?;

        let mut links = Vec::new();
        for link in link_iter {
            links.push(link?);
        }

        Ok(links)
    }

    /// Gets all notes that the specified note points TO.
    pub fn get_outgoing_links(&self, source_id: String) -> Result<Vec<NoteSummary>> {
        let conn = self.db.connection();
        let mut stmt = conn.prepare(
            "SELECT n.id, n.folder_id, n.title, substr(n.content, 1, 200) as excerpt, n.updated_at 
             FROM notes n 
             JOIN backlinks b ON n.id = b.target_id 
             WHERE b.source_id = ?"
        )?;

        let note_iter = stmt.query_map(params![source_id], |row| {
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

        Ok(notes)
    }
}
