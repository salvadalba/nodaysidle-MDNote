use tauri::State;
use crate::models::settings::Settings;
use crate::services::database::DbState;
use crate::services::settings::SettingsService;
use crate::errors::Result;

#[tauri::command]
pub async fn get_settings(
    state: State<'_, DbState>,
) -> Result<Settings> {
    let db = state.0.lock().unwrap();
    let service = SettingsService::new(&db);
    service.get_settings()
}

#[tauri::command]
pub async fn update_settings(
    state: State<'_, DbState>,
    settings: Settings,
) -> Result<Settings> {
    let db = state.0.lock().unwrap();
    let service = SettingsService::new(&db);
    service.update_settings(settings)
}
