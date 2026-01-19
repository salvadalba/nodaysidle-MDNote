use rusqlite::{params, Connection};
use std::fs;
use std::path::PathBuf;
use crate::errors::{AppError, Result};
use tracing::info;

pub struct DatabaseService {
    conn: Connection,
}

impl DatabaseService {
    pub fn new(app_data_dir: PathBuf) -> Result<Self> {
        println!("DatabaseService::new with dir: {:?}", app_data_dir);
        if !app_data_dir.exists() {
            println!("Creating app data directory...");
            fs::create_dir_all(&app_data_dir).map_err(|e| {
                println!("CRITICAL: Failed to create app data dir: {}", e);
                AppError::IoError(e.to_string())
            })?;
        }
        
        let db_path = app_data_dir.join("mdnote.db");
        println!("Opening database at: {:?}", db_path);
        let conn = Connection::open(&db_path).map_err(|e| {
            println!("CRITICAL: Failed to open database: {}", e);
            e
        })?;
        
        println!("Database opened. Enabling WAL and Foreign Keys...");
        // Enable WAL mode
        let _mode: String = conn.query_row("PRAGMA journal_mode=WAL", [], |row| row.get(0)).map_err(|e| {
            println!("CRITICAL: WAL mode failed: {}", e);
            e
        })?;
        conn.execute("PRAGMA foreign_keys=ON", []).map_err(|e| {
            println!("CRITICAL: Foreign keys failed: {}", e);
            e
        })?;
        
        let mut service = Self { conn };
        println!("Running migrations...");
        service.run_migrations().map_err(|e| {
            println!("CRITICAL: Migrations failed: {}", e);
            e
        })?;
        
        println!("DatabaseService initialized successfully.");
        Ok(service)
    }

    fn run_migrations(&mut self) -> Result<()> {
        self.conn.execute(
            "CREATE TABLE IF NOT EXISTS _migrations (version INTEGER PRIMARY KEY, applied_at INTEGER NOT NULL)",
            [],
        )?;

        let migrations = vec![
            (1, include_str!("../migrations/001_notes_folders.sql")),
            (2, include_str!("../migrations/002_tags.sql")),
            (3, include_str!("../migrations/003_fts5.sql")),
            (4, include_str!("../migrations/004_backlinks_settings.sql")),
            (5, include_str!("../migrations/005_tags_color.sql")),
        ];

        for (version, sql) in migrations {
            let count: i32 = self.conn.query_row(
                "SELECT COUNT(*) FROM _migrations WHERE version = ?",
                params![version],
                |row| row.get(0),
            )?;

            if count == 0 {
                info!("Applying migration version {}", version);
                let tx = self.conn.transaction()?;
                
                tx.execute_batch(sql)?;
                
                tx.execute(
                    "INSERT INTO _migrations (version, applied_at) VALUES (?, ?)",
                    params![version, chrono::Utc::now().timestamp_millis()],
                )?;
                
                tx.commit()?;
            }
        }

        Ok(())
    }

    pub fn connection(&self) -> &Connection {
        &self.conn
    }
}

// Helper to provide access to database in Tauri commands
pub struct DbState(pub std::sync::Mutex<DatabaseService>);
