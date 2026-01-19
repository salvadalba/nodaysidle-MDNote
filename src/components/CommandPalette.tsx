import React, { useState, useEffect, useRef } from 'react';
import { useNotes } from '../hooks/useNotes';
import { SearchResult } from '../types';

interface CommandPaletteProps {
    onSelect: (id: string) => void;
    onClose: () => void;
}

const CommandPalette: React.FC<CommandPaletteProps> = ({ onSelect, onClose }) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const { searchNotes } = useNotes();
    const inputRef = useRef<HTMLInputElement>(null);
    const listRef = useRef<HTMLDivElement>(null);
    const selectedItemRef = useRef<HTMLLIElement>(null);

    useEffect(() => {
        inputRef.current?.focus();

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (results.length > 0 ? (prev + 1) % results.length : 0));
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (results.length > 0 ? (prev - 1 + results.length) % results.length : 0));
            }
            if (e.key === 'Enter' && results[selectedIndex]) {
                onSelect(results[selectedIndex].id);
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [results, selectedIndex, onClose, onSelect]);

    useEffect(() => {
        if (selectedItemRef.current) {
            selectedItemRef.current.scrollIntoView({
                block: 'nearest',
                behavior: 'smooth'
            });
        }
    }, [selectedIndex]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const timer = setTimeout(async () => {
            try {
                const res = await searchNotes(query);
                setResults(res);
                setSelectedIndex(0);
            } catch (e) {
                console.error(e);
            }
        }, 200);

        return () => clearTimeout(timer);
    }, [query, searchNotes]);

    const highlightText = (text: string) => {
        return text.replace(/==([^=]+)==/g, '<span class="text-blue-400 font-bold bg-blue-500/10 px-0.5 rounded">$1</span>');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4 pointer-events-none" role="dialog" aria-modal="true" aria-label="Search Palette">
            <div className="fixed inset-0 bg-background/20 backdrop-blur-md pointer-events-auto animate-in fade-in duration-300" onClick={onClose} />
            <div className="w-full max-w-2xl bg-popover border border-border rounded-2xl shadow-2xl overflow-hidden pointer-events-auto glass scale-95 animate-in fade-in zoom-in duration-300 slide-in-from-top-4">
                <div className="p-5 border-b border-border flex items-center gap-4 bg-secondary/20">
                    <svg className="text-muted-foreground" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
                    <input
                        ref={inputRef}
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full bg-transparent border-none outline-none text-xl text-foreground placeholder:text-muted-foreground focus:ring-0"
                        placeholder="Search your knowledge..."
                        aria-label="Search notes"
                    />
                </div>
                <div ref={listRef} className="max-h-[50vh] overflow-y-auto scrollbar-thin scrollbar-thumb-secondary">
                    {results.length === 0 ? (
                        query.trim() ? (
                            <div className="p-12 text-center text-muted-foreground space-y-2">
                                <div className="text-2xl opacity-20">No matching notes found</div>
                                <div className="text-sm opacity-40">Try a different search term</div>
                            </div>
                        ) : (
                            <div className="p-12 text-center text-muted-foreground text-sm italic opacity-40">Start typing to search notes and content...</div>
                        )
                    ) : (
                        <ul className="p-2 space-y-1">
                            {results.map((result, index) => (
                                <li key={result.id} ref={index === selectedIndex ? selectedItemRef : null}>
                                    <button
                                        onClick={() => {
                                            onSelect(result.id);
                                            onClose();
                                        }}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                        className={`w-full text-left px-4 py-3 rounded-xl transition-all duration-200 group flex flex-col gap-1 ${index === selectedIndex
                                            ? 'bg-primary/10 border border-primary/20 shadow-lg shadow-primary/5'
                                            : 'border border-transparent hover:bg-accent'
                                            }`}
                                        alt-text={result.title}
                                    >
                                        <div className={`font-semibold transition-colors ${index === selectedIndex ? 'text-primary' : 'text-foreground'}`}>{result.title}</div>
                                        <div
                                            className="text-xs text-muted-foreground line-clamp-2 leading-relaxed"
                                            dangerouslySetInnerHTML={{ __html: highlightText(result.snippet) }}
                                        />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
                <div className="p-3 bg-secondary/30 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-wider px-6">
                    <div className="flex gap-4">
                        <span className="flex items-center gap-1.5"><kbd className="bg-background/50 px-1.5 py-0.5 rounded border border-border text-foreground">↑↓</kbd> Navigate</span>
                        <span className="flex items-center gap-1.5"><kbd className="bg-background/50 px-1.5 py-0.5 rounded border border-border text-foreground">Enter</kbd> Open note</span>
                    </div>
                    <span className="flex items-center gap-1.5"><kbd className="bg-background/50 px-1.5 py-0.5 rounded border border-border text-foreground">Esc</kbd> Close</span>
                </div>
            </div>
        </div>
    );
};

export default CommandPalette;
