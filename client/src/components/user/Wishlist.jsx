import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../../context/WishlistContext';
import { useCartStore } from '../../store/cartStore';
import { formatCurrency } from '../../utils/helpers';
import Button from '../common/Button';

const HeartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
    </svg>
);

const TrashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const FileTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const categoryColors = {
    UPSC: '#6366f1',
    SSC: '#10b981',
    BANKING: '#f59e0b',
    STATE_PCS: '#8b5cf6',
    RAILWAY: '#ef4444',
    DEFENCE: '#0ea5e9',
    TEACHING: '#ec4899',
    OTHER: '#64748b',
};

export default function Wishlist() {
    const { items, isOpen, setIsOpen, removeItem } = useWishlist();
    const addToCart = useCartStore((state) => state.addItem);

    const truncate = (str, len = 30) => str?.length > len ? str.substring(0, len) + '...' : str;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-white z-50 flex flex-col shadow-2xl"
                    >
                        {/* Header */}
                        <div className="p-6 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className="text-rose-500"><HeartIcon /></span>
                                <h2 className="text-xl font-bold">Wishlist</h2>
                                <span className="text-sm text-gray-500">({items.length} items)</span>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => setIsOpen(false)}
                                className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"
                            >
                                <CloseIcon />
                            </motion.button>
                        </div>

                        {/* Items */}
                        <div className="flex-1 overflow-auto p-4">
                            {items.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                        <HeartIcon />
                                    </div>
                                    <h3 className="font-semibold text-lg mb-2">Your wishlist is empty</h3>
                                    <p className="text-gray-500 mb-4">Save notes you love for later</p>
                                    <Button onClick={() => { setIsOpen(false); window.location.href = '/notes'; }}>
                                        Browse Notes
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {items.map((note, i) => (
                                        <motion.div
                                            key={note.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: i * 0.05 }}
                                            className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                                        >
                                            <a href={`/notes/${note.slug}`} className="flex gap-4 flex-1">
                                                <div
                                                    className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        background: `${categoryColors[note.category] || '#6366f1'}20`,
                                                        color: categoryColors[note.category] || '#6366f1',
                                                    }}
                                                >
                                                    <FileTextIcon />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-sm text-gray-900 mb-1">
                                                        {truncate(note.title)}
                                                    </h4>
                                                    <p className="text-xs text-gray-500">{note.pageCount} pages</p>
                                                    <p className="font-bold text-indigo-600 text-sm mt-1">
                                                        {formatCurrency(note.pageCount * note.pricePerPage)}
                                                    </p>
                                                </div>
                                            </a>
                                            <div className="flex flex-col gap-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => { addToCart(note); removeItem(note.id); }}
                                                    className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center"
                                                    title="Add to Cart"
                                                >
                                                    <CartIcon />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => removeItem(note.id)}
                                                    className="w-8 h-8 rounded-lg bg-gray-200 text-gray-600 flex items-center justify-center"
                                                    title="Remove"
                                                >
                                                    <TrashIcon />
                                                </motion.button>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
