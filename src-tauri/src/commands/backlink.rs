use tauri::State;
use crate::models::note::NoteSummary;
use crate::services::database::DbState;
use crate::services::backlink::{BacklinkService, Backlink};
use crate::errors::Result;

#[tauri::command]
pub async fn add_backlink(
    state: State<'_, DbState>,
    source_id: String,
    target_id: String,
    context: Option<String>,
) -> Result<()> {
    let db = state.0.lock().unwrap();
    let service = BacklinkService::new(&db);
    service.add_link(source_id, target_id, context)
}

#[tauri::command]
pub async fn remove_backlink(
    state: State<'_, DbState>,
    source_id: String,
    target_id: String,
) -> Result<()> {
    let db = state.0.lock().unwrap();
    let service = BacklinkService::new(&db);
    service.remove_link(source_id, target_id)
}

#[tauri::command]
pub async fn get_backlinks(
    state: State<'_, DbState>,
    target_id: String,
) -> Result<Vec<Backlink>> {
    let db = state.0.lock().unwrap();
    let service = BacklinkService::new(&db);
    service.get_backlinks(target_id)
}

#[tauri::command]
pub async fn get_outgoing_links(
    state: State<'_, DbState>,
    source_id: String,
) -> Result<Vec<NoteSummary>> {
    let db = state.0.lock().unwrap();
    let service = BacklinkService::new(&db);
    service.get_outgoing_links(source_id)
}

#[tauri::command]
pub async fn sync_backlinks(
    state: State<'_, DbState>,
    source_id: String,
    content: String,
) -> Result<()> {
    let db = state.0.lock().unwrap();
    let service = BacklinkService::new(&db);
    
    // Simple regex-based discovery for now: [[note-id]] or #tag-like-links
    // In a real app, we'd use a markdown parser. 
    // Here we'll look for [[ulid]] patterns.
    service.clear_outgoing_links(source_id.clone())?;
    
    let re = regex::Regex::new(r"\[\[([0-9A-HJKMNP-TV-Z]{26})\]\]").unwrap();
    for cap in re.captures_iter(&content) {
        let target_id = cap[1].to_string();
        // Avoid self-links
        if target_id != source_id {
            // Extract a snippet of context (surrounding text)
            let match_pos = cap.get(0).unwrap().start();
            let start = match_pos.saturating_sub(40);
            let end = (match_pos + 66).min(content.len());
            let context = content[start..end].to_string();
            
            service.add_link(source_id.clone(), target_id, Some(context))?;
        }
    }
    
    Ok(())
}
