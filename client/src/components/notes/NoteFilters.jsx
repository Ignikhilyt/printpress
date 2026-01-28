import { useState } from 'react';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { NOTE_CATEGORIES } from '../../utils/constants';

export default function NoteFilters({ filters, onFilterChange, institutes, subjects }) {
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const handleChange = (key, value) => {
    onFilterChange({ ...filters, [key]: value, page: 1 });
  };

  const clearFilters = () => {
    onFilterChange({ page: 1, limit: 12 });
  };

  const hasActiveFilters = filters.category || filters.institute || filters.subject || filters.search;

  const FilterContent = () => (
    <>
      {/* Search */}
      <div className="relative">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search notes..."
          value={filters.search || ''}
          onChange={(e) => handleChange('search', e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Category */}
      <div>
        <label className="label">Category</label>
        <select
          value={filters.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="input"
        >
          <option value="">All Categories</option>
          {NOTE_CATEGORIES.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {/* Institute */}
      <div>
        <label className="label">Institute</label>
        <select
          value={filters.institute || ''}
          onChange={(e) => handleChange('institute', e.target.value)}
          className="input"
        >
          <option value="">All Institutes</option>
          {institutes.map((inst) => (
            <option key={inst.id} value={inst.id}>
              {inst.name}
            </option>
          ))}
        </select>
      </div>

      {/* Subject */}
      <div>
        <label className="label">Subject</label>
        <select
          value={filters.subject || ''}
          onChange={(e) => handleChange('subject', e.target.value)}
          className="input"
        >
          <option value="">All Subjects</option>
          {subjects.map((sub) => (
            <option key={sub} value={sub}>
              {sub}
            </option>
          ))}
        </select>
      </div>

      {/* Sort */}
      <div>
        <label className="label">Sort By</label>
        <select
          value={filters.sort || 'latest'}
          onChange={(e) => handleChange('sort', e.target.value)}
          className="input"
        >
          <option value="latest">Latest</option>
          <option value="popular">Popular</option>
          <option value="price_low">Price: Low to High</option>
          <option value="price_high">Price: High to Low</option>
          <option value="pages">Page Count</option>
        </select>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="btn-secondary w-full"
        >
          Clear Filters
        </button>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Filters */}
      <div className="hidden lg:block w-64 flex-shrink-0">
        <div className="sticky top-24 card p-4 space-y-4">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <FunnelIcon className="w-5 h-5" />
            Filters
          </h3>
          <FilterContent />
        </div>
      </div>

      {/* Mobile Filter Button */}
      <div className="lg:hidden mb-4">
        <button
          onClick={() => setShowMobileFilters(true)}
          className="btn-secondary w-full flex items-center justify-center gap-2"
        >
          <FunnelIcon className="w-5 h-5" />
          Filters
          {hasActiveFilters && (
            <span className="bg-primary-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
              !
            </span>
          )}
        </button>
      </div>

      {/* Mobile Filter Panel */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowMobileFilters(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-full max-w-sm bg-white p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold text-lg">Filters</h3>
              <button onClick={() => setShowMobileFilters(false)}>
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <FilterContent />
            </div>
          </div>
        </div>
      )}
    </>
  );
}