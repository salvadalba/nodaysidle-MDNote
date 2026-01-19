mod services;
mod models;
mod commands;
mod errors;

use services::database::{DatabaseService, DbState};
use tauri::Manager;

// Re-export commands for visibility
use commands::note::{create_note, get_note, update_note, delete_note, list_notes};
use commands::search::{search_notes};
use commands::folder::{create_folder, list_folders, update_folder, delete_folder};
use commands::tag::{create_tag, list_tags, add_tag_to_note, remove_tag_from_note, get_note_tags};
use commands::settings::{get_settings, update_settings};
use commands::backlink::{add_backlink, remove_backlink, get_backlinks, get_outgoing_links, sync_backlinks};

#[cfg(target_os = "macos")]
use window_vibrancy::{apply_vibrancy, NSVisualEffectMaterial};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            tracing_subscriber::fmt::init();

            // Initialize database
            let app_data_dir = app.path().app_data_dir().expect("failed to get app data dir");
            let database_service = DatabaseService::new(app_data_dir).expect("failed to init db");
            app.manage(DbState(std::sync::Mutex::new(database_service)));

            // Apply macOS vibrancy effect
            #[cfg(target_os = "macos")]
            {
                let window = app.get_webview_window("main").unwrap();
                apply_vibrancy(&window, NSVisualEffectMaterial::HudWindow, None, None)
                    .expect("Failed to apply vibrancy");
            }

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            create_note,
            get_note,
            update_note,
            delete_note,
            list_notes,
            search_notes,
            create_folder,
            list_folders,
            update_folder,
            delete_folder,
            create_tag,
            list_tags,
            add_tag_to_note,
            remove_tag_from_note,
            get_note_tags,
            get_settings,
            update_settings,
            add_backlink,
            remove_backlink,
            get_backlinks,
            get_outgoing_links,
            sync_backlinks,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
