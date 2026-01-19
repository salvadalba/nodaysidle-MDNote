import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Note, ListNotesResponse, SearchResult } from '../types';

export const useNotes = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createNote = useCallback(async (title: string, content: string, folderId: string | null = null) => {
        setLoading(true);
        setError(null);
        try {
            const note = await invoke<Note>('create_note', { title, content, folderId });
            return note;
        } catch (e: any) {
            setError(e.message || 'Failed to create note');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const getNote = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const note = await invoke<Note>('get_note', { id });
            return note;
        } catch (e: any) {
            setError(e.message || 'Failed to fetch note');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateNote = useCallback(async (id: string, updates: { title?: string; content?: string; folderId?: string | null }) => {
        setLoading(true);
        setError(null);
        try {
            const note = await invoke<Note>('update_note', {
                id,
                title: updates.title,
                content: updates.content,
                folderId: updates.folderId !== undefined ? updates.folderId : undefined
            });
            return note;
        } catch (e: any) {
            setError(e.message || 'Failed to update note');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteNote = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            await invoke<boolean>('delete_note', { id });
            return true;
        } catch (e: any) {
            setError(e.message || 'Failed to delete note');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const listNotes = useCallback(async (folderId: string | null = null, tagId: string | null = null, limit: number = 50, offset: number = 0) => {
        setLoading(true);
        setError(null);
        try {
            const response = await invoke<ListNotesResponse>('list_notes', { folderId, tagId, limit, offset });
            return response;
        } catch (e: any) {
            setError(e.message || 'Failed to list notes');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const searchNotes = useCallback(async (query: string, limit: number = 20) => {
        setLoading(true);
        setError(null);
        try {
            const results = await invoke<SearchResult[]>('search_notes', { query, limit });
            return results;
        } catch (e: any) {
            setError(e.message || 'Search failed');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createNote,
        getNote,
        updateNote,
        deleteNote,
        listNotes,
        searchNotes,
    };
};
