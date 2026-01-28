import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import { cn } from '../../utils/helpers';

// ============================================================================
// HERO CONFIGURATION
// ============================================================================

const STATS = [
  { value: '50K+', label: 'Happy Students', icon: '👨‍🎓' },
  { value: '200+', label: 'Study Notes', icon: '📚' },
  { value: '15+', label: 'Partner Institutes', icon: '🏫' },
  { value: '4.9★', label: 'Average Rating', icon: '⭐' },
];

const FEATURES = [
  { icon: '✨', text: 'Premium Quality Print' },
  { icon: '🚚', text: 'Fast Delivery (3-5 days)' },
  { icon: '💯', text: 'Verified Notes Only' },
  { icon: '🔒', text: 'Secure Payments' },
];

const FLOATING_CARDS = [
  {
    id: 1,
    title: 'Indian Polity Notes',
    institute: 'Vision IAS',
    price: '₹675',
    rating: 4.9,
    position: { top: '10%', right: '5%' },
    delay: 0,
  },
  {
    id: 2,
    title: 'Order Delivered!',
    subtitle: 'SSC Complete Set - Delhi',
    type: 'notification',
    position: { bottom: '30%', right: '10%' },
    delay: 0.5,
  },
  {
    id: 3,
    title: 'Fast Delivery',
    subtitle: '3-7 Business Days',
    type: 'badge',
    position: { top: '45%', right: '0%' },
    delay: 1,
  },
];

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  arrowRight: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  play: (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  star: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ),
  book: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  truck: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
    </svg>
  ),
  chevronDown: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
    </svg>
  ),
};

// ============================================================================
// FLOATING CARD COMPONENT
// ============================================================================

const FloatingCard = ({ card, className = '' }) => {
  if (card.type === 'notification') {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ delay: card.delay, duration: 0.5 }}
        className={cn(
          'absolute bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl p-4 hidden lg:block',
          className
        )}
        style={card.position}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
            {Icons.check}
          </div>
          <div>
            <p className="font-semibold text-gray-900 dark:text-white text-sm">{card.title}</p>
            <p className="text-xs text-gray-500">{card.subtitle}</p>
          </div>
        </div>
      </motion.div>
    );
  }

  if (card.type === 'badge') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: card.delay, duration: 0.5 }}
        className={cn(
          'absolute bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl p-3 hidden lg:flex items-center gap-2',
          className
        )}
        style={card.position}
      >
        <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
          {Icons.truck}
        </div>
        <div>
          <p className="font-semibold text-gray-900 dark:text-white text-sm">{card.title}</p>
          <p className="text-xs text-gray-500">{card.subtitle}</p>
        </div>
      </motion.div>
    );
  }

  // Default product card
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: card.delay, duration: 0.5 }}
      whileHover={{ y: -5 }}
      className={cn(
        'absolute bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm rounded-xl shadow-xl p-4 hidden lg:block w-52',
        className
      )}
      style={card.position}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600">
          {Icons.book}
        </div>
        <span className="px-2 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 text-xs font-medium rounded-full">
          Quality Assured
        </span>
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-1">{card.title}</h4>
      <p className="text-xs text-gray-500 mb-2">{card.institute}</p>
      <div className="flex items-center justify-between">
        <span className="font-bold text-gray-900 dark:text-white">{card.price}</span>
        <div className="flex items-center gap-1 text-amber-500">
          {Icons.star}
          <span className="text-xs font-medium">{card.rating}</span>
        </div>
      </div>
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full mt-3 py-2 bg-amber-500 hover:bg-amber-400 text-black font-medium text-sm rounded-lg transition-colors"
      >
        Add to Cart
      </motion.button>
    </motion.div>
  );
};

// ============================================================================
// STAT ITEM
// ============================================================================

const StatItem = ({ stat, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="text-center"
    >
      <div className="text-2xl mb-1">{stat.icon}</div>
      <p className="text-2xl lg:text-3xl font-bold text-white">{stat.value}</p>
      <p className="text-sm text-gray-400">{stat.label}</p>
    </motion.div>
  );
};

// ============================================================================
// ANIMATED BACKGROUND
// ============================================================================

const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 80% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%), linear-gradient(180deg, #0a0a0a 0%, #111827 50%, #0a0a0a 100%)',
        }}
      />

      {/* Animated particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-amber-500/30 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.3, 0.8, 0.3],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
};

// ============================================================================
// SCROLL INDICATOR
// ============================================================================

const ScrollIndicator = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.5 }}
      className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
    >
      <span className="text-xs text-gray-500 uppercase tracking-wider">Scroll to explore</span>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
        className="text-gray-500"
      >
        {Icons.chevronDown}
      </motion.div>
    </motion.div>
  );
};

// ============================================================================
// MAIN HERO SECTION COMPONENT
// ============================================================================

export default function HeroSection({
  title = 'Premium',
  titleHighlight = 'Printed Notes',
  subtitle = 'Delivered Home',
  description = 'Get high-quality study materials from India\'s top coaching institutes printed and delivered to your doorstep. Focus on studying, leave printing to us.',
  showStats = true,
  showFloatingCards = true,
  showScrollIndicator = true,
  className = '',
  ...props
}) {
  const heroRef = useRef(null);
  const isInView = useInView(heroRef, { once: true });
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 500], [0, 150]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0]);

  return (
    <section
      ref={heroRef}
      className={cn(
        'relative min-h-screen flex items-center pt-16 pb-24 overflow-hidden',
        className
      )}
      {...props}
    >
      <AnimatedBackground />

      {/* Floating announcement */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ delay: 0.2 }}
        className="absolute top-20 left-1/2 -translate-x-1/2 z-20"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-full text-sm">
          <span className="animate-pulse">✨</span>
          <span className="text-amber-400">Launching Soon - Limited Time Offers!</span>
        </div>
      </motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div style={{ y, opacity }}>
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6"
            >
              <span className="text-white">{title} </span>
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 bg-clip-text text-transparent">
                {titleHighlight}
              </span>
              <br />
              <span className="text-white">{subtitle}</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="text-lg text-gray-400 mb-8 max-w-lg"
            >
              {description}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap gap-4 mb-10"
            >
              <Link
                to="/notes"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-black font-semibold rounded-xl hover:from-amber-400 hover:to-yellow-400 transition-all shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50"
              >
                Browse Notes
                {Icons.arrowRight}
              </Link>
              <button className="inline-flex items-center gap-2 px-6 py-3.5 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all border border-white/20">
                {Icons.play}
                How It Works
              </button>
            </motion.div>

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ delay: 0.8 }}
              className="grid grid-cols-2 gap-3"
            >
              {FEATURES.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  className="flex items-center gap-2 text-sm text-gray-400"
                >
                  <span>{feature.icon}</span>
                  <span>{feature.text}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right content - Floating cards */}
          {showFloatingCards && (
            <div className="relative hidden lg:block h-[500px]">
              {FLOATING_CARDS.map((card) => (
                <FloatingCard key={card.id} card={card} />
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        {showStats && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1 }}
            className="mt-16 lg:mt-24 grid grid-cols-2 md:grid-cols-4 gap-8 pt-8 border-t border-gray-800"
          >
            {STATS.map((stat, index) => (
              <StatItem key={stat.label} stat={stat} index={index} />
            ))}
          </motion.div>
        )}
      </div>

      {/* Scroll indicator */}
      {showScrollIndicator && <ScrollIndicator />}
    </section>
  );
}

// ============================================================================
// VARIANT EXPORTS
// ============================================================================

export const HeroSectionSimple = (props) => (
  <HeroSection showFloatingCards={false} showStats={false} showScrollIndicator={false} {...props} />
);

export const HeroSectionMinimal = (props) => (
  <HeroSection
    showFloatingCards={false}
    showStats={false}
    showScrollIndicator={false}
    className="min-h-[60vh]"
    {...props}
  />
);

// ============================================================================
// EXPORTS
// ============================================================================

export { FloatingCard, StatItem, AnimatedBackground, ScrollIndicator };