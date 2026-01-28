import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { cn, formatCurrency } from '../../utils/helpers';
import { notesService } from '../../services/notesService';
import NoteCard from '../notes/NoteCard';
import { SkeletonCard } from '../common/Loader';
import Badge from '../common/Badge';
import StarRating from '../common/StarRating';

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  arrowRight: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  star: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  fire: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.83 2.19a1 1 0 00-1.66 0A17.91 17.91 0 004 14a8 8 0 1016 0 17.91 17.91 0 00-7.17-11.81zM12 20a6 6 0 01-6-6c0-3.19 2.05-6.72 6-10.42 3.95 3.7 6 7.23 6 10.42a6 6 0 01-6 6z" />
    </svg>
  ),
  sparkles: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
    </svg>
  ),
  filter: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
    </svg>
  ),
  grid: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  list: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  ),
  chevronLeft: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  ),
  chevronRight: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  cart: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
};

// ============================================================================
// CATEGORY CONFIGURATIONS
// ============================================================================

const CATEGORIES = [
  { id: 'all', label: 'All Notes', icon: Icons.grid },
  { id: 'UPSC', label: 'UPSC', color: '#6366f1' },
  { id: 'SSC', label: 'SSC', color: '#10b981' },
  { id: 'BANKING', label: 'Banking', color: '#f59e0b' },
  { id: 'STATE_PCS', label: 'State PCS', color: '#8b5cf6' },
  { id: 'RAILWAY', label: 'Railway', color: '#ef4444' },
  { id: 'DEFENCE', label: 'Defence', color: '#0ea5e9' },
  { id: 'TEACHING', label: 'Teaching', color: '#ec4899' },
];

// ============================================================================
// FEATURED NOTE CARD (Enhanced)
// ============================================================================

const FeaturedNoteCard = ({ note, index, variant = 'default' }) => {
  const cardRef = useRef(null);
  const isInView = useInView(cardRef, { once: true, margin: '-50px' });
  const categoryColor = CATEGORIES.find(c => c.id === note.category)?.color || '#6366f1';

  const isFeatured = index === 0;

  if (variant === 'hero' && isFeatured) {
    return (
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5 }}
        className="relative col-span-2 row-span-2 group"
      >
        <div className="relative h-full bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl overflow-hidden">
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0" style={{ backgroundColor: categoryColor }} />
          </div>

          {/* Content */}
          <div className="relative h-full p-8 flex flex-col justify-between">
            {/* Top badges */}
            <div className="flex items-start justify-between">
              <Badge variant="premium" type="solid" size="md">
                {Icons.fire}
                <span>Best Seller</span>
              </Badge>
              <Badge
                variant="default"
                type="soft"
                style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
              >
                {note.category}
              </Badge>
            </div>

            {/* Main content */}
            <div className="mt-auto">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-3">
                {note.title}
              </h3>
              <p className="text-gray-400 mb-4 line-clamp-2">
                {note.description || 'Premium study material from top coaching institute'}
              </p>

              <div className="flex items-center gap-4 mb-6">
                <StarRating rating={note.rating || 4.5} size="sm" showValue />
                <span className="text-gray-400">•</span>
                <span className="text-gray-400">{note.pageCount} pages</span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <span className="text-3xl font-bold text-white">
                    {formatCurrency(note.pageCount * note.pricePerPage)}
                  </span>
                  {note.originalPrice && (
                    <span className="ml-2 text-gray-500 line-through">
                      {formatCurrency(note.originalPrice)}
                    </span>
                  )}
                </div>
                <Link
                  to={`/notes/${note.slug}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/30"
                >
                  View Details
                  {Icons.arrowRight}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Default card
  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      whileHover={{ y: -8 }}
      className="group"
    >
      <Link
        to={`/notes/${note.slug}`}
        className="block bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all border border-gray-100 dark:border-gray-700"
      >
        {/* Image/Icon area */}
        <div
          className="relative h-40 flex items-center justify-center"
          style={{ backgroundColor: `${categoryColor}10` }}
        >
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className="w-16 h-16 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `${categoryColor}20`, color: categoryColor }}
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </motion.div>

          {/* Discount badge */}
          {note.discount && (
            <Badge
              variant="danger"
              type="solid"
              className="absolute top-3 right-3"
            >
              {note.discount}% OFF
            </Badge>
          )}

          {/* Quick add button */}
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 w-10 h-10 rounded-full bg-amber-500 text-black flex items-center justify-center shadow-lg transition-opacity"
            onClick={(e) => {
              e.preventDefault();
              // Add to cart logic
            }}
          >
            {Icons.cart}
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-4">
          <Badge
            variant="default"
            type="soft"
            size="sm"
            className="mb-2"
            style={{ backgroundColor: `${categoryColor}15`, color: categoryColor }}
          >
            {note.category}
          </Badge>

          <h4 className="font-semibold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {note.title}
          </h4>

          <div className="flex items-center gap-2 mb-3">
            <StarRating rating={note.rating || 4.5} size="xs" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({note.reviewCount || 0})
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-lg font-bold text-gray-900 dark:text-white">
                {formatCurrency(note.pageCount * note.pricePerPage)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                • {note.pageCount} pages
              </span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

// ============================================================================
// CATEGORY FILTER TABS
// ============================================================================

const CategoryTabs = ({ activeCategory, onCategoryChange, className = '' }) => {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className={cn('relative', className)}>
      {/* Scroll buttons */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors md:hidden"
      >
        {Icons.chevronLeft}
      </button>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto scrollbar-hide px-8 md:px-0 md:justify-center"
      >
        {CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategoryChange(category.id)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all',
              activeCategory === category.id
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <button
        onClick={() => scroll('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-8 h-8 bg-white dark:bg-gray-800 rounded-full shadow-lg flex items-center justify-center text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors md:hidden"
      >
        {Icons.chevronRight}
      </button>
    </div>
  );
};

// ============================================================================
// MAIN FEATURED NOTES COMPONENT
// ============================================================================

export default function FeaturedNotes({
  title = 'Featured Notes',
  subtitle = 'Popular study materials from top institutes',
  showFilters = true,
  showViewAll = true,
  variant = 'grid', // grid, hero, carousel
  limit = 8,
  className = '',
  ...props
}) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

  // Fetch notes
  useEffect(() => {
    async function fetchNotes() {
      try {
        setLoading(true);
        const response = await notesService.getFeatured();
        setNotes(response.data || []);
      } catch (err) {
        console.error('Failed to fetch featured notes:', err);
        setError('Failed to load notes');
      } finally {
        setLoading(false);
      }
    }
    fetchNotes();
  }, []);

  // Filter notes by category
  const filteredNotes = useMemo(() => {
    if (activeCategory === 'all') return notes;
    return notes.filter(note => note.category === activeCategory);
  }, [notes, activeCategory]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        'py-16 lg:py-24 bg-white dark:bg-gray-900',
        className
      )}
      {...props}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
        >
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-amber-500">{Icons.sparkles}</span>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400 uppercase tracking-wide">
                Featured Collection
              </span>
            </div>
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
              {title}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              {subtitle}
            </p>
          </div>

          {showViewAll && (
            <Link
              to="/notes"
              className="hidden md:inline-flex items-center gap-2 text-amber-600 dark:text-amber-400 font-medium hover:text-amber-700 dark:hover:text-amber-300 transition-colors"
            >
              View All Notes
              {Icons.arrowRight}
            </Link>
          )}
        </motion.div>

        {/* Category filters */}
        {showFilters && (
          <CategoryTabs
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            className="mb-8"
          />
        )}

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(limit)].map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-amber-500 text-black rounded-lg font-medium hover:bg-amber-400 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Notes grid */}
        {!loading && !error && (
          <>
            {variant === 'hero' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 auto-rows-fr">
                {filteredNotes.slice(0, limit).map((note, index) => (
                  <FeaturedNoteCard
                    key={note.id}
                    note={note}
                    index={index}
                    variant={index === 0 ? 'hero' : 'default'}
                  />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredNotes.slice(0, limit).map((note, index) => (
                    <FeaturedNoteCard
                      key={note.id}
                      note={note}
                      index={index}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Empty state */}
            {filteredNotes.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 dark:text-gray-400">
                  No notes found in this category.
                </p>
              </div>
            )}
          </>
        )}

        {/* Mobile View All */}
        {showViewAll && (
          <div className="md:hidden mt-8 text-center">
            <Link
              to="/notes"
              className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-black font-semibold rounded-xl hover:bg-amber-400 transition-colors"
            >
              View All Notes
              {Icons.arrowRight}
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { FeaturedNoteCard, CategoryTabs };