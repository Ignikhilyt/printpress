import { useState, useCallback, useEffect, useRef, forwardRef, createContext, useContext, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/helpers';

// ============================================================================
// INPUT CONFIGURATION & CONSTANTS
// ============================================================================

// Size configurations
const SIZE_CLASSES = {
  xs: {
    input: 'h-7 text-xs px-2',
    icon: 'w-3.5 h-3.5',
    label: 'text-xs',
  },
  sm: {
    input: 'h-8 text-sm px-2.5',
    icon: 'w-4 h-4',
    label: 'text-xs',
  },
  md: {
    input: 'h-10 text-sm px-3',
    icon: 'w-4 h-4',
    label: 'text-sm',
  },
  lg: {
    input: 'h-12 text-base px-4',
    icon: 'w-5 h-5',
    label: 'text-sm',
  },
  xl: {
    input: 'h-14 text-lg px-5',
    icon: 'w-6 h-6',
    label: 'text-base',
  },
};

// Variant styles
const VARIANT_STYLES = {
  default: {
    base: 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800',
    focus: 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
    hover: 'hover:border-gray-400 dark:hover:border-gray-500',
  },
  filled: {
    base: 'border-transparent bg-gray-100 dark:bg-gray-800',
    focus: 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 focus:bg-white dark:focus:bg-gray-900',
    hover: 'hover:bg-gray-200 dark:hover:bg-gray-700',
  },
  outlined: {
    base: 'border-2 border-gray-300 dark:border-gray-600 bg-transparent',
    focus: 'focus:border-amber-500 focus:ring-0',
    hover: 'hover:border-gray-400 dark:hover:border-gray-500',
  },
  underlined: {
    base: 'border-0 border-b-2 border-gray-300 dark:border-gray-600 bg-transparent rounded-none px-0',
    focus: 'focus:border-amber-500 focus:ring-0',
    hover: 'hover:border-gray-400 dark:hover:border-gray-500',
  },
  ghost: {
    base: 'border-transparent bg-transparent',
    focus: 'focus:bg-gray-100 dark:focus:bg-gray-800 focus:ring-0',
    hover: 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
  },
  premium: {
    base: 'border-amber-500/30 bg-black/50 dark:bg-black/80',
    focus: 'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/30',
    hover: 'hover:border-amber-500/50',
  },
};

// State style modifiers
const STATE_STYLES = {
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
  success: 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-500/20',
  warning: 'border-amber-500 focus:border-amber-500 focus:ring-amber-500/20',
  disabled: 'bg-gray-100 dark:bg-gray-800 cursor-not-allowed opacity-60',
  readonly: 'bg-gray-50 dark:bg-gray-800/50 cursor-default',
};

// ============================================================================
// INPUT CONTEXT
// ============================================================================

const InputContext = createContext(null);

export const useInputContext = () => {
  const context = useContext(InputContext);
  return context;
};

// ============================================================================
// HELPER HOOKS
// ============================================================================

// Hook for character counter
const useCharacterCount = (value, maxLength) => {
  const count = useMemo(() => (value || '').length, [value]);
  const remaining = useMemo(() => maxLength - count, [count, maxLength]);
  const percentage = useMemo(() => (count / maxLength) * 100, [count, maxLength]);
  const isOverLimit = remaining < 0;
  const isNearLimit = remaining <= Math.ceil(maxLength * 0.1) && remaining > 0;

  return { count, remaining, percentage, isOverLimit, isNearLimit };
};

// Hook for input validation
const useInputValidation = (value, rules = {}) => {
  const [errors, setErrors] = useState([]);
  const [isValid, setIsValid] = useState(true);

  const validate = useCallback(() => {
    const newErrors = [];

    if (rules.required && (!value || value.trim() === '')) {
      newErrors.push('This field is required');
    }

    if (rules.minLength && value && value.length < rules.minLength) {
      newErrors.push(`Minimum ${rules.minLength} characters required`);
    }

    if (rules.maxLength && value && value.length > rules.maxLength) {
      newErrors.push(`Maximum ${rules.maxLength} characters allowed`);
    }

    if (rules.pattern && value && !rules.pattern.test(value)) {
      newErrors.push(rules.patternMessage || 'Invalid format');
    }

    if (rules.email && value) {
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(value)) {
        newErrors.push('Invalid email address');
      }
    }

    if (rules.url && value) {
      try {
        new URL(value);
      } catch {
        newErrors.push('Invalid URL');
      }
    }

    if (rules.custom && typeof rules.custom === 'function') {
      const customError = rules.custom(value);
      if (customError) {
        newErrors.push(customError);
      }
    }

    setErrors(newErrors);
    setIsValid(newErrors.length === 0);
    return newErrors.length === 0;
  }, [value, rules]);

  return { errors, isValid, validate };
};

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  eye: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  eyeOff: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  ),
  close: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  search: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  check: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  warning: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  error: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  loading: (
    <svg className="animate-spin" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  ),
  calendar: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  lock: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  mail: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  phone: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  user: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  link: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  ),
  copy: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  ),
};

// ============================================================================
// MAIN INPUT COMPONENT
// ============================================================================

const Input = forwardRef(({
  type = 'text',
  label = '',
  placeholder = '',
  value,
  defaultValue,
  onChange,
  onBlur,
  onFocus,
  onClear,
  onEnter,

  // Styling
  variant = 'default',
  size = 'md',
  rounded = 'lg', // none, sm, md, lg, full
  fullWidth = true,
  className = '',
  inputClassName = '',
  labelClassName = '',

  // States
  error = null,
  success = false,
  warning = false,
  disabled = false,
  readOnly = false,
  loading = false,

  // Features
  clearable = false,
  showPasswordToggle = true,
  showCharacterCount = false,
  maxLength = null,
  prefix = null,
  suffix = null,
  leftIcon = null,
  rightIcon = null,
  helperText = '',

  // Floating label
  floatingLabel = false,

  // Validation
  required = false,
  validateOnBlur = false,
  validationRules = null,

  // Copy functionality
  copyable = false,
  onCopy,

  ...props
}, ref) => {
  const inputRef = useRef(null);
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  // Determine if controlled or uncontrolled
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  // Character count
  const charCount = useCharacterCount(currentValue, maxLength || Infinity);

  // Validation
  const { errors: validationErrors, validate } = useInputValidation(
    currentValue,
    validationRules || {}
  );

  // Merge refs
  const mergedRef = useCallback((node) => {
    inputRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  // Handle value change
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;

    if (maxLength && newValue.length > maxLength) {
      return;
    }

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(e);
  }, [isControlled, onChange, maxLength]);

  // Handle focus
  const handleFocus = useCallback((e) => {
    setIsFocused(true);
    onFocus?.(e);
  }, [onFocus]);

  // Handle blur
  const handleBlur = useCallback((e) => {
    setIsFocused(false);
    onBlur?.(e);

    if (validateOnBlur && validationRules) {
      validate();
    }
  }, [onBlur, validateOnBlur, validationRules, validate]);

  // Handle key press
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && onEnter) {
      onEnter(currentValue, e);
    }
  }, [currentValue, onEnter]);

  // Handle clear
  const handleClear = useCallback(() => {
    if (!isControlled) {
      setInternalValue('');
    }

    onClear?.();

    // Trigger onChange with empty value
    const event = { target: { value: '' } };
    onChange?.(event);

    // Focus input after clear
    inputRef.current?.focus();
  }, [isControlled, onClear, onChange]);

  // Handle copy
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentValue);
      setCopied(true);
      onCopy?.(currentValue);

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, [currentValue, onCopy]);

  // Toggle password visibility
  const togglePasswordVisibility = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  // Get rounded styles
  const getRoundedStyles = () => {
    switch (rounded) {
      case 'none': return 'rounded-none';
      case 'sm': return 'rounded-sm';
      case 'md': return 'rounded-md';
      case 'lg': return 'rounded-lg';
      case 'full': return 'rounded-full';
      default: return 'rounded-lg';
    }
  };

  // Get state styles
  const getStateStyles = () => {
    if (disabled) return STATE_STYLES.disabled;
    if (readOnly) return STATE_STYLES.readonly;
    if (error || validationErrors.length > 0) return STATE_STYLES.error;
    if (success) return STATE_STYLES.success;
    if (warning) return STATE_STYLES.warning;
    return '';
  };

  // Get variant styles
  const variantConfig = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  // Determine actual input type
  const actualType = type === 'password' && showPassword ? 'text' : type;

  // Check if input has value
  const hasValue = currentValue && currentValue.length > 0;

  // Combined errors
  const allErrors = error ? [error] : validationErrors;
  const hasError = allErrors.length > 0;

  return (
    <div className={cn(fullWidth && 'w-full', className)}>
      {/* Label (non-floating) */}
      {label && !floatingLabel && (
        <label
          className={cn(
            'block mb-1.5 font-medium text-gray-700 dark:text-gray-300',
            sizeConfig.label,
            required && "after:content-['*'] after:ml-0.5 after:text-red-500",
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      {/* Input wrapper */}
      <div className="relative">
        {/* Prefix */}
        {prefix && (
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {prefix}
            </span>
          </div>
        )}

        {/* Left Icon */}
        {leftIcon && !prefix && (
          <div className={cn(
            'absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none',
            hasError && 'text-red-500',
            success && 'text-emerald-500'
          )}>
            <span className={cn('text-gray-400', sizeConfig.icon)}>
              {leftIcon}
            </span>
          </div>
        )}

        {/* Floating label wrapper */}
        {floatingLabel && (
          <label
            className={cn(
              'absolute left-3 transition-all duration-200 pointer-events-none z-10',
              'text-gray-500 dark:text-gray-400',
              (isFocused || hasValue) ? [
                '-top-2 text-xs px-1 bg-white dark:bg-gray-900',
                isFocused ? 'text-amber-500' : '',
                hasError && 'text-red-500'
              ] : [
                'top-1/2 -translate-y-1/2',
                sizeConfig.label
              ],
              required && "after:content-['*'] after:ml-0.5 after:text-red-500",
              labelClassName
            )}
          >
            {label}
          </label>
        )}

        {/* Input element */}
        <input
          ref={mergedRef}
          type={actualType}
          value={currentValue}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          placeholder={floatingLabel && !isFocused && !hasValue ? '' : placeholder}
          disabled={disabled}
          readOnly={readOnly}
          maxLength={maxLength}
          required={required}
          className={cn(
            // Base styles
            'block w-full border outline-none transition-all duration-200',
            'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',

            // Size
            sizeConfig.input,

            // Rounded
            getRoundedStyles(),

            // Variant
            variantConfig.base,
            !disabled && !readOnly && variantConfig.hover,
            variantConfig.focus,

            // States
            getStateStyles(),

            // Icon/prefix/suffix padding
            (prefix || leftIcon) && 'pl-10',
            (suffix || rightIcon || clearable || type === 'password' || copyable || loading) && 'pr-10',
            (prefix && (suffix || rightIcon)) && 'pr-20',

            inputClassName
          )}
          {...props}
        />

        {/* Right side elements */}
        <div className="absolute inset-y-0 right-0 flex items-center gap-1 pr-3">
          {/* Loading indicator */}
          {loading && (
            <span className={cn('text-gray-400', sizeConfig.icon)}>
              {Icons.loading}
            </span>
          )}

          {/* Clear button */}
          {clearable && hasValue && !loading && !disabled && !readOnly && (
            <button
              type="button"
              onClick={handleClear}
              className={cn(
                'p-1 rounded-full text-gray-400 hover:text-gray-600',
                'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                sizeConfig.icon
              )}
              tabIndex={-1}
            >
              {Icons.close}
            </button>
          )}

          {/* Password toggle */}
          {type === 'password' && showPasswordToggle && !loading && (
            <button
              type="button"
              onClick={togglePasswordVisibility}
              className={cn(
                'p-1 rounded-full text-gray-400 hover:text-gray-600',
                'hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors',
                sizeConfig.icon
              )}
              tabIndex={-1}
            >
              {showPassword ? Icons.eyeOff : Icons.eye}
            </button>
          )}

          {/* Copy button */}
          {copyable && hasValue && !loading && (
            <button
              type="button"
              onClick={handleCopy}
              className={cn(
                'p-1 rounded-full transition-colors',
                copied
                  ? 'text-emerald-500'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700',
                sizeConfig.icon
              )}
              tabIndex={-1}
            >
              {copied ? Icons.check : Icons.copy}
            </button>
          )}

          {/* Status icons */}
          {!loading && hasError && (
            <span className={cn('text-red-500 pointer-events-none', sizeConfig.icon)}>
              {Icons.error}
            </span>
          )}

          {!loading && success && !hasError && (
            <span className={cn('text-emerald-500 pointer-events-none', sizeConfig.icon)}>
              {Icons.check}
            </span>
          )}

          {!loading && warning && !hasError && !success && (
            <span className={cn('text-amber-500 pointer-events-none', sizeConfig.icon)}>
              {Icons.warning}
            </span>
          )}

          {/* Suffix */}
          {suffix && (
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              {suffix}
            </span>
          )}

          {/* Right Icon */}
          {rightIcon && !suffix && (
            <span className={cn('text-gray-400 pointer-events-none', sizeConfig.icon)}>
              {rightIcon}
            </span>
          )}
        </div>
      </div>

      {/* Bottom row: helper text and character count */}
      <div className="flex items-center justify-between mt-1">
        {/* Error message or helper text */}
        <AnimatePresence mode="wait">
          {hasError ? (
            <motion.p
              key="error"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="text-sm text-red-600 dark:text-red-400"
            >
              {allErrors[0]}
            </motion.p>
          ) : helperText ? (
            <motion.p
              key="helper"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm text-gray-500 dark:text-gray-400"
            >
              {helperText}
            </motion.p>
          ) : (
            <span />
          )}
        </AnimatePresence>

        {/* Character count */}
        {showCharacterCount && maxLength && (
          <span className={cn(
            'text-xs tabular-nums transition-colors',
            charCount.isOverLimit && 'text-red-500',
            charCount.isNearLimit && !charCount.isOverLimit && 'text-amber-500',
            !charCount.isNearLimit && !charCount.isOverLimit && 'text-gray-400'
          )}>
            {charCount.count}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

Input.displayName = 'Input';

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export const Textarea = forwardRef(({
  label = '',
  placeholder = '',
  value,
  defaultValue,
  onChange,
  rows = 4,
  minRows = 2,
  maxRows = 10,
  autoResize = false,
  variant = 'default',
  size = 'md',
  error = null,
  success = false,
  disabled = false,
  readOnly = false,
  showCharacterCount = false,
  maxLength = null,
  helperText = '',
  required = false,
  resize = 'vertical', // none, vertical, horizontal, both
  className = '',
  textareaClassName = '',
  labelClassName = '',
  ...props
}, ref) => {
  const textareaRef = useRef(null);
  const [internalValue, setInternalValue] = useState(defaultValue || '');

  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;
  const charCount = useCharacterCount(currentValue, maxLength || Infinity);

  // Merge refs
  const mergedRef = useCallback((node) => {
    textareaRef.current = node;
    if (typeof ref === 'function') {
      ref(node);
    } else if (ref) {
      ref.current = node;
    }
  }, [ref]);

  // Auto resize
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const textarea = textareaRef.current;
      textarea.style.height = 'auto';

      const lineHeight = parseInt(getComputedStyle(textarea).lineHeight);
      const minHeight = minRows * lineHeight;
      const maxHeight = maxRows * lineHeight;

      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;
    }
  }, [currentValue, autoResize, minRows, maxRows]);

  const handleChange = useCallback((e) => {
    const newValue = e.target.value;

    if (maxLength && newValue.length > maxLength) {
      return;
    }

    if (!isControlled) {
      setInternalValue(newValue);
    }

    onChange?.(e);
  }, [isControlled, onChange, maxLength]);

  const variantConfig = VARIANT_STYLES[variant] || VARIANT_STYLES.default;
  const sizeConfig = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  const resizeClass = {
    none: 'resize-none',
    vertical: 'resize-y',
    horizontal: 'resize-x',
    both: 'resize',
  };

  return (
    <div className={cn('w-full', className)}>
      {label && (
        <label
          className={cn(
            'block mb-1.5 font-medium text-gray-700 dark:text-gray-300',
            sizeConfig.label,
            required && "after:content-['*'] after:ml-0.5 after:text-red-500",
            labelClassName
          )}
        >
          {label}
        </label>
      )}

      <textarea
        ref={mergedRef}
        value={currentValue}
        onChange={handleChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        rows={rows}
        maxLength={maxLength}
        required={required}
        className={cn(
          'block w-full border outline-none transition-all duration-200 rounded-lg',
          'text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500',
          'px-3 py-2',
          sizeConfig.label,
          variantConfig.base,
          !disabled && !readOnly && variantConfig.hover,
          variantConfig.focus,
          disabled && STATE_STYLES.disabled,
          readOnly && STATE_STYLES.readonly,
          error && STATE_STYLES.error,
          success && STATE_STYLES.success,
          resizeClass[resize] || resizeClass.vertical,
          textareaClassName
        )}
        {...props}
      />

      <div className="flex items-center justify-between mt-1">
        {error ? (
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : helperText ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">{helperText}</p>
        ) : (
          <span />
        )}

        {showCharacterCount && maxLength && (
          <span className={cn(
            'text-xs tabular-nums',
            charCount.isOverLimit && 'text-red-500',
            charCount.isNearLimit && !charCount.isOverLimit && 'text-amber-500',
            !charCount.isNearLimit && !charCount.isOverLimit && 'text-gray-400'
          )}>
            {charCount.count}/{maxLength}
          </span>
        )}
      </div>
    </div>
  );
});

Textarea.displayName = 'Textarea';

// ============================================================================
// SEARCH INPUT COMPONENT
// ============================================================================

export const SearchInput = forwardRef(({
  placeholder = 'Search...',
  onSearch,
  debounceMs = 300,
  loading = false,
  showShortcut = true,
  shortcutKey = 'K',
  ...props
}, ref) => {
  const [localValue, setLocalValue] = useState('');
  const debounceRef = useRef(null);

  // Handle search with debounce
  const handleChange = useCallback((e) => {
    const newValue = e.target.value;
    setLocalValue(newValue);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      onSearch?.(newValue);
    }, debounceMs);
  }, [onSearch, debounceMs]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === shortcutKey.toLowerCase()) {
        e.preventDefault();
        ref?.current?.focus?.();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcutKey, ref]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <Input
      ref={ref}
      type="search"
      value={localValue}
      onChange={handleChange}
      placeholder={placeholder}
      leftIcon={Icons.search}
      clearable
      loading={loading}
      suffix={showShortcut && (
        <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-xs font-mono bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
          <span className="text-[10px]">⌘</span>{shortcutKey}
        </kbd>
      )}
      onClear={() => {
        setLocalValue('');
        onSearch?.('');
      }}
      {...props}
    />
  );
});

SearchInput.displayName = 'SearchInput';

// ============================================================================
// PASSWORD INPUT COMPONENT
// ============================================================================

export const PasswordInput = forwardRef(({
  label = 'Password',
  placeholder = 'Enter your password',
  showStrengthMeter = false,
  strengthLabels = ['Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'],
  ...props
}, ref) => {
  const [strength, setStrength] = useState(0);

  // Calculate password strength
  const calculateStrength = useCallback((password) => {
    if (!password) return 0;

    let score = 0;

    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character diversity
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    return Math.min(Math.floor(score / 1.5), 4);
  }, []);

  const handleChange = useCallback((e) => {
    if (showStrengthMeter) {
      setStrength(calculateStrength(e.target.value));
    }
    props.onChange?.(e);
  }, [showStrengthMeter, calculateStrength, props.onChange]);

  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-lime-500',
    'bg-emerald-500',
  ];

  return (
    <div className="w-full">
      <Input
        ref={ref}
        type="password"
        label={label}
        placeholder={placeholder}
        leftIcon={Icons.lock}
        {...props}
        onChange={handleChange}
      />

      {showStrengthMeter && (
        <div className="mt-2">
          <div className="flex gap-1 mb-1">
            {[0, 1, 2, 3, 4].map((level) => (
              <div
                key={level}
                className={cn(
                  'h-1 flex-1 rounded-full transition-colors',
                  level <= strength ? strengthColors[strength] : 'bg-gray-200 dark:bg-gray-700'
                )}
              />
            ))}
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Strength: <span className="font-medium">{strengthLabels[strength]}</span>
          </p>
        </div>
      )}
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';

// ============================================================================
// OTP INPUT COMPONENT
// ============================================================================

export const OTPInput = forwardRef(({
  length = 6,
  value = '',
  onChange,
  onComplete,
  autoFocus = true,
  disabled = false,
  error = null,
  size = 'md',
  separator = null,
  separatorAfter = 3,
  mask = false,
  className = '',
  ...props
}, ref) => {
  const inputRefs = useRef([]);
  const [localValues, setLocalValues] = useState(Array(length).fill(''));

  // Sync with controlled value
  useEffect(() => {
    if (value) {
      setLocalValues(value.split('').slice(0, length).concat(Array(Math.max(0, length - value.length)).fill('')));
    }
  }, [value, length]);

  // Auto focus first input
  useEffect(() => {
    if (autoFocus && inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, [autoFocus]);

  const focusInput = (index) => {
    if (inputRefs.current[index]) {
      inputRefs.current[index].focus();
      inputRefs.current[index].select();
    }
  };

  const handleChange = (index, e) => {
    const inputValue = e.target.value;

    // Handle paste
    if (inputValue.length > 1) {
      const pastedValue = inputValue.slice(0, length - index);
      const newValues = [...localValues];

      for (let i = 0; i < pastedValue.length; i++) {
        if (/^\d$/.test(pastedValue[i])) {
          newValues[index + i] = pastedValue[i];
        }
      }

      setLocalValues(newValues);
      onChange?.(newValues.join(''));

      const nextIndex = Math.min(index + pastedValue.length, length - 1);
      focusInput(nextIndex);

      if (newValues.join('').length === length) {
        onComplete?.(newValues.join(''));
      }
      return;
    }

    // Handle single character
    if (/^\d$/.test(inputValue) || inputValue === '') {
      const newValues = [...localValues];
      newValues[index] = inputValue;
      setLocalValues(newValues);
      onChange?.(newValues.join(''));

      if (inputValue && index < length - 1) {
        focusInput(index + 1);
      }

      if (newValues.join('').length === length) {
        onComplete?.(newValues.join(''));
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (!localValues[index] && index > 0) {
        focusInput(index - 1);
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      focusInput(index - 1);
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      focusInput(index + 1);
    }
  };

  const sizeStyles = {
    sm: 'w-8 h-10 text-lg',
    md: 'w-10 h-12 text-xl',
    lg: 'w-12 h-14 text-2xl',
  };

  return (
    <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
      {localValues.map((digit, index) => (
        <div key={index} className="flex items-center gap-2">
          <input
            ref={(el) => (inputRefs.current[index] = el)}
            type={mask ? 'password' : 'text'}
            inputMode="numeric"
            maxLength={length}
            value={digit}
            onChange={(e) => handleChange(index, e)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            disabled={disabled}
            className={cn(
              'text-center font-mono font-bold border-2 rounded-lg outline-none transition-all',
              'text-gray-900 dark:text-white bg-white dark:bg-gray-800',
              'border-gray-300 dark:border-gray-600',
              'focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20',
              disabled && 'bg-gray-100 dark:bg-gray-700 cursor-not-allowed',
              error && 'border-red-500',
              sizeStyles[size] || sizeStyles.md
            )}
          />

          {separator && (index + 1) % separatorAfter === 0 && index < length - 1 && (
            <span className="text-gray-400 dark:text-gray-500">{separator}</span>
          )}
        </div>
      ))}
    </div>
  );
});

OTPInput.displayName = 'OTPInput';

// ============================================================================
// INPUT GROUP COMPONENT
// ============================================================================

export const InputGroup = forwardRef(({
  children,
  attached = true,
  vertical = false,
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex',
        vertical ? 'flex-col' : 'flex-row',
        attached && !vertical && '[&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:not(:first-child)]:border-l-0',
        attached && vertical && '[&>*:first-child]:rounded-b-none [&>*:last-child]:rounded-t-none [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:not(:first-child)]:border-t-0',
        !attached && (vertical ? 'gap-2' : 'gap-2'),
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

InputGroup.displayName = 'InputGroup';

// ============================================================================
// INPUT ADDON COMPONENT
// ============================================================================

export const InputAddon = forwardRef(({
  children,
  position = 'left', // left, right
  className = '',
  ...props
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'flex items-center px-3 border bg-gray-50 dark:bg-gray-800',
        'text-gray-500 dark:text-gray-400 text-sm font-medium',
        'border-gray-300 dark:border-gray-600',
        position === 'left' ? 'rounded-l-lg border-r-0' : 'rounded-r-lg border-l-0',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

InputAddon.displayName = 'InputAddon';

// ============================================================================
// EXPORTS
// ============================================================================

export default Input;