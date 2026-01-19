use tauri::State;
use crate::models::note::{Note, NoteSummary};
use crate::services::database::DbState;
use crate::services::note::NoteService;
use crate::errors::Result;
use serde::Serialize;

#[derive(Serialize)]
pub struct ListNotesResponse {
    pub notes: Vec<NoteSummary>,
    pub total: i64,
}

#[tauri::command]
pub async fn create_note(
    state: State<'_, DbState>,
    folder_id: Option<String>,
    title: String,
    content: String,
) -> Result<Note> {
    let db = state.0.lock().unwrap();
    let service = NoteService::new(&db);
    service.create_note(folder_id, title, content)
}

#[tauri::command]
pub async fn get_note(
    state: State<'_, DbState>,
    id: String,
) -> Result<Note> {
    let db = state.0.lock().unwrap();
    let service = NoteService::new(&db);
    service.get_note(id)
}

#[tauri::command]
pub async fn update_note(
    state: State<'_, DbState>,
    id: String,
    title: Option<String>,
    content: Option<String>,
    folder_id: Option<Option<String>>,
) -> Result<Note> {
    let db = state.0.lock().unwrap();
    let service = NoteService::new(&db);
    service.update_note(id, title, content, folder_id)
}

#[tauri::command]
pub async fn delete_note(
    state: State<'_, DbState>,
    id: String,
) -> Result<bool> {
    let db = state.0.lock().unwrap();
    let service = NoteService::new(&db);
    service.delete_note(id)?;
    Ok(true)
}

#[tauri::command]
pub async fn list_notes(
    state: State<'_, DbState>,
    folder_id: Option<String>,
    tag_id: Option<String>,
    limit: Option<i32>,
    offset: Option<i32>,
) -> Result<ListNotesResponse> {
    let db = state.0.lock().unwrap();
    let service = NoteService::new(&db);
    let (notes, total) = service.list_notes(folder_id, tag_id, limit.unwrap_or(50), offset.unwrap_or(0))?;
    Ok(ListNotesResponse { notes, total })
}
