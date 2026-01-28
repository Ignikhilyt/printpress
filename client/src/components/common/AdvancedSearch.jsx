/**
 * Advanced Search Component
 * Search with suggestions, recent searches, and filters
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    XMarkIcon,
    ClockIcon,
    FireIcon,
    ArrowTrendingUpIcon,
    DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';

const TRENDING_SEARCHES = [
    'UPSC Notes',
    'Indian Polity',
    'Economics',
    'Geography',
    'History',
    'Science & Tech',
];

export default function AdvancedSearch({
    placeholder = 'Search notes, subjects, categories...',
    onSearch,
    className,
}) {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const containerRef = useRef(null);

    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState([]);
    const [recentSearches, setRecentSearches] = useState([]);
    const [loading, setLoading] = useState(false);

    // Load recent searches from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('recentSearches');
        if (saved) {
            setRecentSearches(JSON.parse(saved));
        }
    }, []);

    // Save search to recent
    const saveToRecent = (searchQuery) => {
        const updated = [
            searchQuery,
            ...recentSearches.filter(s => s !== searchQuery),
        ].slice(0, 5);

        setRecentSearches(updated);
        localStorage.setItem('recentSearches', JSON.stringify(updated));
    };

    // Handle search
    const handleSearch = (searchQuery) => {
        if (!searchQuery.trim()) return;

        saveToRecent(searchQuery.trim());
        setIsOpen(false);

        if (onSearch) {
            onSearch(searchQuery);
        } else {
            navigate(`/notes?search=${encodeURIComponent(searchQuery)}`);
        }
    };

    // Clear recent searches
    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem('recentSearches');
    };

    // Handle input change with debounced suggestions
    const handleInputChange = useCallback((e) => {
        const value = e.target.value;
        setQuery(value);

        if (value.length > 1) {
            setLoading(true);
            // Simulate API call for suggestions
            setTimeout(() => {
                const filtered = [
                    `${value} - UPSC Notes`,
                    `${value} - SSC Notes`,
                    `${value} - Study Material`,
                ].filter(s => s.toLowerCase().includes(value.toLowerCase()));
                setSuggestions(filtered);
                setLoading(false);
            }, 200);
        } else {
            setSuggestions([]);
        }
    }, []);

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleSearch(query);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={cn('relative', className)}>
            {/* Search Input */}
            <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={handleInputChange}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full pl-12 pr-10 py-3 bg-gray-100 dark:bg-gray-800 border border-transparent focus:border-amber-500 focus:bg-white dark:focus:bg-gray-900 rounded-xl outline-none transition-all text-gray-900 dark:text-white placeholder-gray-500"
                />
                {query && (
                    <button
                        onClick={() => {
                            setQuery('');
                            setSuggestions([]);
                            inputRef.current?.focus();
                        }}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                    >
                        <XMarkIcon className="w-4 h-4 text-gray-400" />
                    </button>
                )}
            </div>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                        <div className="max-h-[400px] overflow-y-auto">
                            {/* Loading */}
                            {loading && (
                                <div className="p-4 text-center">
                                    <div className="inline-block w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                                </div>
                            )}

                            {/* Suggestions */}
                            {!loading && suggestions.length > 0 && (
                                <div className="p-2">
                                    <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase">
                                        Suggestions
                                    </p>
                                    {suggestions.map((suggestion, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSearch(suggestion)}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                                        >
                                            <DocumentTextIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700 dark:text-gray-300">{suggestion}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Recent Searches */}
                            {!loading && suggestions.length === 0 && recentSearches.length > 0 && (
                                <div className="p-2 border-b border-gray-100 dark:border-gray-800">
                                    <div className="flex items-center justify-between px-3 py-2">
                                        <p className="text-xs font-medium text-gray-500 uppercase">
                                            Recent Searches
                                        </p>
                                        <button
                                            onClick={clearRecentSearches}
                                            className="text-xs text-amber-600 hover:text-amber-700"
                                        >
                                            Clear
                                        </button>
                                    </div>
                                    {recentSearches.map((search, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleSearch(search)}
                                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                                        >
                                            <ClockIcon className="w-4 h-4 text-gray-400" />
                                            <span className="text-gray-700 dark:text-gray-300">{search}</span>
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Trending */}
                            {!loading && suggestions.length === 0 && (
                                <div className="p-2">
                                    <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase flex items-center gap-2">
                                        <FireIcon className="w-4 h-4 text-orange-500" />
                                        Trending Searches
                                    </p>
                                    <div className="flex flex-wrap gap-2 px-3 py-2">
                                        {TRENDING_SEARCHES.map((search, index) => (
                                            <button
                                                key={index}
                                                onClick={() => handleSearch(search)}
                                                className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full text-sm text-gray-700 dark:text-gray-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:text-amber-700 dark:hover:text-amber-400 transition-colors"
                                            >
                                                <ArrowTrendingUpIcon className="w-3 h-3" />
                                                {search}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Search tip */}
                        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-xs text-gray-500 text-center">
                                Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">Enter</kbd> to search or <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-gray-700 rounded text-gray-700 dark:text-gray-300">Esc</kbd> to close
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
