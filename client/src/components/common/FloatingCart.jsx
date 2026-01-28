/**
 * Floating Cart Button
 * Shows cart count and total, quick access to cart
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ShoppingCartIcon,
    XMarkIcon,
    TrashIcon,
    PlusIcon,
    MinusIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/helpers';

export default function FloatingCart() {
    const [isOpen, setIsOpen] = useState(false);
    const items = useCartStore((state) => state.items);
    const removeItem = useCartStore((state) => state.removeItem);
    const pricing = useCartStore((state) => state.getPricing());

    const totalItems = pricing.itemCount || 0;
    const totalAmount = pricing.total || 0;

    if (totalItems === 0) {
        return null;
    }

    return (
        <>
            {/* Floating Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 left-6 z-40 bg-amber-500 text-white p-4 rounded-2xl shadow-lg shadow-amber-500/30 hover:bg-amber-600 transition-colors"
            >
                <ShoppingCartIcon className="w-6 h-6" />

                {/* Badge */}
                <motion.span
                    key={totalItems}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center"
                >
                    {totalItems}
                </motion.span>
            </motion.button>

            {/* Cart Drawer */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed left-0 top-0 bottom-0 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl z-50 flex flex-col"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <ShoppingCartIcon className="w-6 h-6 text-amber-500" />
                                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                                        Your Cart ({totalItems})
                                    </h2>
                                </div>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <XMarkIcon className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Items */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {items.map((item, index) => (
                                    <motion.div
                                        key={item.note?.id || index}
                                        layout
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl"
                                    >
                                        {/* Image */}
                                        <div className="w-16 h-20 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.note?.coverImage ? (
                                                <img
                                                    src={item.note.coverImage}
                                                    alt={item.note.title}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <ShoppingCartIcon className="w-6 h-6 text-gray-400" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-medium text-gray-900 dark:text-white truncate">
                                                {item.note?.title || 'Unknown Item'}
                                            </h3>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {item.note?.pageCount || item.note?.totalPages || 0} pages × {item.quantity || 1}
                                            </p>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {formatCurrency(item.note?.pricePerPage || 0)}/page
                                            </p>

                                            {/* Price and actions */}
                                            <div className="flex items-center justify-between mt-2">
                                                <p className="font-semibold text-amber-600">
                                                    {formatCurrency((item.note?.pageCount || item.note?.totalPages || 0) * (item.note?.pricePerPage || 0) * (item.quantity || 1))}
                                                </p>
                                                <button
                                                    onClick={() => removeItem(item.note?.id)}
                                                    className="p-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
                                {/* Total */}
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
                                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                                        {formatCurrency(totalAmount)}
                                    </span>
                                </div>

                                {/* Checkout Button */}
                                <Link
                                    to="/order"
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full py-3 px-6 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-center transition-colors"
                                >
                                    Proceed to Checkout
                                </Link>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="block w-full py-2 text-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors text-sm"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
