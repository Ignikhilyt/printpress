import { motion } from 'framer-motion';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { useCartStore } from '../../store/cartStore';
import { useWishlist } from '../../context/WishlistContext';
import { formatCurrency } from '../../utils/helpers';

const FileTextIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const HeartIcon = ({ filled }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
);

const CartIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="9" cy="21" r="1" />
        <circle cx="20" cy="21" r="1" />
        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
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

const categoryLabels = {
    UPSC: 'UPSC',
    SSC: 'SSC',
    BANKING: 'Banking',
    STATE_PCS: 'State PCS',
    RAILWAY: 'Railway',
    DEFENCE: 'Defence',
    TEACHING: 'Teaching',
    OTHER: 'Other',
};

export default function NotePreview({ note, isOpen, onClose }) {
    const addItem = useCartStore((state) => state.addItem);
    const { toggleItem, isInWishlist } = useWishlist();

    if (!isOpen || !note) return null;

    const color = categoryColors[note.category] || '#6366f1';
    const price = note.pageCount * note.pricePerPage;
    const inWishlist = isInWishlist(note.id);

    const truncate = (str, len = 150) => str?.length > len ? str.substring(0, len) + '...' : str;

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Quick View" size="lg">
            <div className="flex gap-8">
                {/* Preview Image */}
                <div
                    className="w-48 h-60 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: `${color}15`, color }}
                >
                    <FileTextIcon />
                </div>

                {/* Details */}
                <div className="flex-1">
                    <Badge
                        className="mb-3"
                        style={{ background: `${color}15`, color }}
                    >
                        {categoryLabels[note.category] || 'Notes'}
                    </Badge>

                    <h2 className="text-2xl font-bold mb-2">{note.title}</h2>
                    <p className="text-gray-600 mb-4">{note.institute?.name}</p>

                    <div className="flex gap-4 mb-4">
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Pages</p>
                            <p className="font-bold">{note.pageCount}</p>
                        </div>
                        <div className="px-4 py-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-500">Subject</p>
                            <p className="font-bold">{note.subject}</p>
                        </div>
                    </div>

                    {note.description && (
                        <p className="text-gray-600 text-sm leading-relaxed mb-6">
                            {truncate(note.description)}
                        </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                        <p className="text-2xl font-extrabold text-indigo-600">
                            {formatCurrency(price)}
                        </p>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => toggleItem(note)}
                            className={inWishlist ? 'text-rose-500' : 'text-gray-400'}
                        >
                            <HeartIcon filled={inWishlist} />
                        </motion.button>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            variant="primary"
                            className="flex-1"
                            onClick={() => { addItem(note); onClose(); }}
                        >
                            <CartIcon />
                            Add to Cart
                        </Button>
                        <a href={`/notes/${note.slug}`} className="flex-1">
                            <Button variant="secondary" className="w-full" onClick={onClose}>
                                View Full Details
                            </Button>
                        </a>
                    </div>
                </div>
            </div>
        </Modal>
    );
}
