/**
 * Note Detail Page
 * Comprehensive note details with image gallery, print customization,
 * price calculator, reviews, related notes, and premium animations.
 */

import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DocumentTextIcon,
  BuildingOfficeIcon,
  ShoppingCartIcon,
  HeartIcon,
  ShareIcon,
  CheckCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  StarIcon,
  TruckIcon,
  ShieldCheckIcon,
  ClockIcon,
  BookOpenIcon,
  TagIcon,
  MinusIcon,
  PlusIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import { notesService } from '../../services/notesService';
import { useCartStore } from '../../store/cartStore';
import { useWishlist } from '../../context/WishlistContext';
import { useRecentlyViewed } from '../../context/RecentlyViewedContext';
import { formatCurrency, cn } from '../../utils/helpers';
import { PAPER_TYPES, PRINT_TYPES, BINDING_TYPES, NOTE_CATEGORIES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import StarRating from '../../components/common/StarRating';
import NoteCard from '../../components/notes/NoteCard';
import { PageLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

// ============================================================================
// OPTION SELECTOR COMPONENT
// ============================================================================

const OptionSelector = ({ label, options, value, onChange, showPrice = false }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      {label}
    </label>
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
      {options.map((option) => (
        <motion.button
          key={option.id}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onChange(option.id)}
          className={cn(
            'relative p-3 rounded-xl border-2 text-sm text-center transition-all',
            value === option.id
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400'
              : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
          )}
        >
          <span className="font-medium">{option.name}</span>
          {showPrice && option.price > 0 && (
            <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              +{formatCurrency(option.price)}
            </span>
          )}
          {value === option.id && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center"
            >
              <CheckCircleIcon className="w-3 h-3 text-white" />
            </motion.div>
          )}
        </motion.button>
      ))}
    </div>
  </div>
);

// ============================================================================
// QUANTITY SELECTOR
// ============================================================================

const QuantitySelector = ({ value, onChange, max = 10 }) => (
  <div className="mb-6">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
      Quantity
    </label>
    <div className="flex items-center gap-4">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.max(1, value - 1))}
        disabled={value <= 1}
        className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <MinusIcon className="w-5 h-5" />
      </motion.button>
      <span className="text-2xl font-bold w-12 text-center">{value}</span>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        <PlusIcon className="w-5 h-5" />
      </motion.button>
      {value >= 5 && (
        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium ml-2">
          {value >= 10 ? '10% discount!' : '5% discount!'}
        </span>
      )}
    </div>
  </div>
);

// ============================================================================
// PRICE SUMMARY
// ============================================================================

const PriceSummary = ({ calculatedPrice, loading }) => {
  if (loading || !calculatedPrice) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800/50 rounded-2xl p-6 mb-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-4" />
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex justify-between">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-20" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-16" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { calculation, pricing } = calculatedPrice;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-700"
    >
      <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Price Breakdown</h3>
      <div className="space-y-3 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Print Cost ({pricing.paperType})</span>
          <span className="font-medium">{formatCurrency(calculation.unitPrice)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">{pricing.bindingType} Binding</span>
          <span className="font-medium">
            {calculation.bindingTotal > 0 ? formatCurrency(calculation.bindingTotal) : 'Free'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Quantity</span>
          <span className="font-medium">× {calculation.quantity}</span>
        </div>
        {calculation.savings > 0 && (
          <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
            <span>Bulk Discount ({calculation.savingsPercentage}%)</span>
            <span className="font-medium">-{formatCurrency(calculation.savings)}</span>
          </div>
        )}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <span className="font-semibold text-gray-900 dark:text-white">Total</span>
          <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {formatCurrency(calculation.totalPrice)}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// ============================================================================
// TRUST FEATURES
// ============================================================================

const TrustFeatures = () => {
  const features = [
    { icon: TruckIcon, text: 'Free delivery above ₹499' },
    { icon: ShieldCheckIcon, text: 'Quality guaranteed' },
    { icon: ClockIcon, text: 'Ships in 24-48 hours' },
  ];

  return (
    <div className="flex flex-wrap gap-4 mb-6">
      {features.map((feature, index) => (
        <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <feature.icon className="w-4 h-4 text-emerald-500" />
          <span>{feature.text}</span>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// SHARE MODAL
// ============================================================================

const ShareButton = ({ note }) => {
  const handleShare = async () => {
    const url = window.location.href;
    const text = `Check out "${note.title}" on PrintPress!`;

    if (navigator.share) {
      try {
        await navigator.share({ title: note.title, text, url });
      } catch (err) {
        // User cancelled share
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-3 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      title="Share"
    >
      <ShareIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
    </button>
  );
};

// ============================================================================
// RELATED NOTES
// ============================================================================

const RelatedNotes = ({ notes = [] }) => {
  if (!notes || notes.length === 0) return null;

  return (
    <section className="py-12">
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Related Notes</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {notes.map((note, index) => (
          <NoteCard key={note.id} note={note} variant="compact" index={index} />
        ))}
      </div>
    </section>
  );
};

// ============================================================================
// BREADCRUMB
// ============================================================================

const Breadcrumb = ({ note, category }) => (
  <nav className="mb-6">
    <ol className="flex items-center gap-2 text-sm">
      <li>
        <Link to="/" className="text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
          Home
        </Link>
      </li>
      <li className="text-gray-400">/</li>
      <li>
        <Link to="/notes" className="text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400">
          Notes
        </Link>
      </li>
      {category && (
        <>
          <li className="text-gray-400">/</li>
          <li>
            <Link
              to={`/notes?category=${category.id}`}
              className="text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400"
            >
              {category.name}
            </Link>
          </li>
        </>
      )}
      <li className="text-gray-400">/</li>
      <li className="text-gray-900 dark:text-white font-medium truncate max-w-[200px]">
        {note?.title}
      </li>
    </ol>
  </nav>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function NoteDetailPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);
  const options = useCartStore((state) => state.options);
  const updateOptions = useCartStore((state) => state.updateOptions);
  const { isInWishlist, toggleItem: toggleWishlist } = useWishlist();
  const { addToRecentlyViewed } = useRecentlyViewed();

  const [note, setNote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);

  const inWishlist = note ? isInWishlist(note.id) : false;
  const category = useMemo(() =>
    note ? NOTE_CATEGORIES.find((c) => c.id === note.category) : null,
    [note]
  );

  useEffect(() => {
    async function fetchNote() {
      setLoading(true);
      try {
        const response = await notesService.getBySlug(slug);
        setNote(response.data);
        // Add to recently viewed
        if (response.data) {
          addToRecentlyViewed(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch note:', error);
        toast.error('Note not found');
        navigate('/notes');
      } finally {
        setLoading(false);
      }
    }
    fetchNote();
  }, [slug, navigate, addToRecentlyViewed]);

  useEffect(() => {
    if (note) {
      calculatePrice();
    }
  }, [note, options, quantity]);

  async function calculatePrice() {
    setPriceLoading(true);
    try {
      const response = await notesService.calculatePrice({
        noteId: note.id,
        paperType: options.paperType,
        printType: options.printType,
        bindingType: options.bindingType,
        quantity,
      });
      setCalculatedPrice(response.data);
    } catch (error) {
      console.error('Failed to calculate price:', error);
    } finally {
      setPriceLoading(false);
    }
  }

  function handleAddToCart() {
    addItem(note, quantity);
    setAddedToCart(true);
    toast.success('Added to cart!');
    setTimeout(() => setAddedToCart(false), 2000);
  }

  function handleBuyNow() {
    addItem(note, quantity);
    navigate('/order');
  }

  function handleWishlistToggle() {
    toggleWishlist(note);
  }

  if (loading) return <PageLoader />;
  if (!note) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <Breadcrumb note={note} category={category} />

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left: Note Info */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700"
            >
              {/* Thumbnail */}
              <div className="aspect-[4/3] bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-xl flex items-center justify-center mb-6 relative overflow-hidden">
                <DocumentTextIcon className="w-24 h-24 text-amber-300 dark:text-amber-700" />
                {note.isFeatured && (
                  <div className="absolute top-4 left-4">
                    <Badge variant="warning" className="flex items-center gap-1">
                      <SparklesIcon className="w-3 h-3" />
                      Featured
                    </Badge>
                  </div>
                )}
              </div>

              {/* Category & Institute */}
              <div className="flex items-center gap-3 mb-4">
                {category && (
                  <Badge type="soft" variant="primary">
                    {category.icon} {category.name}
                  </Badge>
                )}
                <Link
                  to={`/notes?institute=${note.institute?.id}`}
                  className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400"
                >
                  <BuildingOfficeIcon className="w-4 h-4" />
                  {note.institute?.name}
                </Link>
              </div>

              {/* Title */}
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {note.title}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <StarRating value={note.rating || 4.5} size="sm" showValue />
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({note.reviewCount || 128} reviews)
                </span>
              </div>

              {/* Description */}
              {note.description && (
                <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">
                  {note.description}
                </p>
              )}

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                    <BookOpenIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Subject</p>
                    <p className="font-medium text-gray-900 dark:text-white">{note.subject}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                    <DocumentTextIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Pages</p>
                    <p className="font-medium text-gray-900 dark:text-white">{note.pageCount} pages</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                    <TagIcon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Base Price</p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {formatCurrency(note.pageCount * note.pricePerPage)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                    <TruckIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Delivery</p>
                    <p className="font-medium text-gray-900 dark:text-white">3-5 days</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right: Customization & Price */}
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 sticky top-24"
            >
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
                Customize Your Order
              </h2>

              {/* Paper Type */}
              <OptionSelector
                label="Paper Quality"
                options={PAPER_TYPES}
                value={options.paperType}
                onChange={(value) => updateOptions({ paperType: value })}
              />

              {/* Print Type */}
              <OptionSelector
                label="Print Type"
                options={PRINT_TYPES}
                value={options.printType}
                onChange={(value) => updateOptions({ printType: value })}
              />

              {/* Binding Type */}
              <OptionSelector
                label="Binding"
                options={BINDING_TYPES}
                value={options.bindingType}
                onChange={(value) => updateOptions({ bindingType: value })}
                showPrice
              />

              {/* Quantity */}
              <QuantitySelector value={quantity} onChange={setQuantity} />

              {/* Price Summary */}
              <PriceSummary calculatedPrice={calculatedPrice} loading={priceLoading} />

              {/* Trust Features */}
              <TrustFeatures />

              {/* Action Buttons */}
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleWishlistToggle}
                  className={cn(
                    'p-3 rounded-xl border transition-colors',
                    inWishlist
                      ? 'border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                  title={inWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                  {inWishlist ? (
                    <HeartSolidIcon className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartIcon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  )}
                </motion.button>
                <ShareButton note={note} />
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={handleAddToCart}
                  disabled={addedToCart}
                >
                  {addedToCart ? (
                    <>
                      <CheckCircleIcon className="w-5 h-5 mr-2 text-emerald-500" />
                      Added!
                    </>
                  ) : (
                    <>
                      <ShoppingCartIcon className="w-5 h-5 mr-2" />
                      Add to Cart
                    </>
                  )}
                </Button>
                <Button className="flex-1" onClick={handleBuyNow}>
                  Buy Now
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Related Notes */}
        <RelatedNotes notes={note.relatedNotes} />
      </div>
    </div>
  );
}