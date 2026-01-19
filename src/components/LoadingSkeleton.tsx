import React from 'react';

interface SkeletonProps {
    className?: string;
    width?: string | number;
    height?: string | number;
    circle?: boolean;
}

const LoadingSkeleton: React.FC<SkeletonProps> = ({
    className = '',
    width,
    height,
    circle = false
}) => {
    const style: React.CSSProperties = {
        width: width,
        height: height,
        borderRadius: circle ? '50%' : '0.5rem',
    };

    return (
        <div
            className={`relative overflow-hidden bg-muted/20 ${className}`}
            style={style}
        >
            <div className="absolute inset-0 shimmer" />
        </div>
    );
};

export const SidebarSkeleton: React.FC = () => (
    <div className="flex flex-col gap-4 p-4">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="flex flex-col gap-2">
                <LoadingSkeleton height={14} width="40%" className="mb-1" />
                {[...Array(3)].map((_, j) => (
                    <LoadingSkeleton key={j} height={32} className="rounded-lg" />
                ))}
            </div>
        ))}
    </div>
);

export const NoteListSkeleton: React.FC = () => (
    <div className="flex flex-col gap-2 p-4">
        {[...Array(8)].map((_, i) => (
            <div key={i} className="p-3 bg-card rounded-xl border border-border space-y-2">
                <LoadingSkeleton height={18} width="70%" />
                <LoadingSkeleton height={12} width="90%" />
                <LoadingSkeleton height={12} width="40%" />
            </div>
        ))}
    </div>
);

export default LoadingSkeleton;
