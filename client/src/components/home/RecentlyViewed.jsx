import { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { cn, formatCurrency } from '../../utils/helpers';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import Badge from '../common/Badge';
import StarRating from '../common/StarRating';

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
    clock: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    ),
    refresh: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
    ),
    document: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
    ),
    chevronLeft: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
    ),
    chevronRight: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
    ),
    arrowRight: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
    ),
    trash: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
    ),
    eye: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
    ),
    cart: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
    ),
    x: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
    ),
};

// ============================================================================
// CATEGORY CONFIGURATIONS
// ============================================================================

const CATEGORY_CONFIG = {
    UPSC: { color: '#6366f1', label: 'UPSC' },
    SSC: { color: '#10b981', label: 'SSC' },
    BANKING: { color: '#f59e0b', label: 'Banking' },
    STATE_PCS: { color: '#8b5cf6', label: 'State PCS' },
    RAILWAY: { color: '#ef4444', label: 'Railway' },
    DEFENCE: { color: '#0ea5e9', label: 'Defence' },
    TEACHING: { color: '#ec4899', label: 'Teaching' },
    OTHER: { color: '#64748b', label: 'Other' },
};

// ============================================================================
// RECENTLY VIEWED ITEM CARD
// ============================================================================

const RecentlyViewedCard = ({
    note,
    index,
    onRemove,
    showRemove = true,
    variant = 'default', // default, compact, detailed
    className = ''
}) => {
    const cardRef = useRef(null);
    const isInView = useInView(cardRef, { once: true, margin: '-20px' });
    const config = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.OTHER;
    const [isHovered, setIsHovered] = useState(false);

    const truncate = (str, len = 25) =>
        str?.length > len ? str.substring(0, len) + '...' : str;

    const handleRemove = (e) => {
        e.preventDefault();
        e.stopPropagation();
        onRemove?.(note.id);
    };

    if (variant === 'compact') {
        return (
            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: index * 0.05 }}
                className={cn(
                    'flex items-center gap-3 p-3 rounded-lg',
                    'bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700',
                    'hover:shadow-md transition-shadow',
                    className
                )}
            >
                <Link to={`/notes/${note.slug}`} className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${config.color}15`, color: config.color }}
                    >
                        {Icons.document}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            {note.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            {formatCurrency(note.pageCount * note.pricePerPage)}
                        </p>
                    </div>
                </Link>
                {showRemove && (
                    <button
                        onClick={handleRemove}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors"
                        title="Remove from history"
                    >
                        {Icons.x}
                    </button>
                )}
            </motion.div>
        );
    }

    if (variant === 'detailed') {
        return (
            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -4 }}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                className={cn(
                    'group bg-white dark:bg-gray-800 rounded-xl overflow-hidden',
                    'border border-gray-100 dark:border-gray-700',
                    'shadow-md hover:shadow-xl transition-all',
                    className
                )}
            >
                <Link to={`/notes/${note.slug}`} className="block">
                    {/* Image area */}
                    <div
                        className="relative h-32 flex items-center justify-center"
                        style={{ backgroundColor: `${config.color}10` }}
                    >
                        <motion.div
                            animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
                            style={{ color: config.color }}
                        >
                            {Icons.document}
                        </motion.div>

                        {/* Remove button */}
                        {showRemove && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
                                onClick={handleRemove}
                                className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/90 dark:bg-gray-800/90 text-gray-400 hover:text-red-500 shadow-sm"
                                title="Remove from history"
                            >
                                {Icons.x}
                            </motion.button>
                        )}

                        {/* View badge */}
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 px-2 py-1 bg-white/90 dark:bg-gray-800/90 rounded-lg text-xs text-gray-600 dark:text-gray-400">
                            {Icons.eye}
                            <span>Viewed</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <Badge
                            variant="default"
                            type="soft"
                            size="sm"
                            className="mb-2"
                            style={{ backgroundColor: `${config.color}15`, color: config.color }}
                        >
                            {config.label}
                        </Badge>

                        <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                            {note.title}
                        </h4>

                        <div className="flex items-center gap-2 mb-3">
                            <StarRating rating={note.rating || 4.5} size="xs" />
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                                {note.pageCount} pages
                            </span>
                        </div>

                        <div className="flex items-center justify-between">
                            <span className="font-bold text-gray-900 dark:text-white">
                                {formatCurrency(note.pageCount * note.pricePerPage)}
                            </span>
                            <motion.span
                                initial={{ x: -5, opacity: 0 }}
                                animate={{ x: isHovered ? 0 : -5, opacity: isHovered ? 1 : 0 }}
                                className="text-amber-600 dark:text-amber-400"
                            >
                                {Icons.arrowRight}
                            </motion.span>
                        </div>
                    </div>
                </Link>
            </motion.div>
        );
    }

    // Default variant
    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            className={cn(
                'min-w-[240px] max-w-[240px] group',
                className
            )}
        >
            <Link
                to={`/notes/${note.slug}`}
                className="block bg-white dark:bg-gray-800 rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
            >
                {/* Icon area */}
                <div
                    className="w-full h-24 rounded-lg flex items-center justify-center mb-3 relative overflow-hidden"
                    style={{ backgroundColor: `${config.color}10` }}
                >
                    <motion.div
                        animate={isHovered ? { scale: 1.15, rotate: 5 } : { scale: 1, rotate: 0 }}
                        style={{ color: config.color }}
                    >
                        {Icons.document}
                    </motion.div>

                    {/* Remove button overlay */}
                    {showRemove && (
                        <motion.button
                            initial={{ opacity: 0 }}
                            animate={{ opacity: isHovered ? 1 : 0 }}
                            onClick={handleRemove}
                            className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-gray-800/80 text-gray-400 hover:text-red-500"
                        >
                            {Icons.x}
                        </motion.button>
                    )}
                </div>

                {/* Badge */}
                <Badge
                    className="mb-2"
                    style={{ backgroundColor: `${config.color}15`, color: config.color }}
                >
                    {config.label}
                </Badge>

                {/* Title */}
                <h4 className="font-semibold text-sm text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {truncate(note.title, 40)}
                </h4>

                {/* Meta */}
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {note.pageCount} pages
                </p>

                {/* Price */}
                <p className="font-bold" style={{ color: config.color }}>
                    {formatCurrency(note.pageCount * note.pricePerPage)}
                </p>
            </Link>
        </motion.div>
    );
};

// ============================================================================
// CAROUSEL CONTROLS
// ============================================================================

const CarouselControls = ({ canScrollLeft, canScrollRight, onScrollLeft, onScrollRight }) => (
    <div className="hidden md:flex items-center gap-2">
        <button
            onClick={onScrollLeft}
            disabled={!canScrollLeft}
            className={cn(
                'p-2 rounded-lg transition-colors',
                canScrollLeft
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-amber-600'
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 cursor-not-allowed'
            )}
            aria-label="Scroll left"
        >
            {Icons.chevronLeft}
        </button>
        <button
            onClick={onScrollRight}
            disabled={!canScrollRight}
            className={cn(
                'p-2 rounded-lg transition-colors',
                canScrollRight
                    ? 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-amber-600'
                    : 'bg-gray-50 dark:bg-gray-900 text-gray-300 dark:text-gray-700 cursor-not-allowed'
            )}
            aria-label="Scroll right"
        >
            {Icons.chevronRight}
        </button>
    </div>
);

// ============================================================================
// MAIN RECENTLY VIEWED COMPONENT
// ============================================================================

export default function RecentlyViewed({
    title = 'Recently Viewed',
    maxItems = 10,
    variant = 'carousel', // carousel, grid, list
    showClearAll = true,
    showRemoveButtons = true,
    emptyMessage = "You haven't viewed any notes yet.",
    className = '',
    ...props
}) {
    const { items, removeItem, clearAll } = useRecentlyViewed();
    const scrollRef = useRef(null);
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-50px' });
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // Update scroll buttons state
    const updateScrollButtons = useCallback(() => {
        if (scrollRef.current) {
            const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
            setCanScrollLeft(scrollLeft > 0);
            setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
        }
    }, []);

    useEffect(() => {
        updateScrollButtons();
        const scrollEl = scrollRef.current;
        if (scrollEl) {
            scrollEl.addEventListener('scroll', updateScrollButtons);
            window.addEventListener('resize', updateScrollButtons);
            return () => {
                scrollEl.removeEventListener('scroll', updateScrollButtons);
                window.removeEventListener('resize', updateScrollButtons);
            };
        }
    }, [updateScrollButtons, items]);

    // Scroll functions
    const scroll = useCallback((direction) => {
        if (scrollRef.current) {
            const scrollAmount = 280; // Card width + gap
            scrollRef.current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth',
            });
        }
    }, []);

    // Handle clear all
    const handleClearAll = useCallback(() => {
        if (window.confirm('Clear all recently viewed items?')) {
            clearAll?.();
        }
    }, [clearAll]);

    // Don't render if no items
    if (!items || items.length === 0) {
        return null;
    }

    const displayItems = items.slice(0, maxItems);

    return (
        <section
            ref={sectionRef}
            className={cn(
                'py-12 lg:py-16 bg-gray-50 dark:bg-gray-900/50',
                className
            )}
            {...props}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="flex items-center justify-between mb-6"
                >
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400">
                            {Icons.clock}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {title}
                            </h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {displayItems.length} item{displayItems.length !== 1 ? 's' : ''}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {showClearAll && displayItems.length > 0 && (
                            <button
                                onClick={handleClearAll}
                                className="text-sm text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors flex items-center gap-1"
                            >
                                {Icons.trash}
                                <span className="hidden sm:inline">Clear All</span>
                            </button>
                        )}

                        {variant === 'carousel' && (
                            <CarouselControls
                                canScrollLeft={canScrollLeft}
                                canScrollRight={canScrollRight}
                                onScrollLeft={() => scroll('left')}
                                onScrollRight={() => scroll('right')}
                            />
                        )}
                    </div>
                </motion.div>

                {/* Content */}
                {variant === 'carousel' && (
                    <div
                        ref={scrollRef}
                        className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
                    >
                        <AnimatePresence>
                            {displayItems.map((note, index) => (
                                <RecentlyViewedCard
                                    key={note.id}
                                    note={note}
                                    index={index}
                                    onRemove={removeItem}
                                    showRemove={showRemoveButtons}
                                    variant="default"
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {variant === 'grid' && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        <AnimatePresence>
                            {displayItems.map((note, index) => (
                                <RecentlyViewedCard
                                    key={note.id}
                                    note={note}
                                    index={index}
                                    onRemove={removeItem}
                                    showRemove={showRemoveButtons}
                                    variant="detailed"
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {variant === 'list' && (
                    <div className="grid gap-3 max-w-2xl">
                        <AnimatePresence>
                            {displayItems.map((note, index) => (
                                <RecentlyViewedCard
                                    key={note.id}
                                    note={note}
                                    index={index}
                                    onRemove={removeItem}
                                    showRemove={showRemoveButtons}
                                    variant="compact"
                                />
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* View more link */}
                {items.length > maxItems && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={isInView ? { opacity: 1 } : {}}
                        transition={{ delay: 0.5 }}
                        className="mt-6 text-center"
                    >
                        <Link
                            to="/notes"
                            className="inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
                        >
                            View all {items.length} items
                            {Icons.arrowRight}
                        </Link>
                    </motion.div>
                )}
            </div>
        </section>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { RecentlyViewedCard, CarouselControls };
