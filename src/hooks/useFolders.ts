import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Folder, FolderListItem } from '../types';

export const useFolders = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const createFolder = useCallback(async (name: string, parentId: string | null = null) => {
        setLoading(true);
        setError(null);
        try {
            const folder = await invoke<Folder>('create_folder', { name, parentId });
            return folder;
        } catch (e: any) {
            setError(e.message || 'Failed to create folder');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const listFolders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const folders = await invoke<FolderListItem[]>('list_folders');
            return folders;
        } catch (e: any) {
            setError(e.message || 'Failed to list folders');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const updateFolder = useCallback(async (id: string, updates: { name?: string; parentId?: string | null }) => {
        setLoading(true);
        setError(null);
        try {
            const folder = await invoke<Folder>('update_folder', {
                id,
                name: updates.name,
                parentId: updates.parentId !== undefined ? updates.parentId : undefined
            });
            return folder;
        } catch (e: any) {
            setError(e.message || 'Failed to update folder');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const deleteFolder = useCallback(async (id: string, deleteNotes: boolean = false) => {
        setLoading(true);
        setError(null);
        try {
            await invoke<{ success: boolean; moved_notes: number }>('delete_folder', { id, deleteNotes });
            return true;
        } catch (e: any) {
            setError(e.message || 'Failed to delete folder');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        createFolder,
        listFolders,
        updateFolder,
        deleteFolder,
    };
};
