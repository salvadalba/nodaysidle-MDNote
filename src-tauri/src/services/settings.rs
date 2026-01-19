use rusqlite::params;
use crate::models::settings::Settings;
use crate::services::database::DatabaseService;
use crate::errors::Result;

pub struct SettingsService<'a> {
    db: &'a DatabaseService,
}

impl<'a> SettingsService<'a> {
    pub fn new(db: &'a DatabaseService) -> Self {
        Self { db }
    }

    pub fn get_settings(&self) -> Result<Settings> {
        let conn = self.db.connection();
        let mut stmt = conn.prepare("SELECT key, value FROM settings")?;
        let rows = stmt.query_map([], |row| {
            let key: String = row.get(0)?;
            let value: String = row.get(1)?;
            Ok((key, value))
        })?;

        let mut settings = Settings::default();
        for row in rows {
            let (key, value) = row?;
            match key.as_str() {
                "theme" => settings.theme = value,
                "font_size" => if let Ok(v) = value.parse() { settings.font_size = v },
                "font_family" => settings.font_family = value,
                "auto_save_delay" => if let Ok(v) = value.parse() { settings.auto_save_delay = v },
                "spell_check" => settings.spell_check = value == "true",
                _ => {}
            }
        }

        Ok(settings)
    }

    pub fn update_settings(&self, settings: Settings) -> Result<Settings> {
        let conn = self.db.connection();
        
        let tx = conn.unchecked_transaction()?;
        
        Self::save_setting(&tx, "theme", &settings.theme)?;
        Self::save_setting(&tx, "font_size", &settings.font_size.to_string())?;
        Self::save_setting(&tx, "font_family", &settings.font_family)?;
        Self::save_setting(&tx, "auto_save_delay", &settings.auto_save_delay.to_string())?;
        Self::save_setting(&tx, "spell_check", if settings.spell_check { "true" } else { "false" })?;
        
        tx.commit()?;

        Ok(settings)
    }

    fn save_setting(conn: &rusqlite::Connection, key: &str, value: &str) -> rusqlite::Result<()> {
        conn.execute(
            "INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)",
            params![key, value],
        )?;
        Ok(())
    }
}
