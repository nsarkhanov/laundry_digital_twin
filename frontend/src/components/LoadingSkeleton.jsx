import React from 'react';

export function LoadingSkeleton() {
    return (
        <div className="dashboard-container relative z-10 animate-pulse">
            {/* Header Skeleton */}
            <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/10" />
                    <div className="h-8 w-48 bg-white/10 rounded" />
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-8 w-32 bg-white/10 rounded-full" />
                    <div className="h-8 w-28 bg-white/10 rounded-full" />
                </div>
            </header>

            {/* Main Content Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
                {/* Hero Card */}
                <div className="lg:col-span-9">
                    <div className="glass-card p-8 h-48">
                        <div className="h-6 w-32 bg-white/10 rounded mb-4" />
                        <div className="h-16 w-64 bg-white/10 rounded mb-4" />
                        <div className="flex gap-4">
                            <div className="h-4 w-24 bg-white/10 rounded" />
                            <div className="h-4 w-24 bg-white/10 rounded" />
                        </div>
                    </div>
                </div>

                {/* Monthly Summary */}
                <div className="lg:col-span-3">
                    <div className="glass-card p-6 h-48">
                        <div className="h-5 w-28 bg-white/10 rounded mb-4" />
                        <div className="space-y-3">
                            <div className="h-4 w-full bg-white/10 rounded" />
                            <div className="h-4 w-3/4 bg-white/10 rounded" />
                            <div className="h-4 w-5/6 bg-white/10 rounded" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Grid Skeleton */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="glass-card p-4">
                        <div className="h-4 w-20 bg-white/10 rounded mb-2" />
                        <div className="h-8 w-16 bg-white/10 rounded" />
                    </div>
                ))}
            </div>

            {/* Tariffs Widget Skeleton */}
            <div className="glass-card p-6">
                <div className="h-5 w-32 bg-white/10 rounded mb-4" />
                <div className="grid grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-20 bg-white/10 rounded" />
                    ))}
                </div>
            </div>
        </div>
    );
}

export function CardSkeleton({ className = '' }) {
    return (
        <div className={`glass-card p-4 animate-pulse ${className}`}>
            <div className="h-4 w-24 bg-white/10 rounded mb-3" />
            <div className="h-8 w-16 bg-white/10 rounded" />
        </div>
    );
}

export default LoadingSkeleton;
