/**
 * Browse Books Page
 * Premium books browsing with grid/list view, advanced filtering,
 * sorting, wishlist integration, and cart functionality.
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    Squares2X2Icon,
    ListBulletIcon,
    XMarkIcon,
    ShoppingCartIcon,
    HeartIcon,
    StarIcon,
    BookOpenIcon,
    SparklesIcon,
    ChevronDownIcon,
    AdjustmentsHorizontalIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency, cn } from '../../utils/helpers';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

// ============================================================================
// BOOK DATA
// ============================================================================

const BOOKS = [
    {
        id: 1,
        title: 'Complete UPSC Prelims Guide 2024',
        author: 'Dr. R.K. Sharma',
        category: 'UPSC',
        price: 599,
        originalPrice: 799,
        rating: 4.8,
        reviews: 234,
        description: 'Comprehensive guide covering all topics for UPSC Prelims examination.',
        inStock: true,
        bestseller: true,
        pages: 450,
    },
    {
        id: 2,
        title: 'SSC CGL Complete Mathematics',
        author: 'Prof. Anil Kumar',
        category: 'SSC',
        price: 349,
        originalPrice: 449,
        rating: 4.6,
        reviews: 567,
        description: 'Master quantitative aptitude with solved examples and practice sets.',
        inStock: true,
        bestseller: false,
        pages: 320,
    },
    {
        id: 3,
        title: 'Banking Awareness Encyclopedia',
        author: 'Neha Patel',
        category: 'Banking',
        price: 299,
        originalPrice: 399,
        rating: 4.5,
        reviews: 189,
        description: 'Complete banking awareness for IBPS, SBI, and RBI exams.',
        inStock: true,
        bestseller: true,
        pages: 280,
    },
    {
        id: 4,
        title: 'Indian Polity for Civil Services',
        author: 'M. Laxmikanth',
        category: 'UPSC',
        price: 699,
        originalPrice: 899,
        rating: 4.9,
        reviews: 1245,
        description: 'The most comprehensive book on Indian Polity for competitive exams.',
        inStock: true,
        bestseller: true,
        pages: 680,
    },
    {
        id: 5,
        title: 'General English Grammar',
        author: 'S.P. Bakshi',
        category: 'General',
        price: 249,
        originalPrice: 349,
        rating: 4.4,
        reviews: 892,
        description: 'Master English grammar with rules, examples, and exercises.',
        inStock: false,
        bestseller: false,
        pages: 360,
    },
    {
        id: 6,
        title: 'Reasoning & Aptitude Master',
        author: 'R.S. Aggarwal',
        category: 'General',
        price: 399,
        originalPrice: 499,
        rating: 4.7,
        reviews: 2341,
        description: 'Complete guide for verbal and non-verbal reasoning.',
        inStock: true,
        bestseller: true,
        pages: 520,
    },
    {
        id: 7,
        title: 'Indian Geography Atlas',
        author: 'Dr. K.K. Kapoor',
        category: 'UPSC',
        price: 449,
        originalPrice: 599,
        rating: 4.6,
        reviews: 456,
        description: 'Detailed maps and explanations for Indian Geography.',
        inStock: true,
        bestseller: false,
        pages: 280,
    },
    {
        id: 8,
        title: 'Economics for Beginners',
        author: 'Prof. S. Sharma',
        category: 'Banking',
        price: 379,
        originalPrice: 479,
        rating: 4.5,
        reviews: 321,
        description: 'Understanding economics made simple for all competitive exams.',
        inStock: true,
        bestseller: false,
        pages: 340,
    },
];

const CATEGORIES = [
    { id: 'all', label: 'All Books', icon: BookOpenIcon },
    { id: 'UPSC', label: 'UPSC', icon: SparklesIcon, color: 'from-indigo-500 to-purple-500' },
    { id: 'SSC', label: 'SSC', icon: BookOpenIcon, color: 'from-emerald-500 to-teal-500' },
    { id: 'Banking', label: 'Banking', icon: BookOpenIcon, color: 'from-amber-500 to-orange-500' },
    { id: 'General', label: 'General', icon: BookOpenIcon, color: 'from-blue-500 to-cyan-500' },
];

const SORT_OPTIONS = [
    { value: 'popular', label: 'Most Popular' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'newest', label: 'Newest First' },
];

// ============================================================================
// BOOK CARD
// ============================================================================

const BookCard = ({ book, view = 'grid', onAddToCart, onToggleWishlist, isWishlisted }) => {
    const discount = Math.round(((book.originalPrice - book.price) / book.originalPrice) * 100);
    const category = CATEGORIES.find(c => c.id === book.category);

    const content = (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            whileHover={{ y: -8 }}
            className={cn(
                'group bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-all',
                view === 'list' && 'flex'
            )}
        >
            {/* Book Cover */}
            <div className={cn(
                'relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center',
                view === 'grid' ? 'h-48' : 'w-40 h-full flex-shrink-0'
            )}>
                {book.bestseller && (
                    <Badge className="absolute top-3 left-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                        🔥 Bestseller
                    </Badge>
                )}
                {discount > 0 && (
                    <span className="absolute top-3 right-3 px-2 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg">
                        {discount}% OFF
                    </span>
                )}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        onToggleWishlist(book.id);
                    }}
                    className="absolute bottom-3 right-3 p-2 rounded-full bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-900 transition-colors"
                >
                    {isWishlisted ? (
                        <HeartSolidIcon className="w-5 h-5 text-red-500" />
                    ) : (
                        <HeartIcon className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
                    )}
                </button>
                <div className="text-6xl">📖</div>
            </div>

            {/* Book Info */}
            <div className={cn('p-5', view === 'list' && 'flex-1')}>
                <Badge
                    type="soft"
                    variant="default"
                    className={cn('mb-3 bg-gradient-to-r text-white border-0', category?.color || 'from-gray-500 to-gray-600')}
                >
                    {book.category}
                </Badge>

                <h3 className="font-bold text-gray-900 dark:text-white mb-1 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {book.title}
                </h3>

                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    by {book.author}
                </p>

                <p className={cn(
                    'text-sm text-gray-600 dark:text-gray-400 mb-3',
                    view === 'grid' ? 'line-clamp-2' : 'line-clamp-3'
                )}>
                    {book.description}
                </p>

                {/* Rating */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                            <StarSolidIcon
                                key={i}
                                className={cn(
                                    'w-4 h-4',
                                    i < Math.floor(book.rating) ? 'text-amber-400' : 'text-gray-200 dark:text-gray-600'
                                )}
                            />
                        ))}
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{book.rating}</span>
                    <span className="text-sm text-gray-400">({book.reviews})</span>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between">
                    <div>
                        <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                            {formatCurrency(book.price)}
                        </span>
                        {book.originalPrice > book.price && (
                            <span className="text-sm text-gray-400 line-through ml-2">
                                {formatCurrency(book.originalPrice)}
                            </span>
                        )}
                    </div>
                    <Button
                        size="sm"
                        onClick={(e) => {
                            e.preventDefault();
                            onAddToCart(book);
                        }}
                        disabled={!book.inStock}
                        className={!book.inStock ? 'opacity-50 cursor-not-allowed' : ''}
                    >
                        {book.inStock ? (
                            <>
                                <ShoppingCartIcon className="w-4 h-4 mr-1" />
                                Add
                            </>
                        ) : (
                            'Out of Stock'
                        )}
                    </Button>
                </div>
            </div>
        </motion.div>
    );

    return content;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BrowseBooksPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('popular');
    const [viewMode, setViewMode] = useState('grid');
    const [showFilters, setShowFilters] = useState(false);
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [wishlist, setWishlist] = useState([]);

    const filteredBooks = useMemo(() => {
        return BOOKS
            .filter(book => {
                const matchesCategory = selectedCategory === 'all' || book.category === selectedCategory;
                const matchesSearch = searchQuery === '' ||
                    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    book.author.toLowerCase().includes(searchQuery.toLowerCase());
                const matchesPrice = book.price >= priceRange[0] && book.price <= priceRange[1];
                return matchesCategory && matchesSearch && matchesPrice;
            })
            .sort((a, b) => {
                switch (sortBy) {
                    case 'price-low': return a.price - b.price;
                    case 'price-high': return b.price - a.price;
                    case 'rating': return b.rating - a.rating;
                    case 'newest': return b.id - a.id;
                    default: return b.reviews - a.reviews;
                }
            });
    }, [searchQuery, selectedCategory, sortBy, priceRange]);

    const addItem = useCartStore((state) => state.addItem);

    const handleAddToCart = (book) => {
        // Adapt book object to note structure if needed, or ensure store handles it
        // Assuming book structure is compatible or we map it
        const noteAdapter = {
            id: book.id,
            title: book.title,
            pageCount: book.pages,
            pricePerPage: book.price / book.pages, // Derive price per page or use fixed price logic
            // books might be different entities, but for now let's treat them as items
            // If the store expects notes, we might need to adjust.
            // However, the previous logic was just a toast.
            // Let's look at the store. updateQuantity uses item.note.id.
            // So we need an id.
        };
        // Actually, the store expects { note, quantity }.
        // Let's pass the book as the note.
        // But we need to make sure price calculation works.
        // Store calculation: item.note.pageCount * item.note.pricePerPage.
        // We should back-calculate pricePerPage or modify store to handle fixed price items.
        // For now, let's just make it work safely.

        // Hack: set pricePerPage such that pageCount * pricePerPage = price
        const adaptedBook = {
            ...book,
            pageCount: book.pages,
            pricePerPage: book.price / book.pages
        };

        addItem(adaptedBook, 1);
        // toast is handled by addItem
    };

    const handleToggleWishlist = (bookId) => {
        setWishlist(prev =>
            prev.includes(bookId)
                ? prev.filter(id => id !== bookId)
                : [...prev, bookId]
        );
        toast.success(wishlist.includes(bookId) ? 'Removed from wishlist' : 'Added to wishlist');
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <section className="relative py-16 lg:py-20 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500 rounded-full blur-3xl" />
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <Badge className="mb-6 bg-amber-500/20 text-amber-400 border-amber-500/30">
                            <BookOpenIcon className="w-4 h-4 mr-1" />
                            Premium Books Collection
                        </Badge>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                            Browse Study{' '}
                            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                                Books
                            </span>
                        </h1>
                        <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                            Discover our curated collection of premium study materials and reference books
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Filters Bar */}
            <section className="sticky top-0 z-30 bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex flex-wrap items-center gap-4">
                        {/* Search */}
                        <div className="flex-1 min-w-[200px] max-w-md relative">
                            <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search books..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>

                        {/* Category Tabs */}
                        <div className="hidden md:flex items-center gap-2 overflow-x-auto">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all',
                                        selectedCategory === cat.id
                                            ? 'bg-amber-500 text-black'
                                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                    )}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Sort Dropdown */}
                        <div className="relative">
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                className="appearance-none pl-4 pr-10 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm"
                            >
                                {SORT_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            <ChevronDownIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>

                        {/* View Toggle */}
                        <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-xl p-1">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={cn(
                                    'p-2 rounded-lg transition-colors',
                                    viewMode === 'grid' ? 'bg-white dark:bg-gray-600 shadow' : ''
                                )}
                            >
                                <Squares2X2Icon className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={cn(
                                    'p-2 rounded-lg transition-colors',
                                    viewMode === 'list' ? 'bg-white dark:bg-gray-600 shadow' : ''
                                )}
                            >
                                <ListBulletIcon className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="md:hidden p-3 rounded-xl bg-gray-100 dark:bg-gray-700"
                        >
                            <FunnelIcon className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Mobile Categories */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="md:hidden mt-4 overflow-hidden"
                            >
                                <div className="flex flex-wrap gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            onClick={() => setSelectedCategory(cat.id)}
                                            className={cn(
                                                'px-4 py-2 rounded-xl text-sm font-medium',
                                                selectedCategory === cat.id
                                                    ? 'bg-amber-500 text-black'
                                                    : 'bg-gray-100 dark:bg-gray-700'
                                            )}
                                        >
                                            {cat.label}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </section>

            {/* Books Grid */}
            <section className="py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-gray-600 dark:text-gray-400">
                            Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredBooks.length}</span> books
                        </p>
                        {(searchQuery || selectedCategory !== 'all') && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('all');
                                }}
                                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
                            >
                                <XMarkIcon className="w-4 h-4" />
                                Clear filters
                            </button>
                        )}
                    </div>

                    {filteredBooks.length === 0 ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-16"
                        >
                            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                                <BookOpenIcon className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                No books found
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Try adjusting your search or filters
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearchQuery('');
                                    setSelectedCategory('all');
                                }}
                            >
                                Clear all filters
                            </Button>
                        </motion.div>
                    ) : (
                        <motion.div
                            layout
                            className={cn(
                                'grid gap-6',
                                viewMode === 'grid'
                                    ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                                    : 'grid-cols-1'
                            )}
                        >
                            <AnimatePresence mode="popLayout">
                                {filteredBooks.map((book) => (
                                    <BookCard
                                        key={book.id}
                                        book={book}
                                        view={viewMode}
                                        onAddToCart={handleAddToCart}
                                        onToggleWishlist={handleToggleWishlist}
                                        isWishlisted={wishlist.includes(book.id)}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            </section>
        </div>
    );
}
