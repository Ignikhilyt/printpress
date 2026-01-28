import { forwardRef, useState, useCallback, useRef, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== ICONS ====================

const SpinnerIcon = ({ size = 16, className = '' }) => (
  <svg
    className={`animate-spin ${className}`}
    width={size}
    height={size}
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
  </svg>
);

const ChevronDownIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const CheckIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const PlusIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const MinusIcon = ({ size = 16 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

// ==================== UTILITY FUNCTIONS ====================

const cn = (...classes) => classes.filter(Boolean).join(' ');

// ==================== STYLE CONFIGURATION ====================

const VARIANT_STYLES = {
  primary: {
    base: 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-transparent',
    hover: 'hover:from-indigo-600 hover:to-purple-700 hover:shadow-lg hover:shadow-indigo-500/25',
    active: 'active:scale-[0.98]',
    focus: 'focus:ring-indigo-500',
    disabled: 'disabled:from-gray-300 disabled:to-gray-400',
  },
  secondary: {
    base: 'bg-gray-100 text-gray-700 border-gray-200',
    hover: 'hover:bg-gray-200 hover:text-gray-900',
    active: 'active:scale-[0.98] active:bg-gray-300',
    focus: 'focus:ring-gray-400',
    disabled: 'disabled:bg-gray-100 disabled:text-gray-400',
  },
  outline: {
    base: 'bg-transparent text-indigo-600 border-indigo-500 border-2',
    hover: 'hover:bg-indigo-50',
    active: 'active:scale-[0.98] active:bg-indigo-100',
    focus: 'focus:ring-indigo-500',
    disabled: 'disabled:border-gray-300 disabled:text-gray-400',
  },
  ghost: {
    base: 'bg-transparent text-gray-600 border-transparent',
    hover: 'hover:bg-gray-100 hover:text-gray-900',
    active: 'active:scale-[0.98] active:bg-gray-200',
    focus: 'focus:ring-gray-400',
    disabled: 'disabled:text-gray-400',
  },
  danger: {
    base: 'bg-red-500 text-white border-transparent',
    hover: 'hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/25',
    active: 'active:scale-[0.98] active:bg-red-700',
    focus: 'focus:ring-red-500',
    disabled: 'disabled:bg-red-300',
  },
  success: {
    base: 'bg-green-500 text-white border-transparent',
    hover: 'hover:bg-green-600 hover:shadow-lg hover:shadow-green-500/25',
    active: 'active:scale-[0.98] active:bg-green-700',
    focus: 'focus:ring-green-500',
    disabled: 'disabled:bg-green-300',
  },
  warning: {
    base: 'bg-amber-500 text-white border-transparent',
    hover: 'hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/25',
    active: 'active:scale-[0.98] active:bg-amber-700',
    focus: 'focus:ring-amber-500',
    disabled: 'disabled:bg-amber-300',
  },
  info: {
    base: 'bg-blue-500 text-white border-transparent',
    hover: 'hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/25',
    active: 'active:scale-[0.98] active:bg-blue-700',
    focus: 'focus:ring-blue-500',
    disabled: 'disabled:bg-blue-300',
  },
  link: {
    base: 'bg-transparent text-indigo-600 border-transparent underline-offset-4',
    hover: 'hover:underline hover:text-indigo-700',
    active: 'active:text-indigo-800',
    focus: 'focus:ring-indigo-500',
    disabled: 'disabled:text-gray-400 disabled:no-underline',
  },
  dark: {
    base: 'bg-gray-900 text-white border-transparent',
    hover: 'hover:bg-gray-800 hover:shadow-lg',
    active: 'active:scale-[0.98] active:bg-gray-700',
    focus: 'focus:ring-gray-600',
    disabled: 'disabled:bg-gray-600',
  },
  white: {
    base: 'bg-white text-gray-900 border-gray-200',
    hover: 'hover:bg-gray-50 hover:shadow-md',
    active: 'active:scale-[0.98] active:bg-gray-100',
    focus: 'focus:ring-gray-300',
    disabled: 'disabled:bg-gray-100 disabled:text-gray-400',
  },
  gradient: {
    base: 'bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white border-transparent',
    hover: 'hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 hover:shadow-lg',
    active: 'active:scale-[0.98]',
    focus: 'focus:ring-pink-500',
    disabled: 'disabled:from-gray-300 disabled:via-gray-400 disabled:to-gray-300',
  },
};

const SIZE_STYLES = {
  xs: 'px-2.5 py-1 text-xs font-medium gap-1',
  sm: 'px-3 py-1.5 text-sm font-medium gap-1.5',
  md: 'px-4 py-2 text-sm font-semibold gap-2',
  lg: 'px-5 py-2.5 text-base font-semibold gap-2',
  xl: 'px-6 py-3 text-lg font-semibold gap-2.5',
  '2xl': 'px-8 py-4 text-xl font-bold gap-3',
};

const ICON_ONLY_SIZES = {
  xs: 'p-1.5',
  sm: 'p-2',
  md: 'p-2.5',
  lg: 'p-3',
  xl: 'p-3.5',
  '2xl': 'p-4',
};

const RADIUS_STYLES = {
  none: 'rounded-none',
  sm: 'rounded-sm',
  md: 'rounded-md',
  lg: 'rounded-lg',
  xl: 'rounded-xl',
  '2xl': 'rounded-2xl',
  full: 'rounded-full',
};

// ==================== BUTTON CONTEXT ====================

const ButtonGroupContext = createContext(null);

// ==================== MAIN BUTTON COMPONENT ====================

const Button = forwardRef(({
  children,
  variant = 'primary',
  size = 'md',
  radius = 'lg',
  type = 'button',
  disabled = false,
  loading = false,
  loadingText,
  fullWidth = false,
  iconOnly = false,
  leftIcon,
  rightIcon,
  as: Component = 'button',
  href,
  target,
  rel,
  onClick,
  onMouseEnter,
  onMouseLeave,
  className = '',
  ripple = true,
  tooltip,
  tooltipPosition = 'top',
  successState = false,
  successDuration = 2000,
  ariaLabel,
  ...props
}, ref) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef(null);
  const groupContext = useContext(ButtonGroupContext);

  // Combine ref
  const combinedRef = (node) => {
    buttonRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  // Handle success state
  useEffect(() => {
    if (successState) {
      setShowSuccess(true);
      const timer = setTimeout(() => setShowSuccess(false), successDuration);
      return () => clearTimeout(timer);
    }
  }, [successState, successDuration]);

  // Handle ripple effect
  const handleRipple = useCallback((e) => {
    if (!ripple || disabled || loading) return;

    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const newRipple = { x, y, size, id: Date.now() };
    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);
  }, [ripple, disabled, loading]);

  // Handle click
  const handleClick = useCallback((e) => {
    handleRipple(e);
    if (!disabled && !loading) {
      onClick?.(e);
    }
  }, [handleRipple, disabled, loading, onClick]);

  // Determine component type
  const isLink = Component === 'a' || href;
  const FinalComponent = isLink ? 'a' : Component;

  // Build class names
  const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.primary;
  const sizeStyle = iconOnly ? ICON_ONLY_SIZES[size] : SIZE_STYLES[size];
  const radiusStyle = groupContext ? '' : RADIUS_STYLES[radius]; // Skip radius in button groups

  const buttonClasses = cn(
    // Base styles
    'relative inline-flex items-center justify-center',
    'border transition-all duration-200 ease-out',
    'focus:outline-none focus:ring-2 focus:ring-offset-2',
    'disabled:cursor-not-allowed disabled:opacity-60',
    'overflow-hidden',
    // Variant styles
    variantStyle.base,
    !disabled && !loading && variantStyle.hover,
    !disabled && !loading && variantStyle.active,
    variantStyle.focus,
    (disabled || loading) && variantStyle.disabled,
    // Size styles
    sizeStyle,
    radiusStyle,
    // Full width
    fullWidth && 'w-full',
    // Custom class
    className
  );

  // Link props
  const linkProps = isLink ? {
    href,
    target,
    rel: target === '_blank' ? 'noopener noreferrer' : rel,
  } : {};

  // Button content
  const renderContent = () => {
    if (showSuccess) {
      return (
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center gap-2"
        >
          <CheckIcon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} />
          <span>Done!</span>
        </motion.span>
      );
    }

    if (loading) {
      return (
        <>
          <SpinnerIcon size={size === 'xs' ? 12 : size === 'sm' ? 14 : 16} className="-ml-1" />
          {loadingText || children}
        </>
      );
    }

    return (
      <>
        {leftIcon && <span className="shrink-0">{leftIcon}</span>}
        {!iconOnly && children && <span>{children}</span>}
        {iconOnly && children}
        {rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </>
    );
  };

  // Tooltip wrapper
  const buttonElement = (
    <FinalComponent
      ref={combinedRef}
      type={!isLink ? type : undefined}
      className={buttonClasses}
      disabled={!isLink && (disabled || loading)}
      onClick={handleClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      aria-label={ariaLabel || (iconOnly && typeof children === 'string' ? children : undefined)}
      aria-disabled={disabled || loading}
      aria-busy={loading}
      {...linkProps}
      {...props}
    >
      {/* Ripple effects */}
      {ripple && (
        <AnimatePresence>
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.5 }}
              animate={{ scale: 4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute bg-white/30 rounded-full pointer-events-none"
              style={{
                width: ripple.size,
                height: ripple.size,
                left: ripple.x,
                top: ripple.y,
              }}
            />
          ))}
        </AnimatePresence>
      )}
      {/* Button content */}
      {renderContent()}
    </FinalComponent>
  );

  // Wrap with tooltip if provided
  if (tooltip) {
    return (
      <Tooltip content={tooltip} position={tooltipPosition}>
        {buttonElement}
      </Tooltip>
    );
  }

  return buttonElement;
});

Button.displayName = 'Button';

// ==================== BUTTON GROUP ====================

export const ButtonGroup = ({
  children,
  orientation = 'horizontal', // horizontal, vertical
  attached = true,
  size,
  variant,
  disabled,
  fullWidth = false,
  className = '',
}) => {
  const orientationClasses = {
    horizontal: 'flex-row',
    vertical: 'flex-col',
  };

  const attachedClasses = attached ? (
    orientation === 'horizontal'
      ? '[&>*:not(:first-child)]:-ml-px [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none'
      : '[&>*:not(:first-child)]:-mt-px [&>*:first-child]:rounded-b-none [&>*:last-child]:rounded-t-none [&>*:not(:first-child):not(:last-child)]:rounded-none'
  ) : 'gap-2';

  return (
    <ButtonGroupContext.Provider value={{ size, variant, disabled }}>
      <div
        className={cn(
          'inline-flex',
          orientationClasses[orientation],
          attachedClasses,
          fullWidth && 'w-full [&>*]:flex-1',
          className
        )}
        role="group"
      >
        {children}
      </div>
    </ButtonGroupContext.Provider>
  );
};

// ==================== ICON BUTTON ====================

export const IconButton = forwardRef(({
  icon,
  variant = 'ghost',
  size = 'md',
  radius = 'full',
  ariaLabel,
  ...props
}, ref) => (
  <Button
    ref={ref}
    variant={variant}
    size={size}
    radius={radius}
    iconOnly
    ariaLabel={ariaLabel}
    {...props}
  >
    {icon}
  </Button>
));

IconButton.displayName = 'IconButton';

// ==================== CLOSE BUTTON ====================

export const CloseButton = forwardRef(({
  size = 'md',
  variant = 'ghost',
  ariaLabel = 'Close',
  ...props
}, ref) => {
  const iconSizes = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, '2xl': 24 };

  return (
    <IconButton
      ref={ref}
      variant={variant}
      size={size}
      ariaLabel={ariaLabel}
      icon={
        <svg
          width={iconSizes[size]}
          height={iconSizes[size]}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      }
      {...props}
    />
  );
});

CloseButton.displayName = 'CloseButton';

// ==================== INCREMENT/DECREMENT BUTTONS ====================

export const IncrementButton = forwardRef(({ size = 'sm', ...props }, ref) => (
  <IconButton ref={ref} size={size} icon={<PlusIcon />} ariaLabel="Increment" {...props} />
));

export const DecrementButton = forwardRef(({ size = 'sm', ...props }, ref) => (
  <IconButton ref={ref} size={size} icon={<MinusIcon />} ariaLabel="Decrement" {...props} />
));

IncrementButton.displayName = 'IncrementButton';
DecrementButton.displayName = 'DecrementButton';

// ==================== DROPDOWN BUTTON ====================

export const DropdownButton = forwardRef(({
  children,
  items = [],
  placement = 'bottom-start',
  variant = 'secondary',
  size = 'md',
  disabled = false,
  onSelect,
  ...props
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle selection
  const handleSelect = (item) => {
    onSelect?.(item);
    setIsOpen(false);
  };

  // Placement classes
  const placementClasses = {
    'bottom-start': 'top-full left-0 mt-1',
    'bottom-end': 'top-full right-0 mt-1',
    'top-start': 'bottom-full left-0 mb-1',
    'top-end': 'bottom-full right-0 mb-1',
  };

  return (
    <div ref={dropdownRef} className="relative inline-block">
      <Button
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        rightIcon={
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDownIcon />
          </motion.span>
        }
        {...props}
      >
        {children}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute z-50 min-w-[180px] py-1',
              'bg-white rounded-lg shadow-xl border border-gray-200',
              placementClasses[placement]
            )}
          >
            {items.map((item, index) => (
              item.divider ? (
                <div key={index} className="my-1 border-t border-gray-100" />
              ) : (
                <button
                  key={index}
                  onClick={() => handleSelect(item)}
                  disabled={item.disabled}
                  className={cn(
                    'w-full px-4 py-2 text-left text-sm',
                    'flex items-center gap-2 transition-colors',
                    'hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed',
                    item.danger && 'text-red-600 hover:bg-red-50'
                  )}
                >
                  {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                  {item.label}
                  {item.shortcut && (
                    <span className="ml-auto text-xs text-gray-400">
                      {item.shortcut}
                    </span>
                  )}
                </button>
              )
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

DropdownButton.displayName = 'DropdownButton';

// ==================== SPLIT BUTTON ====================

export const SplitButton = forwardRef(({
  children,
  items = [],
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  onSelect,
  ...props
}, ref) => {
  return (
    <ButtonGroup attached>
      <Button
        ref={ref}
        variant={variant}
        size={size}
        disabled={disabled}
        loading={loading}
        onClick={onClick}
        {...props}
      >
        {children}
      </Button>
      <DropdownButton
        variant={variant}
        size={size}
        disabled={disabled}
        items={items}
        onSelect={onSelect}
      >
        <ChevronDownIcon />
      </DropdownButton>
    </ButtonGroup>
  );
});

SplitButton.displayName = 'SplitButton';

// ==================== COPY BUTTON ====================

export const CopyButton = forwardRef(({
  text,
  variant = 'ghost',
  size = 'sm',
  successMessage = 'Copied!',
  children,
  ...props
}, ref) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <Button
      ref={ref}
      variant={variant}
      size={size}
      onClick={handleCopy}
      leftIcon={copied ? <CheckIcon /> : (
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
      )}
      {...props}
    >
      {copied ? successMessage : (children || 'Copy')}
    </Button>
  );
});

CopyButton.displayName = 'CopyButton';

// ==================== TOOLTIP COMPONENT ====================

const Tooltip = ({ children, content, position = 'top', delay = 0 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef(null);

  const show = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hide = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div className="relative inline-block" onMouseEnter={show} onMouseLeave={hide}>
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.1 }}
            className={cn(
              'absolute z-50 px-2 py-1',
              'text-xs text-white bg-gray-900 rounded-md',
              'whitespace-nowrap pointer-events-none',
              positionClasses[position]
            )}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==================== EXPORTS ====================

export default Button;