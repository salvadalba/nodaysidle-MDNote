use tauri::State;
use crate::services::database::DbState;
use crate::services::search::{SearchService, SearchResult};
use crate::errors::{Result, AppError};

#[tauri::command]
pub async fn search_notes(
    state: State<'_, DbState>,
    query: String,
    limit: Option<i32>,
) -> Result<Vec<SearchResult>> {
    let db = state.0.lock().map_err(|e| AppError::LockError(e.to_string()))?;
    let service = SearchService::new(&db);
    service.search_notes(query, limit.unwrap_or(20))
}
