import React, { useState, useEffect } from 'react';
import { NoteSummary, FolderListItem, TagWithCount } from '../types';
import { SidebarSkeleton } from './LoadingSkeleton';

interface SidebarProps {
    notes: NoteSummary[];
    folders: FolderListItem[];
    tags: TagWithCount[];
    onSelectNote: (id: string) => void;
    onSelectFolder: (id: string | null) => void;
    onSelectTag: (id: string | null) => void;
    onCreateNote: () => void;
    onCreateFolder: (name: string) => void;
    onCreateTag: (name: string) => void;
    onDeleteFolder: (id: string) => void;
    onRenameFolder: (id: string, newName: string) => void;
    onMoveNote: (noteId: string, targetFolderId: string | null) => void;
    onOpenSettings: () => void;
    selectedNoteId?: string;
    selectedFolderId: string | null;
    selectedTagId: string | null;
    loading?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({
    notes,
    folders,
    tags,
    onSelectNote,
    onSelectFolder,
    onSelectTag,
    onCreateNote,
    onCreateFolder,
    onCreateTag,
    onDeleteFolder,
    onRenameFolder,
    onMoveNote,
    onOpenSettings,
    selectedNoteId,
    selectedFolderId,
    selectedTagId,
    loading = false
}) => {
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState('');
    const [isCreatingTag, setIsCreatingTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, folderId: string } | null>(null);
    const [isRenaming, setIsRenaming] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    const handleCreateFolder = (e: React.FormEvent) => {
        e.preventDefault();
        if (newFolderName.trim()) {
            onCreateFolder(newFolderName.trim());
            setNewFolderName('');
            setIsCreatingFolder(false);
        }
    };

    const handleCreateTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTagName.trim()) {
            onCreateTag(newTagName.trim());
            setNewTagName('');
            setIsCreatingTag(false);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, folderId: string) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, folderId });
    };

    const handleRenameSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (isRenaming && renameValue.trim()) {
            onRenameFolder(isRenaming, renameValue.trim());
            setIsRenaming(null);
        }
    };

    // Drag and Drop
    const onDragStart = (e: React.DragEvent, id: string, type: 'note' | 'folder') => {
        e.dataTransfer.setData('id', id);
        e.dataTransfer.setData('type', type);
    };

    const onDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const onDrop = (e: React.DragEvent, targetFolderId: string | null) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('id');
        const type = e.dataTransfer.getData('type');

        if (type === 'note') {
            onMoveNote(id, targetFolderId);
        }
    };

    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener('click', handleClick);
        return () => window.removeEventListener('click', handleClick);
    }, []);

    if (loading) {
        return (
            <aside className="w-64 border-r border-border/50 flex flex-col z-10 select-none bg-card/50 backdrop-blur-xl">
                <div className="p-4 border-b border-border">
                    <div className="h-7 w-32 bg-secondary/50 rounded shimmer" />
                </div>
                <SidebarSkeleton />
            </aside>
        );
    }

    return (
        <aside className="w-64 border-r border-border/50 flex flex-col z-10 select-none bg-card/50 backdrop-blur-xl">
            <div className="p-4 flex items-center justify-between border-b border-border">
                <h1 className="text-xl font-semibold text-foreground cursor-default tracking-tight">
                    MDNote
                </h1>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsCreatingFolder(true)}
                        className="p-1 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        title="New Folder"
                        aria-label="Create new folder"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z" /><path d="M12 10v6M9 13h6" /></svg>
                    </button>
                    <button
                        onClick={onCreateNote}
                        className="p-1 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                        title="New Note"
                        aria-label="Create new note"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg>
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-6 scrollbar-thin scrollbar-thumb-secondary">
                {/* Folders Section */}
                <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex justify-between items-center">
                        Folders
                    </div>
                    {isCreatingFolder && (
                        <form onSubmit={handleCreateFolder} className="px-2 mb-2">
                            <label htmlFor="folder-name-input" className="sr-only">Folder Name</label>
                            <input
                                id="folder-name-input"
                                autoFocus
                                type="text"
                                value={newFolderName}
                                onChange={(e) => setNewFolderName(e.target.value)}
                                onBlur={() => !newFolderName && setIsCreatingFolder(false)}
                                className="w-full bg-input border border-primary/50 rounded px-2 py-1 text-sm outline-none text-foreground placeholder:text-muted-foreground"
                                placeholder="Folder name..."
                            />
                        </form>
                    )}
                    <ul className="space-y-0.5">
                        <li onDragOver={onDragOver} onDrop={(e) => onDrop(e, null)}>
                            <button
                                onClick={() => { onSelectFolder(null); onSelectTag(null); }}
                                className={`w-full text-left px-3 py-1.5 rounded-lg transition-all text-sm flex items-center gap-2 ${selectedFolderId === null && selectedTagId === null ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                    }`}
                            >
                                <svg className="opacity-60" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                                All Notes
                            </button>
                        </li>
                        {folders.map((folder) => (
                            <li key={folder.id} onDragOver={onDragOver} onDrop={(e) => onDrop(e, folder.id)}>
                                {isRenaming === folder.id ? (
                                    <form onSubmit={handleRenameSubmit} className="px-2 py-1">
                                        <label htmlFor={`rename-${folder.id}`} className="sr-only">Rename Folder</label>
                                        <input
                                            id={`rename-${folder.id}`}
                                            autoFocus
                                            type="text"
                                            value={renameValue}
                                            onChange={(e) => setRenameValue(e.target.value)}
                                            onBlur={() => setIsRenaming(null)}
                                            className="w-full bg-input border border-primary/50 rounded px-2 py-0.5 text-sm outline-none text-foreground"
                                        />
                                    </form>
                                ) : (
                                    <button
                                        onClick={() => { onSelectFolder(folder.id); onSelectTag(null); }}
                                        onContextMenu={(e) => handleContextMenu(e, folder.id)}
                                        className={`w-full text-left px-3 py-1.5 rounded-lg transition-all text-sm flex items-center justify-between group ${selectedFolderId === folder.id ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                                            }`}
                                    >
                                        <div className="flex items-center gap-2 truncate">
                                            <svg className="opacity-60" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" /></svg>
                                            <span className="truncate">{folder.name}</span>
                                        </div>
                                        <span className="text-[10px] bg-secondary border border-border px-1.5 py-0.5 rounded-full group-hover:bg-background/20 transition-colors opacity-70">
                                            {folder.note_count}
                                        </span>
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Tags Section */}
                <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2 flex justify-between items-center">
                        Tags
                        <button
                            onClick={() => setIsCreatingTag(true)}
                            className="p-1 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                            aria-label="Create new tag"
                            title="New Tag"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                        </button>
                    </div>
                    {isCreatingTag && (
                        <form onSubmit={handleCreateTag} className="px-2 mb-2">
                            <label htmlFor="tag-name-input" className="sr-only">Tag Name</label>
                            <input
                                id="tag-name-input"
                                autoFocus
                                type="text"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onBlur={() => !newTagName && setIsCreatingTag(false)}
                                className="w-full bg-input border border-primary/50 rounded px-2 py-1 text-sm outline-none text-foreground placeholder:text-muted-foreground"
                                placeholder="Tag name..."
                            />
                        </form>
                    )}
                    {tags.length === 0 ? (
                        <div className="px-3 py-2 text-[10px] text-muted-foreground italic opacity-60">No tags yet</div>
                    ) : (
                        <ul className="flex flex-wrap gap-1 px-2">
                            {tags.map((tag) => (
                                <li key={tag.id}>
                                    <button
                                        onClick={() => { onSelectTag(tag.id); onSelectFolder(null); }}
                                        className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 ${selectedTagId === tag.id
                                            ? 'ring-1 ring-white/20 text-white'
                                            : 'bg-secondary text-muted-foreground hover:bg-accent hover:text-foreground'
                                            }`}
                                        style={{
                                            backgroundColor: selectedTagId === tag.id ? `${tag.color}40` : undefined,
                                            color: selectedTagId === tag.id ? tag.color : undefined,
                                            borderColor: selectedTagId === tag.id ? `${tag.color}60` : 'transparent'
                                        }}
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color }} />
                                        {tag.name}
                                        <span className="opacity-40">{tag.note_count}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Notes List Section */}
                <div>
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-2">
                        Notes
                    </div>
                    {notes.length === 0 ? (
                        <div className="px-2 py-4 text-xs text-muted-foreground italic flex flex-col items-center gap-2 opacity-60">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/50"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /></svg>
                            No notes found
                        </div>
                    ) : (
                        <ul className="space-y-1">
                            {notes.map((note) => (
                                <li
                                    key={note.id}
                                    draggable
                                    onDragStart={(e) => onDragStart(e, note.id, 'note')}
                                >
                                    <button
                                        onClick={() => onSelectNote(note.id)}
                                        className={`w-full text-left px-3 py-2 rounded-xl transition-all text-sm group flex flex-col border border-transparent ${selectedNoteId === note.id ? 'bg-primary/10 text-primary shadow-sm border-primary/20' : 'hover:bg-accent text-muted-foreground'
                                            }`}
                                    >
                                        <span className={`font-medium truncate w-full ${selectedNoteId === note.id ? 'text-primary' : 'group-hover:text-foreground'}`}>{note.title || 'Untitled'}</span>
                                        <span className={`text-[11px] truncate w-full opacity-60 group-hover:opacity-100 italic ${selectedNoteId === note.id ? 'text-primary/70' : 'text-muted-foreground'}`}>
                                            {note.excerpt || 'No content...'}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>

            {/* Sidebar Footer */}
            <div className="p-2 border-t border-border">
                <button
                    onClick={onOpenSettings}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all text-sm group focus:outline-none focus:ring-1 focus:ring-primary/50"
                    aria-label="Open settings"
                >
                    <svg className="opacity-60 group-hover:rotate-90 transition-transform duration-700" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33 1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82 1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
                    <span>Settings</span>
                </button>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-popover/90 glass border border-border rounded-xl shadow-2xl py-1 z-50 w-32 animate-in fade-in zoom-in-95 duration-200"
                    style={{
                        top: Math.min(contextMenu.y, window.innerHeight - 100),
                        left: Math.min(contextMenu.x, window.innerWidth - 150)
                    }}
                >
                    <button
                        className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-accent transition-colors flex items-center gap-2"
                        onClick={() => {
                            const folder = folders.find(f => f.id === contextMenu.folderId);
                            if (folder) {
                                setIsRenaming(folder.id);
                                setRenameValue(folder.name);
                            }
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
                        Rename
                    </button>
                    <button
                        className="w-full text-left px-3 py-2 text-xs text-destructive hover:bg-destructive/10 transition-colors flex items-center gap-2"
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this folder? Notes will be moved to the root.')) {
                                onDeleteFolder(contextMenu.folderId);
                            }
                        }}
                    >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                        Delete
                    </button>
                </div>
            )}
        </aside>
    );
};

export default Sidebar;
