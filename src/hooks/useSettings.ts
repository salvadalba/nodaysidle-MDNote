import { useState, useCallback, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Settings } from '../types';

export const useSettings = () => {
    const [settings, setSettings] = useState<Settings | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const applyTheme = useCallback((theme: string) => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
            document.documentElement.classList.remove('dark');
        } else {
            // System preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            document.documentElement.classList.toggle('dark', prefersDark);
        }
    }, []);

    const fetchSettings = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await invoke<Settings>('get_settings');
            setSettings(res);
            // Apply theme on initial load
            if (res.theme) {
                applyTheme(res.theme);
            }
            return res;
        } catch (e: any) {
            setError(e.message || 'Failed to fetch settings');
            throw e;
        } finally {
            setLoading(false);
        }
    }, [applyTheme]);

    const updateSettings = useCallback(async (newSettings: Settings) => {
        setLoading(true);
        setError(null);
        try {
            const res = await invoke<Settings>('update_settings', { settings: newSettings });
            setSettings(res);
            // Apply theme on update
            if (res.theme) {
                applyTheme(res.theme);
            }
            return res;
        } catch (e: any) {
            setError(e.message || 'Failed to update settings');
            throw e;
        } finally {
            setLoading(false);
        }
    }, [applyTheme]);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    return {
        settings,
        loading,
        error,
        fetchSettings,
        updateSettings,
    };
};
