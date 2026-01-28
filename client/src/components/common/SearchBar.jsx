import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../services/api';
import Loader from './Loader';

// ==================== ICONS ====================

const SearchIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const MicrophoneIcon = ({ size = 18, isListening = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={isListening ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
);

const CloseIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const HistoryIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 3v5h5" />
        <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
        <path d="M12 7v5l4 2" />
    </svg>
);

const TrendingIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
        <polyline points="17 6 23 6 23 12" />
    </svg>
);

const FileTextIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const FilterIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
);

const ChevronDownIcon = ({ size = 18 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="6 9 12 15 18 9" />
    </svg>
);

const StarIcon = ({ size = 14, filled = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
);

// ==================== CONSTANTS ====================

const CATEGORY_CONFIG = {
    UPSC: { color: '#6366f1', label: 'UPSC', icon: '📚' },
    SSC: { color: '#10b981', label: 'SSC', icon: '📝' },
    BANKING: { color: '#f59e0b', label: 'Banking', icon: '🏦' },
    STATE_PCS: { color: '#8b5cf6', label: 'State PCS', icon: '🏛️' },
    RAILWAY: { color: '#ef4444', label: 'Railway', icon: '🚂' },
    DEFENCE: { color: '#0ea5e9', label: 'Defence', icon: '🎖️' },
    TEACHING: { color: '#ec4899', label: 'Teaching', icon: '👩‍🏫' },
    OTHER: { color: '#64748b', label: 'Other', icon: '📄' },
};

const SORT_OPTIONS = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
];

const TRENDING_SEARCHES = [
    'UPSC Prelims 2024',
    'SSC CGL Notes',
    'Vision IAS',
    'Current Affairs',
    'Indian Polity',
    'Economy Notes',
];

const SEARCH_HISTORY_KEY = 'printpress_search_history';
const MAX_HISTORY_ITEMS = 10;

// ==================== UTILITY HOOKS ====================

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(timer);
    }, [value, delay]);

    return debouncedValue;
};

const useLocalStorage = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading localStorage:', error);
            return initialValue;
        }
    });

    const setValue = useCallback((value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (error) {
            console.error('Error writing to localStorage:', error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue];
};

const useVoiceSearch = () => {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            setIsSupported(true);
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-IN';

            recognitionRef.current.onresult = (event) => {
                const current = event.resultIndex;
                const transcriptResult = event.results[current][0].transcript;
                setTranscript(transcriptResult);
            };

            recognitionRef.current.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };
        }

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort();
            }
        };
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            setIsListening(true);
            recognitionRef.current.start();
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    return { isListening, transcript, isSupported, startListening, stopListening };
};

// ==================== SUB-COMPONENTS ====================

const SearchSuggestionItem = ({ note, isSelected, onClick }) => {
    const config = CATEGORY_CONFIG[note.category] || CATEGORY_CONFIG.OTHER;

    return (
        <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={onClick}
            className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all duration-200"
            style={{
                background: isSelected ? 'var(--bg-tertiary, #f1f5f9)' : 'transparent',
                borderLeft: isSelected ? `3px solid ${config.color}` : '3px solid transparent',
            }}
        >
            <div
                className="w-12 h-12 rounded-lg flex items-center justify-center text-lg shrink-0"
                style={{
                    background: `${config.color}15`,
                    color: config.color,
                }}
            >
                {config.icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: 'var(--text-primary, #0f172a)' }}>
                    {note.title}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${config.color}15`, color: config.color }}>
                        {config.label}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                        {note.subject}
                    </span>
                    {note.pageCount && (
                        <span className="text-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                            • {note.pageCount} pages
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                    {note.rating && (
                        <div className="flex items-center gap-1" style={{ color: '#f59e0b' }}>
                            <StarIcon size={12} filled />
                            <span className="text-xs font-medium">{note.rating}</span>
                        </div>
                    )}
                    {note.price && (
                        <span className="text-xs font-semibold" style={{ color: 'var(--color-primary, #6366f1)' }}>
                            ₹{note.price}
                        </span>
                    )}
                </div>
            </div>
            <div className="shrink-0">
                <svg className="w-4 h-4" style={{ color: 'var(--text-muted, #94a3b8)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
            </div>
        </motion.div>
    );
};

const SearchHistoryItem = ({ query, onClick, onRemove }) => (
    <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors group"
        onClick={onClick}
    >
        <HistoryIcon size={16} />
        <span className="flex-1 text-sm" style={{ color: 'var(--text-secondary, #475569)' }}>{query}</span>
        <button
            onClick={(e) => { e.stopPropagation(); onRemove(); }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 transition-all"
            style={{ color: 'var(--text-muted, #94a3b8)' }}
        >
            <CloseIcon size={14} />
        </button>
    </motion.div>
);

const TrendingSearchItem = ({ query, onClick, index }) => (
    <motion.button
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        onClick={onClick}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all hover:scale-105"
        style={{
            background: 'var(--bg-tertiary, #f1f5f9)',
            color: 'var(--text-secondary, #475569)'
        }}
    >
        <TrendingIcon size={14} />
        {query}
    </motion.button>
);

const FilterDropdown = ({ label, options, value, onChange, icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div ref={dropdownRef} className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border"
                style={{
                    background: value ? 'var(--color-primary, #6366f1)' : 'var(--bg-card, white)',
                    color: value ? 'white' : 'var(--text-secondary, #475569)',
                    borderColor: value ? 'var(--color-primary, #6366f1)' : 'var(--border-color, #e2e8f0)',
                }}
            >
                {Icon && <Icon size={16} />}
                {selectedOption?.label || label}
                <ChevronDownIcon size={16} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        className="absolute top-full left-0 mt-2 min-w-[180px] rounded-xl shadow-xl border overflow-hidden z-50"
                        style={{
                            background: 'var(--bg-card, white)',
                            borderColor: 'var(--border-color, #e2e8f0)'
                        }}
                    >
                        {options.map((option) => (
                            <button
                                key={option.value}
                                onClick={() => { onChange(option.value); setIsOpen(false); }}
                                className="w-full px-4 py-2.5 text-left text-sm transition-colors flex items-center justify-between"
                                style={{
                                    background: value === option.value ? 'var(--bg-tertiary, #f1f5f9)' : 'transparent',
                                    color: value === option.value ? 'var(--color-primary, #6366f1)' : 'var(--text-primary, #0f172a)',
                                }}
                            >
                                {option.label}
                                {value === option.value && (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const CategoryFilter = ({ value, onChange }) => {
    const categories = Object.entries(CATEGORY_CONFIG);

    return (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => onChange(null)}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                    background: !value ? 'var(--color-primary, #6366f1)' : 'var(--bg-tertiary, #f1f5f9)',
                    color: !value ? 'white' : 'var(--text-secondary, #475569)',
                }}
            >
                All
            </button>
            {categories.map(([key, config]) => (
                <button
                    key={key}
                    onClick={() => onChange(key)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1"
                    style={{
                        background: value === key ? config.color : `${config.color}15`,
                        color: value === key ? 'white' : config.color,
                    }}
                >
                    <span>{config.icon}</span>
                    {config.label}
                </button>
            ))}
        </div>
    );
};

// ==================== MAIN COMPONENT ====================

export default function SearchBar({
    onSearch,
    placeholder = "Search notes, subjects, institutes...",
    showSuggestions = true,
    showFilters = true,
    showVoiceSearch = true,
    showHistory = true,
    showTrending = true,
    variant = 'default', // default, hero, compact
    className = '',
}) {
    // State
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [showFiltersPanel, setShowFiltersPanel] = useState(false);
    const [filters, setFilters] = useState({
        category: null,
        sortBy: 'relevance',
        priceRange: null,
        rating: null,
    });

    // Refs
    const wrapperRef = useRef(null);
    const inputRef = useRef(null);

    // Hooks
    const debouncedQuery = useDebounce(query, 300);
    const [searchHistory, setSearchHistory] = useLocalStorage(SEARCH_HISTORY_KEY, []);
    const { isListening, transcript, isSupported, startListening, stopListening } = useVoiceSearch();

    // Update query when voice transcript changes
    useEffect(() => {
        if (transcript) {
            setQuery(transcript);
        }
    }, [transcript]);

    // Handle click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
                setIsOpen(false);
                setShowFiltersPanel(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions
    useEffect(() => {
        if (!showSuggestions || debouncedQuery.length < 2) {
            setSuggestions([]);
            return;
        }

        const fetchSuggestions = async () => {
            setLoading(true);
            try {
                const params = new URLSearchParams({
                    search: debouncedQuery,
                    limit: '8',
                    ...(filters.category && { category: filters.category }),
                    ...(filters.sortBy && { sortBy: filters.sortBy }),
                });

                const res = await api.get(`/notes?${params}`);
                if (res.data?.success && res.data?.data) {
                    setSuggestions(res.data.data.slice(0, 8));
                } else if (Array.isArray(res.data)) {
                    setSuggestions(res.data.slice(0, 8));
                }
            } catch (e) {
                console.error('Search error:', e);
                setSuggestions([]);
            }
            setLoading(false);
        };

        fetchSuggestions();
    }, [debouncedQuery, showSuggestions, filters.category, filters.sortBy]);

    // Add to search history
    const addToHistory = useCallback((searchQuery) => {
        if (!searchQuery.trim()) return;
        setSearchHistory(prev => {
            const filtered = prev.filter(q => q.toLowerCase() !== searchQuery.toLowerCase());
            return [searchQuery, ...filtered].slice(0, MAX_HISTORY_ITEMS);
        });
    }, [setSearchHistory]);

    // Remove from history
    const removeFromHistory = useCallback((searchQuery) => {
        setSearchHistory(prev => prev.filter(q => q !== searchQuery));
    }, [setSearchHistory]);

    // Clear all history
    const clearHistory = useCallback(() => {
        setSearchHistory([]);
    }, [setSearchHistory]);

    // Handle search
    const handleSearch = useCallback((searchQuery = query) => {
        if (!searchQuery.trim()) return;
        addToHistory(searchQuery);
        onSearch?.(searchQuery, filters);
        setIsOpen(false);
    }, [query, filters, addToHistory, onSearch]);

    // Handle suggestion click
    const handleSuggestionClick = useCallback((note) => {
        addToHistory(note.title);
        window.location.href = `/notes/${note.slug}`;
    }, [addToHistory]);

    // Handle keyboard navigation
    const handleKeyDown = useCallback((e) => {
        const totalItems = suggestions.length + (showHistory ? searchHistory.length : 0);

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex(prev => Math.min(prev + 1, totalItems - 1));
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex(prev => Math.max(prev - 1, -1));
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
                    handleSuggestionClick(suggestions[selectedIndex]);
                } else if (selectedIndex >= suggestions.length && searchHistory[selectedIndex - suggestions.length]) {
                    setQuery(searchHistory[selectedIndex - suggestions.length]);
                    handleSearch(searchHistory[selectedIndex - suggestions.length]);
                } else {
                    handleSearch();
                }
                break;
            case 'Escape':
                setIsOpen(false);
                inputRef.current?.blur();
                break;
            case 'Tab':
                if (isOpen && suggestions.length > 0) {
                    e.preventDefault();
                    setQuery(suggestions[0].title);
                }
                break;
            default:
                break;
        }
    }, [suggestions, searchHistory, selectedIndex, showHistory, handleSearch, handleSuggestionClick, isOpen]);

    // Keyboard shortcut to focus search (Cmd/Ctrl + K)
    useEffect(() => {
        const handleGlobalKeyDown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };
        document.addEventListener('keydown', handleGlobalKeyDown);
        return () => document.removeEventListener('keydown', handleGlobalKeyDown);
    }, []);

    // Computed styles based on variant
    const variantStyles = useMemo(() => {
        switch (variant) {
            case 'hero':
                return {
                    input: 'py-4 pl-14 pr-32 text-lg rounded-2xl shadow-xl',
                    icon: 'left-5',
                    iconSize: 22,
                };
            case 'compact':
                return {
                    input: 'py-2 pl-10 pr-4 text-sm rounded-lg',
                    icon: 'left-3',
                    iconSize: 16,
                };
            default:
                return {
                    input: 'py-3 pl-12 pr-24 text-base rounded-xl',
                    icon: 'left-4',
                    iconSize: 18,
                };
        }
    }, [variant]);

    const showDropdown = isOpen && (query.length > 0 || (showHistory && searchHistory.length > 0) || showTrending);

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            {/* Search Input Container */}
            <div className="relative">
                {/* Search Icon */}
                <div className={`absolute ${variantStyles.icon} top-1/2 -translate-y-1/2`} style={{ color: 'var(--text-muted, #94a3b8)' }}>
                    <SearchIcon size={variantStyles.iconSize} />
                </div>

                {/* Input */}
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setIsOpen(true);
                        setSelectedIndex(-1);
                    }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className={`w-full border-2 bg-white focus:outline-none transition-all duration-200 ${variantStyles.input}`}
                    style={{
                        borderColor: isOpen ? 'var(--color-primary, #6366f1)' : 'var(--border-color, #e2e8f0)',
                        boxShadow: isOpen ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : 'none',
                    }}
                    aria-label="Search notes"
                    aria-expanded={showDropdown}
                    aria-autocomplete="list"
                    role="combobox"
                />

                {/* Action Buttons */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {/* Loading Spinner */}
                    {loading && <Loader size="small" />}

                    {/* Clear Button */}
                    {query && !loading && (
                        <button
                            onClick={() => { setQuery(''); inputRef.current?.focus(); }}
                            className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                            style={{ color: 'var(--text-muted, #94a3b8)' }}
                            aria-label="Clear search"
                        >
                            <CloseIcon size={16} />
                        </button>
                    )}

                    {/* Voice Search */}
                    {showVoiceSearch && isSupported && (
                        <button
                            onClick={isListening ? stopListening : startListening}
                            className={`p-2 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'hover:bg-gray-100'}`}
                            style={{ color: isListening ? 'white' : 'var(--text-muted, #94a3b8)' }}
                            aria-label={isListening ? 'Stop voice search' : 'Start voice search'}
                        >
                            <MicrophoneIcon size={18} isListening={isListening} />
                        </button>
                    )}

                    {/* Filters Toggle */}
                    {showFilters && (
                        <button
                            onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                            className={`p-2 rounded-full transition-all ${showFiltersPanel ? 'bg-indigo-500 text-white' : 'hover:bg-gray-100'}`}
                            style={{ color: showFiltersPanel ? 'white' : 'var(--text-muted, #94a3b8)' }}
                            aria-label="Toggle filters"
                        >
                            <FilterIcon size={18} />
                        </button>
                    )}

                    {/* Keyboard Shortcut Hint */}
                    {!query && variant !== 'compact' && (
                        <div className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md text-xs" style={{ background: 'var(--bg-tertiary, #f1f5f9)', color: 'var(--text-muted, #94a3b8)' }}>
                            <kbd className="font-semibold">⌘</kbd>
                            <kbd className="font-semibold">K</kbd>
                        </div>
                    )}
                </div>
            </div>

            {/* Filters Panel */}
            <AnimatePresence>
                {showFiltersPanel && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="mt-3 p-4 rounded-xl border overflow-hidden"
                        style={{
                            background: 'var(--bg-card, white)',
                            borderColor: 'var(--border-color, #e2e8f0)'
                        }}
                    >
                        <div className="flex flex-wrap items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-medium" style={{ color: 'var(--text-secondary, #475569)' }}>Sort by:</span>
                                <FilterDropdown
                                    label="Sort"
                                    options={SORT_OPTIONS}
                                    value={filters.sortBy}
                                    onChange={(val) => setFilters(f => ({ ...f, sortBy: val }))}
                                />
                            </div>

                            <div className="w-px h-6 bg-gray-200" />

                            <div className="flex-1">
                                <CategoryFilter
                                    value={filters.category}
                                    onChange={(val) => setFilters(f => ({ ...f, category: val }))}
                                />
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Suggestions Dropdown */}
            <AnimatePresence>
                {showDropdown && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-full left-0 right-0 mt-2 rounded-xl shadow-2xl border overflow-hidden z-50"
                        style={{
                            background: 'var(--bg-card, white)',
                            borderColor: 'var(--border-color, #e2e8f0)',
                            maxHeight: '70vh',
                            overflowY: 'auto',
                        }}
                        role="listbox"
                    >
                        {/* Voice Search Listening Indicator */}
                        {isListening && (
                            <div className="px-4 py-3 border-b flex items-center gap-3" style={{ borderColor: 'var(--border-color, #e2e8f0)' }}>
                                <div className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center animate-pulse">
                                    <MicrophoneIcon size={16} isListening />
                                </div>
                                <div>
                                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary, #0f172a)' }}>Listening...</p>
                                    <p className="text-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                                        {transcript || 'Say something to search'}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Suggestions */}
                        {suggestions.length > 0 && (
                            <div>
                                <div className="px-4 py-2 border-b" style={{ borderColor: 'var(--border-color, #e2e8f0)' }}>
                                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                                        Notes
                                    </p>
                                </div>
                                {suggestions.map((note, i) => (
                                    <SearchSuggestionItem
                                        key={note.id}
                                        note={note}
                                        isSelected={i === selectedIndex}
                                        onClick={() => handleSuggestionClick(note)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Search History */}
                        {showHistory && searchHistory.length > 0 && !query && (
                            <div>
                                <div className="px-4 py-2 border-b flex items-center justify-between" style={{ borderColor: 'var(--border-color, #e2e8f0)' }}>
                                    <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                                        Recent Searches
                                    </p>
                                    <button
                                        onClick={clearHistory}
                                        className="text-xs hover:underline"
                                        style={{ color: 'var(--color-primary, #6366f1)' }}
                                    >
                                        Clear all
                                    </button>
                                </div>
                                {searchHistory.slice(0, 5).map((historyQuery, i) => (
                                    <SearchHistoryItem
                                        key={historyQuery}
                                        query={historyQuery}
                                        onClick={() => { setQuery(historyQuery); handleSearch(historyQuery); }}
                                        onRemove={() => removeFromHistory(historyQuery)}
                                    />
                                ))}
                            </div>
                        )}

                        {/* Trending Searches */}
                        {showTrending && !query && suggestions.length === 0 && (
                            <div className="p-4">
                                <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                                    Trending Searches
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {TRENDING_SEARCHES.map((trendQuery, i) => (
                                        <TrendingSearchItem
                                            key={trendQuery}
                                            query={trendQuery}
                                            index={i}
                                            onClick={() => { setQuery(trendQuery); handleSearch(trendQuery); }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {query.length >= 2 && !loading && suggestions.length === 0 && (
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ background: 'var(--bg-tertiary, #f1f5f9)' }}>
                                    <SearchIcon size={24} />
                                </div>
                                <p className="font-medium mb-1" style={{ color: 'var(--text-primary, #0f172a)' }}>
                                    No notes found
                                </p>
                                <p className="text-sm" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                                    Try searching with different keywords
                                </p>
                            </div>
                        )}

                        {/* Search Tips */}
                        {!query && suggestions.length === 0 && !isListening && (
                            <div className="px-4 py-3 border-t" style={{ borderColor: 'var(--border-color, #e2e8f0)', background: 'var(--bg-secondary, #f8fafc)' }}>
                                <p className="text-xs" style={{ color: 'var(--text-muted, #94a3b8)' }}>
                                    💡 <strong>Tip:</strong> Search by subject, institute, or exam type (e.g., "Vision IAS Polity", "SSC Math")
                                </p>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
