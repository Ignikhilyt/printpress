import { useState, useEffect, useCallback, forwardRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { cn } from '../../utils/helpers';

// ============================================================================
// BACK TO TOP CONFIGURATION
// ============================================================================

// Position configurations
const POSITION_CLASSES = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'bottom-center': 'bottom-6 left-1/2 -translate-x-1/2',
    'top-right': 'top-20 right-6',
    'top-left': 'top-20 left-6',
};

// Size configurations
const SIZE_CLASSES = {
    sm: 'w-10 h-10',
    md: 'w-12 h-12',
    lg: 'w-14 h-14',
    xl: 'w-16 h-16',
};

// Variant styles
const VARIANT_STYLES = {
    primary: {
        base: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black shadow-lg shadow-amber-500/30',
        hover: 'hover:shadow-xl hover:shadow-amber-500/40',
    },
    secondary: {
        base: 'bg-gray-800 dark:bg-gray-700 text-white shadow-lg',
        hover: 'hover:bg-gray-700 dark:hover:bg-gray-600',
    },
    outline: {
        base: 'border-2 border-amber-500 text-amber-500 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm',
        hover: 'hover:bg-amber-500 hover:text-black',
    },
    glass: {
        base: 'bg-white/20 dark:bg-gray-900/20 backdrop-blur-md text-gray-800 dark:text-white border border-white/30 dark:border-gray-700/30',
        hover: 'hover:bg-white/40 dark:hover:bg-gray-800/40',
    },
    minimal: {
        base: 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        hover: 'hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-amber-500',
    },
    premium: {
        base: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 text-black shadow-xl shadow-amber-400/40',
        hover: 'hover:from-amber-300 hover:via-yellow-400 hover:to-amber-500',
    },
};

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
    arrowUp: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
    ),
    chevronUp: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
    ),
    doubleChevronUp: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 11l7-7 7 7M5 19l7-7 7 7" />
        </svg>
    ),
    rocket: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
        </svg>
    ),
    sparkles: (
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
    ),
};

// ============================================================================
// MAIN BACK TO TOP COMPONENT
// ============================================================================

const BackToTop = forwardRef(({
    position = 'bottom-right',
    size = 'md',
    variant = 'primary',
    icon = 'arrowUp',
    showProgress = false,
    showAfter = 400,
    smooth = true,
    offset = 0,
    tooltip = 'Back to top',
    showTooltip = false,
    animated = true,
    pulseOnShow = false,
    ariaLabel = 'Scroll to top',
    className = '',
    children,
    ...props
}, ref) => {
    const [show, setShow] = useState(false);
    const [isHovered, setIsHovered] = useState(false);
    const { scrollYProgress } = useScroll();

    // Calculate progress
    const progressValue = useTransform(scrollYProgress, [0, 1], [0, 100]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        return progressValue.on('change', (value) => {
            setProgress(value);
        });
    }, [progressValue]);

    // Handle scroll visibility
    useEffect(() => {
        const handleScroll = () => {
            setShow(window.scrollY > showAfter);
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll(); // Check initial position

        return () => window.removeEventListener('scroll', handleScroll);
    }, [showAfter]);

    // Scroll to top function
    const scrollToTop = useCallback(() => {
        window.scrollTo({
            top: offset,
            behavior: smooth ? 'smooth' : 'auto',
        });
    }, [smooth, offset]);

    // Get variant styles
    const variantConfig = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;

    // Get icon
    const IconComponent = typeof icon === 'string' ? Icons[icon] || Icons.arrowUp : icon;

    // Animation variants
    const buttonVariants = {
        hidden: {
            opacity: 0,
            scale: 0.8,
            y: 20,
        },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 20,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.8,
            y: 20,
            transition: {
                duration: 0.2,
            },
        },
        hover: {
            scale: 1.1,
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 10,
            },
        },
        tap: {
            scale: 0.95,
        },
    };

    return (
        <AnimatePresence>
            {show && (
                <motion.div
                    ref={ref}
                    className={cn(
                        'fixed z-50',
                        POSITION_CLASSES[position] || POSITION_CLASSES['bottom-right'],
                        className
                    )}
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    {...props}
                >
                    {/* Progress ring wrapper */}
                    {showProgress && (
                        <svg
                            className="absolute inset-0 -rotate-90"
                            viewBox="0 0 100 100"
                        >
                            <circle
                                cx="50"
                                cy="50"
                                r="46"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-gray-200 dark:text-gray-700"
                            />
                            <motion.circle
                                cx="50"
                                cy="50"
                                r="46"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeLinecap="round"
                                className="text-amber-500"
                                strokeDasharray={289}
                                strokeDashoffset={289 - (progress / 100) * 289}
                            />
                        </svg>
                    )}

                    {/* Button */}
                    <motion.button
                        onClick={scrollToTop}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        whileHover={animated ? 'hover' : undefined}
                        whileTap={animated ? 'tap' : undefined}
                        className={cn(
                            'relative flex items-center justify-center rounded-full transition-all duration-300',
                            SIZE_CLASSES[size] || SIZE_CLASSES.md,
                            variantConfig.base,
                            variantConfig.hover,
                            pulseOnShow && 'animate-pulse'
                        )}
                        aria-label={ariaLabel}
                        title={showTooltip ? tooltip : undefined}
                    >
                        {children || (
                            <span className={cn(
                                'transition-transform',
                                size === 'sm' && 'w-4 h-4',
                                size === 'md' && 'w-5 h-5',
                                size === 'lg' && 'w-6 h-6',
                                size === 'xl' && 'w-7 h-7',
                                animated && isHovered && '-translate-y-0.5'
                            )}>
                                {IconComponent}
                            </span>
                        )}
                    </motion.button>

                    {/* Tooltip */}
                    {showTooltip && (
                        <AnimatePresence>
                            {isHovered && (
                                <motion.div
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className={cn(
                                        'absolute right-full mr-3 top-1/2 -translate-y-1/2',
                                        'px-3 py-1.5 rounded-lg whitespace-nowrap',
                                        'bg-gray-900 dark:bg-gray-700 text-white text-sm font-medium',
                                        'shadow-lg'
                                    )}
                                >
                                    {tooltip}
                                    {/* Arrow */}
                                    <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 rotate-45 w-2 h-2 bg-gray-900 dark:bg-gray-700" />
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </motion.div>
            )}
        </AnimatePresence>
    );
});

BackToTop.displayName = 'BackToTop';

export default BackToTop;

// ============================================================================
// SCROLL TO SECTION COMPONENT
// ============================================================================

export const ScrollToSection = forwardRef(({
    targetId,
    targetSelector,
    offset = 0,
    smooth = true,
    children,
    className = '',
    ...props
}, ref) => {
    const scrollToTarget = useCallback(() => {
        let target = null;

        if (targetId) {
            target = document.getElementById(targetId);
        } else if (targetSelector) {
            target = document.querySelector(targetSelector);
        }

        if (target) {
            const top = target.getBoundingClientRect().top + window.scrollY - offset;
            window.scrollTo({
                top,
                behavior: smooth ? 'smooth' : 'auto',
            });
        }
    }, [targetId, targetSelector, offset, smooth]);

    return (
        <button
            ref={ref}
            onClick={scrollToTarget}
            className={className}
            {...props}
        >
            {children}
        </button>
    );
});

ScrollToSection.displayName = 'ScrollToSection';

// ============================================================================
// SCROLL PROGRESS BAR
// ============================================================================

export const ScrollProgressBar = forwardRef(({
    position = 'top', // top, bottom
    height = 3,
    color = 'primary',
    showPercentage = false,
    zIndex = 9999,
    className = '',
    ...props
}, ref) => {
    const { scrollYProgress } = useScroll();
    const width = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

    const colors = {
        primary: 'bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600',
        secondary: 'bg-gray-600',
        success: 'bg-emerald-500',
        danger: 'bg-red-500',
        info: 'bg-blue-500',
    };

    return (
        <div
            ref={ref}
            className={cn(
                'fixed left-0 right-0',
                position === 'top' ? 'top-0' : 'bottom-0',
                className
            )}
            style={{ zIndex, height }}
            {...props}
        >
            <motion.div
                className={cn(
                    'h-full',
                    colors[color] || colors.primary
                )}
                style={{ width }}
            />

            {showPercentage && (
                <motion.span
                    className="absolute right-4 top-full mt-2 text-xs font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded shadow-sm"
                    style={{
                        opacity: scrollYProgress,
                    }}
                >
                    <motion.span>
                        {useTransform(scrollYProgress, (v) => `${Math.round(v * 100)}%`)}
                    </motion.span>
                </motion.span>
            )}
        </div>
    );
});

ScrollProgressBar.displayName = 'ScrollProgressBar';

// ============================================================================
// SCROLL INDICATOR
// ============================================================================

export const ScrollIndicator = forwardRef(({
    text = 'Scroll',
    size = 'md',
    color = 'primary',
    animated = true,
    className = '',
    ...props
}, ref) => {
    const sizes = {
        sm: { container: 'h-8', dot: 'w-1 h-1', text: 'text-xs' },
        md: { container: 'h-10', dot: 'w-1.5 h-1.5', text: 'text-sm' },
        lg: { container: 'h-12', dot: 'w-2 h-2', text: 'text-base' },
    };

    const colors = {
        primary: 'border-amber-500 bg-amber-500',
        secondary: 'border-gray-500 bg-gray-500',
        white: 'border-white bg-white',
    };

    const sizeConfig = sizes[size] || sizes.md;
    const colorConfig = colors[color] || colors.primary;
    const [borderColor, dotColor] = colorConfig.split(' ');

    return (
        <div
            ref={ref}
            className={cn('flex flex-col items-center gap-2', className)}
            {...props}
        >
            {text && (
                <span className={cn(
                    'font-medium text-gray-500 dark:text-gray-400',
                    sizeConfig.text
                )}>
                    {text}
                </span>
            )}

            <div className={cn(
                'relative w-6 rounded-full border-2',
                sizeConfig.container,
                borderColor
            )}>
                <motion.div
                    className={cn(
                        'absolute left-1/2 -translate-x-1/2 rounded-full',
                        sizeConfig.dot,
                        dotColor
                    )}
                    animate={animated ? {
                        y: ['20%', '80%', '20%'],
                    } : undefined}
                    transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                    style={{ top: '20%' }}
                />
            </div>
        </div>
    );
});

ScrollIndicator.displayName = 'ScrollIndicator';

// ============================================================================
// SCROLL REVEAL
// ============================================================================

export const ScrollReveal = forwardRef(({
    children,
    direction = 'up', // up, down, left, right, fade
    delay = 0,
    duration = 0.5,
    distance = 50,
    once = true,
    threshold = 0.1,
    className = '',
    ...props
}, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useCallback((node) => {
        if (node && typeof IntersectionObserver !== 'undefined') {
            const observer = new IntersectionObserver(
                ([entry]) => {
                    if (entry.isIntersecting) {
                        setIsVisible(true);
                        if (once) {
                            observer.disconnect();
                        }
                    } else if (!once) {
                        setIsVisible(false);
                    }
                },
                { threshold }
            );

            observer.observe(node);
            return () => observer.disconnect();
        }
    }, [once, threshold]);

    // Combine refs
    const combinedRef = useCallback((node) => {
        elementRef(node);
        if (typeof ref === 'function') {
            ref(node);
        } else if (ref) {
            ref.current = node;
        }
    }, [elementRef, ref]);

    const getInitialPosition = () => {
        switch (direction) {
            case 'up': return { y: distance, opacity: 0 };
            case 'down': return { y: -distance, opacity: 0 };
            case 'left': return { x: distance, opacity: 0 };
            case 'right': return { x: -distance, opacity: 0 };
            case 'fade':
            default: return { opacity: 0 };
        }
    };

    return (
        <motion.div
            ref={combinedRef}
            initial={getInitialPosition()}
            animate={isVisible ? { x: 0, y: 0, opacity: 1 } : getInitialPosition()}
            transition={{
                duration,
                delay,
                ease: 'easeOut',
            }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
});

ScrollReveal.displayName = 'ScrollReveal';

// ============================================================================
// PARALLAX WRAPPER
// ============================================================================

export const Parallax = forwardRef(({
    children,
    speed = 0.5, // 0 = fixed, 1 = normal scroll
    direction = 'vertical', // vertical, horizontal
    className = '',
    ...props
}, ref) => {
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, (value) => value * (1 - speed));

    return (
        <motion.div
            ref={ref}
            style={direction === 'vertical' ? { y } : { x: y }}
            className={className}
            {...props}
        >
            {children}
        </motion.div>
    );
});

Parallax.displayName = 'Parallax';
