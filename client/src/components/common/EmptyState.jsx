/**
 * EmptyState Component
 * Displays a friendly message when there's no content to show
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Button from './Button';

export default function EmptyState({
    icon: Icon,
    title,
    description,
    action,
    actionLabel,
    actionHref,
    illustration = null,
    className = '',
}) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col items-center justify-center text-center py-12 px-4 ${className}`}
        >
            {/* Icon or Illustration */}
            {illustration ? (
                <div className="w-64 h-64 mb-6">{illustration}</div>
            ) : Icon ? (
                <div className="w-20 h-20 mx-auto mb-6 text-gray-300 dark:text-gray-600">
                    <Icon className="w-full h-full" />
                </div>
            ) : (
                <div className="text-8xl mb-6">📭</div>
            )}

            {/* Title */}
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                {title}
            </h3>

            {/* Description */}
            <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 leading-relaxed">
                {description}
            </p>

            {/* Action Button */}
            {(action || actionHref) && (
                <>
                    {actionHref ? (
                        <Link to={actionHref}>
                            <Button size="lg">{actionLabel || 'Take Action'}</Button>
                        </Link>
                    ) : (
                        <Button onClick={action} size="lg">
                            {actionLabel || 'Take Action'}
                        </Button>
                    )}
                </>
            )}
        </motion.div>
    );
}

// Preset empty states for common scenarios
export const EmptyCart = () => (
    <EmptyState
        title="Your cart is empty"
        description="Looks like you haven't added any notes to your cart yet. Browse our collection and find the perfect study materials for your exam preparation."
        actionLabel="Browse Notes"
        actionHref="/notes"
    />
);

export const EmptyWishlist = () => (
    <EmptyState
        title="No items in wishlist"
        description="Save notes you love for later. Click the heart icon on any note to add it to your wishlist."
        actionLabel="Explore Notes"
        actionHref="/notes"
    />
);

export const EmptySearch = ({ searchQuery }) => (
    <EmptyState
        title="No results found"
        description={
            searchQuery
                ? `We couldn't find any notes matching "${searchQuery}". Try different keywords or browse by category.`
                : "No notes match your search criteria. Try adjusting your filters."
        }
        actionLabel="Clear Filters"
        actionHref="/notes"
    />
);

export const EmptyOrders = () => (
    <EmptyState
        title="No orders yet"
        description="You haven't placed any orders yet. Start shopping for quality study notes and we'll process them within 24-48 hours."
        actionLabel="Start Shopping"
        actionHref="/notes"
    />
);

export const EmptyNotes = () => (
    <EmptyState
        title="No notes available"
        description="We're working on adding more study materials. Check back soon or contact us if you're looking for something specific."
        actionLabel="Contact Us"
        actionHref="/contact"
    />
);
