import React, { useState } from 'react';
import { Settings } from '../types';

interface SettingsModalProps {
    settings: Settings;
    onSave: (settings: Settings) => void;
    onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ settings: initialSettings, onSave, onClose }) => {
    const [settings, setSettings] = useState<Settings>(initialSettings);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(settings);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden glass translate-y-[-20px] animate-in slide-in-from-top-4 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="p-6 border-b border-border flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-foreground">Settings</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors focus:outline-none focus:ring-1 focus:ring-primary"
                        title="Close settings"
                        aria-label="Close settings"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-6">
                    {/* Theme */}
                    <div className="space-y-2">
                        <label id="appearance-label" className="text-sm font-medium text-muted-foreground">Appearance</label>
                        <div className="flex gap-2 p-1 bg-secondary/50 rounded-xl border border-border" aria-labelledby="appearance-label">
                            {['light', 'dark', 'system'].map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setSettings({ ...settings, theme: t })}
                                    className={`flex-1 py-1.5 text-xs font-medium rounded-lg capitalize transition-all ${settings.theme === t
                                        ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                    aria-pressed={settings.theme === t ? "true" : "false"}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Typography */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label htmlFor="font-size-input" className="text-sm font-medium text-muted-foreground">Font Size</label>
                            <input
                                id="font-size-input"
                                type="number"
                                value={settings.font_size}
                                onChange={(e) => setSettings({ ...settings, font_size: parseInt(e.target.value) })}
                                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
                            />
                        </div>
                        <div className="space-y-2">
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="font-family-select" className="text-sm font-medium text-muted-foreground">Font Family</label>
                            <select
                                id="font-family-select"
                                value={settings.font_family}
                                onChange={(e) => setSettings({ ...settings, font_family: e.target.value })}
                                className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
                            >
                                <option value="Inter">Inter</option>
                                <option value="Roboto">Roboto</option>
                                <option value="Outfit">Outfit</option>
                                <option value="monospace">Monospace</option>
                            </select>
                        </div>
                    </div>

                    {/* Auto Save */}
                    <div className="space-y-2">
                        <label htmlFor="auto-save-delay-input" className="text-sm font-medium text-muted-foreground">Auto-save Delay (ms)</label>
                        <input
                            id="auto-save-delay-input"
                            type="number"
                            value={settings.auto_save_delay}
                            onChange={(e) => setSettings({ ...settings, auto_save_delay: parseInt(e.target.value) })}
                            step="100"
                            min="100"
                            className="w-full bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground outline-none focus:border-primary/50 transition-colors"
                        />
                    </div>

                    {/* Spell Check */}
                    <div className="flex items-center justify-between">
                        <label id="spellcheck-label" className="text-sm font-medium text-muted-foreground">Spell Check</label>
                        <button
                            type="button"
                            onClick={() => setSettings({ ...settings, spell_check: !settings.spell_check })}
                            className={`w-10 h-6 rounded-full transition-colors relative focus:outline-none focus:ring-1 focus:ring-primary ${settings.spell_check ? 'bg-primary' : 'bg-secondary'
                                }`}
                            aria-labelledby="spellcheck-label"
                            aria-pressed={settings.spell_check ? "true" : "false"}
                            title="Toggle spell check"
                        >
                            <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${settings.spell_check ? 'translate-x-4' : ''
                                }`} />
                        </button>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-2.5 text-sm font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 text-sm font-medium bg-blue-500 hover:bg-blue-400 text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-[0.98]"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SettingsModal;
