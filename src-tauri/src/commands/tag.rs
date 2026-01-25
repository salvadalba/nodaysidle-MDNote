use tauri::State;
use crate::models::tag::Tag;
use crate::services::database::DbState;
use crate::services::tag::{TagService, TagWithCount};
use crate::errors::{Result, AppError};

#[tauri::command]
pub async fn create_tag(
    state: State<'_, DbState>,
    name: String,
    color: Option<String>,
) -> Result<Tag> {
    let db = state.0.lock().map_err(|e| AppError::LockError(e.to_string()))?;
    let service = TagService::new(&db);
    service.create_tag(name, color)
}

#[tauri::command]
pub async fn list_tags(
    state: State<'_, DbState>,
) -> Result<Vec<TagWithCount>> {
    let db = state.0.lock().map_err(|e| AppError::LockError(e.to_string()))?;
    let service = TagService::new(&db);
    service.list_tags()
}

#[tauri::command]
pub async fn add_tag_to_note(
    state: State<'_, DbState>,
    note_id: String,
    tag_id: String,
) -> Result<()> {
    let db = state.0.lock().map_err(|e| AppError::LockError(e.to_string()))?;
    let service = TagService::new(&db);
    service.add_tag_to_note(note_id, tag_id)
}

#[tauri::command]
pub async fn remove_tag_from_note(
    state: State<'_, DbState>,
    note_id: String,
    tag_id: String,
) -> Result<()> {
    let db = state.0.lock().map_err(|e| AppError::LockError(e.to_string()))?;
    let service = TagService::new(&db);
    service.remove_tag_from_note(note_id, tag_id)
}

#[tauri::command]
pub async fn get_note_tags(
    state: State<'_, DbState>,
    note_id: String,
) -> Result<Vec<Tag>> {
    let db = state.0.lock().map_err(|e| AppError::LockError(e.to_string()))?;
    let service = TagService::new(&db);
    service.get_note_tags(note_id)
}

#[tauri::command]
pub async fn delete_tag(
    state: State<'_, DbState>,
    tag_id: String,
) -> Result<()> {
    let db = state.0.lock().map_err(|e| AppError::LockError(e.to_string()))?;
    let service = TagService::new(&db);
    service.delete_tag(tag_id)
}
