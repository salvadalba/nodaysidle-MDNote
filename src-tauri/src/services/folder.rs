use rusqlite::params;
use ulid::Ulid;
use crate::models::folder::Folder;
use crate::services::database::DatabaseService;
use crate::errors::{AppError, Result};
use serde::Serialize;

#[derive(Serialize)]
pub struct FolderListItem {
    pub id: String,
    pub name: String,
    pub parent_id: Option<String>,
    pub note_count: i64,
}

pub struct FolderService<'a> {
    db: &'a DatabaseService,
}

impl<'a> FolderService<'a> {
    pub fn new(db: &'a DatabaseService) -> Self {
        Self { db }
    }

    pub fn create_folder(&self, name: String, parent_id: Option<String>) -> Result<Folder> {
        let id = Ulid::new().to_string();
        let now = chrono::Utc::now().timestamp_millis();
        
        let conn = self.db.connection();
        conn.execute(
            "INSERT INTO folders (id, name, parent_id, created_at) VALUES (?, ?, ?, ?)",
            params![id, name, parent_id, now],
        )?;

        Ok(Folder {
            id,
            name,
            parent_id,
            created_at: now,
        })
    }

    pub fn list_folders(&self) -> Result<Vec<FolderListItem>> {
        let conn = self.db.connection();
        let mut stmt = conn.prepare(
            "SELECT f.id, f.name, f.parent_id, (SELECT COUNT(*) FROM notes WHERE folder_id = f.id) as note_count 
             FROM folders f"
        )?;

        let folder_iter = stmt.query_map([], |row| {
            Ok(FolderListItem {
                id: row.get(0)?,
                name: row.get(1)?,
                parent_id: row.get(2)?,
                note_count: row.get(3)?,
            })
        })?;

        let mut folders = Vec::new();
        for folder in folder_iter {
            folders.push(folder?);
        }

        Ok(folders)
    }

    pub fn update_folder(&self, id: String, name: Option<String>, parent_id: Option<Option<String>>) -> Result<Folder> {
        let conn = self.db.connection();
        
        let mut query = String::from("UPDATE folders SET id = id");
        let mut params_vec: Vec<Box<dyn rusqlite::ToSql>> = vec![];

        if let Some(n) = name {
            query.push_str(", name = ?");
            params_vec.push(Box::new(n));
        }
        if let Some(p) = parent_id {
            query.push_str(", parent_id = ?");
            params_vec.push(Box::new(p));
        }

        query.push_str(" WHERE id = ?");
        params_vec.push(Box::new(id.clone()));

        let params_refs: Vec<&dyn rusqlite::ToSql> = params_vec.iter().map(|p| p.as_ref()).collect();
        let affected = conn.execute(&query, params_refs.as_slice())?;
        
        if affected == 0 {
            return Err(AppError::NotFound(format!("Folder with id {} not found", id)));
        }

        // Get updated folder
        let folder = conn.query_row(
            "SELECT id, name, parent_id, created_at FROM folders WHERE id = ?",
            params![id],
            |row| Ok(Folder {
                id: row.get(0)?,
                name: row.get(1)?,
                parent_id: row.get(2)?,
                created_at: row.get(3)?,
            })
        )?;

        Ok(folder)
    }

    pub fn delete_folder(&self, id: String, delete_notes: bool) -> Result<i64> {
        let conn = self.db.connection();
        
        let tx = conn.unchecked_transaction()?;
        
        let mut moved_notes = 0;
        if delete_notes {
            tx.execute("DELETE FROM notes WHERE folder_id = ?", params![id])?;
        } else {
            moved_notes = tx.execute("UPDATE notes SET folder_id = NULL WHERE folder_id = ?", params![id])? as i64;
        }

        let affected = tx.execute("DELETE FROM folders WHERE id = ?", params![id])?;
        if affected == 0 {
            return Err(AppError::NotFound(format!("Folder with id {} not found", id)));
        }

        tx.commit()?;
        Ok(moved_notes)
    }
}
