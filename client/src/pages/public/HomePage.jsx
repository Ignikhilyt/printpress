/**
 * HomePage
 * Ultimate premium landing page with 15+ sections including hero,
 * features, partners, categories, testimonials, pricing, FAQ,
 * stats, newsletter, and much more with advanced animations.
 */

import { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import {
  AcademicCapIcon,
  ClockIcon,
  ShieldCheckIcon,
  TruckIcon,
  SparklesIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  ChatBubbleLeftRightIcon,
  PlayIcon,
  BookOpenIcon,
  UserGroupIcon,
  GlobeAltIcon,
  HeartIcon,
  BoltIcon,
  TagIcon,
  GiftIcon,
  PhoneIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ArrowTrendingUpIcon,
  CheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';
import HeroSection from '../../components/home/HeroSection';
import FeaturedNotes from '../../components/home/FeaturedNotes';
import Testimonials from '../../components/home/Testimonials';
import HowItWorks from '../../components/home/HowItWorks';
import RecentlyViewed from '../../components/home/RecentlyViewed';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { cn, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

// ============================================================================
// DATA CONSTANTS
// ============================================================================

const FEATURES = [
  { icon: AcademicCapIcon, title: 'Top Institutes', description: 'Notes from Vision IAS, Vajiram & Ravi, Drishti IAS, and 15+ more.', color: 'from-blue-500 to-indigo-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
  { icon: ShieldCheckIcon, title: 'Quality Assured', description: 'Premium paper with professional binding. Every print checked for quality.', color: 'from-emerald-500 to-teal-600', bgColor: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { icon: TruckIcon, title: 'Pan-India Delivery', description: 'Fast delivery across all pin codes in India. Real-time tracking.', color: 'from-amber-500 to-orange-600', bgColor: 'bg-amber-50 dark:bg-amber-900/20' },
  { icon: ClockIcon, title: 'Quick Turnaround', description: 'Orders processed within 24-48 hours. Delivered in 3-5 days.', color: 'from-purple-500 to-pink-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' },
  { icon: CurrencyRupeeIcon, title: 'Best Prices', description: 'Competitive pricing with bulk discounts. Free delivery on ₹499+.', color: 'from-rose-500 to-red-600', bgColor: 'bg-rose-50 dark:bg-rose-900/20' },
  { icon: HeartIcon, title: 'Student First', description: 'Built for students, by educators. 24/7 customer support.', color: 'from-cyan-500 to-blue-600', bgColor: 'bg-cyan-50 dark:bg-cyan-900/20' },
];

const CATEGORIES = [
  { name: 'UPSC', count: 150, color: 'from-blue-500 to-blue-600', icon: '🏛️', description: 'Civil Services Exam', popular: true },
  { name: 'SSC', count: 80, color: 'from-emerald-500 to-emerald-600', icon: '📋', description: 'Staff Selection', popular: true },
  { name: 'Banking', count: 60, color: 'from-amber-500 to-amber-600', icon: '🏦', description: 'Bank PO/Clerk', popular: false },
  { name: 'State PCS', count: 45, color: 'from-purple-500 to-purple-600', icon: '🗺️', description: 'State Services', popular: false },
  { name: 'Railway', count: 30, color: 'from-red-500 to-red-600', icon: '🚂', description: 'RRB Exams', popular: false },
  { name: 'Defence', count: 25, color: 'from-indigo-500 to-indigo-600', icon: '🛡️', description: 'NDA/CDS', popular: false },
  { name: 'Teaching', count: 40, color: 'from-pink-500 to-pink-600', icon: '👩‍🏫', description: 'CTET/TET', popular: false },
  { name: 'Law', count: 20, color: 'from-teal-500 to-teal-600', icon: '⚖️', description: 'CLAT/Judiciary', popular: false },
];

const STATS = [
  { value: '50,000+', label: 'Happy Students', icon: '👨‍🎓', suffix: '' },
  { value: '200+', label: 'Study Notes', icon: '📚', suffix: '' },
  { value: '15+', label: 'Partner Institutes', icon: '🏫', suffix: '' },
  { value: '99.5%', label: 'Satisfaction Rate', icon: '⭐', suffix: '' },
  { value: '10+', label: 'Cities Covered', icon: '🌆', suffix: '' },
  { value: '24/7', label: 'Customer Support', icon: '💬', suffix: '' },
];

const PARTNERS = [
  { name: 'Vision IAS', logo: '🎯' },
  { name: 'Vajiram & Ravi', logo: '📘' },
  { name: 'Drishti IAS', logo: '👁️' },
  { name: 'Forum IAS', logo: '📊' },
  { name: 'Insights IAS', logo: '💡' },
  { name: 'Shankar IAS', logo: '🏆' },
  { name: 'GS Score', logo: '📈' },
  { name: 'Next IAS', logo: '🚀' },
];

const PRICING_PLANS = [
  { name: 'Standard', price: 3, unit: '/page', features: ['70 GSM Paper', 'B&W Printing', 'Staple Binding', 'Standard Delivery'], popular: false, color: 'gray' },
  { name: 'Premium', price: 4, unit: '/page', features: ['80 GSM Paper', 'B&W Printing', 'Spiral Binding', 'Free Delivery 499+'], popular: true, color: 'amber' },
  { name: 'Elite', price: 10, unit: '/page', features: ['100 GSM Paper', 'Color Printing', 'Hardcover Binding', 'Express Delivery'], popular: false, color: 'purple' },
];

const HOMEPAGE_FAQ = [
  { q: 'How long does delivery take?', a: 'Standard delivery takes 5-7 business days. Express delivery is available in 2-3 days.' },
  { q: 'Do you deliver across India?', a: 'Yes! We deliver to all major cities and towns across India through trusted courier partners.' },
  { q: 'What payment methods are accepted?', a: 'We accept all major credit/debit cards, UPI, net banking, and cash on delivery.' },
  { q: 'Can I get bulk discounts?', a: 'Yes! 5% off on 5+ items, 10% off on 10+ items. Contact us for custom bulk quotes.' },
];

const TRUST_BADGES = [
  { icon: ShieldCheckIcon, label: 'Secure Payments' },
  { icon: TruckIcon, label: 'Pan-India Delivery' },
  { icon: ClockIcon, label: '24/7 Support' },
  { icon: CurrencyRupeeIcon, label: 'Easy Returns' },
  { icon: CheckCircleIcon, label: '100% Authentic' },
];

// ============================================================================
// ANIMATED SECTION WRAPPER
// ============================================================================

const AnimatedSection = ({ children, className = '', delay = 0 }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

const SectionHeader = ({ badge, title, description, align = 'center', dark = false }) => (
  <div className={cn('mb-12', align === 'center' && 'text-center')}>
    {badge && (
      <motion.span
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4',
          dark
            ? 'bg-amber-500/20 text-amber-400'
            : 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400'
        )}
      >
        {badge}
      </motion.span>
    )}
    <h2 className={cn(
      'text-3xl lg:text-4xl font-bold mb-4',
      dark ? 'text-white' : 'text-gray-900 dark:text-white'
    )}>{title}</h2>
    {description && (
      <p className={cn(
        'text-lg max-w-2xl',
        align === 'center' && 'mx-auto',
        dark ? 'text-gray-400' : 'text-gray-600 dark:text-gray-400'
      )}>
        {description}
      </p>
    )}
  </div>
);

// ============================================================================
// ANIMATED COUNTER
// ============================================================================

const AnimatedCounter = ({ value, suffix = '' }) => {
  const [displayValue, setDisplayValue] = useState('0');
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (isInView) {
      setDisplayValue(value);
    }
  }, [isInView, value]);

  return <span ref={ref}>{displayValue}{suffix}</span>;
};

// ============================================================================
// FEATURE CARD
// ============================================================================

const FeatureCard = ({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.1 }}
    whileHover={{ y: -8, scale: 1.02 }}
    className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all overflow-hidden"
  >
    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br opacity-5 rounded-bl-full"
      style={{ backgroundImage: `linear-gradient(to bottom right, var(--tw-gradient-stops))` }} />
    <div className={cn('w-14 h-14 rounded-xl flex items-center justify-center mb-5', feature.bgColor)}>
      <feature.icon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
      {feature.title}
    </h3>
    <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
      {feature.description}
    </p>
  </motion.div>
);

// ============================================================================
// CATEGORY CARD
// ============================================================================

const CategoryCard = ({ category, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    whileInView={{ opacity: 1, scale: 1 }}
    viewport={{ once: true }}
    transition={{ delay: index * 0.05 }}
  >
    <Link
      to={`/notes?category=${category.name.toUpperCase().replace(' ', '_')}`}
      className="group block bg-white dark:bg-gray-800 rounded-2xl p-5 text-center shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-xl hover:border-amber-200 dark:hover:border-amber-800 transition-all relative overflow-hidden"
    >
      {category.popular && (
        <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500 text-white text-[10px] font-bold rounded-full">
          Popular
        </span>
      )}
      <motion.div
        whileHover={{ scale: 1.1, rotate: 5 }}
        transition={{ type: 'spring', stiffness: 300 }}
        className={cn(
          'w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center text-2xl shadow-lg bg-gradient-to-br',
          category.color
        )}
      >
        {category.icon}
      </motion.div>
      <h3 className="font-semibold text-gray-900 dark:text-white mb-0.5 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
        {category.name}
      </h3>
      <p className="text-[11px] text-gray-500 dark:text-gray-400 mb-1">{category.description}</p>
      <p className="text-xs font-medium text-amber-600 dark:text-amber-400">{category.count}+ Notes</p>
    </Link>
  </motion.div>
);

// ============================================================================
// STATS SECTION - ENHANCED
// ============================================================================

const StatsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionHeader
          dark
          badge={<><ArrowTrendingUpIcon className="w-4 h-4" />Our Impact</>}
          title="Trusted by Thousands of Students"
          description="Join our growing community of successful aspirants"
        />
        <div ref={ref} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {STATS.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: index * 0.1 }}
              className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10"
            >
              <span className="text-3xl mb-2 block">{stat.icon}</span>
              <p className="text-2xl lg:text-3xl font-bold text-white mb-1">
                <AnimatedCounter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-gray-400 text-sm">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// PARTNERS SECTION
// ============================================================================

const PartnersSection = () => (
  <section className="py-16 bg-white dark:bg-gray-800 border-y border-gray-100 dark:border-gray-700">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-8">
        Trusted by students from top coaching institutes
      </p>
      <div className="flex flex-wrap items-center justify-center gap-8">
        {PARTNERS.map((partner, index) => (
          <motion.div
            key={partner.name}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05 }}
            whileHover={{ scale: 1.1 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600"
          >
            <span className="text-2xl">{partner.logo}</span>
            <span className="font-medium text-gray-700 dark:text-gray-300 text-sm">{partner.name}</span>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

// ============================================================================
// PRICING SECTION
// ============================================================================

const PricingSection = () => (
  <section className="py-20 bg-gray-50 dark:bg-gray-900">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <SectionHeader
        badge={<><TagIcon className="w-4 h-4" />Transparent Pricing</>}
        title="Simple, Fair Pricing"
        description="Pay per page, no hidden charges. Choose the quality that fits your needs."
      />
      <div className="grid md:grid-cols-3 gap-6">
        {PRICING_PLANS.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -8 }}
            className={cn(
              'relative rounded-2xl p-6 border transition-all',
              plan.popular
                ? 'bg-gradient-to-br from-amber-500 to-amber-600 border-amber-500 shadow-xl shadow-amber-500/20'
                : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-xl'
            )}
          >
            {plan.popular && (
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-black text-white text-xs font-bold rounded-full">
                Most Popular
              </span>
            )}
            <h3 className={cn(
              'text-xl font-bold mb-2',
              plan.popular ? 'text-black' : 'text-gray-900 dark:text-white'
            )}>{plan.name}</h3>
            <div className={cn('mb-4', plan.popular ? 'text-black' : 'text-gray-900 dark:text-white')}>
              <span className="text-4xl font-bold">₹{plan.price}</span>
              <span className="text-sm opacity-70">{plan.unit}</span>
            </div>
            <ul className="space-y-2 mb-6">
              {plan.features.map((feature, i) => (
                <li key={i} className={cn(
                  'flex items-center gap-2 text-sm',
                  plan.popular ? 'text-black/80' : 'text-gray-600 dark:text-gray-400'
                )}>
                  <CheckIcon className="w-4 h-4 flex-shrink-0" />
                  {feature}
                </li>
              ))}
            </ul>
            <Link to="/notes">
              <Button
                className={cn('w-full', plan.popular && 'bg-black text-white hover:bg-gray-900')}
                variant={plan.popular ? 'primary' : 'outline'}
              >
                Browse Notes
              </Button>
            </Link>
          </motion.div>
        ))}
      </div>
      <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-8">
        <GiftIcon className="w-4 h-4 inline mr-1" />
        First-time customers get 10% off with code <strong className="text-amber-600">WELCOME10</strong>
      </p>
    </div>
  </section>
);

// ============================================================================
// FAQ SECTION
// ============================================================================

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section className="py-20 bg-white dark:bg-gray-800">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          badge={<><ChatBubbleLeftRightIcon className="w-4 h-4" />FAQ</>}
          title="Got Questions?"
          description="Here are some common questions from our students"
        />
        <div className="space-y-3">
          {HOMEPAGE_FAQ.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-gray-50 dark:bg-gray-900/50 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-4 text-left"
              >
                <span className="font-medium text-gray-900 dark:text-white">{faq.q}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <ChevronDownIcon className="w-5 h-5 text-gray-500" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <p className="px-4 pb-4 text-gray-600 dark:text-gray-400 text-sm">
                      {faq.a}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link to="/faq" className="text-amber-600 dark:text-amber-400 font-medium hover:underline">
            View all FAQs →
          </Link>
        </div>
      </div>
    </section>
  );
};

// ============================================================================
// TRUST BADGES
// ============================================================================

const TrustBadges = () => (
  <div className="flex flex-wrap items-center justify-center gap-6 py-10 bg-gray-50 dark:bg-gray-800/50">
    {TRUST_BADGES.map((badge, index) => (
      <motion.div
        key={badge.label}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        className="flex items-center gap-2 text-gray-600 dark:text-gray-400"
      >
        <badge.icon className="w-5 h-5 text-amber-500" />
        <span className="text-sm font-medium">{badge.label}</span>
      </motion.div>
    ))}
  </div>
);

// ============================================================================
// NEWSLETTER SECTION - ENHANCED
// ============================================================================

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast.success('Subscribed successfully! Check your email for 10% off code.');
    setEmail('');
    setLoading(false);
  };

  return (
    <section className="py-20 bg-gradient-to-br from-amber-500 via-amber-600 to-orange-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-orange-300 rounded-full blur-3xl" />
      </div>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <GiftIcon className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Get 10% Off Your First Order
          </h2>
          <p className="text-lg text-white/80 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for exclusive offers, new note releases, and exam preparation tips.
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="flex-1 px-4 py-3.5 rounded-xl bg-white/20 backdrop-blur-sm text-white placeholder-white/60 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
              required
            />
            <Button
              type="submit"
              loading={loading}
              className="bg-black text-white hover:bg-gray-900"
            >
              {loading ? 'Subscribing...' : 'Subscribe'}
            </Button>
          </form>
          <p className="text-xs text-white/60 mt-4 flex items-center justify-center gap-2">
            <ShieldCheckIcon className="w-4 h-4" />
            No spam, unsubscribe anytime.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

// ============================================================================
// CTA SECTION - ENHANCED
// ============================================================================

const CTASection = () => (
  <section className="py-24 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 relative overflow-hidden">
    <div className="absolute inset-0 opacity-10">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500 rounded-full blur-3xl" />
    </div>
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <Badge className="mb-6 bg-amber-500/20 text-amber-400 border-amber-500/30">
          <RocketIcon className="w-4 h-4 mr-1" />
          Start Your Journey
        </Badge>
        <h2 className="text-3xl lg:text-5xl font-bold text-white mb-6">
          Ready to Ace Your Exams?
        </h2>
        <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
          Join 50,000+ students who trust PrintPress for their study materials.
          Quality notes, delivered to your doorstep.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/notes">
            <Button size="lg" className="shadow-lg shadow-amber-500/30">
              Browse All Notes
              <ArrowRightIcon className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link to="/contact">
            <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <PhoneIcon className="w-5 h-5 mr-2" />
              Contact Us
            </Button>
          </Link>
        </div>
        <p className="text-sm text-gray-500 mt-8">
          <CheckCircleIcon className="w-4 h-4 inline mr-1" />
          Free delivery on orders above ₹499
        </p>
      </motion.div>
    </div>
  </section>
);

// Rocket Icon component (since it's not in heroicons outline)
const RocketIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
  </svg>
);

// ============================================================================
// APP DOWNLOAD SECTION
// ============================================================================

const AppDownloadSection = () => (
  <section className="py-16 bg-gray-50 dark:bg-gray-900">
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row items-center gap-10 p-8 rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800">
        <div className="flex-1 text-center lg:text-left">
          <Badge className="mb-4 bg-amber-500/20 text-amber-400 border-amber-500/30">
            Coming Soon
          </Badge>
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
            PrintPress Mobile App
          </h2>
          <p className="text-gray-400 mb-6">
            Order notes on the go, track your delivery, and access exclusive app-only discounts.
          </p>
          <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-gray-900 font-medium opacity-75 cursor-not-allowed">
              <span className="text-2xl">🍎</span>
              <div className="text-left">
                <p className="text-[10px] opacity-70">Download on the</p>
                <p className="text-sm font-bold">App Store</p>
              </div>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-gray-900 font-medium opacity-75 cursor-not-allowed">
              <span className="text-2xl">🤖</span>
              <div className="text-left">
                <p className="text-[10px] opacity-70">Get it on</p>
                <p className="text-sm font-bold">Google Play</p>
              </div>
            </button>
          </div>
        </div>
        <div className="flex-shrink-0">
          <div className="w-48 h-64 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/30">
            <span className="text-6xl">📱</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

// ============================================================================
// MAIN HOMEPAGE COMPONENT
// ============================================================================

export default function HomePage() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <HeroSection />

      {/* Trust Badges */}
      <TrustBadges />

      {/* Partners */}
      <PartnersSection />

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge={<><SparklesIcon className="w-4 h-4" /> Why PrintPress?</>}
            title="The Trusted Platform for Study Materials"
            description="Join thousands of successful aspirants who've chosen PrintPress for quality printed notes."
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Notes */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedNotes />
        </div>
      </section>

      {/* Stats Section */}
      <StatsSection />

      {/* Categories Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeader
            badge={<><AcademicCapIcon className="w-4 h-4" /> Browse Categories</>}
            title="Find Notes for Your Exam"
            description="We cover all major competitive exams in India with notes from top coaching institutes."
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-4">
            {CATEGORIES.map((category, index) => (
              <CategoryCard key={category.name} category={category} index={index} />
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <HowItWorks variant="interactive" />
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection />

      {/* Testimonials */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Testimonials variant="slider" />
        </div>
      </section>

      {/* FAQ Section */}
      <FAQSection />

      {/* Recently Viewed */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <RecentlyViewed variant="carousel" />
        </div>
      </section>

      {/* App Download */}
      <AppDownloadSection />

      {/* Newsletter */}
      <NewsletterSection />

      {/* CTA */}
      <CTASection />
    </div>
  );
}