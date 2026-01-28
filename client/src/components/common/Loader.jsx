import { useState, useEffect, useCallback, useMemo, forwardRef, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/helpers';

// ============================================================================
// LOADER CONFIGURATION & CONSTANTS
// ============================================================================

// Size configurations
const SIZE_CLASSES = {
  xs: { spinner: 'w-3 h-3 border', dot: 'w-1.5 h-1.5', text: 'text-xs' },
  sm: { spinner: 'w-4 h-4 border-2', dot: 'w-2 h-2', text: 'text-sm' },
  md: { spinner: 'w-8 h-8 border-[3px]', dot: 'w-3 h-3', text: 'text-base' },
  lg: { spinner: 'w-12 h-12 border-4', dot: 'w-4 h-4', text: 'text-lg' },
  xl: { spinner: 'w-16 h-16 border-4', dot: 'w-5 h-5', text: 'text-xl' },
  '2xl': { spinner: 'w-24 h-24 border-[5px]', dot: 'w-6 h-6', text: 'text-2xl' },
};

// Color configurations
const COLOR_CLASSES = {
  primary: {
    spinner: 'border-amber-500 border-t-transparent',
    dot: 'bg-amber-500',
    text: 'text-amber-500',
    gradient: 'from-amber-400 to-yellow-500',
  },
  secondary: {
    spinner: 'border-gray-500 border-t-transparent',
    dot: 'bg-gray-500',
    text: 'text-gray-500',
    gradient: 'from-gray-400 to-gray-600',
  },
  success: {
    spinner: 'border-emerald-500 border-t-transparent',
    dot: 'bg-emerald-500',
    text: 'text-emerald-500',
    gradient: 'from-emerald-400 to-teal-500',
  },
  danger: {
    spinner: 'border-red-500 border-t-transparent',
    dot: 'bg-red-500',
    text: 'text-red-500',
    gradient: 'from-red-400 to-rose-500',
  },
  warning: {
    spinner: 'border-amber-400 border-t-transparent',
    dot: 'bg-amber-400',
    text: 'text-amber-400',
    gradient: 'from-amber-300 to-orange-400',
  },
  info: {
    spinner: 'border-blue-500 border-t-transparent',
    dot: 'bg-blue-500',
    text: 'text-blue-500',
    gradient: 'from-blue-400 to-cyan-500',
  },
  white: {
    spinner: 'border-white border-t-transparent',
    dot: 'bg-white',
    text: 'text-white',
    gradient: 'from-white to-gray-200',
  },
  gold: {
    spinner: 'border-amber-400 border-t-transparent',
    dot: 'bg-gradient-to-r from-amber-400 to-yellow-500',
    text: 'text-amber-400',
    gradient: 'from-amber-300 via-yellow-400 to-amber-500',
  },
};

// ============================================================================
// LOADING CONTEXT
// ============================================================================

const LoadingContext = createContext({
  isLoading: false,
  setLoading: () => { },
  loadingText: '',
  setLoadingText: () => { },
});

export const LoadingProvider = ({ children }) => {
  const [isLoading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  return (
    <LoadingContext.Provider value={{ isLoading, setLoading, loadingText, setLoadingText }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => useContext(LoadingContext);

// ============================================================================
// SPINNER LOADER (Default)
// ============================================================================

export const Spinner = forwardRef(({
  size = 'md',
  color = 'primary',
  thickness = null,
  speed = 'normal', // slow, normal, fast
  className = '',
  ...props
}, ref) => {
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const colorConfig = COLOR_CLASSES[color] || COLOR_CLASSES.primary;

  const speedClass = {
    slow: 'animate-[spin_1.5s_linear_infinite]',
    normal: 'animate-spin',
    fast: 'animate-[spin_0.5s_linear_infinite]',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-full',
        sizeConfig.spinner,
        colorConfig.spinner,
        speedClass[speed] || speedClass.normal,
        thickness && `border-[${thickness}px]`,
        className
      )}
      role="status"
      aria-label="Loading"
      {...props}
    />
  );
});

Spinner.displayName = 'Spinner';

// ============================================================================
// DOTS LOADER
// ============================================================================

export const DotsLoader = forwardRef(({
  size = 'md',
  color = 'primary',
  count = 3,
  className = '',
  ...props
}, ref) => {
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const colorConfig = COLOR_CLASSES[color] || COLOR_CLASSES.primary;

  return (
    <div
      ref={ref}
      className={cn('flex items-center gap-1', className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={cn('rounded-full', sizeConfig.dot, colorConfig.dot)}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.15,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
});

DotsLoader.displayName = 'DotsLoader';

// ============================================================================
// PULSE LOADER
// ============================================================================

export const PulseLoader = forwardRef(({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}, ref) => {
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const colorConfig = COLOR_CLASSES[color] || COLOR_CLASSES.primary;

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <motion.div
        className={cn('rounded-full', sizeConfig.spinner, colorConfig.dot)}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [1, 0, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className={cn('absolute inset-0 rounded-full', sizeConfig.spinner, colorConfig.dot)}
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 0, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.3,
        }}
      />
    </div>
  );
});

PulseLoader.displayName = 'PulseLoader';

// ============================================================================
// BARS LOADER
// ============================================================================

export const BarsLoader = forwardRef(({
  size = 'md',
  color = 'primary',
  count = 5,
  className = '',
  ...props
}, ref) => {
  const colorConfig = COLOR_CLASSES[color] || COLOR_CLASSES.primary;

  const barHeights = {
    xs: 8,
    sm: 12,
    md: 20,
    lg: 28,
    xl: 36,
    '2xl': 48,
  };

  const barWidth = {
    xs: 2,
    sm: 3,
    md: 4,
    lg: 5,
    xl: 6,
    '2xl': 8,
  };

  const height = barHeights[size] || barHeights.md;
  const width = barWidth[size] || barWidth.md;

  return (
    <div
      ref={ref}
      className={cn('flex items-end gap-1', className)}
      style={{ height }}
      role="status"
      aria-label="Loading"
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={cn('rounded-full', colorConfig.dot)}
          style={{ width }}
          animate={{
            height: [height * 0.3, height, height * 0.3],
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: i * 0.1,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
});

BarsLoader.displayName = 'BarsLoader';

// ============================================================================
// RING LOADER
// ============================================================================

export const RingLoader = forwardRef(({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}, ref) => {
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const colorConfig = COLOR_CLASSES[color] || COLOR_CLASSES.primary;

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <motion.div
        className={cn(
          'rounded-full border-4',
          sizeConfig.spinner,
          'border-current opacity-20',
          colorConfig.text
        )}
      />
      <motion.div
        className={cn(
          'absolute inset-0 rounded-full',
          sizeConfig.spinner,
          colorConfig.spinner
        )}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
});

RingLoader.displayName = 'RingLoader';

// ============================================================================
// GRADIENT SPINNER
// ============================================================================

export const GradientSpinner = forwardRef(({
  size = 'md',
  color = 'gold',
  className = '',
  ...props
}, ref) => {
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const colorConfig = COLOR_CLASSES[color] || COLOR_CLASSES.gold;

  return (
    <div
      ref={ref}
      className={cn('relative', className)}
      role="status"
      aria-label="Loading"
      {...props}
    >
      <motion.div
        className={cn(
          'rounded-full bg-gradient-to-r',
          sizeConfig.spinner,
          colorConfig.gradient
        )}
        style={{
          mask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
          WebkitMask: 'radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 4px))',
        }}
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
      />
    </div>
  );
});

GradientSpinner.displayName = 'GradientSpinner';

// ============================================================================
// LOADING TEXT
// ============================================================================

export const LoadingText = forwardRef(({
  text = 'Loading',
  size = 'md',
  color = 'primary',
  animated = true,
  dotCount = 3,
  className = '',
  ...props
}, ref) => {
  const [dots, setDots] = useState('');
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;
  const colorConfig = COLOR_CLASSES[color] || COLOR_CLASSES.primary;

  useEffect(() => {
    if (!animated) return;

    const interval = setInterval(() => {
      setDots(prev => (prev.length >= dotCount ? '' : prev + '.'));
    }, 400);

    return () => clearInterval(interval);
  }, [animated, dotCount]);

  return (
    <span
      ref={ref}
      className={cn(sizeConfig.text, colorConfig.text, 'font-medium', className)}
      {...props}
    >
      {text}{animated ? dots : ''}
    </span>
  );
});

LoadingText.displayName = 'LoadingText';

// ============================================================================
// MAIN LOADER COMPONENT
// ============================================================================

const Loader = forwardRef(({
  type = 'spinner', // spinner, dots, pulse, bars, ring, gradient
  size = 'md',
  color = 'primary',
  text = null,
  textPosition = 'bottom', // top, right, bottom, left
  className = '',
  ...props
}, ref) => {
  const LoaderComponent = {
    spinner: Spinner,
    dots: DotsLoader,
    pulse: PulseLoader,
    bars: BarsLoader,
    ring: RingLoader,
    gradient: GradientSpinner,
  }[type] || Spinner;

  const flexDirection = {
    top: 'flex-col-reverse',
    right: 'flex-row',
    bottom: 'flex-col',
    left: 'flex-row-reverse',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'inline-flex items-center justify-center gap-3',
        flexDirection[textPosition],
        className
      )}
      {...props}
    >
      <LoaderComponent size={size} color={color} />
      {text && <LoadingText text={text} size={size} color={color} />}
    </div>
  );
});

Loader.displayName = 'Loader';

export default Loader;

// ============================================================================
// PAGE LOADER
// ============================================================================

export const PageLoader = forwardRef(({
  text = 'Loading',
  size = 'lg',
  color = 'primary',
  type = 'spinner',
  fullScreen = false,
  overlay = false,
  blur = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center justify-center',
        fullScreen ? 'fixed inset-0 z-50' : 'min-h-[60vh]',
        overlay && 'bg-black/50',
        blur && 'backdrop-blur-sm',
        className
      )}
      {...props}
    >
      <div className="text-center">
        <Loader type={type} size={size} color={color} className="mb-4" />
        {text && (
          <p className={cn(
            'font-medium',
            COLOR_CLASSES[color]?.text || 'text-gray-500'
          )}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
});

PageLoader.displayName = 'PageLoader';

// ============================================================================
// LOADING OVERLAY
// ============================================================================

export const LoadingOverlay = forwardRef(({
  isVisible = false,
  text = 'Loading...',
  type = 'spinner',
  size = 'lg',
  color = 'primary',
  blur = true,
  className = '',
  ...props
}, ref) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn(
            'absolute inset-0 z-50 flex items-center justify-center',
            'bg-white/80 dark:bg-gray-900/80',
            blur && 'backdrop-blur-sm',
            className
          )}
          {...props}
        >
          <Loader type={type} size={size} color={color} text={text} />
        </motion.div>
      )}
    </AnimatePresence>
  );
});

LoadingOverlay.displayName = 'LoadingOverlay';

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

export const Skeleton = forwardRef(({
  variant = 'text', // text, circular, rectangular, rounded
  width,
  height,
  animation = 'pulse', // pulse, wave, none
  className = '',
  style = {},
  ...props
}, ref) => {
  const variantClasses = {
    text: 'h-4 rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-[wave_1.5s_ease-in-out_infinite]',
    none: '',
  };

  return (
    <div
      ref={ref}
      className={cn(
        'bg-gray-200 dark:bg-gray-700',
        variantClasses[variant] || variantClasses.text,
        animationClasses[animation] || animationClasses.pulse,
        className
      )}
      style={{
        width: width,
        height: height,
        ...style,
      }}
      {...props}
    />
  );
});

Skeleton.displayName = 'Skeleton';

// ============================================================================
// SKELETON CARD
// ============================================================================

export const SkeletonCard = forwardRef(({
  imageHeight = 160,
  lines = 3,
  showAvatar = false,
  showActions = true,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm',
        className
      )}
      {...props}
    >
      {/* Image */}
      <Skeleton
        variant="rounded"
        height={imageHeight}
        className="w-full mb-4"
      />

      {/* Avatar and title row */}
      {showAvatar && (
        <div className="flex items-center gap-3 mb-4">
          <Skeleton variant="circular" width={40} height={40} />
          <div className="flex-1">
            <Skeleton width="60%" height={16} className="mb-2" />
            <Skeleton width="40%" height={12} />
          </div>
        </div>
      )}

      {/* Content lines */}
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            width={i === lines - 1 ? '60%' : '100%'}
            height={i === 0 ? 20 : 16}
          />
        ))}
      </div>

      {/* Actions */}
      {showActions && (
        <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <Skeleton width={80} height={24} />
          <Skeleton variant="rounded" width={100} height={36} />
        </div>
      )}
    </div>
  );
});

SkeletonCard.displayName = 'SkeletonCard';

// ============================================================================
// SKELETON TEXT
// ============================================================================

export const SkeletonText = forwardRef(({
  lines = 3,
  gap = 8,
  lastLineWidth = '60%',
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('space-y-2', className)}
      style={{ gap }}
      {...props}
    >
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          width={i === lines - 1 ? lastLineWidth : '100%'}
          height={16}
        />
      ))}
    </div>
  );
});

SkeletonText.displayName = 'SkeletonText';

// ============================================================================
// SKELETON LIST
// ============================================================================

export const SkeletonList = forwardRef(({
  count = 5,
  showAvatar = true,
  avatarSize = 40,
  gap = 16,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('space-y-4', className)}
      style={{ gap }}
      {...props}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          {showAvatar && (
            <Skeleton
              variant="circular"
              width={avatarSize}
              height={avatarSize}
            />
          )}
          <div className="flex-1">
            <Skeleton width="70%" height={16} className="mb-2" />
            <Skeleton width="50%" height={12} />
          </div>
        </div>
      ))}
    </div>
  );
});

SkeletonList.displayName = 'SkeletonList';

// ============================================================================
// SKELETON TABLE
// ============================================================================

export const SkeletonTable = forwardRef(({
  rows = 5,
  columns = 4,
  showHeader = true,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn('w-full', className)}
      {...props}
    >
      {/* Header */}
      {showHeader && (
        <div className="flex gap-4 pb-4 border-b border-gray-200 dark:border-gray-700 mb-4">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="flex-1" height={20} />
          ))}
        </div>
      )}

      {/* Rows */}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 items-center">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                className="flex-1"
                height={16}
                width={colIndex === 0 ? '80%' : '100%'}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

SkeletonTable.displayName = 'SkeletonTable';

// ============================================================================
// PROGRESS LOADER
// ============================================================================

export const ProgressLoader = forwardRef(({
  progress = 0,
  showPercentage = true,
  color = 'primary',
  size = 'md',
  animated = true,
  className = '',
  ...props
}, ref) => {
  const colorConfig = COLOR_CLASSES[color] || COLOR_CLASSES.primary;

  const heights = {
    xs: 'h-1',
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
    xl: 'h-4',
  };

  return (
    <div ref={ref} className={cn('w-full', className)} {...props}>
      <div className={cn(
        'w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden',
        heights[size] || heights.md
      )}>
        <motion.div
          className={cn(
            'h-full rounded-full bg-gradient-to-r',
            colorConfig.gradient
          )}
          initial={{ width: 0 }}
          animate={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
          transition={{ duration: animated ? 0.3 : 0, ease: 'easeOut' }}
        />
      </div>
      {showPercentage && (
        <p className={cn(
          'text-right mt-1',
          SIZE_CLASSES[size]?.text || 'text-sm',
          colorConfig.text
        )}>
          {Math.round(progress)}%
        </p>
      )}
    </div>
  );
});

ProgressLoader.displayName = 'ProgressLoader';

// ============================================================================
// INLINE LOADER
// ============================================================================

export const InlineLoader = forwardRef(({
  text = 'Loading',
  size = 'sm',
  color = 'primary',
  className = '',
  ...props
}, ref) => {
  return (
    <span
      ref={ref}
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    >
      <Spinner size={size} color={color} />
      <LoadingText text={text} size={size} color={color} />
    </span>
  );
});

InlineLoader.displayName = 'InlineLoader';