import { useState, useCallback, useMemo, forwardRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/helpers';

// ============================================================================
// STAR RATING CONFIGURATION & CONSTANTS
// ============================================================================

// Size configurations
const SIZE_CLASSES = {
    xs: { star: 12, gap: 1, text: 'text-xs' },
    sm: { star: 16, gap: 2, text: 'text-sm' },
    md: { star: 20, gap: 2, text: 'text-base' },
    lg: { star: 28, gap: 3, text: 'text-lg' },
    xl: { star: 36, gap: 4, text: 'text-xl' },
    '2xl': { star: 48, gap: 5, text: 'text-2xl' },
};

// Color configurations
const COLOR_CLASSES = {
    gold: {
        filled: '#f59e0b',
        empty: '#d1d5db',
        hover: '#fbbf24',
        gradient: 'url(#gold-gradient)',
    },
    amber: {
        filled: '#d97706',
        empty: '#e5e7eb',
        hover: '#f59e0b',
        gradient: 'url(#amber-gradient)',
    },
    yellow: {
        filled: '#eab308',
        empty: '#e5e7eb',
        hover: '#facc15',
        gradient: 'url(#yellow-gradient)',
    },
    red: {
        filled: '#ef4444',
        empty: '#fecaca',
        hover: '#f87171',
        gradient: 'url(#red-gradient)',
    },
    pink: {
        filled: '#ec4899',
        empty: '#fbcfe8',
        hover: '#f472b6',
        gradient: 'url(#pink-gradient)',
    },
    purple: {
        filled: '#8b5cf6',
        empty: '#ddd6fe',
        hover: '#a78bfa',
        gradient: 'url(#purple-gradient)',
    },
    blue: {
        filled: '#3b82f6',
        empty: '#bfdbfe',
        hover: '#60a5fa',
        gradient: 'url(#blue-gradient)',
    },
    green: {
        filled: '#22c55e',
        empty: '#bbf7d0',
        hover: '#4ade80',
        gradient: 'url(#green-gradient)',
    },
    premium: {
        filled: 'url(#premium-gradient)',
        empty: '#374151',
        hover: 'url(#premium-gradient-hover)',
        gradient: 'url(#premium-gradient)',
    },
};

// ============================================================================
// STAR ICONS
// ============================================================================

// Classic star icon
const StarIcon = ({ size = 20, filled = false, fillColor, strokeColor, strokeWidth = 2 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? fillColor : 'none'}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

// Heart icon for love rating
const HeartIcon = ({ size = 20, filled = false, fillColor, strokeColor, strokeWidth = 2 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? fillColor : 'none'}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

// Thumbs up icon
const ThumbsUpIcon = ({ size = 20, filled = false, fillColor, strokeColor, strokeWidth = 2 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? fillColor : 'none'}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
    </svg>
);

// Fire/flame icon
const FlameIcon = ({ size = 20, filled = false, fillColor, strokeColor, strokeWidth = 2 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? fillColor : 'none'}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
);

// Circle icon (for custom ratings)
const CircleIcon = ({ size = 20, filled = false, fillColor, strokeColor, strokeWidth = 2 }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={filled ? fillColor : 'none'}
        stroke={strokeColor}
        strokeWidth={strokeWidth}
    >
        <circle cx="12" cy="12" r="10" />
    </svg>
);

// Icon map
const ICON_MAP = {
    star: StarIcon,
    heart: HeartIcon,
    thumbsUp: ThumbsUpIcon,
    flame: FlameIcon,
    circle: CircleIcon,
};

// ============================================================================
// SVG GRADIENTS
// ============================================================================

const GradientDefs = () => (
    <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
            <linearGradient id="gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fbbf24" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            <linearGradient id="premium-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fcd34d" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#b45309" />
            </linearGradient>
            <linearGradient id="premium-gradient-hover" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#fde68a" />
                <stop offset="50%" stopColor="#fbbf24" />
                <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
        </defs>
    </svg>
);

// ============================================================================
// RATING LABELS
// ============================================================================

const DEFAULT_LABELS = {
    1: 'Poor',
    2: 'Fair',
    3: 'Good',
    4: 'Very Good',
    5: 'Excellent',
};

const EMOJI_LABELS = {
    1: '😞 Terrible',
    2: '😕 Poor',
    3: '😐 Average',
    4: '😊 Good',
    5: '🤩 Excellent',
};

// ============================================================================
// MAIN STAR RATING COMPONENT
// ============================================================================

const StarRating = forwardRef(({
    rating = 0,
    maxStars = 5,
    size = 'md',
    color = 'gold',
    icon = 'star',
    interactive = false,
    readOnly = false,
    disabled = false,
    onChange,
    onHover,
    showValue = false,
    valuePosition = 'right', // left, right
    showLabel = false,
    labels = DEFAULT_LABELS,
    precision = 1, // 0.5 for half stars, 1 for full stars
    highlightOnlySelected = false,
    animated = true,
    tooltip = false,
    name = '',
    className = '',
    starClassName = '',
    ...props
}, ref) => {
    const [hoverRating, setHoverRating] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;
    const colorConfig = COLOR_CLASSES[color] || COLOR_CLASSES.gold;
    const IconComponent = ICON_MAP[icon] || ICON_MAP.star;

    // Calculate display rating (considering precision)
    const displayRating = isHovering ? hoverRating : rating;

    // Get star fill state
    const getStarFill = useCallback((index) => {
        const starValue = index + 1;

        if (highlightOnlySelected) {
            return displayRating === starValue;
        }

        if (precision === 0.5) {
            if (displayRating >= starValue) return 'full';
            if (displayRating >= starValue - 0.5) return 'half';
            return 'empty';
        }

        return displayRating >= starValue ? 'full' : 'empty';
    }, [displayRating, precision, highlightOnlySelected]);

    // Handle click
    const handleClick = useCallback((index, event) => {
        if (!interactive || disabled || readOnly) return;

        let newRating = index + 1;

        // Support half-star precision on click
        if (precision === 0.5) {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            if (x < rect.width / 2) {
                newRating -= 0.5;
            }
        }

        // Toggle off if clicking same rating
        if (newRating === rating) {
            newRating = 0;
        }

        onChange?.(newRating);
    }, [interactive, disabled, readOnly, precision, rating, onChange]);

    // Handle hover
    const handleMouseMove = useCallback((index, event) => {
        if (!interactive || disabled || readOnly) return;

        let newHoverRating = index + 1;

        if (precision === 0.5) {
            const rect = event.currentTarget.getBoundingClientRect();
            const x = event.clientX - rect.left;
            if (x < rect.width / 2) {
                newHoverRating -= 0.5;
            }
        }

        setHoverRating(newHoverRating);
        setIsHovering(true);
        onHover?.(newHoverRating);
    }, [interactive, disabled, readOnly, precision, onHover]);

    // Handle mouse leave
    const handleMouseLeave = useCallback(() => {
        setHoverRating(0);
        setIsHovering(false);
        onHover?.(0);
    }, [onHover]);

    // Get current label
    const currentLabel = useMemo(() => {
        const labelRating = Math.ceil(displayRating);
        return labels[labelRating] || '';
    }, [displayRating, labels]);

    return (
        <div
            ref={ref}
            className={cn(
                'inline-flex items-center',
                valuePosition === 'left' ? 'flex-row-reverse' : 'flex-row',
                disabled && 'opacity-50 cursor-not-allowed',
                className
            )}
            onMouseLeave={handleMouseLeave}
            {...props}
        >
            <GradientDefs />

            {/* Stars container */}
            <div
                className={cn('flex items-center')}
                style={{ gap: sizeConfig.gap }}
                role={interactive ? 'slider' : 'img'}
                aria-label={`Rating: ${rating} out of ${maxStars} stars`}
                aria-valuenow={rating}
                aria-valuemin={0}
                aria-valuemax={maxStars}
            >
                {Array.from({ length: maxStars }).map((_, index) => {
                    const fillState = getStarFill(index);
                    const isFilled = fillState === 'full';
                    const isHalf = fillState === 'half';

                    return (
                        <motion.button
                            key={index}
                            type="button"
                            onClick={(e) => handleClick(index, e)}
                            onMouseMove={(e) => handleMouseMove(index, e)}
                            whileHover={interactive && !disabled ? { scale: 1.15 } : {}}
                            whileTap={interactive && !disabled ? { scale: 0.95 } : {}}
                            animate={animated && isFilled ? {
                                scale: [1, 1.2, 1],
                                transition: { duration: 0.2 }
                            } : {}}
                            disabled={!interactive || disabled}
                            className={cn(
                                'relative focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 rounded',
                                interactive && !disabled && 'cursor-pointer',
                                !interactive && 'cursor-default',
                                starClassName
                            )}
                            style={{
                                background: 'none',
                                border: 'none',
                                padding: 0,
                            }}
                            title={tooltip ? `${index + 1} star${index > 0 ? 's' : ''}` : undefined}
                        >
                            {/* Half star overlay */}
                            {isHalf && (
                                <div
                                    className="absolute inset-0 overflow-hidden"
                                    style={{ width: '50%' }}
                                >
                                    <IconComponent
                                        size={sizeConfig.star}
                                        filled={true}
                                        fillColor={colorConfig.filled}
                                        strokeColor={colorConfig.filled}
                                        strokeWidth={1.5}
                                    />
                                </div>
                            )}

                            {/* Main star */}
                            <IconComponent
                                size={sizeConfig.star}
                                filled={isFilled}
                                fillColor={isHovering && hoverRating >= index + 1
                                    ? colorConfig.hover
                                    : colorConfig.filled
                                }
                                strokeColor={isFilled || isHalf
                                    ? colorConfig.filled
                                    : colorConfig.empty
                                }
                                strokeWidth={1.5}
                            />
                        </motion.button>
                    );
                })}
            </div>

            {/* Value display */}
            {showValue && (
                <span className={cn(
                    'font-medium text-gray-700 dark:text-gray-300',
                    sizeConfig.text,
                    valuePosition === 'left' ? 'mr-2' : 'ml-2'
                )}>
                    {rating.toFixed(precision === 0.5 ? 1 : 0)}
                    <span className="text-gray-400 dark:text-gray-500">/{maxStars}</span>
                </span>
            )}

            {/* Label display */}
            {showLabel && currentLabel && (
                <span className={cn(
                    'ml-2 font-medium text-gray-600 dark:text-gray-400',
                    sizeConfig.text
                )}>
                    {currentLabel}
                </span>
            )}

            {/* Hidden input for forms */}
            {name && (
                <input
                    type="hidden"
                    name={name}
                    value={rating}
                />
            )}
        </div>
    );
});

StarRating.displayName = 'StarRating';

export default StarRating;

// ============================================================================
// EMOJI RATING COMPONENT
// ============================================================================

export const EmojiRating = forwardRef(({
    rating = 0,
    onChange,
    size = 'lg',
    showLabel = true,
    disabled = false,
    className = '',
    ...props
}, ref) => {
    const emojis = ['😞', '😕', '😐', '😊', '🤩'];
    const labels = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'];

    const sizes = {
        sm: 'text-xl',
        md: 'text-2xl',
        lg: 'text-3xl',
        xl: 'text-4xl',
    };

    return (
        <div
            ref={ref}
            className={cn('flex flex-col items-center gap-3', className)}
            {...props}
        >
            <div className="flex items-center gap-2">
                {emojis.map((emoji, index) => (
                    <motion.button
                        key={index}
                        type="button"
                        onClick={() => !disabled && onChange?.(index + 1)}
                        whileHover={!disabled ? { scale: 1.2 } : {}}
                        whileTap={!disabled ? { scale: 0.9 } : {}}
                        className={cn(
                            sizes[size] || sizes.lg,
                            'p-2 rounded-lg transition-all',
                            rating === index + 1
                                ? 'bg-amber-100 dark:bg-amber-900/30 scale-110'
                                : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                            disabled && 'opacity-50 cursor-not-allowed'
                        )}
                        disabled={disabled}
                    >
                        {emoji}
                    </motion.button>
                ))}
            </div>

            {showLabel && rating > 0 && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-sm font-medium text-gray-600 dark:text-gray-400"
                >
                    {labels[rating - 1]}
                </motion.p>
            )}
        </div>
    );
});

EmojiRating.displayName = 'EmojiRating';

// ============================================================================
// RATING WITH BREAKDOWN
// ============================================================================

export const RatingBreakdown = forwardRef(({
    rating = 0,
    totalReviews = 0,
    breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
    showPercentage = true,
    interactive = false,
    onFilterClick,
    className = '',
    ...props
}, ref) => {
    const maxCount = Math.max(...Object.values(breakdown), 1);

    return (
        <div
            ref={ref}
            className={cn('flex flex-col sm:flex-row gap-6', className)}
            {...props}
        >
            {/* Overall rating */}
            <div className="text-center sm:text-left">
                <div className="text-5xl font-bold text-gray-900 dark:text-white">
                    {rating.toFixed(1)}
                </div>
                <StarRating rating={rating} size="sm" className="justify-center sm:justify-start mt-2" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {totalReviews.toLocaleString()} reviews
                </p>
            </div>

            {/* Breakdown bars */}
            <div className="flex-1 space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                    const count = breakdown[stars] || 0;
                    const percentage = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
                    const barWidth = (count / maxCount) * 100;

                    return (
                        <button
                            key={stars}
                            onClick={() => interactive && onFilterClick?.(stars)}
                            className={cn(
                                'flex items-center gap-3 w-full',
                                interactive && 'hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-1 -ml-1 transition-colors'
                            )}
                            disabled={!interactive}
                        >
                            <span className="text-sm text-gray-600 dark:text-gray-400 w-8">
                                {stars}★
                            </span>
                            <div className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${barWidth}%` }}
                                    transition={{ duration: 0.5, delay: (5 - stars) * 0.1 }}
                                    className="h-full bg-amber-400 rounded-full"
                                />
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                                {showPercentage ? `${percentage.toFixed(0)}%` : count}
                            </span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
});

RatingBreakdown.displayName = 'RatingBreakdown';

// ============================================================================
// RATING INPUT (Form-ready)
// ============================================================================

export const RatingInput = forwardRef(({
    label = 'Your Rating',
    name = 'rating',
    value = 0,
    onChange,
    error = null,
    helperText = '',
    required = false,
    showLabels = true,
    labels = {
        1: 'Poor',
        2: 'Fair',
        3: 'Average',
        4: 'Good',
        5: 'Excellent'
    },
    className = '',
    ...props
}, ref) => {
    const [hoveredRating, setHoveredRating] = useState(0);

    const displayLabel = labels[hoveredRating] || labels[value] || '';

    return (
        <div ref={ref} className={cn('space-y-2', className)}>
            {label && (
                <label className={cn(
                    'block text-sm font-medium text-gray-700 dark:text-gray-300',
                    required && "after:content-['*'] after:ml-0.5 after:text-red-500"
                )}>
                    {label}
                </label>
            )}

            <div className="flex items-center gap-3">
                <StarRating
                    rating={value}
                    onChange={onChange}
                    onHover={setHoveredRating}
                    interactive
                    size="lg"
                    name={name}
                    {...props}
                />

                {showLabels && displayLabel && (
                    <AnimatePresence mode="wait">
                        <motion.span
                            key={displayLabel}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 10 }}
                            className="text-sm font-medium text-amber-600 dark:text-amber-400"
                        >
                            {displayLabel}
                        </motion.span>
                    </AnimatePresence>
                )}
            </div>

            {(error || helperText) && (
                <p className={cn(
                    'text-sm',
                    error ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'
                )}>
                    {error || helperText}
                </p>
            )}
        </div>
    );
});

RatingInput.displayName = 'RatingInput';

// ============================================================================
// COMPACT RATING DISPLAY
// ============================================================================

export const CompactRating = forwardRef(({
    rating = 0,
    maxRating = 5,
    reviewCount = null,
    size = 'sm',
    showStar = true,
    className = '',
    ...props
}, ref) => {
    const sizes = {
        xs: 'text-xs',
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg',
    };

    return (
        <div
            ref={ref}
            className={cn(
                'inline-flex items-center gap-1',
                sizes[size] || sizes.sm,
                className
            )}
            {...props}
        >
            {showStar && (
                <svg
                    className="w-4 h-4 text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
            )}
            <span className="font-semibold text-gray-900 dark:text-white">
                {rating.toFixed(1)}
            </span>
            {reviewCount !== null && (
                <span className="text-gray-500 dark:text-gray-400">
                    ({reviewCount.toLocaleString()})
                </span>
            )}
        </div>
    );
});

CompactRating.displayName = 'CompactRating';
