/**
 * Wishlist Context
 * Enhanced wishlist management with slide-out drawer,
 * move to cart functionality, and animations.
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    XMarkIcon,
    HeartIcon,
    TrashIcon,
    ShoppingCartIcon,
    DocumentTextIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { storage, formatCurrency, cn } from '../utils/helpers';
import Button from '../components/common/Button';
import Badge from '../components/common/Badge';
import toast from 'react-hot-toast';

// ============================================================================
// CONTEXT
// ============================================================================

const WishlistContext = createContext(null);

// ============================================================================
// WISHLIST DRAWER COMPONENT
// ============================================================================

const WishlistDrawer = ({ isOpen, onClose, wishlist, onAddToCart }) => {
    const { items, removeItem, clearWishlist } = wishlist;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Drawer */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-pink-100 dark:bg-pink-900/30 rounded-xl flex items-center justify-center">
                                    <HeartSolidIcon className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-gray-900 dark:text-white">Wishlist</h2>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        {items.length} {items.length === 1 ? 'item' : 'items'} saved
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <XMarkIcon className="w-6 h-6" />
                            </button>
                        </div>

                        {/* Wishlist Items */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mb-4">
                                        <HeartIcon className="w-10 h-10 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                        Your wishlist is empty
                                    </h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                                        Save items you love for later
                                    </p>
                                    <Link to="/notes" onClick={onClose}>
                                        <Button>Browse Notes</Button>
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    {/* Items List */}
                                    <AnimatePresence mode="popLayout">
                                        {items.map((item) => (
                                            <motion.div
                                                key={item.id}
                                                layout
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, x: -100 }}
                                                className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl group"
                                            >
                                                <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <DocumentTextIcon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        to={`/notes/${item.slug || item.id}`}
                                                        onClick={onClose}
                                                        className="block"
                                                    >
                                                        <h4 className="font-medium text-gray-900 dark:text-white text-sm truncate hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
                                                            {item.title}
                                                        </h4>
                                                    </Link>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                        {item.institute?.name || 'PrintPress'}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-2">
                                                        <Button
                                                            size="xs"
                                                            onClick={() => {
                                                                onAddToCart(item);
                                                                removeItem(item.id);
                                                            }}
                                                        >
                                                            <ShoppingCartIcon className="w-3 h-3 mr-1" />
                                                            Add to Cart
                                                        </Button>
                                                        <button
                                                            onClick={() => removeItem(item.id)}
                                                            className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-semibold text-amber-600 dark:text-amber-400 text-sm">
                                                        {formatCurrency(item.pageCount * item.pricePerPage)}
                                                    </p>
                                                    {item.originalPrice && item.originalPrice > item.pageCount * item.pricePerPage && (
                                                        <p className="text-xs text-gray-400 line-through">
                                                            {formatCurrency(item.originalPrice)}
                                                        </p>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>

                                    {/* Clear All */}
                                    <button
                                        onClick={clearWishlist}
                                        className="w-full py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                                    >
                                        Clear Wishlist
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        {items.length > 0 && (
                            <div className="p-4 border-t border-gray-100 dark:border-gray-800 space-y-4">
                                <div className="flex items-center gap-2 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-xl text-sm">
                                    <SparklesIcon className="w-5 h-5 text-pink-600" />
                                    <span className="text-pink-700 dark:text-pink-400">
                                        Prices may change. Add to cart to lock in pricing.
                                    </span>
                                </div>

                                <Link to="/notes" onClick={onClose} className="block">
                                    <Button variant="outline" className="w-full">
                                        Continue Shopping
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

// ============================================================================
// PROVIDER
// ============================================================================

export function WishlistProvider({ children }) {
    const [items, setItems] = useState([]);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Load wishlist from storage on mount
    useEffect(() => {
        const savedWishlist = storage.get('wishlist');
        if (savedWishlist && Array.isArray(savedWishlist)) {
            setItems(savedWishlist);
        }
    }, []);

    // Save wishlist to storage when it changes
    useEffect(() => {
        storage.set('wishlist', items);
    }, [items]);

    // Add item
    const addItem = useCallback((note) => {
        setItems((prev) => {
            if (prev.find((i) => i.id === note.id)) {
                return prev;
            }
            toast.success('Added to wishlist!', {
                icon: '❤️',
            });
            return [...prev, note];
        });
    }, []);

    // Remove item
    const removeItem = useCallback((noteId) => {
        setItems((prev) => prev.filter((i) => i.id !== noteId));
        toast.success('Removed from wishlist');
    }, []);

    // Toggle item
    const toggleItem = useCallback((note) => {
        setItems((prev) => {
            const exists = prev.find((i) => i.id === note.id);
            if (exists) {
                toast.success('Removed from wishlist');
                return prev.filter((i) => i.id !== note.id);
            } else {
                toast.success('Added to wishlist!', {
                    icon: '❤️',
                });
                return [...prev, note];
            }
        });
    }, []);

    // Check if item is in wishlist
    const isInWishlist = useCallback((noteId) => items.some((i) => i.id === noteId), [items]);

    // Clear wishlist
    const clearWishlist = useCallback(() => {
        setItems([]);
        storage.remove('wishlist');
        toast.success('Wishlist cleared');
    }, []);

    // Move all to cart
    const moveAllToCart = useCallback((addToCartFn) => {
        items.forEach((item) => addToCartFn(item));
        clearWishlist();
        toast.success('All items moved to cart!');
    }, [items, clearWishlist]);

    // Open/close drawer
    const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
    const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

    // Categories in wishlist
    const categories = useMemo(() => {
        const cats = items.map((item) => item.category?.name || 'General');
        return [...new Set(cats)];
    }, [items]);

    // Total value
    const totalValue = useMemo(() => {
        return items.reduce((sum, item) => sum + (item.pageCount * item.pricePerPage), 0);
    }, [items]);

    const value = {
        items,
        itemCount: items.length,
        categories,
        totalValue,
        isDrawerOpen,
        addItem,
        removeItem,
        toggleItem,
        isInWishlist,
        clearWishlist,
        moveAllToCart,
        openDrawer,
        closeDrawer,
    };

    // Placeholder for addToCart - would be passed from CartContext in real app
    const handleAddToCart = (item) => {
        toast.success('Added to cart!');
    };

    return (
        <WishlistContext.Provider value={value}>
            {children}
            <WishlistDrawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                wishlist={value}
                onAddToCart={handleAddToCart}
            />
        </WishlistContext.Provider>
    );
}

// ============================================================================
// HOOK
// ============================================================================

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}

export default WishlistContext;
