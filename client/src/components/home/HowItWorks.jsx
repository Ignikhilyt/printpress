import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { cn } from '../../utils/helpers';

// ============================================================================
// HOW IT WORKS STEPS DATA
// ============================================================================

const DEFAULT_STEPS = [
    {
        id: 1,
        number: '01',
        title: 'Browse & Select Notes',
        description: 'Explore our extensive collection of study materials from top coaching institutes. Filter by exam category, subject, or coaching center to find exactly what you need.',
        features: [
            'Notes from 50+ coaching institutes',
            'Filter by exam, subject, topic',
            'Preview sample pages before ordering',
            'Read reviews from other students',
        ],
        icon: 'search',
        color: 'amber',
    },
    {
        id: 2,
        number: '02',
        title: 'Customize Your Order',
        description: 'Personalize your notes with our printing options. Choose paper quality, binding style, and other preferences to get exactly what works best for your study habits.',
        features: [
            'Premium paper quality options',
            'Spiral or perfect binding',
            'Color or black & white printing',
            'Add notes margins or highlights',
        ],
        icon: 'customize',
        color: 'emerald',
    },
    {
        id: 3,
        number: '03',
        title: 'Secure Checkout',
        description: 'Complete your purchase with our secure payment gateway. We support multiple payment methods including UPI, cards, net banking, and cash on delivery.',
        features: [
            'Multiple payment options',
            'Secure encrypted transactions',
            'Apply discount codes',
            'Cash on delivery available',
        ],
        icon: 'payment',
        color: 'blue',
    },
    {
        id: 4,
        number: '04',
        title: 'Fast Delivery',
        description: 'Sit back and relax! Your professionally printed notes will be delivered right to your doorstep. Track your order in real-time and get updates via SMS.',
        features: [
            'Delivery in 3-5 business days',
            'Real-time order tracking',
            'SMS & email updates',
            'Free delivery above ₹499',
        ],
        icon: 'delivery',
        color: 'purple',
    },
];

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
    search: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
    ),
    customize: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
    ),
    payment: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
    ),
    delivery: (
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
    ),
    check: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
    ),
    arrow: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
    ),
    play: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
        </svg>
    ),
};

// ============================================================================
// COLOR CONFIGURATIONS
// ============================================================================

const COLORS = {
    amber: {
        bg: 'bg-amber-100 dark:bg-amber-900/30',
        text: 'text-amber-600 dark:text-amber-400',
        border: 'border-amber-200 dark:border-amber-800',
        gradient: 'from-amber-500 to-yellow-500',
        ring: 'ring-amber-500/30',
    },
    emerald: {
        bg: 'bg-emerald-100 dark:bg-emerald-900/30',
        text: 'text-emerald-600 dark:text-emerald-400',
        border: 'border-emerald-200 dark:border-emerald-800',
        gradient: 'from-emerald-500 to-teal-500',
        ring: 'ring-emerald-500/30',
    },
    blue: {
        bg: 'bg-blue-100 dark:bg-blue-900/30',
        text: 'text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        gradient: 'from-blue-500 to-cyan-500',
        ring: 'ring-blue-500/30',
    },
    purple: {
        bg: 'bg-purple-100 dark:bg-purple-900/30',
        text: 'text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        gradient: 'from-purple-500 to-pink-500',
        ring: 'ring-purple-500/30',
    },
};

// ============================================================================
// STEP CARD COMPONENT
// ============================================================================

const StepCard = ({
    step,
    index,
    isActive = false,
    variant = 'default', // default, horizontal, minimal
    onClick,
    className = '',
}) => {
    const cardRef = useRef(null);
    const isInView = useInView(cardRef, { once: true, margin: '-50px' });
    const colorConfig = COLORS[step.color] || COLORS.amber;
    const IconComponent = Icons[step.icon] || Icons.search;

    if (variant === 'horizontal') {
        return (
            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.15, duration: 0.5 }}
                whileHover={{ y: -4 }}
                onClick={onClick}
                className={cn(
                    'relative flex flex-col md:flex-row gap-6 p-6 rounded-2xl transition-all cursor-pointer',
                    'bg-white dark:bg-gray-800 border',
                    isActive ? `${colorConfig.border} shadow-lg ${colorConfig.ring} ring-4` : 'border-gray-200 dark:border-gray-700 shadow-md',
                    className
                )}
            >
                {/* Number badge */}
                <div className={cn(
                    'absolute -top-3 -left-3 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold',
                    'bg-gradient-to-r text-white shadow-lg',
                    colorConfig.gradient
                )}>
                    {step.number}
                </div>

                {/* Icon */}
                <div className={cn(
                    'flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center',
                    colorConfig.bg,
                    colorConfig.text
                )}>
                    {IconComponent}
                </div>

                {/* Content */}
                <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                        {step.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {step.description}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {step.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <span className={colorConfig.text}>{Icons.check}</span>
                                {feature}
                            </li>
                        ))}
                    </ul>
                </div>
            </motion.div>
        );
    }

    if (variant === 'minimal') {
        return (
            <motion.div
                ref={cardRef}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className={cn('text-center', className)}
            >
                <div className={cn(
                    'w-20 h-20 mx-auto rounded-2xl flex items-center justify-center mb-4',
                    colorConfig.bg,
                    colorConfig.text
                )}>
                    {IconComponent}
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {step.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {step.description.slice(0, 100)}...
                </p>
            </motion.div>
        );
    }

    // Default variant
    return (
        <motion.div
            ref={cardRef}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.15, duration: 0.5 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className={cn(
                'relative bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg',
                'border border-gray-100 dark:border-gray-700',
                'transition-shadow hover:shadow-2xl',
                className
            )}
        >
            {/* Step number */}
            <div className={cn(
                'absolute -top-4 left-8 px-4 py-1 rounded-full text-sm font-bold',
                'bg-gradient-to-r text-white shadow-md',
                colorConfig.gradient
            )}>
                Step {step.number}
            </div>

            {/* Icon */}
            <div className={cn(
                'w-16 h-16 rounded-xl flex items-center justify-center mb-6 mt-2',
                colorConfig.bg,
                colorConfig.text
            )}>
                {IconComponent}
            </div>

            {/* Content */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                {step.title}
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
                {step.description}
            </p>

            {/* Features list */}
            <ul className="space-y-2">
                {step.features.map((feature, i) => (
                    <motion.li
                        key={i}
                        initial={{ opacity: 0, x: -10 }}
                        animate={isInView ? { opacity: 1, x: 0 } : {}}
                        transition={{ delay: index * 0.15 + i * 0.05 + 0.3 }}
                        className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                    >
                        <span className={cn('flex-shrink-0 mt-0.5', colorConfig.text)}>
                            {Icons.check}
                        </span>
                        {feature}
                    </motion.li>
                ))}
            </ul>
        </motion.div>
    );
};

// ============================================================================
// TIMELINE CONNECTOR
// ============================================================================

const TimelineConnector = ({ isActive = false, color = 'amber' }) => {
    const colorConfig = COLORS[color] || COLORS.amber;

    return (
        <div className="hidden lg:flex items-center justify-center">
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    'h-1 w-16 rounded-full origin-left',
                    isActive ? `bg-gradient-to-r ${colorConfig.gradient}` : 'bg-gray-200 dark:bg-gray-700'
                )}
            />
            <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
                className={cn(
                    'w-3 h-3 rounded-full',
                    isActive ? `bg-gradient-to-r ${colorConfig.gradient}` : 'bg-gray-300 dark:bg-gray-600'
                )}
            />
            <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className={cn(
                    'h-1 w-16 rounded-full origin-left',
                    'bg-gray-200 dark:bg-gray-700'
                )}
            />
        </div>
    );
};

// ============================================================================
// INTERACTIVE STEPS (Tabs)
// ============================================================================

const InteractiveSteps = ({ steps = DEFAULT_STEPS, className = '' }) => {
    const [activeStep, setActiveStep] = useState(0);

    return (
        <div className={cn('grid lg:grid-cols-2 gap-8 lg:gap-12', className)}>
            {/* Steps navigation */}
            <div className="space-y-4">
                {steps.map((step, index) => {
                    const colorConfig = COLORS[step.color] || COLORS.amber;
                    const isActive = index === activeStep;

                    return (
                        <motion.button
                            key={step.id}
                            onClick={() => setActiveStep(index)}
                            whileHover={{ x: 4 }}
                            className={cn(
                                'w-full text-left p-4 rounded-xl transition-all',
                                'flex items-center gap-4',
                                isActive
                                    ? `${colorConfig.bg} ${colorConfig.border} border-2`
                                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            )}
                        >
                            <div className={cn(
                                'flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold',
                                isActive
                                    ? `bg-gradient-to-r ${colorConfig.gradient} text-white`
                                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                            )}>
                                {step.number}
                            </div>
                            <div>
                                <h4 className={cn(
                                    'font-semibold',
                                    isActive ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                                )}>
                                    {step.title}
                                </h4>
                                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                                    {step.description}
                                </p>
                            </div>
                            <div className={cn(
                                'ml-auto transition-transform',
                                isActive && 'rotate-90'
                            )}>
                                {Icons.arrow}
                            </div>
                        </motion.button>
                    );
                })}
            </div>

            {/* Active step details */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeStep}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                >
                    <StepCard
                        step={steps[activeStep]}
                        index={0}
                        isActive={true}
                        variant="horizontal"
                    />
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

// ============================================================================
// VIDEO CTA SECTION
// ============================================================================

const VideoCTA = ({ className = '' }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
                'relative rounded-2xl overflow-hidden',
                'bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500',
                'p-8 md:p-12',
                className
            )}
        >
            <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                {/* Play button */}
                <button
                    onClick={() => setIsPlaying(true)}
                    className="flex-shrink-0 w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors group"
                >
                    <motion.span
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="w-12 h-12 rounded-full bg-white flex items-center justify-center text-amber-600 shadow-lg group-hover:shadow-xl"
                    >
                        {Icons.play}
                    </motion.span>
                </button>

                {/* Text */}
                <div className="text-center md:text-left">
                    <h3 className="text-2xl md:text-3xl font-bold text-black mb-2">
                        See How It Works
                    </h3>
                    <p className="text-black/80 mb-4">
                        Watch our 2-minute video tutorial to learn how easy it is to order printed notes.
                    </p>
                    <Link
                        to="/notes"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-semibold hover:bg-gray-900 transition-colors"
                    >
                        Start Ordering Now
                        {Icons.arrow}
                    </Link>
                </div>
            </div>

            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0" style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
            </div>
        </motion.div>
    );
};

// ============================================================================
// MAIN HOW IT WORKS COMPONENT
// ============================================================================

export default function HowItWorks({
    steps = DEFAULT_STEPS,
    variant = 'default', // default, grid, timeline, interactive
    showVideoCTA = true,
    title = 'How It Works',
    subtitle = 'Get your study materials in 4 simple steps',
    className = '',
    ...props
}) {
    const sectionRef = useRef(null);
    const isInView = useInView(sectionRef, { once: true, margin: '-100px' });

    return (
        <section
            ref={sectionRef}
            className={cn(
                'py-16 lg:py-24 bg-white dark:bg-gray-900',
                className
            )}
            {...props}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    className="text-center mb-12 lg:mb-16"
                >
                    <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                        {title}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-lg">
                        {subtitle}
                    </p>
                </motion.div>

                {/* Content based on variant */}
                {variant === 'grid' && (
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <StepCard key={step.id} step={step} index={index} />
                        ))}
                    </div>
                )}

                {variant === 'timeline' && (
                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-center gap-4">
                        {steps.map((step, index) => (
                            <div key={step.id} className="flex items-center">
                                <StepCard step={step} index={index} variant="minimal" />
                                {index < steps.length - 1 && (
                                    <TimelineConnector color={step.color} isActive={true} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {variant === 'interactive' && (
                    <InteractiveSteps steps={steps} />
                )}

                {variant === 'default' && (
                    <div className="space-y-8">
                        {steps.map((step, index) => (
                            <StepCard
                                key={step.id}
                                step={step}
                                index={index}
                                variant="horizontal"
                            />
                        ))}
                    </div>
                )}

                {/* Video CTA */}
                {showVideoCTA && (
                    <VideoCTA className="mt-16" />
                )}
            </div>
        </section>
    );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { StepCard, InteractiveSteps, VideoCTA, TimelineConnector };
