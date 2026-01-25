import React, { useEffect, useState, useCallback } from 'react';
import { useNotes } from './hooks/useNotes';
import { useFolders } from './hooks/useFolders';
import { useTags } from './hooks/useTags';
import { useSettings } from './hooks/useSettings';
import { NoteSummary, Note, FolderListItem, TagWithCount } from './types';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import CommandPalette from './components/CommandPalette';
import SettingsModal from './components/SettingsModal';

const App: React.FC = () => {
  const { listNotes, getNote, createNote, updateNote } = useNotes();
  const { listFolders, createFolder, updateFolder, deleteFolder } = useFolders();
  const { listTags, createTag, deleteTag } = useTags();
  const { settings, updateSettings } = useSettings();

  const [notes, setNotes] = useState<NoteSummary[]>([]);
  const [folders, setFolders] = useState<FolderListItem[]>([]);
  const [tags, setTags] = useState<TagWithCount[]>([]);

  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);
  const [selectedTagId, setSelectedTagId] = useState<string | null>(null);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [showSearch, setShowSearch] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isLoadingSidebar, setIsLoadingSidebar] = useState(true);
  const [isLoadingNote, setIsLoadingNote] = useState(false);

  const fetchFolders = useCallback(async () => {
    try {
      const res = await listFolders();
      setFolders(res);
    } catch (e) {
      console.error(e);
    }
  }, [listFolders]);

  const fetchTags = useCallback(async () => {
    try {
      const res = await listTags();
      setTags(res);
    } catch (e) {
      console.error(e);
    }
  }, [listTags]);

  const fetchNotes = useCallback(async (folderId: string | null = null, tagId: string | null = null) => {
    try {
      const res = await listNotes(folderId, tagId);
      setNotes(res.notes);
    } catch (e) {
      console.error(e);
    }
  }, [listNotes]);

  useEffect(() => {
    const init = async () => {
      setIsLoadingSidebar(true);
      await Promise.all([fetchFolders(), fetchTags()]);
      setIsLoadingSidebar(false);
    };
    init();
  }, [fetchFolders, fetchTags]);

  useEffect(() => {
    fetchNotes(selectedFolderId, selectedTagId);
  }, [selectedFolderId, selectedTagId, fetchNotes]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K: Open search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearch(true);
      }
      // Cmd/Ctrl + ,: Open settings
      if ((e.metaKey || e.ctrlKey) && e.key === ',') {
        e.preventDefault();
        setShowSettings(true);
      }
      // Cmd/Ctrl + N: New note
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        handleCreateNote();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFolderId, selectedTagId]);

  const handleSelectNote = async (id: string) => {
    try {
      setIsLoadingNote(true);
      const note = await getNote(id);
      setSelectedNote(note);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingNote(false);
    }
  };

  const handleCreateNote = async () => {
    try {
      const note = await createNote('New Note', '', selectedFolderId);
      setSelectedNote(note);
      fetchNotes(selectedFolderId, selectedTagId);
      fetchFolders();
      fetchTags();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateFolder = async (name: string) => {
    try {
      await createFolder(name);
      fetchFolders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateTag = async (name: string) => {
    try {
      await createTag(name);
      fetchTags();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteTag = async (id: string) => {
    try {
      await deleteTag(id);
      if (selectedTagId === id) setSelectedTagId(null);
      fetchTags();
      fetchNotes(selectedFolderId, selectedTagId === id ? null : selectedTagId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleUpdateFolder = async (id: string, name: string) => {
    try {
      await updateFolder(id, { name });
      fetchFolders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteFolder = async (id: string) => {
    try {
      await deleteFolder(id, false);
      if (selectedFolderId === id) setSelectedFolderId(null);
      fetchFolders();
      fetchNotes(selectedFolderId === id ? null : selectedFolderId, selectedTagId);
    } catch (e) {
      console.error(e);
    }
  };

  const handleMoveNote = async (noteId: string, folderId: string | null) => {
    try {
      await updateNote(noteId, { folderId });
      fetchNotes(selectedFolderId, selectedTagId);
      fetchFolders();
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveNote = async (content: string, title?: string) => {
    if (!selectedNote) return;
    try {
      const updated = await updateNote(selectedNote.id, { content, title });
      setSelectedNote(updated);
      fetchNotes(selectedFolderId, selectedTagId);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      <Sidebar
        notes={notes}
        folders={folders}
        tags={tags}
        selectedFolderId={selectedFolderId}
        selectedTagId={selectedTagId}
        onSelectNote={handleSelectNote}
        onSelectFolder={setSelectedFolderId}
        onSelectTag={setSelectedTagId}
        onCreateNote={handleCreateNote}
        onCreateFolder={handleCreateFolder}
        onCreateTag={handleCreateTag}
        onDeleteTag={handleDeleteTag}
        onRenameFolder={handleUpdateFolder}
        onDeleteFolder={handleDeleteFolder}
        onMoveNote={handleMoveNote}
        onOpenSettings={() => setShowSettings(true)}
        selectedNoteId={selectedNote?.id}
        loading={isLoadingSidebar}
      />
      <main className="flex-1 overflow-hidden relative border-l border-border/10">
        <div className="absolute inset-0 bg-background/30 backdrop-blur-sm">
          {selectedNote ? (
            <Editor note={selectedNote} onSave={handleSaveNote} onSelectNote={handleSelectNote} onTagsChanged={fetchTags} loading={isLoadingNote} />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground gap-6 flex-col animate-in fade-in zoom-in duration-500">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-2xl shadow-primary/5">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary"><path d="M12 5v14M5 12h14" /></svg>
              </div>
              <div className="text-center space-y-2">
                <p className="text-xl font-medium text-foreground">Your notes are waiting</p>
                <p className="text-sm text-muted-foreground">Create a new note or search to begin</p>
              </div>
              <div className="flex gap-3">
                <div className="flex flex-col items-center gap-1">
                  <kbd className="px-2.5 py-1.5 bg-secondary/80 rounded-lg border border-border text-xs font-mono text-foreground shadow-sm leading-none">⌘ K</kbd>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-tighter font-bold">Search</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <kbd className="px-2.5 py-1.5 bg-secondary/80 rounded-lg border border-border text-xs font-mono text-foreground shadow-sm leading-none">⌘ N</kbd>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-tighter font-bold">New Note</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      {showSearch && (
        <CommandPalette
          onSelect={handleSelectNote}
          onClose={() => setShowSearch(false)}
        />
      )}
      {showSettings && settings && (
        <SettingsModal
          settings={settings}
          onSave={updateSettings}
          onClose={() => setShowSettings(false)}
        />
      )}
    </div>
  );
};

export default App;
