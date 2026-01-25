import React, { useState, useEffect, useRef } from 'react';
import { Note, Tag, Backlink } from '../types';
import { useTags } from '../hooks/useTags';
import { useBacklinks } from '../hooks/useBacklinks';
import BacklinkPanel from './BacklinkPanel';
import LoadingSkeleton from './LoadingSkeleton';

interface EditorProps {
    note: Note;
    onSave: (content: string, title?: string) => void;
    onSelectNote: (id: string) => void;
    onTagsChanged?: () => void;
    loading?: boolean;
}

const Editor: React.FC<EditorProps> = ({ note, onSave, onSelectNote, onTagsChanged, loading = false }) => {
    const [title, setTitle] = useState(note.title);
    const [content, setContent] = useState(note.content);
    const [isDirty, setIsDirty] = useState(false);
    const [tags, setTags] = useState<Tag[]>([]);
    const [backlinks, setBacklinks] = useState<Backlink[]>([]);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTagName, setNewTagName] = useState('');

    const { getNoteTags, createTag, addTagToNote, removeTagFromNote, listTags } = useTags();
    const { getBacklinks, syncBacklinks } = useBacklinks();
    const saveTimeoutRef = useRef<number | null>(null);

    useEffect(() => {
        setTitle(note.title);
        setContent(note.content);
        setIsDirty(false);
        if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);

        // Fetch tags for this note
        getNoteTags(note.id).then(setTags).catch(console.error);

        // Fetch backlinks
        getBacklinks(note.id).then(setBacklinks).catch(console.error);
    }, [note.id, getNoteTags, getBacklinks]);

    const debouncedSave = (newContent: string, newTitle: string) => {
        setIsDirty(true);
        if (saveTimeoutRef.current) window.clearTimeout(saveTimeoutRef.current);

        saveTimeoutRef.current = window.setTimeout(async () => {
            onSave(newContent, newTitle);

            // Sync backlinks after save
            try {
                await syncBacklinks(note.id, newContent);
            } catch (e) {
                console.error('Backlink sync failed:', e);
            }

            setIsDirty(false);
        }, 500) as unknown as number;
    };

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTitle = e.target.value;
        setTitle(newTitle);
        debouncedSave(content, newTitle);
    };

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newContent = e.target.value;
        setContent(newContent);
        debouncedSave(newContent, title);
    };

    const handleAddTag = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTagName.trim()) return;

        try {
            // Find or create tag
            const allTags = await listTags();
            let tag = allTags.find(t => t.name.toLowerCase() === newTagName.toLowerCase());

            let tagId;
            if (!tag) {
                const newTag = await createTag(newTagName.trim());
                tagId = newTag.id;
            } else {
                tagId = tag.id;
            }

            await addTagToNote(note.id, tagId);
            const updatedTags = await getNoteTags(note.id);
            setTags(updatedTags);
            setNewTagName('');
            setIsAddingTag(false);
            // Notify parent to refresh sidebar tags
            onTagsChanged?.();
        } catch (e) {
            console.error(e);
        }
    };

    const handleRemoveTag = async (tagId: string) => {
        try {
            await removeTagFromNote(note.id, tagId);
            setTags(tags.filter(t => t.id !== tagId));
            // Notify parent to refresh sidebar tags (count changed)
            onTagsChanged?.();
        } catch (e) {
            console.error(e);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col h-full bg-transparent max-w-4xl mx-auto overflow-y-auto w-full">
                <div className="p-8 pb-0 space-y-8">
                    <LoadingSkeleton height={48} width="60%" className="rounded-xl opacity-20" />
                    <div className="flex gap-2">
                        <LoadingSkeleton height={24} width={80} className="rounded-full opacity-10" />
                        <LoadingSkeleton height={24} width={100} className="rounded-full opacity-10" />
                    </div>
                    <LoadingSkeleton height="50vh" className="rounded-2xl opacity-5" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-transparent max-w-4xl mx-auto overflow-y-auto w-full">
            <div className="p-8 pb-0">
                <div className="flex items-center justify-between mb-4">
                    <label htmlFor="note-title-input" className="sr-only">Note Title</label>
                    <input
                        id="note-title-input"
                        type="text"
                        value={title}
                        onChange={handleTitleChange}
                        className="text-4xl font-bold bg-transparent border-none outline-none text-foreground placeholder:text-muted-foreground/30 flex-1 focus:ring-0"
                        placeholder="Note Title"
                    />
                    {isDirty && (
                        <div className="text-[10px] uppercase tracking-widest font-bold text-primary/80 animate-pulse flex items-center gap-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
                            <span className="w-1 h-1 bg-primary rounded-full"></span>
                            Auto-saving
                        </div>
                    )}
                </div>

                <div className="flex flex-wrap gap-2 mb-10 items-center min-h-[32px]">
                    {tags.map(tag => (
                        <div
                            key={tag.id}
                            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold border transition-all"
                            style={{ backgroundColor: `${tag.color}15`, color: tag.color, borderColor: `${tag.color}30` }}
                        >
                            <span>{tag.name}</span>
                            <button
                                onClick={() => handleRemoveTag(tag.id)}
                                className="hover:text-foreground transition-colors opacity-60 hover:opacity-100"
                                aria-label={`Remove tag ${tag.name}`}
                                title="Remove tag"
                            >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 6L6 18M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                    {isAddingTag ? (
                        <form onSubmit={handleAddTag}>
                            <label htmlFor="new-tag-input" className="sr-only">New Tag Name</label>
                            <input
                                id="new-tag-input"
                                autoFocus
                                type="text"
                                value={newTagName}
                                onChange={(e) => setNewTagName(e.target.value)}
                                onBlur={() => !newTagName && setIsAddingTag(false)}
                                className="bg-input border border-primary/50 rounded-full px-3 py-1 text-[11px] outline-none text-foreground focus:border-primary transition-colors"
                                placeholder="Tag name..."
                            />
                        </form>
                    ) : (
                        <button
                            onClick={() => setIsAddingTag(true)}
                            className="text-[11px] font-medium text-muted-foreground hover:text-foreground flex items-center gap-1.5 transition-colors px-3 py-1 rounded-full border border-border hover:bg-accent"
                            aria-label="Add new tag"
                        >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 5v14M5 12h14" /></svg>
                            Add Tag
                        </button>
                    )}
                </div>

                <label htmlFor="note-content-area" className="sr-only">Note Content</label>
                <textarea
                    id="note-content-area"
                    value={content}
                    onChange={handleContentChange}
                    className="w-full h-[calc(100vh-400px)] bg-transparent border-none outline-none resize-none text-lg leading-relaxed text-foreground placeholder:text-muted-foreground/30 scrollbar-thin scrollbar-thumb-secondary"
                    placeholder="Start writing... Tip: use [[ULID]] to link to other notes."
                />
            </div>

            <BacklinkPanel
                backlinks={backlinks}
                onSelectNote={onSelectNote}
            />
        </div>
    );
};

export default Editor;
