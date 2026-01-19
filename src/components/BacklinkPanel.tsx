import React from 'react';
import { Backlink } from '../types';

interface BacklinkPanelProps {
    backlinks: Backlink[];
    onSelectNote: (id: string) => void;
}

const BacklinkPanel: React.FC<BacklinkPanelProps> = ({ backlinks, onSelectNote }) => {
    if (backlinks.length === 0) {
        return (
            <div className="p-4 text-xs text-muted-foreground italic opacity-60 border-t border-border">
                No backlinks found for this note.
            </div>
        );
    }

    return (
        <div className="border-t border-border bg-background/40 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-2 duration-300">
            <h3 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3 flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
                Backlinks ({backlinks.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {backlinks.map((link) => (
                    <button
                        key={link.source_id}
                        onClick={() => onSelectNote(link.source_id)}
                        className="text-left p-3 rounded-xl bg-card border border-border hover:border-primary/50 hover:bg-accent transition-all group overflow-hidden"
                    >
                        <div className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate mb-1">
                            {link.source_title || 'Untitled'}
                        </div>
                        {link.context && (
                            <div className="text-[11px] text-muted-foreground italic line-clamp-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                {link.context.split('[[').join('**[[').split(']]').join(']]**')}
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default BacklinkPanel;
