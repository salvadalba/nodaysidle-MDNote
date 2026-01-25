import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Tag, TagWithCount } from '../types';

export const useTags = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createTag = useCallback(async (name: string, color?: string) => {
        setLoading(true);
        setError(null);
        try {
            const tag = await invoke<Tag>('create_tag', { name, color });
            return tag;
        } catch (e: any) {
            setError(e.message || 'Failed to create tag');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const listTags = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const tags = await invoke<TagWithCount[]>('list_tags');
            return tags;
        } catch (e: any) {
            setError(e.message || 'Failed to list tags');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const addTagToNote = useCallback(async (noteId: string, tagId: string) => {
        setLoading(true);
        setError(null);
        try {
            await invoke<void>('add_tag_to_note', { noteId, tagId });
        } catch (e: any) {
            setError(e.message || 'Failed to add tag to note');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const removeTagFromNote = useCallback(async (noteId: string, tagId: string) => {
        setLoading(true);
        setError(null);
        try {
            await invoke<void>('remove_tag_from_note', { noteId, tagId });
        } catch (e: any) {
            setError(e.message || 'Failed to remove tag from note');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const getNoteTags = useCallback(async (noteId: string) => {
        setLoading(true);
        setError(null);
        try {
            const tags = await invoke<Tag[]>('get_note_tags', { noteId });
            return tags;
        } catch (e: any) {
            setError(e.message || 'Failed to get note tags');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteTag = useCallback(async (tagId: string) => {
        setLoading(true);
        setError(null);
        try {
            await invoke<void>('delete_tag', { tagId });
        } catch (e: any) {
            setError(e.message || 'Failed to delete tag');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createTag,
        listTags,
        addTagToNote,
        removeTagFromNote,
        getNoteTags,
        deleteTag,
    };
};
