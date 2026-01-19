use tauri::State;
use crate::models::folder::Folder;
use crate::services::database::DbState;
use crate::services::folder::{FolderService, FolderListItem};
use crate::errors::Result;
use serde::Serialize;

#[derive(Serialize)]
pub struct DeleteFolderResponse {
    pub success: bool,
    pub moved_notes: i64,
}

#[tauri::command]
pub async fn create_folder(
    state: State<'_, DbState>,
    name: String,
    parent_id: Option<String>,
) -> Result<Folder> {
    let db = state.0.lock().unwrap();
    let service = FolderService::new(&db);
    service.create_folder(name, parent_id)
}

#[tauri::command]
pub async fn list_folders(
    state: State<'_, DbState>,
) -> Result<Vec<FolderListItem>> {
    let db = state.0.lock().unwrap();
    let service = FolderService::new(&db);
    service.list_folders()
}

#[tauri::command]
pub async fn update_folder(
    state: State<'_, DbState>,
    id: String,
    name: Option<String>,
    parent_id: Option<Option<String>>,
) -> Result<Folder> {
    let db = state.0.lock().unwrap();
    let service = FolderService::new(&db);
    service.update_folder(id, name, parent_id)
}

#[tauri::command]
pub async fn delete_folder(
    state: State<'_, DbState>,
    id: String,
    delete_notes: Option<bool>,
) -> Result<DeleteFolderResponse> {
    let db = state.0.lock().unwrap();
    let service = FolderService::new(&db);
    let moved_notes = service.delete_folder(id, delete_notes.unwrap_or(false))?;
    Ok(DeleteFolderResponse { success: true, moved_notes })
}
