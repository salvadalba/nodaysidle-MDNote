use rusqlite::params;
use serde::Serialize;
use crate::services::database::DatabaseService;
use crate::errors::Result;

#[derive(Serialize)]
pub struct SearchResult {
    pub id: String,
    pub title: String,
    pub snippet: String,
    pub rank: f64,
}

pub struct SearchService<'a> {
    db: &'a DatabaseService,
}

impl<'a> SearchService<'a> {
    pub fn new(db: &'a DatabaseService) -> Self {
        Self { db }
    }

    pub fn search_notes(&self, query: String, limit: i32) -> Result<Vec<SearchResult>> {
        let conn = self.db.connection();
        
        // FTS5 search with BM25 ranking and snippet generation
        // We use highlight() to mark matches in the snippet
        let mut stmt = conn.prepare(
            "SELECT id, title, snippet(notes_fts, 2, '==', '==', '...', 64) as snippet, rank 
             FROM notes_fts 
             WHERE notes_fts MATCH ? 
             ORDER BY rank 
             LIMIT ?"
        )?;

        let search_results = stmt.query_map(params![query, limit], |row| {
            Ok(SearchResult {
                id: row.get(0)?,
                title: row.get(1)?,
                snippet: row.get(2)?,
                rank: row.get(3)?,
            })
        })?;

        let mut results = Vec::new();
        for result in search_results {
            results.push(result?);
        }

        Ok(results)
    }
}
