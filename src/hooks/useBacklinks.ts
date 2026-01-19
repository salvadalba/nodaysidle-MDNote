import { useState, useCallback } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Backlink, NoteSummary } from '../types';

export const useBacklinks = () => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getBacklinks = useCallback(async (targetId: string) => {
        setLoading(true);
        setError(null);
        try {
            const results = await invoke<Backlink[]>('get_backlinks', { targetId });
            return results;
        } catch (e: any) {
            setError(e.message || 'Failed to fetch backlinks');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const getOutgoingLinks = useCallback(async (sourceId: string) => {
        setLoading(true);
        setError(null);
        try {
            const results = await invoke<NoteSummary[]>('get_outgoing_links', { sourceId });
            return results;
        } catch (e: any) {
            setError(e.message || 'Failed to fetch outgoing links');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    const syncBacklinks = useCallback(async (sourceId: string, content: string) => {
        setLoading(true);
        setError(null);
        try {
            await invoke('sync_backlinks', { source_id: sourceId, content });
        } catch (e: any) {
            setError(e.message || 'Failed to sync backlinks');
            throw e;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        loading,
        error,
        getBacklinks,
        getOutgoingLinks,
        syncBacklinks,
    };
};
