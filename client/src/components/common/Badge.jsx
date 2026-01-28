import { useState, useCallback, useEffect, createContext, useContext, forwardRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/helpers';

// ============================================================================
// BADGE CONFIGURATION & CONSTANTS
// ============================================================================

// Color variants for badges - solid backgrounds
const SOLID_VARIANTS = {
    default: 'bg-gray-500 text-white',
    primary: 'bg-gradient-to-r from-amber-500 to-amber-600 text-black',
    secondary: 'bg-gray-700 text-white',
    success: 'bg-emerald-500 text-white',
    warning: 'bg-amber-400 text-black',
    danger: 'bg-red-500 text-white',
    info: 'bg-blue-500 text-white',
    purple: 'bg-purple-500 text-white',
    pink: 'bg-pink-500 text-white',
    indigo: 'bg-indigo-500 text-white',
    teal: 'bg-teal-500 text-white',
    cyan: 'bg-cyan-500 text-white',
    orange: 'bg-orange-500 text-white',
    lime: 'bg-lime-500 text-black',
    rose: 'bg-rose-500 text-white',
    gold: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-black',
    premium: 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black shadow-lg shadow-amber-500/30',
};

// Soft/light backgrounds
const SOFT_VARIANTS = {
    default: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
    primary: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    secondary: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
    success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
    warning: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    purple: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
    pink: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
    indigo: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
    teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300',
    cyan: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300',
    orange: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    lime: 'bg-lime-100 text-lime-800 dark:bg-lime-900/30 dark:text-lime-300',
    rose: 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-300',
    gold: 'bg-amber-100/80 text-amber-900 dark:bg-amber-900/30 dark:text-amber-300',
    premium: 'bg-gradient-to-r from-amber-50 to-yellow-50 text-amber-900 dark:from-amber-900/30 dark:to-yellow-900/30 dark:text-amber-300',
};

// Outline variants
const OUTLINE_VARIANTS = {
    default: 'border-2 border-gray-400 text-gray-600 dark:border-gray-500 dark:text-gray-400',
    primary: 'border-2 border-amber-500 text-amber-600 dark:text-amber-400',
    secondary: 'border-2 border-gray-500 text-gray-600 dark:text-gray-400',
    success: 'border-2 border-emerald-500 text-emerald-600 dark:text-emerald-400',
    warning: 'border-2 border-amber-400 text-amber-600 dark:text-amber-400',
    danger: 'border-2 border-red-500 text-red-600 dark:text-red-400',
    info: 'border-2 border-blue-500 text-blue-600 dark:text-blue-400',
    purple: 'border-2 border-purple-500 text-purple-600 dark:text-purple-400',
    pink: 'border-2 border-pink-500 text-pink-600 dark:text-pink-400',
    indigo: 'border-2 border-indigo-500 text-indigo-600 dark:text-indigo-400',
    teal: 'border-2 border-teal-500 text-teal-600 dark:text-teal-400',
    cyan: 'border-2 border-cyan-500 text-cyan-600 dark:text-cyan-400',
    orange: 'border-2 border-orange-500 text-orange-600 dark:text-orange-400',
    lime: 'border-2 border-lime-500 text-lime-600 dark:text-lime-400',
    rose: 'border-2 border-rose-500 text-rose-600 dark:text-rose-400',
    gold: 'border-2 border-amber-500 text-amber-600 dark:text-amber-400',
    premium: 'border-2 border-gradient-to-r from-amber-400 to-yellow-500 text-amber-600',
};

// Gradient variants
const GRADIENT_VARIANTS = {
    default: 'bg-gradient-to-r from-gray-400 to-gray-600 text-white',
    primary: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-black',
    secondary: 'bg-gradient-to-r from-gray-500 to-gray-700 text-white',
    success: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white',
    warning: 'bg-gradient-to-r from-amber-300 to-orange-400 text-black',
    danger: 'bg-gradient-to-r from-red-400 to-rose-500 text-white',
    info: 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white',
    purple: 'bg-gradient-to-r from-purple-400 to-pink-500 text-white',
    pink: 'bg-gradient-to-r from-pink-400 to-rose-500 text-white',
    indigo: 'bg-gradient-to-r from-indigo-400 to-purple-500 text-white',
    teal: 'bg-gradient-to-r from-teal-400 to-cyan-500 text-white',
    cyan: 'bg-gradient-to-r from-cyan-400 to-blue-500 text-white',
    orange: 'bg-gradient-to-r from-orange-400 to-red-500 text-white',
    lime: 'bg-gradient-to-r from-lime-400 to-green-500 text-black',
    rose: 'bg-gradient-to-r from-rose-400 to-pink-500 text-white',
    gold: 'bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 text-black shadow-lg shadow-amber-400/30',
    premium: 'bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 text-black shadow-xl shadow-amber-400/40',
};

// Size configurations
const SIZE_CLASSES = {
    xs: 'px-1.5 py-0.5 text-[10px] leading-tight',
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
    xl: 'px-4 py-2 text-base',
    '2xl': 'px-5 py-2.5 text-lg',
};

// Dot indicator sizes
const DOT_SIZES = {
    xs: 'w-1.5 h-1.5',
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
    xl: 'w-3.5 h-3.5',
    '2xl': 'w-4 h-4',
};

// Dot colors
const DOT_COLORS = {
    default: 'bg-gray-400',
    primary: 'bg-amber-500',
    secondary: 'bg-gray-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-400',
    danger: 'bg-red-500',
    info: 'bg-blue-500',
    purple: 'bg-purple-500',
    pink: 'bg-pink-500',
    online: 'bg-emerald-500',
    offline: 'bg-gray-400',
    away: 'bg-amber-400',
    busy: 'bg-red-500',
};

// Animation variants for framer-motion
const ANIMATION_VARIANTS = {
    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
    },
    scale: {
        initial: { opacity: 0, scale: 0.5 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.5 },
    },
    slideUp: {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -10 },
    },
    slideDown: {
        initial: { opacity: 0, y: -10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 10 },
    },
    bounce: {
        initial: { opacity: 0, scale: 0 },
        animate: {
            opacity: 1,
            scale: 1,
            transition: { type: 'spring', stiffness: 500, damping: 15 }
        },
        exit: { opacity: 0, scale: 0 },
    },
    pop: {
        initial: { opacity: 0, scale: 0.8, rotate: -10 },
        animate: {
            opacity: 1,
            scale: 1,
            rotate: 0,
            transition: { type: 'spring', stiffness: 400, damping: 12 }
        },
        exit: { opacity: 0, scale: 0.8, rotate: 10 },
    },
};

// ============================================================================
// HELPER HOOKS
// ============================================================================

// Hook for handling dismissible badges
const useDismissible = (initialVisible = true, onDismiss) => {
    const [isVisible, setIsVisible] = useState(initialVisible);

    const dismiss = useCallback(() => {
        setIsVisible(false);
        onDismiss?.();
    }, [onDismiss]);

    const show = useCallback(() => {
        setIsVisible(true);
    }, []);

    return { isVisible, dismiss, show };
};

// Hook for number formatting in notification badges
const useFormattedCount = (count, maxCount = 99) => {
    return useMemo(() => {
        if (typeof count !== 'number') return count;
        if (count <= 0) return null;
        if (count > maxCount) return `${maxCount}+`;
        return count.toString();
    }, [count, maxCount]);
};

// ============================================================================
// BADGE CONTEXT
// ============================================================================

const BadgeContext = createContext(null);

export const useBadgeContext = () => {
    const context = useContext(BadgeContext);
    return context;
};

// ============================================================================
// MAIN BADGE COMPONENT
// ============================================================================

const Badge = forwardRef(({
    children,
    variant = 'default',
    type = 'soft', // solid, soft, outline, gradient
    size = 'md',
    rounded = 'full', // none, sm, md, lg, full
    icon = null, // left icon
    rightIcon = null,
    dot = false,
    dotColor = null,
    dotPosition = 'left', // left, right
    pulse = false,
    glow = false,
    dismissible = false,
    onDismiss = null,
    animated = false,
    animation = 'scale',
    className = '',
    onClick = null,
    href = null,
    as = 'span',
    disabled = false,
    uppercase = false,
    truncate = false,
    maxWidth = null,
    title = null,
    ...props
}, ref) => {
    const [isVisible, setIsVisible] = useState(true);

    // Get variant styles based on type
    const getVariantStyles = () => {
        switch (type) {
            case 'solid':
                return SOLID_VARIANTS[variant] || SOLID_VARIANTS.default;
            case 'outline':
                return OUTLINE_VARIANTS[variant] || OUTLINE_VARIANTS.default;
            case 'gradient':
                return GRADIENT_VARIANTS[variant] || GRADIENT_VARIANTS.default;
            case 'soft':
            default:
                return SOFT_VARIANTS[variant] || SOFT_VARIANTS.default;
        }
    };

    // Get rounded styles
    const getRoundedStyles = () => {
        switch (rounded) {
            case 'none': return 'rounded-none';
            case 'sm': return 'rounded-sm';
            case 'md': return 'rounded-md';
            case 'lg': return 'rounded-lg';
            case 'full':
            default: return 'rounded-full';
        }
    };

    // Handle dismiss
    const handleDismiss = useCallback((e) => {
        e.stopPropagation();
        setIsVisible(false);
        onDismiss?.();
    }, [onDismiss]);

    // Get the actual dot color
    const actualDotColor = dotColor || variant;

    // Determine component type
    const Component = href ? 'a' : as;
    const MotionComponent = animated ? motion[Component] || motion.span : Component;

    // Base styles
    const baseStyles = cn(
        'inline-flex items-center justify-center gap-1.5 font-medium transition-all duration-200',
        getVariantStyles(),
        SIZE_CLASSES[size] || SIZE_CLASSES.md,
        getRoundedStyles(),
        uppercase && 'uppercase tracking-wide',
        truncate && 'truncate',
        onClick && !disabled && 'cursor-pointer hover:opacity-80 active:scale-95',
        href && !disabled && 'cursor-pointer hover:opacity-90',
        disabled && 'opacity-50 cursor-not-allowed',
        glow && variant === 'gold' && 'shadow-lg shadow-amber-500/30',
        glow && variant === 'premium' && 'shadow-xl shadow-amber-400/40',
        glow && variant === 'success' && 'shadow-lg shadow-emerald-500/30',
        glow && variant === 'danger' && 'shadow-lg shadow-red-500/30',
        className
    );

    // Animation props
    const animationProps = animated ? {
        ...ANIMATION_VARIANTS[animation],
        transition: { duration: 0.2 },
    } : {};

    if (!isVisible) return null;

    const badgeContent = (
        <>
            {/* Left dot indicator */}
            {dot && dotPosition === 'left' && (
                <span className={cn(
                    'relative flex-shrink-0',
                    DOT_SIZES[size] || DOT_SIZES.md
                )}>
                    <span className={cn(
                        'absolute inset-0 rounded-full',
                        DOT_COLORS[actualDotColor] || DOT_COLORS.default
                    )} />
                    {pulse && (
                        <span className={cn(
                            'absolute inset-0 rounded-full animate-ping',
                            DOT_COLORS[actualDotColor] || DOT_COLORS.default,
                            'opacity-75'
                        )} />
                    )}
                </span>
            )}

            {/* Left icon */}
            {icon && (
                <span className="flex-shrink-0 -ml-0.5">{icon}</span>
            )}

            {/* Content */}
            {children && (
                <span
                    className={cn(truncate && 'truncate')}
                    style={maxWidth ? { maxWidth } : undefined}
                    title={title || (typeof children === 'string' ? children : undefined)}
                >
                    {children}
                </span>
            )}

            {/* Right icon */}
            {rightIcon && (
                <span className="flex-shrink-0 -mr-0.5">{rightIcon}</span>
            )}

            {/* Right dot indicator */}
            {dot && dotPosition === 'right' && (
                <span className={cn(
                    'relative flex-shrink-0',
                    DOT_SIZES[size] || DOT_SIZES.md
                )}>
                    <span className={cn(
                        'absolute inset-0 rounded-full',
                        DOT_COLORS[actualDotColor] || DOT_COLORS.default
                    )} />
                    {pulse && (
                        <span className={cn(
                            'absolute inset-0 rounded-full animate-ping',
                            DOT_COLORS[actualDotColor] || DOT_COLORS.default,
                            'opacity-75'
                        )} />
                    )}
                </span>
            )}

            {/* Dismiss button */}
            {dismissible && (
                <button
                    type="button"
                    onClick={handleDismiss}
                    className="ml-1 -mr-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current"
                    aria-label="Dismiss"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </>
    );

    if (animated) {
        return (
            <AnimatePresence mode="wait">
                <MotionComponent
                    ref={ref}
                    className={baseStyles}
                    onClick={!disabled ? onClick : undefined}
                    href={!disabled ? href : undefined}
                    {...animationProps}
                    {...props}
                >
                    {badgeContent}
                </MotionComponent>
            </AnimatePresence>
        );
    }

    return (
        <Component
            ref={ref}
            className={baseStyles}
            onClick={!disabled ? onClick : undefined}
            href={!disabled ? href : undefined}
            {...props}
        >
            {badgeContent}
        </Component>
    );
});

Badge.displayName = 'Badge';

// ============================================================================
// NOTIFICATION BADGE COMPONENT
// ============================================================================

export const NotificationBadge = forwardRef(({
    count,
    maxCount = 99,
    showZero = false,
    dot = false,
    position = 'top-right', // top-right, top-left, bottom-right, bottom-left
    offset = { x: 0, y: 0 },
    color = 'danger',
    size = 'sm',
    pulse = false,
    children,
    className = '',
    badgeClassName = '',
    ...props
}, ref) => {
    const formattedCount = useFormattedCount(count, maxCount);

    // Position classes
    const positionClasses = {
        'top-right': 'top-0 right-0 -translate-y-1/2 translate-x-1/2',
        'top-left': 'top-0 left-0 -translate-y-1/2 -translate-x-1/2',
        'bottom-right': 'bottom-0 right-0 translate-y-1/2 translate-x-1/2',
        'bottom-left': 'bottom-0 left-0 translate-y-1/2 -translate-x-1/2',
    };

    const shouldShow = dot || (showZero ? count >= 0 : count > 0);

    return (
        <div ref={ref} className={cn('relative inline-flex', className)} {...props}>
            {children}

            <AnimatePresence>
                {shouldShow && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className={cn(
                            'absolute flex items-center justify-center min-w-[1.25rem] h-5',
                            positionClasses[position],
                            dot ? 'w-3 h-3 min-w-0' : 'px-1.5',
                            size === 'xs' && 'text-[9px] min-w-[1rem] h-4',
                            size === 'sm' && 'text-[10px] min-w-[1.25rem] h-5',
                            size === 'md' && 'text-xs min-w-[1.5rem] h-6',
                            size === 'lg' && 'text-sm min-w-[1.75rem] h-7',
                            'rounded-full font-bold',
                            SOLID_VARIANTS[color] || SOLID_VARIANTS.danger,
                            pulse && 'animate-pulse',
                            badgeClassName
                        )}
                        style={{
                            transform: `translate(${offset.x}px, ${offset.y}px)`,
                        }}
                    >
                        {!dot && formattedCount}
                        {pulse && (
                            <span className={cn(
                                'absolute inset-0 rounded-full animate-ping opacity-50',
                                SOLID_VARIANTS[color] || SOLID_VARIANTS.danger
                            )} />
                        )}
                    </motion.span>
                )}
            </AnimatePresence>
        </div>
    );
});

NotificationBadge.displayName = 'NotificationBadge';

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

export const StatusBadge = forwardRef(({
    status = 'offline', // online, offline, away, busy, custom
    label = null,
    showLabel = true,
    size = 'md',
    pulse = false,
    className = '',
    ...props
}, ref) => {
    const statusConfig = {
        online: { color: 'success', label: 'Online', dotColor: 'online' },
        offline: { color: 'default', label: 'Offline', dotColor: 'offline' },
        away: { color: 'warning', label: 'Away', dotColor: 'away' },
        busy: { color: 'danger', label: 'Busy', dotColor: 'busy' },
        dnd: { color: 'danger', label: 'Do Not Disturb', dotColor: 'busy' },
    };

    const config = statusConfig[status] || statusConfig.offline;

    return (
        <Badge
            ref={ref}
            variant={config.color}
            type="soft"
            size={size}
            dot
            dotColor={config.dotColor}
            pulse={pulse && status === 'online'}
            className={className}
            {...props}
        >
            {showLabel && (label || config.label)}
        </Badge>
    );
});

StatusBadge.displayName = 'StatusBadge';

// ============================================================================
// AVATAR BADGE COMPONENT
// ============================================================================

export const AvatarBadge = forwardRef(({
    src,
    alt = '',
    size = 'md',
    status = null,
    statusPosition = 'bottom-right',
    badge = null,
    badgePosition = 'top-right',
    ring = false,
    ringColor = 'primary',
    className = '',
    ...props
}, ref) => {
    const sizeClasses = {
        xs: 'w-6 h-6',
        sm: 'w-8 h-8',
        md: 'w-10 h-10',
        lg: 'w-12 h-12',
        xl: 'w-14 h-14',
        '2xl': 'w-20 h-20',
    };

    const statusSizeClasses = {
        xs: 'w-2 h-2',
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
        lg: 'w-3.5 h-3.5',
        xl: 'w-4 h-4',
        '2xl': 'w-5 h-5',
    };

    const positionClasses = {
        'top-right': 'top-0 right-0',
        'top-left': 'top-0 left-0',
        'bottom-right': 'bottom-0 right-0',
        'bottom-left': 'bottom-0 left-0',
    };

    const ringColors = {
        primary: 'ring-amber-500',
        success: 'ring-emerald-500',
        danger: 'ring-red-500',
        white: 'ring-white',
    };

    return (
        <div
            ref={ref}
            className={cn('relative inline-block', className)}
            {...props}
        >
            <img
                src={src}
                alt={alt}
                className={cn(
                    'rounded-full object-cover',
                    sizeClasses[size] || sizeClasses.md,
                    ring && 'ring-2',
                    ring && (ringColors[ringColor] || ringColors.primary)
                )}
            />

            {/* Status indicator */}
            {status && (
                <span
                    className={cn(
                        'absolute rounded-full border-2 border-white dark:border-gray-900',
                        positionClasses[statusPosition],
                        statusSizeClasses[size] || statusSizeClasses.md,
                        DOT_COLORS[status] || DOT_COLORS.offline
                    )}
                />
            )}

            {/* Custom badge */}
            {badge && (
                <span className={cn(
                    'absolute',
                    positionClasses[badgePosition]
                )}>
                    {badge}
                </span>
            )}
        </div>
    );
});

AvatarBadge.displayName = 'AvatarBadge';

// ============================================================================
// BADGE GROUP COMPONENT
// ============================================================================

export const BadgeGroup = forwardRef(({
    children,
    spacing = 'sm', // none, xs, sm, md, lg
    wrap = true,
    className = '',
    ...props
}, ref) => {
    const spacingClasses = {
        none: 'gap-0',
        xs: 'gap-0.5',
        sm: 'gap-1',
        md: 'gap-2',
        lg: 'gap-3',
    };

    return (
        <div
            ref={ref}
            className={cn(
                'inline-flex items-center',
                spacingClasses[spacing] || spacingClasses.sm,
                wrap && 'flex-wrap',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});

BadgeGroup.displayName = 'BadgeGroup';

// ============================================================================
// STACKED BADGE GROUP COMPONENT
// ============================================================================

export const StackedBadges = forwardRef(({
    children,
    max = 5,
    size = 'md',
    spacing = -8,
    showMore = true,
    moreVariant = 'soft',
    moreColor = 'default',
    className = '',
    ...props
}, ref) => {
    const childArray = Array.isArray(children) ? children : [children];
    const visibleChildren = childArray.slice(0, max);
    const hiddenCount = childArray.length - max;

    return (
        <div
            ref={ref}
            className={cn('flex items-center', className)}
            {...props}
        >
            {visibleChildren.map((child, index) => (
                <div
                    key={index}
                    style={{ marginLeft: index === 0 ? 0 : spacing }}
                    className="relative"
                >
                    {child}
                </div>
            ))}

            {showMore && hiddenCount > 0 && (
                <Badge
                    variant={moreColor}
                    type={moreVariant}
                    size={size}
                    style={{ marginLeft: spacing }}
                    className="relative"
                >
                    +{hiddenCount}
                </Badge>
            )}
        </div>
    );
});

StackedBadges.displayName = 'StackedBadges';

// ============================================================================
// CLOSABLE BADGE (CHIP/TAG) COMPONENT
// ============================================================================

export const Chip = forwardRef(({
    children,
    variant = 'default',
    type = 'soft',
    size = 'md',
    onRemove,
    removable = true,
    icon = null,
    avatar = null,
    selected = false,
    disabled = false,
    onClick = null,
    className = '',
    ...props
}, ref) => {
    const handleRemove = (e) => {
        e.stopPropagation();
        if (!disabled && onRemove) {
            onRemove();
        }
    };

    return (
        <Badge
            ref={ref}
            variant={selected ? 'primary' : variant}
            type={selected ? 'solid' : type}
            size={size}
            onClick={!disabled ? onClick : undefined}
            disabled={disabled}
            className={cn(
                onClick && !disabled && 'cursor-pointer hover:opacity-90',
                selected && 'ring-2 ring-amber-500/50',
                className
            )}
            {...props}
        >
            {avatar && (
                <img
                    src={avatar}
                    alt=""
                    className={cn(
                        'rounded-full -ml-1',
                        size === 'xs' && 'w-3 h-3',
                        size === 'sm' && 'w-4 h-4',
                        size === 'md' && 'w-5 h-5',
                        size === 'lg' && 'w-6 h-6',
                        size === 'xl' && 'w-7 h-7'
                    )}
                />
            )}

            {icon && !avatar && (
                <span className="-ml-0.5">{icon}</span>
            )}

            <span>{children}</span>

            {removable && onRemove && (
                <button
                    type="button"
                    onClick={handleRemove}
                    disabled={disabled}
                    className={cn(
                        'ml-0.5 -mr-1 p-0.5 rounded-full transition-colors',
                        'hover:bg-black/10 dark:hover:bg-white/10',
                        'focus:outline-none focus:ring-1 focus:ring-current',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    aria-label="Remove"
                >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </Badge>
    );
});

Chip.displayName = 'Chip';

// ============================================================================
// LABEL BADGE COMPONENT
// ============================================================================

export const LabelBadge = forwardRef(({
    label,
    value,
    labelVariant = 'default',
    valueVariant = 'primary',
    size = 'md',
    className = '',
    ...props
}, ref) => {
    return (
        <div
            ref={ref}
            className={cn('inline-flex items-stretch rounded-full overflow-hidden', className)}
            {...props}
        >
            <Badge
                variant={labelVariant}
                type="soft"
                size={size}
                rounded="none"
                className="rounded-l-full"
            >
                {label}
            </Badge>
            <Badge
                variant={valueVariant}
                type="solid"
                size={size}
                rounded="none"
                className="rounded-r-full"
            >
                {value}
            </Badge>
        </div>
    );
});

LabelBadge.displayName = 'LabelBadge';

// ============================================================================
// RIBBON BADGE COMPONENT
// ============================================================================

export const RibbonBadge = forwardRef(({
    children,
    variant = 'primary',
    position = 'top-right', // top-right, top-left
    offset = 8,
    className = '',
    containerClassName = '',
    ...props
}, ref) => {
    const positionStyles = {
        'top-right': {
            top: offset,
            right: -offset,
            transform: 'rotate(45deg)',
            transformOrigin: 'center center',
        },
        'top-left': {
            top: offset,
            left: -offset,
            transform: 'rotate(-45deg)',
            transformOrigin: 'center center',
        },
    };

    return (
        <div className={cn('relative overflow-hidden', containerClassName)}>
            <Badge
                ref={ref}
                variant={variant}
                type="solid"
                className={cn(
                    'absolute whitespace-nowrap px-8 py-1 text-xs font-bold shadow-md',
                    className
                )}
                style={positionStyles[position]}
                rounded="none"
                {...props}
            >
                {children}
            </Badge>
        </div>
    );
});

RibbonBadge.displayName = 'RibbonBadge';

// ============================================================================
// ANIMATED COUNTER BADGE
// ============================================================================

export const CounterBadge = forwardRef(({
    count = 0,
    prefix = '',
    suffix = '',
    variant = 'primary',
    type = 'solid',
    size = 'md',
    animate = true,
    duration = 0.5,
    className = '',
    ...props
}, ref) => {
    const [displayCount, setDisplayCount] = useState(count);

    useEffect(() => {
        if (!animate) {
            setDisplayCount(count);
            return;
        }

        const startCount = displayCount;
        const difference = count - startCount;
        const startTime = Date.now();

        const updateCount = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / (duration * 1000), 1);

            const easeOutQuad = 1 - (1 - progress) * (1 - progress);
            const currentCount = Math.round(startCount + difference * easeOutQuad);

            setDisplayCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(updateCount);
            }
        };

        requestAnimationFrame(updateCount);
    }, [count, animate, duration]);

    return (
        <Badge
            ref={ref}
            variant={variant}
            type={type}
            size={size}
            className={cn('tabular-nums', className)}
            {...props}
        >
            {prefix}{displayCount.toLocaleString()}{suffix}
        </Badge>
    );
});

CounterBadge.displayName = 'CounterBadge';

// ============================================================================
// EXPORTS
// ============================================================================

export default Badge;
