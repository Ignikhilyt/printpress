import { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== ICONS ====================

const ChevronLeftIcon = ({ size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="15 18 9 12 15 6" />
    </svg>
);

const ChevronRightIcon = ({ size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 18 15 12 9 6" />
    </svg>
);

const ChevronsLeftIcon = ({ size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="11 17 6 12 11 7" />
        <polyline points="18 17 13 12 18 7" />
    </svg>
);

const ChevronsRightIcon = ({ size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="13 17 18 12 13 7" />
        <polyline points="6 17 11 12 6 7" />
    </svg>
);

const MoreHorizontalIcon = ({ size = 16 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="19" cy="12" r="1" />
        <circle cx="5" cy="12" r="1" />
    </svg>
);

// ==================== UTILITY FUNCTIONS ====================

const cn = (...classes) => classes.filter(Boolean).join(' ');

const range = (start, end) => {
    const length = end - start + 1;
    return Array.from({ length }, (_, i) => start + i);
};

// ==================== CONSTANTS ====================

const SIZE_CONFIG = {
    sm: {
        button: 'min-w-[28px] h-7 text-xs',
        select: 'text-xs py-1 px-2',
        gap: 'gap-0.5',
    },
    md: {
        button: 'min-w-[36px] h-9 text-sm',
        select: 'text-sm py-1.5 px-3',
        gap: 'gap-1',
    },
    lg: {
        button: 'min-w-[44px] h-11 text-base',
        select: 'text-base py-2 px-4',
        gap: 'gap-1.5',
    },
};

const VARIANT_CONFIG = {
    default: {
        button: 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300',
        active: 'bg-indigo-500 border-indigo-500 text-white hover:bg-indigo-600',
        disabled: 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed',
    },
    outlined: {
        button: 'bg-transparent border-2 border-gray-300 text-gray-700 hover:border-indigo-500 hover:text-indigo-500',
        active: 'bg-transparent border-2 border-indigo-500 text-indigo-500',
        disabled: 'bg-transparent border-2 border-gray-200 text-gray-400 cursor-not-allowed',
    },
    ghost: {
        button: 'bg-transparent border-transparent text-gray-600 hover:bg-gray-100',
        active: 'bg-indigo-50 border-transparent text-indigo-600',
        disabled: 'bg-transparent border-transparent text-gray-400 cursor-not-allowed',
    },
    solid: {
        button: 'bg-gray-100 border-transparent text-gray-700 hover:bg-gray-200',
        active: 'bg-indigo-500 border-transparent text-white',
        disabled: 'bg-gray-50 border-transparent text-gray-400 cursor-not-allowed',
    },
};

const ITEMS_PER_PAGE_OPTIONS = [5, 10, 12, 20, 24, 25, 50, 100];

// ==================== SUB-COMPONENTS ====================

// Page Button Component
const PageButton = ({
    page,
    isActive,
    isDisabled,
    onClick,
    variant,
    size,
    loading,
    ariaLabel,
}) => {
    const { button, active, disabled } = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;
    const sizeClass = SIZE_CONFIG[size]?.button || SIZE_CONFIG.md.button;

    return (
        <motion.button
            whileHover={!isDisabled && !loading ? { scale: 1.05 } : {}}
            whileTap={!isDisabled && !loading ? { scale: 0.95 } : {}}
            onClick={onClick}
            disabled={isDisabled || loading}
            aria-label={ariaLabel || `Page ${page}`}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
                'rounded-lg flex items-center justify-center font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                sizeClass,
                isActive ? active : isDisabled ? disabled : button,
                loading && 'opacity-50'
            )}
        >
            {loading ? (
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : page}
        </motion.button>
    );
};

// Navigation Button Component
const NavButton = ({
    direction,
    onClick,
    disabled,
    variant,
    size,
    showLabel = false,
    iconOnly = false,
}) => {
    const { button, disabled: disabledStyle } = VARIANT_CONFIG[variant] || VARIANT_CONFIG.default;
    const sizeClass = SIZE_CONFIG[size]?.button || SIZE_CONFIG.md.button;

    const icons = {
        first: <ChevronsLeftIcon size={16} />,
        prev: <ChevronLeftIcon size={16} />,
        next: <ChevronRightIcon size={16} />,
        last: <ChevronsRightIcon size={16} />,
    };

    const labels = {
        first: 'First',
        prev: 'Previous',
        next: 'Next',
        last: 'Last',
    };

    return (
        <motion.button
            whileHover={!disabled ? { scale: 1.05 } : {}}
            whileTap={!disabled ? { scale: 0.95 } : {}}
            onClick={onClick}
            disabled={disabled}
            aria-label={labels[direction]}
            className={cn(
                'rounded-lg flex items-center justify-center gap-1 font-medium transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
                sizeClass,
                !iconOnly && showLabel && 'px-3',
                disabled ? disabledStyle : button
            )}
        >
            {(direction === 'first' || direction === 'prev') && icons[direction]}
            {showLabel && !iconOnly && <span className="hidden sm:inline">{labels[direction]}</span>}
            {(direction === 'next' || direction === 'last') && icons[direction]}
        </motion.button>
    );
};

// Ellipsis Component
const Ellipsis = ({ onClick, canJump = false }) => (
    <span
        className={cn(
            'min-w-[36px] h-9 flex items-center justify-center text-gray-400',
            canJump && 'cursor-pointer hover:text-indigo-500 transition-colors'
        )}
        onClick={canJump ? onClick : undefined}
        title={canJump ? 'Click to jump to page' : undefined}
    >
        <MoreHorizontalIcon size={16} />
    </span>
);

// Page Info Component
const PageInfo = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    showRange = true,
    className = '',
}) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className={cn('text-sm text-gray-600', className)}>
            {showRange && totalItems > 0 ? (
                <span>
                    Showing <span className="font-medium text-gray-900">{startItem}</span>
                    {' - '}
                    <span className="font-medium text-gray-900">{endItem}</span>
                    {' of '}
                    <span className="font-medium text-gray-900">{totalItems.toLocaleString()}</span>
                    {' items'}
                </span>
            ) : (
                <span>
                    Page <span className="font-medium text-gray-900">{currentPage}</span>
                    {' of '}
                    <span className="font-medium text-gray-900">{totalPages}</span>
                </span>
            )}
        </div>
    );
};

// Items Per Page Selector
const ItemsPerPageSelector = ({
    value,
    onChange,
    options = ITEMS_PER_PAGE_OPTIONS,
    size = 'md',
    label = 'per page',
    showLabel = true,
    className = '',
}) => {
    const sizeClass = SIZE_CONFIG[size]?.select || SIZE_CONFIG.md.select;

    return (
        <div className={cn('flex items-center gap-2', className)}>
            {showLabel && (
                <span className="text-sm text-gray-600">Show:</span>
            )}
            <select
                value={value}
                onChange={(e) => onChange(Number(e.target.value))}
                className={cn(
                    'border border-gray-200 rounded-lg bg-white',
                    'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
                    'transition-colors cursor-pointer',
                    sizeClass
                )}
                aria-label="Items per page"
            >
                {options.map((opt) => (
                    <option key={opt} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
            {showLabel && (
                <span className="text-sm text-gray-600">{label}</span>
            )}
        </div>
    );
};

// Jump To Page Input
const JumpToPage = ({
    totalPages,
    onJump,
    size = 'md',
    className = '',
}) => {
    const [inputValue, setInputValue] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const page = parseInt(inputValue, 10);
        if (page >= 1 && page <= totalPages) {
            onJump(page);
            setInputValue('');
            setIsOpen(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            setIsOpen(false);
            setInputValue('');
        }
    };

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    return (
        <div className={cn('relative', className)}>
            {!isOpen ? (
                <button
                    onClick={() => setIsOpen(true)}
                    className="text-sm text-indigo-600 hover:text-indigo-700 hover:underline focus:outline-none"
                >
                    Go to page
                </button>
            ) : (
                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <input
                        ref={inputRef}
                        type="number"
                        min="1"
                        max={totalPages}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        onBlur={() => !inputValue && setIsOpen(false)}
                        placeholder={`1-${totalPages}`}
                        className="w-20 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                        type="submit"
                        disabled={!inputValue}
                        className="px-2 py-1 text-sm bg-indigo-500 text-white rounded-lg disabled:opacity-50 hover:bg-indigo-600 transition-colors"
                    >
                        Go
                    </button>
                    <button
                        type="button"
                        onClick={() => { setIsOpen(false); setInputValue(''); }}
                        className="text-sm text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                </form>
            )}
        </div>
    );
};

// ==================== MAIN PAGINATION COMPONENT ====================

export default function Pagination({
    // Core props
    currentPage = 1,
    totalPages = 1,
    onPageChange,

    // Total items (for showing range)
    totalItems,

    // Items per page
    itemsPerPage = 10,
    onItemsPerPageChange,
    itemsPerPageOptions = ITEMS_PER_PAGE_OPTIONS,
    showItemsPerPage = true,

    // Display options
    showFirstLast = true,
    showPrevNext = true,
    showPageNumbers = true,
    showPageInfo = true,
    showJumpToPage = false,

    // Siblings (pages to show around current)
    siblingCount = 1,
    boundaryCount = 1,

    // Appearance
    variant = 'default',
    size = 'md',
    shape = 'rounded', // rounded, circle, square

    // Layout
    layout = 'default', // default, simple, mini, table
    justify = 'between', // start, center, end, between

    // State
    loading = false,
    disabled = false,

    // Keyboard navigation
    keyboardNavigation = true,

    // Accessibility
    ariaLabel = 'Pagination',

    // Styling
    className = '',
}) {
    // Calculate pagination range
    const paginationRange = useMemo(() => {
        const totalPageNumbers = siblingCount * 2 + 3 + boundaryCount * 2;

        if (totalPageNumbers >= totalPages) {
            return range(1, totalPages);
        }

        const leftSiblingIndex = Math.max(currentPage - siblingCount, boundaryCount + 1);
        const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages - boundaryCount);

        const shouldShowLeftDots = leftSiblingIndex > boundaryCount + 2;
        const shouldShowRightDots = rightSiblingIndex < totalPages - boundaryCount - 1;

        if (!shouldShowLeftDots && shouldShowRightDots) {
            const leftItemCount = 3 + 2 * siblingCount;
            const leftRange = range(1, leftItemCount);
            return [...leftRange, 'right-dots', ...range(totalPages - boundaryCount + 1, totalPages)];
        }

        if (shouldShowLeftDots && !shouldShowRightDots) {
            const rightItemCount = 3 + 2 * siblingCount;
            const rightRange = range(totalPages - rightItemCount + 1, totalPages);
            return [...range(1, boundaryCount), 'left-dots', ...rightRange];
        }

        if (shouldShowLeftDots && shouldShowRightDots) {
            const middleRange = range(leftSiblingIndex, rightSiblingIndex);
            return [
                ...range(1, boundaryCount),
                'left-dots',
                ...middleRange,
                'right-dots',
                ...range(totalPages - boundaryCount + 1, totalPages),
            ];
        }

        return range(1, totalPages);
    }, [totalPages, siblingCount, boundaryCount, currentPage]);

    // Handlers
    const handlePageChange = useCallback((page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage && !disabled) {
            onPageChange?.(page);
        }
    }, [currentPage, totalPages, onPageChange, disabled]);

    const handlePrev = useCallback(() => handlePageChange(currentPage - 1), [currentPage, handlePageChange]);
    const handleNext = useCallback(() => handlePageChange(currentPage + 1), [currentPage, handlePageChange]);
    const handleFirst = useCallback(() => handlePageChange(1), [handlePageChange]);
    const handleLast = useCallback(() => handlePageChange(totalPages), [totalPages, handlePageChange]);

    const handleEllipsisClick = useCallback((type) => {
        if (type === 'left-dots') {
            handlePageChange(Math.max(1, currentPage - siblingCount * 2 - 1));
        } else {
            handlePageChange(Math.min(totalPages, currentPage + siblingCount * 2 + 1));
        }
    }, [currentPage, siblingCount, totalPages, handlePageChange]);

    // Keyboard navigation
    useEffect(() => {
        if (!keyboardNavigation) return;

        const handleKeyDown = (e) => {
            if (e.target.tagName === 'INPUT') return;

            if (e.key === 'ArrowLeft' && currentPage > 1) {
                e.preventDefault();
                handlePrev();
            } else if (e.key === 'ArrowRight' && currentPage < totalPages) {
                e.preventDefault();
                handleNext();
            } else if (e.key === 'Home') {
                e.preventDefault();
                handleFirst();
            } else if (e.key === 'End') {
                e.preventDefault();
                handleLast();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [keyboardNavigation, currentPage, totalPages, handlePrev, handleNext, handleFirst, handleLast]);

    // Don't render if only one page
    if (totalPages <= 1 && !showItemsPerPage) return null;

    // Justify classes
    const justifyClasses = {
        start: 'justify-start',
        center: 'justify-center',
        end: 'justify-end',
        between: 'justify-between',
    };

    // Shape classes for buttons
    const shapeClass = {
        rounded: 'rounded-lg',
        circle: 'rounded-full',
        square: 'rounded-none',
    }[shape] || 'rounded-lg';

    const gapClass = SIZE_CONFIG[size]?.gap || SIZE_CONFIG.md.gap;

    // Simple layout
    if (layout === 'simple') {
        return (
            <nav aria-label={ariaLabel} className={cn('flex items-center', justifyClasses[justify], className)}>
                <NavButton
                    direction="prev"
                    onClick={handlePrev}
                    disabled={currentPage === 1 || disabled}
                    variant={variant}
                    size={size}
                    showLabel
                />
                <PageInfo
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    showRange={false}
                    className="mx-4"
                />
                <NavButton
                    direction="next"
                    onClick={handleNext}
                    disabled={currentPage === totalPages || disabled}
                    variant={variant}
                    size={size}
                    showLabel
                />
            </nav>
        );
    }

    // Mini layout
    if (layout === 'mini') {
        return (
            <nav aria-label={ariaLabel} className={cn('flex items-center gap-2', className)}>
                <NavButton
                    direction="prev"
                    onClick={handlePrev}
                    disabled={currentPage === 1 || disabled}
                    variant={variant}
                    size="sm"
                    iconOnly
                />
                <span className="text-sm text-gray-600">
                    {currentPage} / {totalPages}
                </span>
                <NavButton
                    direction="next"
                    onClick={handleNext}
                    disabled={currentPage === totalPages || disabled}
                    variant={variant}
                    size="sm"
                    iconOnly
                />
            </nav>
        );
    }

    // Table layout (typical for data tables)
    if (layout === 'table') {
        return (
            <div className={cn('flex flex-col sm:flex-row items-center justify-between gap-4', className)}>
                <div className="flex items-center gap-4">
                    {showItemsPerPage && onItemsPerPageChange && (
                        <ItemsPerPageSelector
                            value={itemsPerPage}
                            onChange={onItemsPerPageChange}
                            options={itemsPerPageOptions}
                            size={size}
                        />
                    )}
                    {showPageInfo && totalItems && (
                        <PageInfo
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={totalItems}
                            itemsPerPage={itemsPerPage}
                        />
                    )}
                </div>
                <nav aria-label={ariaLabel} className={cn('flex items-center', gapClass)}>
                    {showFirstLast && (
                        <NavButton
                            direction="first"
                            onClick={handleFirst}
                            disabled={currentPage === 1 || disabled}
                            variant={variant}
                            size={size}
                            iconOnly
                        />
                    )}
                    {showPrevNext && (
                        <NavButton
                            direction="prev"
                            onClick={handlePrev}
                            disabled={currentPage === 1 || disabled}
                            variant={variant}
                            size={size}
                            iconOnly
                        />
                    )}
                    {showPageNumbers && paginationRange.map((page, index) => {
                        if (typeof page === 'string') {
                            return (
                                <Ellipsis
                                    key={page}
                                    onClick={() => handleEllipsisClick(page)}
                                    canJump
                                />
                            );
                        }
                        return (
                            <PageButton
                                key={page}
                                page={page}
                                isActive={page === currentPage}
                                isDisabled={disabled}
                                onClick={() => handlePageChange(page)}
                                variant={variant}
                                size={size}
                                loading={loading && page === currentPage}
                            />
                        );
                    })}
                    {showPrevNext && (
                        <NavButton
                            direction="next"
                            onClick={handleNext}
                            disabled={currentPage === totalPages || disabled}
                            variant={variant}
                            size={size}
                            iconOnly
                        />
                    )}
                    {showFirstLast && (
                        <NavButton
                            direction="last"
                            onClick={handleLast}
                            disabled={currentPage === totalPages || disabled}
                            variant={variant}
                            size={size}
                            iconOnly
                        />
                    )}
                </nav>
            </div>
        );
    }

    // Default layout
    return (
        <div className={cn('flex flex-wrap items-center gap-4', justifyClasses[justify], className)}>
            {/* Left section: Items per page */}
            {showItemsPerPage && onItemsPerPageChange && (
                <ItemsPerPageSelector
                    value={itemsPerPage}
                    onChange={onItemsPerPageChange}
                    options={itemsPerPageOptions}
                    size={size}
                />
            )}

            {/* Center section: Page info */}
            {showPageInfo && (
                <div className="flex items-center gap-4">
                    <PageInfo
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={totalItems}
                        itemsPerPage={itemsPerPage}
                        showRange={!!totalItems}
                    />
                    {showJumpToPage && totalPages > 10 && (
                        <JumpToPage totalPages={totalPages} onJump={handlePageChange} size={size} />
                    )}
                </div>
            )}

            {/* Right section: Navigation */}
            <nav aria-label={ariaLabel} className={cn('flex items-center', gapClass)}>
                {showFirstLast && (
                    <NavButton
                        direction="first"
                        onClick={handleFirst}
                        disabled={currentPage === 1 || disabled}
                        variant={variant}
                        size={size}
                        iconOnly
                    />
                )}

                {showPrevNext && (
                    <NavButton
                        direction="prev"
                        onClick={handlePrev}
                        disabled={currentPage === 1 || disabled}
                        variant={variant}
                        size={size}
                        iconOnly
                    />
                )}

                <AnimatePresence mode="wait">
                    {showPageNumbers && (
                        <motion.div
                            key="page-numbers"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className={cn('flex items-center', gapClass)}
                        >
                            {paginationRange.map((page, index) => {
                                if (typeof page === 'string') {
                                    return (
                                        <Ellipsis
                                            key={page}
                                            onClick={() => handleEllipsisClick(page)}
                                            canJump
                                        />
                                    );
                                }
                                return (
                                    <PageButton
                                        key={page}
                                        page={page}
                                        isActive={page === currentPage}
                                        isDisabled={disabled}
                                        onClick={() => handlePageChange(page)}
                                        variant={variant}
                                        size={size}
                                        loading={loading && page === currentPage}
                                    />
                                );
                            })}
                        </motion.div>
                    )}
                </AnimatePresence>

                {showPrevNext && (
                    <NavButton
                        direction="next"
                        onClick={handleNext}
                        disabled={currentPage === totalPages || disabled}
                        variant={variant}
                        size={size}
                        iconOnly
                    />
                )}

                {showFirstLast && (
                    <NavButton
                        direction="last"
                        onClick={handleLast}
                        disabled={currentPage === totalPages || disabled}
                        variant={variant}
                        size={size}
                        iconOnly
                    />
                )}
            </nav>
        </div>
    );
}

// ==================== NAMED EXPORTS ====================

export { PageInfo, ItemsPerPageSelector, JumpToPage, PageButton, NavButton };
