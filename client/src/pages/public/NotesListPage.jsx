/**
 * Notes List Page
 * Browse and filter study notes with advanced features including
 * grid/list view toggle, advanced filters, and animations.
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon,
  ListBulletIcon,
  FunnelIcon,
  XMarkIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { notesService } from '../../services/notesService';
import { adminService } from '../../services/adminService';
import NoteCard, { NoteCardSkeleton } from '../../components/notes/NoteCard';
import Pagination from '../../components/common/Pagination';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { cn } from '../../utils/helpers';
import { NOTE_CATEGORIES } from '../../utils/constants';

// ============================================================================
// CONSTANTS
// ============================================================================

const SORT_OPTIONS = [
  { value: 'latest', label: 'Latest First', icon: '🕐' },
  { value: 'oldest', label: 'Oldest First', icon: '📅' },
  { value: 'price_low', label: 'Price: Low to High', icon: '💰' },
  { value: 'price_high', label: 'Price: High to Low', icon: '💎' },
  { value: 'popular', label: 'Most Popular', icon: '🔥' },
  { value: 'rating', label: 'Highest Rated', icon: '⭐' },
];

const VIEW_MODES = {
  GRID: 'grid',
  LIST: 'list',
};

// ============================================================================
// FILTER SIDEBAR
// ============================================================================

const FilterSidebar = ({
  filters,
  onFilterChange,
  institutes = [],
  subjects = [],
  isOpen,
  onClose,
  className = '',
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

  const handleChange = (key, value) => {
    const updated = { ...localFilters, [key]: value, page: 1 };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const clearFilters = () => {
    const cleared = { page: 1, limit: 12, sort: 'latest' };
    setLocalFilters(cleared);
    onFilterChange(cleared);
  };

  const hasActiveFilters = filters.category || filters.institute || filters.subject;

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={isOpen ? { x: 0 } : { x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-50 lg:z-0',
          'w-72 lg:w-64 bg-white dark:bg-gray-900 lg:bg-transparent',
          'lg:translate-x-0 lg:block',
          'border-r border-gray-200 dark:border-gray-700 lg:border-0',
          className
        )}
      >
        <div className="h-full overflow-y-auto p-4 lg:p-0">
          {/* Mobile header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Filters</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              <XMarkIcon className="w-5 h-5" />
            </button>
          </div>

          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-600 mb-4"
            >
              <XMarkIcon className="w-4 h-4" />
              Clear all filters
            </button>
          )}

          {/* Categories */}
          <FilterSection title="Category">
            <div className="space-y-2">
              {NOTE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleChange('category', filters.category === cat.id ? '' : cat.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                    filters.category === cat.id
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <span className="text-lg">{cat.icon}</span>
                  <span>{cat.name}</span>
                  {filters.category === cat.id && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
              ))}
            </div>
          </FilterSection>

          {/* Institutes */}
          {institutes.length > 0 && (
            <FilterSection title="Institute">
              <select
                value={filters.institute || ''}
                onChange={(e) => handleChange('institute', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Institutes</option>
                {institutes.map((inst) => (
                  <option key={inst.id} value={inst.id}>
                    {inst.name}
                  </option>
                ))}
              </select>
            </FilterSection>
          )}

          {/* Subjects */}
          {subjects.length > 0 && (
            <FilterSection title="Subject">
              <select
                value={filters.subject || ''}
                onChange={(e) => handleChange('subject', e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                <option value="">All Subjects</option>
                {subjects.map((sub) => (
                  <option key={sub} value={sub}>
                    {sub}
                  </option>
                ))}
              </select>
            </FilterSection>
          )}

          {/* Featured Only */}
          <FilterSection title="Filter">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featured === 'true'}
                onChange={(e) => handleChange('featured', e.target.checked ? 'true' : '')}
                className="w-5 h-5 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 flex items-center gap-2">
                <SparklesIcon className="w-4 h-4 text-amber-500" />
                Featured Only
              </span>
            </label>
          </FilterSection>
        </div>
      </motion.aside>
    </>
  );
};

const FilterSection = ({ title, children }) => (
  <div className="mb-6">
    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{title}</h4>
    {children}
  </div>
);

// ============================================================================
// SEARCH BAR
// ============================================================================

const SearchBar = ({ value, onChange, className = '' }) => {
  const [query, setQuery] = useState(value || '');
  const timeoutRef = useRef(null);

  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    setQuery(newValue);

    // Debounce search
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  return (
    <div className={cn('relative', className)}>
      <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={handleChange}
        placeholder="Search notes..."
        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
      />
      {query && (
        <button
          onClick={() => {
            setQuery('');
            onChange('');
          }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <XMarkIcon className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  );
};

// ============================================================================
// SORT DROPDOWN
// ============================================================================

const SortDropdown = ({ value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const selected = SORT_OPTIONS.find((opt) => opt.value === value) || SORT_OPTIONS[0];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <span>{selected.icon}</span>
        <span className="hidden sm:inline">{selected.label}</span>
        <ChevronDownIcon className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden"
            >
              {SORT_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors',
                    option.value === value
                      ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  )}
                >
                  <span>{option.icon}</span>
                  <span>{option.label}</span>
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// VIEW TOGGLE
// ============================================================================

const ViewToggle = ({ value, onChange }) => (
  <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-1">
    <button
      onClick={() => onChange(VIEW_MODES.GRID)}
      className={cn(
        'p-2 rounded-lg transition-colors',
        value === VIEW_MODES.GRID
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
      title="Grid view"
    >
      <Squares2X2Icon className="w-5 h-5" />
    </button>
    <button
      onClick={() => onChange(VIEW_MODES.LIST)}
      className={cn(
        'p-2 rounded-lg transition-colors',
        value === VIEW_MODES.LIST
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
          : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'
      )}
      title="List view"
    >
      <ListBulletIcon className="w-5 h-5" />
    </button>
  </div>
);

// ============================================================================
// ACTIVE FILTERS
// ============================================================================

const ActiveFilters = ({ filters, onRemove }) => {
  const activeFilters = [];

  if (filters.category) {
    const cat = NOTE_CATEGORIES.find((c) => c.id === filters.category);
    activeFilters.push({ key: 'category', label: cat?.name || filters.category });
  }
  if (filters.search) {
    activeFilters.push({ key: 'search', label: `Search: "${filters.search}"` });
  }
  if (filters.featured === 'true') {
    activeFilters.push({ key: 'featured', label: 'Featured Only' });
  }

  if (activeFilters.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-gray-500">Active filters:</span>
      {activeFilters.map((filter) => (
        <Badge
          key={filter.key}
          type="soft"
          variant="default"
          className="flex items-center gap-1 cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => onRemove(filter.key)}
        >
          {filter.label}
          <XMarkIcon className="w-3 h-3" />
        </Badge>
      ))}
    </div>
  );
};

// ============================================================================
// EMPTY STATE
// ============================================================================

const EmptyState = ({ hasFilters, onClearFilters }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16"
  >
    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <MagnifyingGlassIcon className="w-10 h-10 text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notes found</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
      {hasFilters
        ? 'Try adjusting your filters or search terms to find what you\'re looking for.'
        : 'We don\'t have any notes available at the moment. Check back soon!'}
    </p>
    {hasFilters && (
      <Button variant="outline" className="mt-6" onClick={onClearFilters}>
        Clear all filters
      </Button>
    )}
  </motion.div>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function NotesListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [notes, setNotes] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [institutes, setInstitutes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [viewMode, setViewMode] = useState(VIEW_MODES.GRID);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filters = useMemo(() => ({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 12,
    category: searchParams.get('category') || '',
    institute: searchParams.get('institute') || '',
    subject: searchParams.get('subject') || '',
    search: searchParams.get('search') || '',
    sort: searchParams.get('sort') || 'latest',
    featured: searchParams.get('featured') || '',
  }), [searchParams]);

  const hasActiveFilters = filters.category || filters.institute || filters.subject || filters.search || filters.featured;

  // Fetch filter options
  useEffect(() => {
    Promise.all([
      adminService.getInstitutes({ active: true }),
      notesService.getSubjects(),
    ]).then(([instRes, subRes]) => {
      setInstitutes(instRes.data || []);
      setSubjects(subRes.data || []);
    }).catch(console.error);
  }, []);

  // Fetch notes
  useEffect(() => {
    fetchNotes();
  }, [searchParams]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = {};
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });
      const response = await notesService.getAll(params);
      setNotes(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = useCallback((newFilters) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value && value !== '' && key !== 'limit') {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  }, [setSearchParams]);

  const handleRemoveFilter = (key) => {
    handleFilterChange({ ...filters, [key]: '' });
  };

  const handlePageChange = (page) => {
    handleFilterChange({ ...filters, page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Browse Study Notes
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto mb-8">
              Discover high-quality printed notes from India's top coaching institutes.
              Order and get delivered to your doorstep.
            </p>
            <SearchBar
              value={filters.search}
              onChange={(value) => handleFilterChange({ ...filters, search: value, page: 1 })}
              className="max-w-xl mx-auto"
            />
          </motion.div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar */}
          <FilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            institutes={institutes}
            subjects={subjects}
            isOpen={filtersOpen}
            onClose={() => setFiltersOpen(false)}
            className="hidden lg:block"
          />

          {/* Notes Content */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setFiltersOpen(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-sm font-medium"
                >
                  <FunnelIcon className="w-4 h-4" />
                  Filters
                  {hasActiveFilters && (
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                  )}
                </button>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {loading ? 'Loading...' : `${pagination?.total || 0} notes found`}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <SortDropdown
                  value={filters.sort}
                  onChange={(value) => handleFilterChange({ ...filters, sort: value })}
                />
                <ViewToggle value={viewMode} onChange={setViewMode} />
              </div>
            </div>

            {/* Active Filters */}
            <ActiveFilters filters={filters} onRemove={handleRemoveFilter} />

            {/* Notes Grid/List */}
            {loading ? (
              <div className={cn(
                'grid gap-6',
                viewMode === VIEW_MODES.GRID
                  ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                  : 'grid-cols-1'
              )}>
                {[...Array(6)].map((_, i) => (
                  <NoteCardSkeleton key={i} variant={viewMode === VIEW_MODES.LIST ? 'horizontal' : 'default'} />
                ))}
              </div>
            ) : notes.length === 0 ? (
              <EmptyState
                hasFilters={hasActiveFilters}
                onClearFilters={() => handleFilterChange({ page: 1, limit: 12, sort: 'latest' })}
              />
            ) : (
              <>
                <motion.div
                  layout
                  className={cn(
                    'grid gap-6',
                    viewMode === VIEW_MODES.GRID
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-1'
                  )}
                >
                  <AnimatePresence mode="popLayout">
                    {notes.map((note, index) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        variant={viewMode === VIEW_MODES.LIST ? 'horizontal' : 'default'}
                        index={index}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>

                {/* Pagination */}
                {pagination && pagination.pages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination
                      currentPage={filters.page}
                      totalPages={pagination.pages}
                      onPageChange={handlePageChange}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      <FilterSidebar
        filters={filters}
        onFilterChange={handleFilterChange}
        institutes={institutes}
        subjects={subjects}
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        className="lg:hidden"
      />
    </div>
  );
}