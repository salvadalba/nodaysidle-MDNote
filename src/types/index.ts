export interface Note {
    id: string;
    folder_id: string | null;
    title: string;
    content: string;
    created_at: number;
    updated_at: number;
}

export interface NoteSummary {
    id: string;
    folder_id: string | null;
    title: string;
    excerpt: string;
    updated_at: number;
}

export interface ListNotesResponse {
    notes: NoteSummary[];
    total: number;
}

export interface SearchResult {
    id: string;
    title: string;
    snippet: string;
    rank: number;
}


export interface Folder {
    id: string;
    name: string;
    parent_id: string | null;
    created_at: number;
}

export interface FolderListItem {
    id: string;
    name: string;
    parent_id: string | null;
    note_count: number;
}

export interface Tag {
    id: string;
    name: string;
    color: string;
}

export interface TagWithCount {
    id: string;
    name: string;
    color: string;
    note_count: number;
}

export interface Settings {
    theme: string;
    font_size: number;
    font_family: string;
    auto_save_delay: number;
    spell_check: boolean;
}

export interface Backlink {
    source_id: string;
    source_title: string;
    context: string | null;
}

export interface AppError {
    code: string;
    message: string;
}
