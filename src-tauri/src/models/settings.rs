use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Settings {
    pub theme: String,
    pub font_size: i32,
    pub font_family: String,
    pub auto_save_delay: i32,
    pub spell_check: bool,
}

impl Default for Settings {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            font_size: 16,
            font_family: "Inter".to_string(),
            auto_save_delay: 500,
            spell_check: true,
        }
    }
}
