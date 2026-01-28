/**
 * Quick View Modal for Notes
 * Shows note details in a modal without navigation
 */

import { useState, useEffect, Fragment } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, Transition } from '@headlessui/react';
import { useNavigate } from 'react-router-dom';
import {
    XMarkIcon,
    ShoppingCartIcon,
    HeartIcon,
    ShareIcon,
    StarIcon,
    DocumentTextIcon,
    AcademicCapIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import { formatCurrency } from '../../utils/helpers';
import { useCartStore } from '../../store/cartStore';
import { useWishlist } from '../../context/WishlistContext';
import Button from './Button';
import toast from 'react-hot-toast';

export default function QuickViewModal({ note, isOpen, onClose }) {
    const navigate = useNavigate();
    const addItem = useCartStore((state) => state.addItem);
    const { isInWishlist, toggleWishlist } = useWishlist();
    const [selectedPages, setSelectedPages] = useState('all');
    const [customPages, setCustomPages] = useState({ from: 1, to: note?.totalPages || 100 });
    const [isAdding, setIsAdding] = useState(false);

    const inWishlist = note ? isInWishlist(note.id) : false;

    useEffect(() => {
        if (note) {
            setCustomPages({ from: 1, to: note.totalPages });
        }
    }, [note]);

    if (!note) return null;

    const calculatePrice = () => {
        if (selectedPages === 'all') {
            return note.totalPages * note.pricePerPage;
        }
        const pages = customPages.to - customPages.from + 1;
        return pages * note.pricePerPage;
    };

    const handleAddToCart = async () => {
        setIsAdding(true);

        const cartItem = {
            noteId: note.id,
            title: note.title,
            slug: note.slug,
            pricePerPage: note.pricePerPage,
            pageRange: selectedPages === 'all'
                ? { from: 1, to: note.totalPages }
                : customPages,
            totalPages: selectedPages === 'all'
                ? note.totalPages
                : customPages.to - customPages.from + 1,
            coverImage: note.coverImage,
            institute: note.institute?.name,
        };

        // Simulate adding delay for UX
        await new Promise(resolve => setTimeout(resolve, 300));
        addItem(cartItem);

        setIsAdding(false);
        toast.success('Added to cart!', {
            icon: '🛒',
        });
    };

    const handleViewDetails = () => {
        onClose();
        navigate(`/notes/${note.slug}`);
    };

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-3xl bg-white dark:bg-gray-900 shadow-2xl transition-all">
                                <div className="grid md:grid-cols-2 gap-0">
                                    {/* Image Section */}
                                    <div className="relative bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-800 p-8">
                                        {/* Close button */}
                                        <button
                                            onClick={onClose}
                                            className="absolute top-4 right-4 md:hidden p-2 rounded-full bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-800 transition-colors z-10"
                                        >
                                            <XMarkIcon className="w-5 h-5" />
                                        </button>

                                        {/* Image */}
                                        <motion.div
                                            initial={{ scale: 0.9, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl"
                                        >
                                            <img
                                                src={note.coverImage || '/placeholder-note.jpg'}
                                                alt={note.title}
                                                className="w-full h-full object-cover"
                                            />
                                        </motion.div>

                                        {/* Quick stats */}
                                        <div className="mt-4 flex justify-center gap-4">
                                            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                                                <DocumentTextIcon className="w-4 h-4" />
                                                <span>{note.totalPages} pages</span>
                                            </div>
                                            <div className="flex items-center gap-1 text-sm text-amber-600">
                                                <StarIcon className="w-4 h-4 fill-current" />
                                                <span>4.8</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Details Section */}
                                    <div className="p-8 flex flex-col">
                                        {/* Close button - desktop */}
                                        <button
                                            onClick={onClose}
                                            className="hidden md:block absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                                        >
                                            <XMarkIcon className="w-5 h-5 text-gray-500" />
                                        </button>

                                        {/* Category badge */}
                                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 w-fit mb-3">
                                            {note.category}
                                        </span>

                                        {/* Title */}
                                        <Dialog.Title className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                            {note.title}
                                        </Dialog.Title>

                                        {/* Institute */}
                                        {note.institute && (
                                            <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-4">
                                                <AcademicCapIcon className="w-4 h-4" />
                                                <span className="text-sm">{note.institute.name}</span>
                                            </div>
                                        )}

                                        {/* Description */}
                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 line-clamp-3">
                                            {note.description || 'Comprehensive study material covering all important topics for your exam preparation.'}
                                        </p>

                                        {/* Page Selection */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Select Pages
                                            </label>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedPages('all')}
                                                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${selectedPages === 'all'
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    All Pages ({note.totalPages})
                                                </button>
                                                <button
                                                    onClick={() => setSelectedPages('custom')}
                                                    className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-all ${selectedPages === 'custom'
                                                        ? 'bg-amber-500 text-white'
                                                        : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                        }`}
                                                >
                                                    Custom Range
                                                </button>
                                            </div>

                                            {/* Custom range inputs */}
                                            <AnimatePresence>
                                                {selectedPages === 'custom' && (
                                                    <motion.div
                                                        initial={{ height: 0, opacity: 0 }}
                                                        animate={{ height: 'auto', opacity: 1 }}
                                                        exit={{ height: 0, opacity: 0 }}
                                                        className="overflow-hidden"
                                                    >
                                                        <div className="flex items-center gap-3 mt-3">
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                max={note.totalPages}
                                                                value={customPages.from}
                                                                onChange={(e) => setCustomPages(prev => ({ ...prev, from: parseInt(e.target.value) || 1 }))}
                                                                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-center"
                                                            />
                                                            <span className="text-gray-500">to</span>
                                                            <input
                                                                type="number"
                                                                min={1}
                                                                max={note.totalPages}
                                                                value={customPages.to}
                                                                onChange={(e) => setCustomPages(prev => ({ ...prev, to: parseInt(e.target.value) || note.totalPages }))}
                                                                className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-center"
                                                            />
                                                        </div>
                                                    </motion.div>
                                                )}
                                            </AnimatePresence>
                                        </div>

                                        {/* Price */}
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 mb-6">
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-600 dark:text-gray-400">Price</span>
                                                <div className="text-right">
                                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                                                        {formatCurrency(calculatePrice())}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {formatCurrency(note.pricePerPage)}/page
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex gap-3 mt-auto">
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => toggleWishlist(note)}
                                                className={`p-3 rounded-xl border transition-colors ${inWishlist
                                                    ? 'bg-red-50 border-red-200 text-red-500 dark:bg-red-900/20 dark:border-red-800'
                                                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                                                    }`}
                                            >
                                                {inWishlist ? (
                                                    <HeartSolidIcon className="w-5 h-5" />
                                                ) : (
                                                    <HeartIcon className="w-5 h-5" />
                                                )}
                                            </motion.button>

                                            <motion.button
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                                onClick={handleAddToCart}
                                                disabled={isAdding}
                                                className="flex-1 flex items-center justify-center gap-2 py-3 px-6 bg-gradient-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-xl hover:from-amber-600 hover:to-amber-700 transition-all disabled:opacity-50"
                                            >
                                                {isAdding ? (
                                                    <>
                                                        <CheckCircleIcon className="w-5 h-5" />
                                                        Added!
                                                    </>
                                                ) : (
                                                    <>
                                                        <ShoppingCartIcon className="w-5 h-5" />
                                                        Add to Cart
                                                    </>
                                                )}
                                            </motion.button>
                                        </div>

                                        {/* View full details link */}
                                        <button
                                            onClick={handleViewDetails}
                                            className="mt-4 text-center text-sm text-amber-600 dark:text-amber-400 hover:underline"
                                        >
                                            View Full Details →
                                        </button>
                                    </div>
                                </div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

// Hook for managing quick view state
export function useQuickView() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedNote, setSelectedNote] = useState(null);

    const openQuickView = (note) => {
        setSelectedNote(note);
        setIsOpen(true);
    };

    const closeQuickView = () => {
        setIsOpen(false);
        setTimeout(() => setSelectedNote(null), 200);
    };

    return {
        isOpen,
        selectedNote,
        openQuickView,
        closeQuickView,
    };
}
