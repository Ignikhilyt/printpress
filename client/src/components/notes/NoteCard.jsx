import { useState, useCallback, useRef, forwardRef, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { cn, formatCurrency } from '../../utils/helpers';
import { NOTE_CATEGORIES } from '../../utils/constants';
import { useCartStore } from '../../store/cartStore';
import { useWishlist } from '../../context/WishlistContext';
import StarRating from '../common/StarRating';
import Badge from '../common/Badge';

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  document: (
    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  building: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  pages: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  ),
  heart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  heartFilled: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
  cart: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
    </svg>
  ),
  eye: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  star: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  fire: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.83 2.19a1 1 0 00-1.66 0A17.91 17.91 0 004 14a8 8 0 1016 0 17.91 17.91 0 00-7.17-11.81z" />
    </svg>
  ),
  share: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
};

// ============================================================================
// CATEGORY COLOR MAP
// ============================================================================

const CATEGORY_COLORS = {
  UPSC: { bg: '#6366f1', light: '#eef2ff' },
  SSC: { bg: '#10b981', light: '#d1fae5' },
  BANKING: { bg: '#f59e0b', light: '#fef3c7' },
  STATE_PCS: { bg: '#8b5cf6', light: '#ede9fe' },
  RAILWAY: { bg: '#ef4444', light: '#fee2e2' },
  DEFENCE: { bg: '#0ea5e9', light: '#e0f2fe' },
  TEACHING: { bg: '#ec4899', light: '#fce7f3' },
  OTHER: { bg: '#64748b', light: '#f1f5f9' },
};

// ============================================================================
// QUICK ACTION BUTTON
// ============================================================================

const QuickAction = ({ icon, label, onClick, isActive = false, activeColor = 'red', className = '' }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.95 }}
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onClick?.();
    }}
    className={cn(
      'p-2 rounded-lg backdrop-blur-sm transition-colors',
      isActive
        ? `bg-${activeColor}-500 text-white`
        : 'bg-white/80 dark:bg-gray-800/80 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700',
      className
    )}
    title={label}
  >
    {icon}
  </motion.button>
);

// ============================================================================
// MAIN NOTE CARD COMPONENT
// ============================================================================

const NoteCard = forwardRef(({
  note,
  variant = 'default', // default, compact, horizontal, detailed, mini
  showActions = true,
  showRating = true,
  showInstitute = true,
  animated = true,
  index = 0,
  className = '',
  onQuickView,
  onAddToCart,
  ...props
}, ref) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  const [isHovered, setIsHovered] = useState(false);
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const navigate = useNavigate();

  const addItem = useCartStore((state) => state.addItem);
  const { isInWishlist, addItem: addToWishlist, removeItem: removeFromWishlist } = useWishlist();

  // Get category info
  const category = NOTE_CATEGORIES?.find((c) => c.id === note.category) || { name: note.category };
  const categoryColor = CATEGORY_COLORS[note.category] || CATEGORY_COLORS.OTHER;
  const estimatedPrice = note.pageCount * note.pricePerPage;
  const inWishlist = isInWishlist?.(note.id);

  // Handle wishlist toggle
  const toggleWishlist = useCallback(() => {
    if (inWishlist) {
      removeFromWishlist?.(note.id);
    } else {
      addToWishlist?.({ ...note, id: note.id });
    }
  }, [inWishlist, note, addToWishlist, removeFromWishlist]);

  // Handle add to cart
  const handleAddToCart = useCallback(() => {
    addItem?.({ ...note, quantity: 1 });
    setIsAddedToCart(true);
    onAddToCart?.(note);
    setTimeout(() => setIsAddedToCart(false), 2000);
  }, [note, addItem, onAddToCart]);

  // Handle quick view
  const handleQuickView = useCallback(() => {
    onQuickView?.(note);
  }, [note, onQuickView]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { delay: index * 0.1, duration: 0.4 }
    },
  };

  // Compact variant
  if (variant === 'compact') {
    return (
      <motion.div
        ref={ref}
        variants={animated ? containerVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated && isInView ? 'visible' : undefined}
        className={cn('group', className)}
      >
        <Link
          to={`/notes/${note.slug}`}
          className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
        >
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: categoryColor.light, color: categoryColor.bg }}
          >
            {Icons.document}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate group-hover:text-amber-600 transition-colors">
              {note.title}
            </h4>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{note.pageCount} pages</span>
              <span>•</span>
              <span className="font-medium text-amber-600">{formatCurrency(estimatedPrice)}</span>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Horizontal variant
  if (variant === 'horizontal') {
    return (
      <motion.div
        ref={ref}
        variants={animated ? containerVariants : undefined}
        initial={animated ? 'hidden' : undefined}
        animate={animated && isInView ? 'visible' : undefined}
        className={cn('group', className)}
      >
        <Link
          to={`/notes/${note.slug}`}
          className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
        >
          {/* Image */}
          <div
            className="w-full sm:w-40 h-32 rounded-lg flex items-center justify-center flex-shrink-0 relative"
            style={{ backgroundColor: categoryColor.light }}
          >
            <span style={{ color: categoryColor.bg }}>{Icons.document}</span>
            {note.isFeatured && (
              <Badge variant="warning" type="solid" size="sm" className="absolute top-2 left-2">
                {Icons.fire} Featured
              </Badge>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 flex flex-col">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <Badge
                  type="soft"
                  size="sm"
                  style={{ backgroundColor: `${categoryColor.bg}15`, color: categoryColor.bg }}
                >
                  {category.name}
                </Badge>
              </div>
              {showRating && (
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-amber-500">{Icons.star}</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    {note.rating?.toFixed(1) || '4.5'}
                  </span>
                </div>
              )}
            </div>

            <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
              {note.title}
            </h3>

            {showInstitute && note.institute?.name && (
              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
                {Icons.building}
                <span className="truncate">{note.institute.name}</span>
              </div>
            )}

            <div className="mt-auto flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {note.pageCount} pages
                </p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">
                  {formatCurrency(estimatedPrice)}
                </p>
              </div>
              {showActions && (
                <div className="flex items-center gap-2">
                  <QuickAction
                    icon={inWishlist ? Icons.heartFilled : Icons.heart}
                    label={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                    onClick={toggleWishlist}
                    isActive={inWishlist}
                    className={inWishlist ? 'bg-red-500 text-white' : ''}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart();
                    }}
                    className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-medium text-sm transition-colors flex items-center gap-2"
                  >
                    {isAddedToCart ? Icons.check : Icons.cart}
                    <span>{isAddedToCart ? 'Added!' : 'Add to Cart'}</span>
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  // Mini variant
  if (variant === 'mini') {
    return (
      <Link
        to={`/notes/${note.slug}`}
        className={cn(
          'block p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors',
          className
        )}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: categoryColor.light, color: categoryColor.bg }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {note.title}
            </p>
            <p className="text-xs text-gray-500">{formatCurrency(estimatedPrice)}</p>
          </div>
        </div>
      </Link>
    );
  }

  // Default variant
  return (
    <motion.div
      ref={cardRef}
      variants={animated ? containerVariants : undefined}
      initial={animated ? 'hidden' : undefined}
      animate={animated && isInView ? 'visible' : undefined}
      whileHover={{ y: -8 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={cn('group', className)}
      {...props}
    >
      <Link
        to={`/notes/${note.slug}`}
        className="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300"
      >
        {/* Thumbnail */}
        <div
          className="relative aspect-[4/3] flex items-center justify-center overflow-hidden"
          style={{ backgroundColor: categoryColor.light }}
        >
          <motion.span
            animate={isHovered ? { scale: 1.1, rotate: 5 } : { scale: 1, rotate: 0 }}
            style={{ color: categoryColor.bg }}
          >
            {Icons.document}
          </motion.span>

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-1">
            {note.isFeatured && (
              <Badge variant="warning" type="solid" size="sm" className="shadow-md">
                {Icons.fire} Featured
              </Badge>
            )}
            {note.discount && (
              <Badge variant="danger" type="solid" size="sm" className="shadow-md">
                {note.discount}% OFF
              </Badge>
            )}
          </div>

          {/* Quick actions */}
          {showActions && (
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="absolute top-3 right-3 flex flex-col gap-2"
                >
                  <QuickAction
                    icon={inWishlist ? Icons.heartFilled : Icons.heart}
                    label="Add to wishlist"
                    onClick={toggleWishlist}
                    className={inWishlist ? 'bg-red-500 text-white' : ''}
                  />
                  {onQuickView && (
                    <QuickAction
                      icon={Icons.eye}
                      label="Quick view"
                      onClick={handleQuickView}
                    />
                  )}
                  <QuickAction
                    icon={Icons.share}
                    label="Share"
                    onClick={() => {
                      navigator.share?.({
                        title: note.title,
                        url: `/notes/${note.slug}`,
                      });
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          )}

          {/* Add to cart button */}
          {showActions && (
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute bottom-3 left-3 right-3"
                >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={(e) => {
                      e.preventDefault();
                      handleAddToCart();
                    }}
                    className={cn(
                      'w-full py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2',
                      isAddedToCart
                        ? 'bg-emerald-500 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-black'
                    )}
                  >
                    {isAddedToCart ? Icons.check : Icons.cart}
                    <span>{isAddedToCart ? 'Added to Cart!' : 'Add to Cart'}</span>
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category */}
          <Badge
            type="soft"
            size="sm"
            className="mb-2"
            style={{ backgroundColor: `${categoryColor.bg}15`, color: categoryColor.bg }}
          >
            {category.name}
          </Badge>

          {/* Title */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-amber-600 transition-colors">
            {note.title}
          </h3>

          {/* Institute */}
          {showInstitute && note.institute?.name && (
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-3">
              {Icons.building}
              <span className="truncate">{note.institute.name}</span>
            </div>
          )}

          {/* Rating */}
          {showRating && (
            <div className="flex items-center gap-2 mb-3">
              <StarRating rating={note.rating || 4.5} size="xs" />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                ({note.reviewCount || 0})
              </span>
            </div>
          )}

          {/* Details */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              {Icons.pages}
              <span>{note.pageCount} pages</span>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(estimatedPrice)}
              </p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
});

NoteCard.displayName = 'NoteCard';

export default NoteCard;

// ============================================================================
// NOTE CARD SKELETON
// ============================================================================

export const NoteCardSkeleton = ({ variant = 'default', className = '' }) => {
  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-gray-800 animate-pulse', className)}>
        <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2" />
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white dark:bg-gray-800 rounded-xl overflow-hidden animate-pulse', className)}>
      <div className="aspect-[4/3] bg-gray-200 dark:bg-gray-700" />
      <div className="p-4">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-3" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-4" />
        <div className="flex justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export { QuickAction };