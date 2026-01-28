import { useState, useEffect, useCallback, useRef, createContext, useContext, forwardRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/helpers';

// ============================================================================
// TOAST CONFIGURATION & CONSTANTS
// ============================================================================

// Toast types with their configurations
const TOAST_TYPES = {
    success: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
        ),
        className: 'bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 dark:border-emerald-800',
        iconClassName: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/50',
        progressClassName: 'bg-emerald-500',
        title: 'Success',
    },
    error: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
        ),
        className: 'bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-800',
        iconClassName: 'text-red-500 bg-red-100 dark:bg-red-900/50',
        progressClassName: 'bg-red-500',
        title: 'Error',
    },
    warning: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        ),
        className: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
        iconClassName: 'text-amber-500 bg-amber-100 dark:bg-amber-900/50',
        progressClassName: 'bg-amber-500',
        title: 'Warning',
    },
    info: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        className: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800',
        iconClassName: 'text-blue-500 bg-blue-100 dark:bg-blue-900/50',
        progressClassName: 'bg-blue-500',
        title: 'Info',
    },
    default: {
        icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
        ),
        className: 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700',
        iconClassName: 'text-gray-500 bg-gray-100 dark:bg-gray-700',
        progressClassName: 'bg-gray-500',
        title: 'Notification',
    },
    loading: {
        icon: (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
        ),
        className: 'bg-amber-50 dark:bg-amber-900/30 border-amber-200 dark:border-amber-800',
        iconClassName: 'text-amber-500 bg-amber-100 dark:bg-amber-900/50',
        progressClassName: 'bg-amber-500',
        title: 'Loading',
    },
    premium: {
        icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
        ),
        className: 'bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30 border-amber-300 dark:border-amber-700',
        iconClassName: 'text-amber-500 bg-gradient-to-r from-amber-100 to-yellow-100 dark:from-amber-900/50 dark:to-yellow-900/50',
        progressClassName: 'bg-gradient-to-r from-amber-400 to-yellow-500',
        title: 'Premium',
    },
};

// Position configurations
const POSITION_CLASSES = {
    'top-left': 'top-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2',
    'bottom-right': 'bottom-4 right-4',
};

// Animation variants based on position
const getAnimationVariants = (position) => {
    const isTop = position.includes('top');
    const isLeft = position.includes('left');
    const isRight = position.includes('right');
    const isCenter = position.includes('center');

    return {
        initial: {
            opacity: 0,
            y: isTop ? -20 : 20,
            x: isCenter ? 0 : isLeft ? -20 : isRight ? 20 : 0,
            scale: 0.95,
        },
        animate: {
            opacity: 1,
            y: 0,
            x: 0,
            scale: 1,
            transition: {
                type: 'spring',
                stiffness: 400,
                damping: 25,
            },
        },
        exit: {
            opacity: 0,
            scale: 0.95,
            x: isCenter ? 0 : isLeft ? -100 : isRight ? 100 : 0,
            transition: {
                duration: 0.2,
            },
        },
    };
};

// ============================================================================
// TOAST CONTEXT
// ============================================================================

const ToastContext = createContext(null);

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};

// ============================================================================
// TOAST PROVIDER
// ============================================================================

export const ToastProvider = ({
    children,
    position = 'top-right',
    maxToasts = 5,
    containerClassName = '',
}) => {
    const [toasts, setToasts] = useState([]);
    const toastIdRef = useRef(0);

    // Add toast
    const addToast = useCallback((options) => {
        const id = ++toastIdRef.current;
        const toast = {
            id,
            type: 'default',
            duration: 5000,
            dismissible: true,
            showProgress: true,
            ...options,
        };

        setToasts((prev) => {
            const newToasts = [...prev, toast];
            // Limit max toasts
            if (newToasts.length > maxToasts) {
                return newToasts.slice(-maxToasts);
            }
            return newToasts;
        });

        return id;
    }, [maxToasts]);

    // Remove toast
    const removeToast = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    // Update toast
    const updateToast = useCallback((id, options) => {
        setToasts((prev) =>
            prev.map((t) => (t.id === id ? { ...t, ...options } : t))
        );
    }, []);

    // Clear all toasts
    const clearToasts = useCallback(() => {
        setToasts([]);
    }, []);

    // Shorthand methods
    const toast = useMemo(() => ({
        show: (message, options = {}) => addToast({ message, ...options }),
        success: (message, options = {}) => addToast({ message, type: 'success', ...options }),
        error: (message, options = {}) => addToast({ message, type: 'error', ...options }),
        warning: (message, options = {}) => addToast({ message, type: 'warning', ...options }),
        info: (message, options = {}) => addToast({ message, type: 'info', ...options }),
        loading: (message, options = {}) => addToast({ message, type: 'loading', duration: 0, ...options }),
        premium: (message, options = {}) => addToast({ message, type: 'premium', ...options }),
        promise: async (promise, { loading, success, error }) => {
            const id = addToast({ message: loading, type: 'loading', duration: 0 });
            try {
                const result = await promise;
                updateToast(id, { message: success, type: 'success', duration: 5000 });
                return result;
            } catch (err) {
                updateToast(id, { message: error || err.message, type: 'error', duration: 5000 });
                throw err;
            }
        },
        dismiss: removeToast,
        clear: clearToasts,
    }), [addToast, removeToast, updateToast, clearToasts]);

    return (
        <ToastContext.Provider value={toast}>
            {children}
            <ToastContainer
                toasts={toasts}
                position={position}
                onDismiss={removeToast}
                className={containerClassName}
            />
        </ToastContext.Provider>
    );
};

// ============================================================================
// TOAST CONTAINER
// ============================================================================

const ToastContainer = ({
    toasts,
    position,
    onDismiss,
    className = '',
}) => {
    return (
        <div
            className={cn(
                'fixed z-[9999] flex flex-col gap-3 pointer-events-none',
                POSITION_CLASSES[position] || POSITION_CLASSES['top-right'],
                className
            )}
            aria-live="polite"
            aria-label="Notifications"
        >
            <AnimatePresence mode="popLayout">
                {toasts.map((toast) => (
                    <Toast
                        key={toast.id}
                        {...toast}
                        position={position}
                        onDismiss={() => onDismiss(toast.id)}
                    />
                ))}
            </AnimatePresence>
        </div>
    );
};

// ============================================================================
// SINGLE TOAST COMPONENT
// ============================================================================

const Toast = forwardRef(({
    id,
    type = 'default',
    title,
    message,
    description,
    duration = 5000,
    dismissible = true,
    showProgress = true,
    showIcon = true,
    icon: customIcon,
    action,
    actionLabel,
    onAction,
    onDismiss,
    position = 'top-right',
    className = '',
    ...props
}, ref) => {
    const [progress, setProgress] = useState(100);
    const [isPaused, setIsPaused] = useState(false);
    const progressRef = useRef(null);
    const startTimeRef = useRef(Date.now());
    const remainingTimeRef = useRef(duration);

    const config = TOAST_TYPES[type] || TOAST_TYPES.default;
    const animationVariants = getAnimationVariants(position);

    // Progress timer
    useEffect(() => {
        if (duration === 0 || isPaused) return;

        const startTime = Date.now();
        const initialRemaining = remainingTimeRef.current;

        const updateProgress = () => {
            const elapsed = Date.now() - startTime;
            const remaining = Math.max(0, initialRemaining - elapsed);
            const newProgress = (remaining / duration) * 100;

            setProgress(newProgress);
            remainingTimeRef.current = remaining;

            if (remaining > 0) {
                progressRef.current = requestAnimationFrame(updateProgress);
            } else {
                onDismiss?.();
            }
        };

        progressRef.current = requestAnimationFrame(updateProgress);

        return () => {
            if (progressRef.current) {
                cancelAnimationFrame(progressRef.current);
            }
        };
    }, [duration, isPaused, onDismiss]);

    // Pause on hover
    const handleMouseEnter = useCallback(() => {
        setIsPaused(true);
    }, []);

    const handleMouseLeave = useCallback(() => {
        startTimeRef.current = Date.now();
        setIsPaused(false);
    }, []);

    return (
        <motion.div
            ref={ref}
            layout
            {...animationVariants}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                'pointer-events-auto relative w-[360px] max-w-[calc(100vw-2rem)]',
                'rounded-xl border shadow-lg overflow-hidden',
                'backdrop-blur-sm',
                config.className,
                className
            )}
            role="alert"
            {...props}
        >
            <div className="flex items-start gap-3 p-4">
                {/* Icon */}
                {showIcon && (
                    <div className={cn(
                        'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                        config.iconClassName
                    )}>
                        {customIcon || config.icon}
                    </div>
                )}

                {/* Content */}
                <div className="flex-1 min-w-0">
                    {/* Title */}
                    {(title || config.title) && (
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                            {title || config.title}
                        </p>
                    )}

                    {/* Message */}
                    {message && (
                        <p className={cn(
                            'text-sm text-gray-600 dark:text-gray-300',
                            (title || config.title) && 'mt-1'
                        )}>
                            {message}
                        </p>
                    )}

                    {/* Description */}
                    {description && (
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            {description}
                        </p>
                    )}

                    {/* Action button */}
                    {(action || (actionLabel && onAction)) && (
                        <div className="mt-3">
                            {action || (
                                <button
                                    onClick={onAction}
                                    className="text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 transition-colors"
                                >
                                    {actionLabel}
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Dismiss button */}
                {dismissible && (
                    <button
                        onClick={onDismiss}
                        className="flex-shrink-0 p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:text-gray-300 dark:hover:bg-gray-700 transition-colors"
                        aria-label="Dismiss notification"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>

            {/* Progress bar */}
            {showProgress && duration > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-200/50 dark:bg-gray-700/50">
                    <motion.div
                        className={cn('h-full', config.progressClassName)}
                        initial={{ width: '100%' }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1, ease: 'linear' }}
                    />
                </div>
            )}
        </motion.div>
    );
});

Toast.displayName = 'Toast';

// ============================================================================
// STANDALONE TOAST COMPONENT (for use without provider)
// ============================================================================

export const StandaloneToast = forwardRef(({
    isVisible = false,
    onClose,
    autoClose = true,
    duration = 5000,
    position = 'top-right',
    ...props
}, ref) => {
    useEffect(() => {
        if (isVisible && autoClose && duration > 0) {
            const timer = setTimeout(() => {
                onClose?.();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [isVisible, autoClose, duration, onClose]);

    return (
        <AnimatePresence>
            {isVisible && (
                <div
                    className={cn(
                        'fixed z-[9999]',
                        POSITION_CLASSES[position] || POSITION_CLASSES['top-right']
                    )}
                >
                    <Toast
                        ref={ref}
                        {...props}
                        position={position}
                        onDismiss={onClose}
                        duration={autoClose ? duration : 0}
                    />
                </div>
            )}
        </AnimatePresence>
    );
});

StandaloneToast.displayName = 'StandaloneToast';

// ============================================================================
// NOTIFICATION BELL WITH TOAST
// ============================================================================

export const NotificationBell = ({
    count = 0,
    notifications = [],
    onNotificationClick,
    onClearAll,
    className = '',
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className={cn('relative', className)}>
            {/* Bell button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                <svg className="w-6 h-6 text-gray-600 dark:text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>

                {count > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                        {count > 99 ? '99+' : count}
                    </motion.span>
                )}
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>
                            {notifications.length > 0 && (
                                <button
                                    onClick={onClearAll}
                                    className="text-sm text-amber-600 hover:text-amber-700 dark:text-amber-400"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>

                        {/* Notifications list */}
                        <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                                    <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                                    </svg>
                                    <p>No notifications</p>
                                </div>
                            ) : (
                                notifications.map((notification, index) => (
                                    <button
                                        key={notification.id || index}
                                        onClick={() => onNotificationClick?.(notification)}
                                        className="w-full p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                                    >
                                        <div className="flex gap-3">
                                            <div className={cn(
                                                'flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center',
                                                TOAST_TYPES[notification.type]?.iconClassName || TOAST_TYPES.default.iconClassName
                                            )}>
                                                {TOAST_TYPES[notification.type]?.icon || TOAST_TYPES.default.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                                    {notification.title}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">
                                                    {notification.message}
                                                </p>
                                                {notification.time && (
                                                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                                        {notification.time}
                                                    </p>
                                                )}
                                            </div>
                                            {!notification.read && (
                                                <span className="flex-shrink-0 w-2 h-2 bg-amber-500 rounded-full" />
                                            )}
                                        </div>
                                    </button>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </div>
    );
};

// ============================================================================
// CONFIRMATION TOAST
// ============================================================================

export const ConfirmationToast = forwardRef(({
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    onConfirm,
    onCancel,
    type = 'warning',
    isDestructive = false,
    className = '',
    ...props
}, ref) => {
    const config = TOAST_TYPES[type] || TOAST_TYPES.default;

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
                'w-[400px] max-w-[calc(100vw-2rem)] rounded-xl border shadow-xl overflow-hidden',
                'bg-white dark:bg-gray-800',
                className
            )}
            {...props}
        >
            <div className="p-5">
                <div className="flex items-start gap-4">
                    <div className={cn(
                        'flex-shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
                        config.iconClassName
                    )}>
                        {config.icon}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {title}
                        </h3>
                        {message && (
                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                                {message}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex items-center justify-end gap-3 mt-5">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        onClick={onConfirm}
                        className={cn(
                            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                            isDestructive
                                ? 'bg-red-500 hover:bg-red-600 text-white'
                                : 'bg-amber-500 hover:bg-amber-600 text-black'
                        )}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </motion.div>
    );
});

ConfirmationToast.displayName = 'ConfirmationToast';

// ============================================================================
// UNDO TOAST
// ============================================================================

export const UndoToast = forwardRef(({
    message = 'Action completed',
    undoLabel = 'Undo',
    onUndo,
    onDismiss,
    duration = 5000,
    className = '',
    ...props
}, ref) => {
    const [timeLeft, setTimeLeft] = useState(duration / 1000);

    useEffect(() => {
        if (timeLeft <= 0) {
            onDismiss?.();
            return;
        }

        const timer = setTimeout(() => {
            setTimeLeft(prev => prev - 1);
        }, 1000);

        return () => clearTimeout(timer);
    }, [timeLeft, onDismiss]);

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
                'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg',
                'bg-gray-900 text-white',
                className
            )}
            {...props}
        >
            <p className="flex-1 text-sm">{message}</p>
            <button
                onClick={onUndo}
                className="px-3 py-1 text-sm font-medium text-amber-400 hover:text-amber-300 transition-colors"
            >
                {undoLabel} ({timeLeft}s)
            </button>
            <button
                onClick={onDismiss}
                className="p-1 hover:bg-gray-800 rounded transition-colors"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </motion.div>
    );
});

UndoToast.displayName = 'UndoToast';

// ============================================================================
// EXPORTS
// ============================================================================

export default Toast;
