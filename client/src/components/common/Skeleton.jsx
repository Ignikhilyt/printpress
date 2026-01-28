/**
 * Loading Skeleton Components
 * Beautiful animated skeletons for better loading states
 */

import { motion } from 'framer-motion';
import { cn } from '../../utils/helpers';

// Base skeleton with shimmer effect
export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn(
                'relative overflow-hidden bg-gray-200 dark:bg-gray-700 rounded-lg',
                'before:absolute before:inset-0',
                'before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent',
                'before:animate-[shimmer_1.5s_infinite]',
                className
            )}
            {...props}
        />
    );
}

// Text line skeleton
export function SkeletonText({ lines = 1, className }) {
    return (
        <div className={cn('space-y-2', className)}>
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton
                    key={i}
                    className={cn(
                        'h-4',
                        i === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
                    )}
                />
            ))}
        </div>
    );
}

// Avatar skeleton
export function SkeletonAvatar({ size = 'md' }) {
    const sizes = {
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-16 h-16',
    };

    return <Skeleton className={cn('rounded-full', sizes[size])} />;
}

// Card skeleton
export function SkeletonCard({ className }) {
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={cn(
                'bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700',
                className
            )}
        >
            <Skeleton className="w-full h-48 rounded-xl mb-4" />
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-10 w-28 rounded-full" />
            </div>
        </motion.div>
    );
}

// Note card skeleton
export function NoteCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 group">
            {/* Image skeleton */}
            <Skeleton className="w-full h-48" />

            {/* Content */}
            <div className="p-5">
                {/* Category badge */}
                <Skeleton className="h-5 w-16 rounded-full mb-3" />

                {/* Title */}
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-6 w-2/3 mb-3" />

                {/* Institute */}
                <div className="flex items-center gap-2 mb-4">
                    <SkeletonAvatar size="sm" />
                    <Skeleton className="h-4 w-24" />
                </div>

                {/* Price and button */}
                <div className="flex justify-between items-center pt-4 border-t border-gray-100 dark:border-gray-700">
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-10 w-28 rounded-full" />
                </div>
            </div>
        </div>
    );
}

// Order row skeleton
export function OrderRowSkeleton() {
    return (
        <div className="flex items-center gap-4 p-4 border-b border-gray-100 dark:border-gray-700">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-5 w-20" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
        </div>
    );
}

// Table skeleton
export function TableSkeleton({ rows = 5, columns = 5 }) {
    return (
        <div className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="bg-gray-50 dark:bg-gray-800 p-4 flex gap-4">
                {Array.from({ length: columns }).map((_, i) => (
                    <Skeleton key={i} className="h-4 flex-1" />
                ))}
            </div>

            {/* Rows */}
            {Array.from({ length: rows }).map((_, i) => (
                <div
                    key={i}
                    className="p-4 flex gap-4 border-t border-gray-100 dark:border-gray-700"
                >
                    {Array.from({ length: columns }).map((_, j) => (
                        <Skeleton key={j} className="h-5 flex-1" />
                    ))}
                </div>
            ))}
        </div>
    );
}

// Dashboard stats skeleton
export function StatCardSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-2" />
                    <Skeleton className="h-8 w-32" />
                </div>
                <Skeleton className="w-12 h-12 rounded-xl" />
            </div>
            <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    );
}

// Full page skeleton
export function PageSkeleton() {
    return (
        <div className="space-y-6 p-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <Skeleton className="h-8 w-48 mb-2" />
                    <Skeleton className="h-4 w-64" />
                </div>
                <Skeleton className="h-10 w-32 rounded-xl" />
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, i) => (
                    <StatCardSkeleton key={i} />
                ))}
            </div>

            {/* Content */}
            <TableSkeleton />
        </div>
    );
}

// Notes grid skeleton
export function NotesGridSkeleton({ count = 6 }) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <NoteCardSkeleton key={i} />
            ))}
        </div>
    );
}

export default Skeleton;
