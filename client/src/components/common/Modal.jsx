import { Fragment, useState, useEffect, useCallback, createContext, useContext, useRef } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { motion, AnimatePresence } from 'framer-motion';

// ==================== ICONS ====================

const XMarkIcon = ({ size = 20 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const AlertCircleIcon = ({ size = 48 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const CheckCircleIcon = ({ size = 48 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const AlertTriangleIcon = ({ size = 48 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
    <line x1="12" y1="9" x2="12" y2="13" />
    <line x1="12" y1="17" x2="12.01" y2="17" />
  </svg>
);

const InfoIcon = ({ size = 48 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const TrashIcon = ({ size = 48 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const ChevronLeftIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRightIcon = ({ size = 24 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const MaximizeIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
  </svg>
);

const MinimizeIcon = ({ size = 18 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3" />
  </svg>
);

// ==================== CONSTANTS ====================

const SIZE_CLASSES = {
  xs: 'max-w-xs',
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  '2xl': 'max-w-6xl',
  full: 'max-w-[95vw] max-h-[95vh]',
  fullscreen: 'w-screen h-screen max-w-none',
};

const ANIMATION_VARIANTS = {
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.9 },
  },
  slideUp: {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 50 },
  },
  slideDown: {
    initial: { opacity: 0, y: -50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  },
  slideLeft: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
  },
  slideRight: {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -100 },
  },
  zoom: {
    initial: { opacity: 0, scale: 0.5 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.5 },
  },
};

const ALERT_CONFIG = {
  success: {
    icon: CheckCircleIcon,
    bgColor: '#dcfce7',
    textColor: '#166534',
    borderColor: '#22c55e',
    buttonColor: '#22c55e',
  },
  error: {
    icon: AlertCircleIcon,
    bgColor: '#fee2e2',
    textColor: '#991b1b',
    borderColor: '#ef4444',
    buttonColor: '#ef4444',
  },
  warning: {
    icon: AlertTriangleIcon,
    bgColor: '#fef3c7',
    textColor: '#92400e',
    borderColor: '#f59e0b',
    buttonColor: '#f59e0b',
  },
  info: {
    icon: InfoIcon,
    bgColor: '#dbeafe',
    textColor: '#1e40af',
    borderColor: '#3b82f6',
    buttonColor: '#3b82f6',
  },
  delete: {
    icon: TrashIcon,
    bgColor: '#fee2e2',
    textColor: '#991b1b',
    borderColor: '#ef4444',
    buttonColor: '#ef4444',
  },
};

// ==================== MODAL CONTEXT ====================

const ModalContext = createContext(null);

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('Modal components must be used within a Modal');
  }
  return context;
};

// ==================== SUB-COMPONENTS ====================

// Modal Header Component
export const ModalHeader = ({
  children,
  showClose = true,
  showMaximize = false,
  className = '',
  sticky = false,
}) => {
  const { onClose, isMaximized, toggleMaximize, title } = useModalContext();

  return (
    <div
      className={`flex items-center justify-between gap-4 p-4 sm:p-6 border-b ${sticky ? 'sticky top-0 z-10' : ''} ${className}`}
      style={{
        borderColor: 'var(--border-color, #e2e8f0)',
        background: sticky ? 'var(--bg-card, white)' : 'transparent',
      }}
    >
      <div className="flex-1 min-w-0">
        {children || (
          <h2 className="text-lg sm:text-xl font-semibold truncate" style={{ color: 'var(--text-primary, #0f172a)' }}>
            {title}
          </h2>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {showMaximize && (
          <button
            onClick={toggleMaximize}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text-muted, #94a3b8)' }}
            aria-label={isMaximized ? 'Minimize' : 'Maximize'}
          >
            {isMaximized ? <MinimizeIcon /> : <MaximizeIcon />}
          </button>
        )}
        {showClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors hover:bg-gray-100"
            style={{ color: 'var(--text-muted, #94a3b8)' }}
            aria-label="Close modal"
          >
            <XMarkIcon />
          </button>
        )}
      </div>
    </div>
  );
};

// Modal Body Component
export const ModalBody = ({ children, className = '', padding = true }) => {
  return (
    <div
      className={`flex-1 overflow-y-auto ${padding ? 'p-4 sm:p-6' : ''} ${className}`}
      style={{ color: 'var(--text-secondary, #475569)' }}
    >
      {children}
    </div>
  );
};

// Modal Footer Component
export const ModalFooter = ({
  children,
  className = '',
  sticky = false,
  justify = 'end', // start, center, end, between
}) => {
  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 sm:p-6 border-t ${justifyClasses[justify]} ${sticky ? 'sticky bottom-0' : ''} ${className}`}
      style={{
        borderColor: 'var(--border-color, #e2e8f0)',
        background: sticky ? 'var(--bg-card, white)' : 'transparent',
      }}
    >
      {children}
    </div>
  );
};

// Modal Button Component
export const ModalButton = ({
  children,
  variant = 'primary', // primary, secondary, danger, ghost
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  className = '',
}) => {
  const variants = {
    primary: {
      bg: 'var(--color-primary, #6366f1)',
      hoverBg: 'var(--color-primary-dark, #4f46e5)',
      text: 'white',
    },
    secondary: {
      bg: 'var(--bg-tertiary, #f1f5f9)',
      hoverBg: 'var(--border-color, #e2e8f0)',
      text: 'var(--text-primary, #0f172a)',
    },
    danger: {
      bg: '#ef4444',
      hoverBg: '#dc2626',
      text: 'white',
    },
    ghost: {
      bg: 'transparent',
      hoverBg: 'var(--bg-tertiary, #f1f5f9)',
      text: 'var(--text-secondary, #475569)',
    },
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const style = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      style={{
        background: style.bg,
        color: style.text,
      }}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      )}
      {children}
    </button>
  );
};

// ==================== SPECIALIZED MODALS ====================

// Confirmation Modal
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning', // success, error, warning, info, delete
  loading = false,
}) => {
  const config = ALERT_CONFIG[variant] || ALERT_CONFIG.warning;
  const IconComponent = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" animation="scale">
      <div className="text-center p-6">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: config.bgColor }}
        >
          <IconComponent size={32} style={{ color: config.borderColor }} />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary, #0f172a)' }}>
          {title}
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary, #475569)' }}>
          {message}
        </p>
        <div className="flex items-center justify-center gap-3">
          <ModalButton variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </ModalButton>
          <ModalButton
            variant={variant === 'delete' || variant === 'error' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
          >
            {confirmText}
          </ModalButton>
        </div>
      </div>
    </Modal>
  );
};

// Alert Modal
export const AlertModal = ({
  isOpen,
  onClose,
  title,
  message,
  buttonText = 'OK',
  variant = 'info',
}) => {
  const config = ALERT_CONFIG[variant] || ALERT_CONFIG.info;
  const IconComponent = config.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm" animation="scale">
      <div className="text-center p-6">
        <div
          className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
          style={{ background: config.bgColor }}
        >
          <IconComponent size={32} style={{ color: config.borderColor }} />
        </div>
        <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--text-primary, #0f172a)' }}>
          {title}
        </h3>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary, #475569)' }}>
          {message}
        </p>
        <ModalButton onClick={onClose} fullWidth>
          {buttonText}
        </ModalButton>
      </div>
    </Modal>
  );
};

// Image Gallery Modal
export const ImageGalleryModal = ({
  isOpen,
  onClose,
  images = [],
  initialIndex = 0,
  showThumbnails = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, goNext, goPrev, onClose]);

  // Reset to initial index when modal opens
  useEffect(() => {
    if (isOpen) setCurrentIndex(initialIndex);
  }, [isOpen, initialIndex]);

  if (!images.length) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full" animation="fade" overlay="dark">
      <div className="relative w-full h-full flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/70 to-transparent">
          <span className="text-white text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </span>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <XMarkIcon size={24} />
          </button>
        </div>

        {/* Main Image */}
        <div className="flex-1 flex items-center justify-center p-4 relative">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentIndex}
              src={images[currentIndex]?.src || images[currentIndex]}
              alt={images[currentIndex]?.alt || `Image ${currentIndex + 1}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
          </AnimatePresence>

          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={goPrev}
                className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <ChevronLeftIcon size={24} />
              </button>
              <button
                onClick={goNext}
                className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              >
                <ChevronRightIcon size={24} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {showThumbnails && images.length > 1 && (
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent">
            <div className="flex items-center justify-center gap-2 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${idx === currentIndex ? 'border-white scale-110' : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                >
                  <img
                    src={img?.src || img}
                    alt={img?.alt || `Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Form Modal
export const FormModal = ({
  isOpen,
  onClose,
  onSubmit,
  title,
  children,
  submitText = 'Submit',
  cancelText = 'Cancel',
  loading = false,
  size = 'md',
  validateOnSubmit = true,
}) => {
  const formRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateOnSubmit && formRef.current && !formRef.current.checkValidity()) {
      formRef.current.reportValidity();
      return;
    }
    const formData = new FormData(formRef.current);
    const data = Object.fromEntries(formData.entries());
    onSubmit?.(data, e);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} title={title}>
      <form ref={formRef} onSubmit={handleSubmit}>
        <ModalHeader />
        <ModalBody>{children}</ModalBody>
        <ModalFooter>
          <ModalButton variant="secondary" onClick={onClose} disabled={loading}>
            {cancelText}
          </ModalButton>
          <ModalButton type="submit" loading={loading}>
            {submitText}
          </ModalButton>
        </ModalFooter>
      </form>
    </Modal>
  );
};

// ==================== MAIN MODAL COMPONENT ====================

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  animation = 'scale', // fade, scale, slideUp, slideDown, slideLeft, slideRight, zoom
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showClose = true,
  overlay = 'default', // default, dark, blur
  centered = true,
  scrollBehavior = 'inside', // inside, outside
  initialFocus,
  className = '',
  contentClassName = '',
}) {
  const [isMaximized, setIsMaximized] = useState(false);

  // Handle escape key
  useEffect(() => {
    if (!closeOnEscape || !isOpen) return;
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [closeOnEscape, isOpen, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const toggleMaximize = useCallback(() => {
    setIsMaximized((prev) => !prev);
  }, []);

  const animationConfig = ANIMATION_VARIANTS[animation] || ANIMATION_VARIANTS.scale;
  const sizeClass = isMaximized ? SIZE_CLASSES.fullscreen : (SIZE_CLASSES[size] || SIZE_CLASSES.md);

  const overlayClasses = {
    default: 'bg-black/40',
    dark: 'bg-black/70',
    blur: 'bg-black/30 backdrop-blur-sm',
  };

  const contextValue = {
    onClose,
    isMaximized,
    toggleMaximize,
    title,
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className={`relative z-50 ${className}`}
        onClose={closeOnOverlayClick ? onClose : () => { }}
        initialFocus={initialFocus}
      >
        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className={`fixed inset-0 ${overlayClasses[overlay] || overlayClasses.default}`} />
        </Transition.Child>

        {/* Modal Container */}
        <div className={`fixed inset-0 ${scrollBehavior === 'outside' ? 'overflow-y-auto' : ''}`}>
          <div className={`flex min-h-full ${centered ? 'items-center' : 'items-start pt-10'} justify-center p-4`}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                as={motion.div}
                initial={animationConfig.initial}
                animate={animationConfig.animate}
                exit={animationConfig.exit}
                transition={{ duration: 0.2 }}
                className={`w-full ${sizeClass} transform transition-all ${contentClassName}`}
                style={{
                  background: 'var(--bg-card, white)',
                  borderRadius: isMaximized ? '0' : 'var(--radius-xl, 16px)',
                  boxShadow: 'var(--shadow-xl, 0 25px 50px -12px rgba(0, 0, 0, 0.25))',
                  maxHeight: scrollBehavior === 'inside' ? '90vh' : 'none',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <ModalContext.Provider value={contextValue}>
                  {/* If children are modal sub-components, render them directly */}
                  {typeof children === 'function' ? (
                    children({ onClose, isMaximized, toggleMaximize })
                  ) : (
                    <>
                      {/* Default layout if no sub-components used */}
                      {title && !hasSubComponent(children, 'ModalHeader') && (
                        <ModalHeader showClose={showClose} />
                      )}
                      {!hasSubComponent(children, 'ModalBody') ? (
                        <ModalBody>{children}</ModalBody>
                      ) : (
                        children
                      )}
                    </>
                  )}
                </ModalContext.Provider>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}

// Helper function to check if children contain specific sub-components
function hasSubComponent(children, componentName) {
  let hasComponent = false;
  const checkChildren = (child) => {
    if (child?.type?.name === componentName || child?.type?.displayName === componentName) {
      hasComponent = true;
    }
    if (child?.props?.children) {
      React.Children.forEach(child.props.children, checkChildren);
    }
  };
  React.Children.forEach(children, checkChildren);
  return hasComponent;
}

// Display names for sub-components
ModalHeader.displayName = 'ModalHeader';
ModalBody.displayName = 'ModalBody';
ModalFooter.displayName = 'ModalFooter';
ModalButton.displayName = 'ModalButton';