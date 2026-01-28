import { useState, useEffect, useCallback, useRef, forwardRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { cn } from '../../utils/helpers';
import StarRating from '../common/StarRating';

// ============================================================================
// TESTIMONIALS DATA
// ============================================================================

const DEFAULT_TESTIMONIALS = [
    {
        id: 1,
        name: 'Priya Sharma',
        role: 'UPSC Aspirant',
        avatar: null,
        location: 'New Delhi',
        rating: 5,
        title: 'Best study material I ever received!',
        content: 'The print quality is exceptional and the delivery was super fast. The notes are well-organized and easy to understand. Helped me clear my prelims on the first attempt!',
        date: '2 weeks ago',
        verified: true,
        helpful: 42,
        images: [],
        category: 'UPSC',
    },
    {
        id: 2,
        name: 'Rahul Verma',
        role: 'SSC CGL Qualified',
        avatar: null,
        location: 'Mumbai',
        rating: 5,
        title: 'Perfect for competitive exams',
        content: 'I ordered notes for SSC CGL and the content coverage was comprehensive. The binding quality is excellent, pages don\'t come off even after extensive use.',
        date: '1 month ago',
        verified: true,
        helpful: 38,
        images: [],
        category: 'SSC',
    },
    {
        id: 3,
        name: 'Anjali Patel',
        role: 'Bank PO',
        avatar: null,
        location: 'Ahmedabad',
        rating: 5,
        title: 'Cleared SBI PO with these notes',
        content: 'The banking notes were incredibly helpful. Clear concepts, solved examples, and practice questions - everything I needed was in one place. Highly recommended!',
        date: '3 weeks ago',
        verified: true,
        helpful: 55,
        images: [],
        category: 'Banking',
    },
    {
        id: 4,
        name: 'Amit Kumar',
        role: 'State PCS Officer',
        avatar: null,
        location: 'Lucknow',
        rating: 4,
        title: 'Great quality and fast delivery',
        content: 'Ordered UPPCS notes and received them within 3 days. The paper quality is premium and print is clear. Would have loved regional language options.',
        date: '2 months ago',
        verified: true,
        helpful: 29,
        images: [],
        category: 'State PCS',
    },
    {
        id: 5,
        name: 'Sneha Reddy',
        role: 'Teaching Exam Cleared',
        avatar: null,
        location: 'Hyderabad',
        rating: 5,
        title: 'Excellent notes for teaching exams',
        content: 'The CTET and TET notes were comprehensive and up-to-date with the latest syllabus. The diagrams and illustrations made complex topics easy to understand.',
        date: '1 week ago',
        verified: true,
        helpful: 33,
        images: [],
        category: 'Teaching',
    },
    {
        id: 6,
        name: 'Vikram Singh',
        role: 'Railway Officer',
        avatar: null,
        location: 'Jaipur',
        rating: 5,
        title: 'Perfect preparation material',
        content: 'The RRB notes helped me crack multiple railway exams. The question bank section is especially useful for practice. Print quality exceeded expectations!',
        date: '1 month ago',
        verified: true,
        helpful: 47,
        images: [],
        category: 'Railway',
    },
];

// ============================================================================
// TESTIMONIALS STATS
// ============================================================================

const STATS = {
    totalReviews: 2847,
    averageRating: 4.8,
    breakdown: { 5: 1963, 4: 598, 3: 199, 2: 58, 1: 29 },
    recommendRate: 94,
};

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
    quote: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
    ),
    verified: (
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
    ),
    thumbUp: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
        </svg>
    ),
    chevronLeft: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
    ),
    chevronRight: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
    ),
    star: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
    ),
};

// ============================================================================
// AVATAR COMPONENT
// ============================================================================

const Avatar = ({ name, src, size = 'md' }) => {
    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-12 h-12 text-base',
        lg: 'w-16 h-16 text-lg',
    };

    const initials = name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const colors = [
        'bg-amber-500',
        'bg-emerald-500',
        'bg-blue-500',
        'bg-purple-500',
        'bg-pink-500',
        'bg-teal-500',
    ];
    const colorIndex = name.length % colors.length;

    if (src) {
        return (
            <img
                src={src}
                alt={name}
                className={cn('rounded-full object-cover', sizes[size])}
            />
        );
    }

    return (
        <div
            className={cn(
                'rounded-full flex items-center justify-center text-white font-semibold',
                sizes[size],
                colors[colorIndex]
            )}
        >
            {initials}
        </div>
    );
};

// ============================================================================
// SINGLE TESTIMONIAL CARD
// ============================================================================

const TestimonialCard = forwardRef(({
    testimonial,
    variant = 'default', // default, compact, featured
    showHelpful = true,
    onHelpfulClick,
    className = '',
    ...props
}, ref) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const contentRef = useRef(null);
    const [needsExpansion, setNeedsExpansion] = useState(false);

    useEffect(() => {
        if (contentRef.current) {
            setNeedsExpansion(contentRef.current.scrollHeight > contentRef.current.clientHeight);
        }
    }, [testimonial.content]);

    if (variant === 'compact') {
        return (
            <motion.div
                ref={ref}
                whileHover={{ y: -4 }}
                className={cn(
                    'bg-white dark:bg-gray-800 rounded-xl p-5 shadow-lg',
                    'border border-gray-100 dark:border-gray-700',
                    className
                )}
                {...props}
            >
                <div className="flex items-center gap-3 mb-3">
                    <Avatar name={testimonial.name} src={testimonial.avatar} size="sm" />
                    <div>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {testimonial.name}
                        </p>
                        <StarRating rating={testimonial.rating} size="xs" />
                    </div>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3">
                    "{testimonial.content}"
                </p>
            </motion.div>
        );
    }

    if (variant === 'featured') {
        return (
            <motion.div
                ref={ref}
                className={cn(
                    'relative bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20',
                    'rounded-2xl p-8 shadow-xl border border-amber-200 dark:border-amber-800',
                    className
                )}
                {...props}
            >
                <div className="absolute -top-4 -left-4 text-amber-400/30">
                    {Icons.quote}
                </div>

                <div className="flex items-start gap-4 mb-6">
                    <Avatar name={testimonial.name} src={testimonial.avatar} size="lg" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-bold text-gray-900 dark:text-white text-lg">
                                {testimonial.name}
                            </h4>
                            {testimonial.verified && (
                                <span className="text-amber-500" title="Verified Purchase">
                                    {Icons.verified}
                                </span>
                            )}
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                            {testimonial.role} • {testimonial.location}
                        </p>
                        <StarRating rating={testimonial.rating} size="sm" className="mt-2" />
                    </div>
                </div>

                <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
                    {testimonial.title}
                </h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                    "{testimonial.content}"
                </p>

                <div className="flex items-center justify-between mt-6 pt-4 border-t border-amber-200 dark:border-amber-800">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.date}
                    </span>
                    {showHelpful && (
                        <button
                            onClick={() => onHelpfulClick?.(testimonial.id)}
                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        >
                            {Icons.thumbUp}
                            <span>Helpful ({testimonial.helpful})</span>
                        </button>
                    )}
                </div>
            </motion.div>
        );
    }

    // Default variant
    return (
        <motion.div
            ref={ref}
            whileHover={{ y: -4 }}
            className={cn(
                'bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg',
                'border border-gray-100 dark:border-gray-700',
                'transition-shadow hover:shadow-xl',
                className
            )}
            {...props}
        >
            <div className="flex items-start gap-4 mb-4">
                <Avatar name={testimonial.name} src={testimonial.avatar} />
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white truncate">
                            {testimonial.name}
                        </h4>
                        {testimonial.verified && (
                            <span className="flex-shrink-0 text-amber-500" title="Verified Purchase">
                                {Icons.verified}
                            </span>
                        )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.role}
                    </p>
                    <StarRating rating={testimonial.rating} size="xs" className="mt-1" />
                </div>
            </div>

            {testimonial.title && (
                <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                    {testimonial.title}
                </h5>
            )}

            <div className="relative">
                <p
                    ref={contentRef}
                    className={cn(
                        'text-gray-600 dark:text-gray-400 text-sm leading-relaxed',
                        !isExpanded && 'line-clamp-3'
                    )}
                >
                    {testimonial.content}
                </p>
                {needsExpansion && (
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-amber-600 dark:text-amber-400 text-sm font-medium mt-1 hover:underline"
                    >
                        {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                )}
            </div>

            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
                <span className="text-xs text-gray-400 dark:text-gray-500">
                    {testimonial.date}
                </span>
                {showHelpful && (
                    <button
                        onClick={() => onHelpfulClick?.(testimonial.id)}
                        className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                    >
                        {Icons.thumbUp}
                        <span>{testimonial.helpful}</span>
                    </button>
                )}
            </div>
        </motion.div>
    );
});

TestimonialCard.displayName = 'TestimonialCard';

// ============================================================================
// TESTIMONIALS SLIDER
// ============================================================================

const TestimonialsSlider = ({
    testimonials = DEFAULT_TESTIMONIALS,
    autoPlay = true,
    autoPlayInterval = 5000,
    showDots = true,
    showArrows = true,
    className = '',
}) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, [testimonials.length]);

    const prevSlide = useCallback(() => {
        setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
    }, [testimonials.length]);

    useEffect(() => {
        if (!autoPlay || isPaused) return;

        const interval = setInterval(nextSlide, autoPlayInterval);
        return () => clearInterval(interval);
    }, [autoPlay, autoPlayInterval, isPaused, nextSlide]);

    return (
        <div
            className={cn('relative', className)}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            <div className="overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentIndex}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TestimonialCard
                            testimonial={testimonials[currentIndex]}
                            variant="featured"
                        />
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Navigation arrows */}
            {showArrows && (
                <>
                    <button
                        onClick={prevSlide}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 lg:-translate-x-6 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        aria-label="Previous testimonial"
                    >
                        {Icons.chevronLeft}
                    </button>
                    <button
                        onClick={nextSlide}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 lg:translate-x-6 p-2 rounded-full bg-white dark:bg-gray-800 shadow-lg text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        aria-label="Next testimonial"
                    >
                        {Icons.chevronRight}
                    </button>
                </>
            )}

            {/* Dots */}
            {showDots && (
                <div className="flex items-center justify-center gap-2 mt-6">
                    {testimonials.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={cn(
                                'w-2 h-2 rounded-full transition-all',
                                index === currentIndex
                                    ? 'w-6 bg-amber-500'
                                    : 'bg-gray-300 dark:bg-gray-600 hover:bg-amber-300'
                            )}
                            aria-label={`Go to testimonial ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// TESTIMONIALS GRID
// ============================================================================

const TestimonialsGrid = ({
    testimonials = DEFAULT_TESTIMONIALS,
    columns = 3,
    limit = 6,
    animated = true,
    className = '',
}) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const gridCols = {
        1: 'grid-cols-1',
        2: 'grid-cols-1 md:grid-cols-2',
        3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
        4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    };

    return (
        <div
            ref={ref}
            className={cn('grid gap-6', gridCols[columns] || gridCols[3], className)}
        >
            {testimonials.slice(0, limit).map((testimonial, index) => (
                <motion.div
                    key={testimonial.id}
                    initial={animated ? { opacity: 0, y: 30 } : false}
                    animate={animated && isInView ? { opacity: 1, y: 0 } : false}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                >
                    <TestimonialCard testimonial={testimonial} />
                </motion.div>
            ))}
        </div>
    );
};

// ============================================================================
// TESTIMONIALS STATS HEADER
// ============================================================================

const TestimonialsStats = ({ stats = STATS, className = '' }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className={cn(
                'flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16',
                className
            )}
        >
            {/* Average rating */}
            <div className="text-center">
                <div className="flex items-center justify-center gap-2">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                        {stats.averageRating}
                    </span>
                    <span className="text-amber-500">{Icons.star}</span>
                </div>
                <StarRating rating={stats.averageRating} size="sm" className="justify-center mt-2" />
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Based on {stats.totalReviews.toLocaleString()} reviews
                </p>
            </div>

            {/* Divider */}
            <div className="hidden md:block w-px h-20 bg-gray-200 dark:bg-gray-700" />

            {/* Recommendation rate */}
            <div className="text-center">
                <div className="text-4xl font-bold text-emerald-500">
                    {stats.recommendRate}%
                </div>
                <p className="text-gray-500 dark:text-gray-400 mt-1">
                    Would recommend
                </p>
            </div>
        </motion.div>
    );
};

// ============================================================================
// MAIN TESTIMONIALS COMPONENT
// ============================================================================

export default function Testimonials({
    testimonials = DEFAULT_TESTIMONIALS,
    variant = 'slider', // slider, grid, featured
    showStats = true,
    title = 'What Our Students Say',
    subtitle = 'Join thousands of successful aspirants who trust PrintPress for their study materials',
    className = '',
    ...props
}) {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    return (
        <section
            ref={sectionRef}
            className={cn(
                'py-16 lg:py-24 bg-gray-50 dark:bg-gray-900',
                className
            )}
            {...props}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="text-center mb-12"
                >
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Stats */}
                {showStats && (
                    <TestimonialsStats className="mb-12" />
                )}

                {/* Content based on variant */}
                {variant === 'slider' && (
                    <div className="max-w-3xl mx-auto">
                        <TestimonialsSlider testimonials={testimonials} />
                    </div>
                )}

                {variant === 'grid' && (
                    <TestimonialsGrid testimonials={testimonials} />
                )}

                {variant === 'featured' && (
                    <div className="grid gap-8 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            <TestimonialCard
                                testimonial={testimonials[0]}
                                variant="featured"
                            />
                        </div>
                        <div className="space-y-4">
                            {testimonials.slice(1, 4).map((t) => (
                                <TestimonialCard
                                    key={t.id}
                                    testimonial={t}
                                    variant="compact"
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { TestimonialCard, TestimonialsSlider, TestimonialsGrid, TestimonialsStats };
