import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import toast from 'react-hot-toast';
import { cn } from '../../utils/helpers';

// ============================================================================
// FOOTER CONFIGURATION
// ============================================================================

// Social links configuration
const SOCIAL_LINKS = [
  {
    name: 'Facebook',
    href: 'https://facebook.com/printpress',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: '#1877f2',
  },
  {
    name: 'Instagram',
    href: 'https://instagram.com/printpress',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
      </svg>
    ),
    color: '#e4405f',
  },
  {
    name: 'Twitter',
    href: 'https://twitter.com/printpress',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: '#000000',
  },
  {
    name: 'YouTube',
    href: 'https://youtube.com/printpress',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    color: '#ff0000',
  },
  {
    name: 'LinkedIn',
    href: 'https://linkedin.com/company/printpress',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
    color: '#0077b5',
  },
  {
    name: 'Telegram',
    href: 'https://t.me/printpress',
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
      </svg>
    ),
    color: '#0088cc',
  },
];

// Navigation links
const QUICK_LINKS = [
  { name: 'Browse Notes', href: '/notes', isNew: false },
  { name: 'Books', href: '/books', isNew: true },
  { name: 'Track Order', href: '/track', isNew: false },
  { name: 'FAQ', href: '/faq', isNew: false },
  { name: 'Bulk Orders', href: '/bulk-orders', isNew: true },
];

const COMPANY_LINKS = [
  { name: 'About Us', href: '/about' },
  { name: 'Contact', href: '/contact' },
  { name: 'Careers', href: '/careers' },
  { name: 'Blog', href: '/blog' },
  { name: 'Press', href: '/press' },
];

const LEGAL_LINKS = [
  { name: 'Privacy Policy', href: '/privacy' },
  { name: 'Terms of Service', href: '/terms' },
  { name: 'Refund Policy', href: '/refund' },
  { name: 'Shipping Policy', href: '/shipping' },
];

const CATEGORY_LINKS = [
  { name: 'UPSC Notes', href: '/notes?category=UPSC', color: '#6366f1' },
  { name: 'SSC Notes', href: '/notes?category=SSC', color: '#10b981' },
  { name: 'Banking Notes', href: '/notes?category=BANKING', color: '#f59e0b' },
  { name: 'State PCS', href: '/notes?category=STATE_PCS', color: '#8b5cf6' },
  { name: 'Railway Notes', href: '/notes?category=RAILWAY', color: '#ef4444' },
  { name: 'Defence Notes', href: '/notes?category=DEFENCE', color: '#0ea5e9' },
];

// Payment methods
const PAYMENT_METHODS = [
  { name: 'Visa', icon: '💳' },
  { name: 'Mastercard', icon: '💳' },
  { name: 'UPI', icon: '📱' },
  { name: 'Net Banking', icon: '🏦' },
  { name: 'COD', icon: '💵' },
];

// Trust badges
const TRUST_BADGES = [
  { icon: '🔒', label: 'Secure Payments' },
  { icon: '✅', label: 'Quality Assured' },
  { icon: '🚚', label: 'Fast Delivery' },
  { icon: '🔄', label: 'Easy Returns' },
];

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  arrow: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  mail: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  phone: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  location: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  check: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  ),
  heart: (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
    </svg>
  ),
};

// ============================================================================
// NEWSLETTER FORM
// ============================================================================

const NewsletterForm = ({ className = '' }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    toast.success('Thanks for subscribing! Check your inbox for updates.');
    setEmail('');
    setSubscribed(true);
    setLoading(false);

    // Reset subscribed state after 5 seconds
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <form onSubmit={handleSubmit} className={cn('w-full', className)}>
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">
            {Icons.mail}
          </div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading || subscribed}
            className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all disabled:opacity-50"
            required
          />
        </div>
        <motion.button
          type="submit"
          disabled={loading || subscribed}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className={cn(
            'px-6 py-3.5 rounded-xl font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2 min-w-[140px]',
            subscribed
              ? 'bg-emerald-500 text-white'
              : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-black hover:from-amber-400 hover:to-yellow-400'
          )}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <span>Subscribing...</span>
            </>
          ) : subscribed ? (
            <>
              {Icons.check}
              <span>Subscribed!</span>
            </>
          ) : (
            <>
              <span>Subscribe</span>
              {Icons.arrow}
            </>
          )}
        </motion.button>
      </div>
    </form>
  );
};

// ============================================================================
// FOOTER LINK COLUMN
// ============================================================================

const FooterLinkColumn = ({ title, links, showArrow = true, className = '' }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <div ref={ref} className={className}>
      <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider flex items-center gap-2">
        {title}
        <div className="h-px flex-1 bg-gradient-to-r from-amber-500/50 to-transparent max-w-[50px]" />
      </h3>
      <ul className="space-y-3">
        {links.map((link, index) => (
          <motion.li
            key={link.name}
            initial={{ opacity: 0, x: -10 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: index * 0.05 }}
          >
            <Link
              to={link.href}
              className="group flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm"
            >
              {showArrow && (
                <span className="opacity-0 group-hover:opacity-100 transition-opacity text-amber-500">
                  →
                </span>
              )}
              <span>{link.name}</span>
              {link.isNew && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-black rounded-full">
                  NEW
                </span>
              )}
              {link.color && (
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: link.color }}
                />
              )}
            </Link>
          </motion.li>
        ))}
      </ul>
    </div>
  );
};

// ============================================================================
// SOCIAL LINK COMPONENT
// ============================================================================

const SocialLink = ({ social, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ scale: 1.1, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-10 h-10 rounded-xl flex items-center justify-center transition-all"
      style={{
        backgroundColor: isHovered ? social.color : 'rgba(255,255,255,0.1)',
        color: isHovered ? '#fff' : '#9ca3af',
      }}
      title={social.name}
    >
      {social.icon}
    </motion.a>
  );
};

// ============================================================================
// CONTACT INFO
// ============================================================================

const ContactInfo = ({ className = '' }) => (
  <div className={cn('space-y-4', className)}>
    <a
      href="mailto:support@printpress.in"
      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
        {Icons.mail}
      </div>
      <div>
        <p className="text-xs text-gray-500">Email Support</p>
        <p className="text-sm font-medium">support@printpress.in</p>
      </div>
    </a>
    <a
      href="tel:+919876543210"
      className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group"
    >
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-amber-500/20 transition-colors">
        {Icons.phone}
      </div>
      <div>
        <p className="text-xs text-gray-500">Call Us</p>
        <p className="text-sm font-medium">+91 98765 43210</p>
      </div>
    </a>
    <div className="flex items-start gap-3 text-gray-400">
      <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
        {Icons.location}
      </div>
      <div>
        <p className="text-xs text-gray-500">Address</p>
        <p className="text-sm">PrintPress India Pvt. Ltd.<br />New Delhi, India 110001</p>
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN FOOTER COMPONENT
// ============================================================================

export default function Footer({ className = '', ...props }) {
  const footerRef = useRef(null);
  const isInView = useInView(footerRef, { once: true, margin: '-100px' });
  const currentYear = new Date().getFullYear();

  return (
    <footer
      ref={footerRef}
      className={cn(
        'relative overflow-hidden',
        className
      )}
      style={{
        background: 'linear-gradient(180deg, #0a0a0a 0%, #000000 100%)',
      }}
      {...props}
    >
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Newsletter Section */}
      <div className="relative border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            className="flex flex-col lg:flex-row items-center justify-between gap-8"
          >
            <div className="text-center lg:text-left">
              <h3 className="text-2xl lg:text-3xl font-bold text-white mb-2">
                Stay Updated! <span className="text-amber-500">✨</span>
              </h3>
              <p className="text-gray-400 max-w-md">
                Subscribe to our newsletter for exclusive offers, new arrivals, and study tips.
              </p>
            </div>
            <NewsletterForm className="w-full lg:w-auto lg:min-w-[450px]" />
          </motion.div>
        </div>
      </div>

      {/* Trust Badges */}
      <div className="relative border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {TRUST_BADGES.map((badge, index) => (
              <motion.div
                key={badge.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-center gap-3 py-3"
              >
                <span className="text-2xl">{badge.icon}</span>
                <span className="text-sm font-medium text-gray-300">{badge.label}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 lg:gap-6">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-5 group">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30"
              >
                <span className="text-black font-bold text-xl">P</span>
              </motion.div>
              <div>
                <span className="text-xl font-bold text-white">PrintPress</span>
                <p className="text-xs text-gray-500">Premium Study Notes</p>
              </div>
            </Link>
            <p className="text-gray-400 mb-6 max-w-sm text-sm leading-relaxed">
              Your one-stop destination for high-quality printed study notes. We partner with top coaching institutes to bring you the best study materials delivered right to your doorstep.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-2">
              {SOCIAL_LINKS.map((social, index) => (
                <SocialLink key={social.name} social={social} index={index} />
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <FooterLinkColumn title="Quick Links" links={QUICK_LINKS} />

          {/* Company */}
          <FooterLinkColumn title="Company" links={COMPANY_LINKS} />

          {/* Categories */}
          <FooterLinkColumn title="Categories" links={CATEGORY_LINKS} showArrow={false} />

          {/* Contact & Legal */}
          <div className="col-span-2 lg:col-span-1">
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">
              Get in Touch
            </h3>
            <ContactInfo className="mb-6" />

            <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider mt-6">
              Legal
            </h3>
            <ul className="space-y-2">
              {LEGAL_LINKS.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-gray-500 hover:text-gray-300 transition-colors text-xs"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="relative border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-500 flex items-center gap-1">
              © {currentYear} PrintPress. Made with
              <span className="text-red-500">{Icons.heart}</span>
              in India
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-500 hidden sm:block">We Accept:</span>
              <div className="flex gap-2">
                {PAYMENT_METHODS.map((method) => (
                  <div
                    key={method.name}
                    className="w-10 h-6 rounded bg-white/10 flex items-center justify-center text-sm"
                    title={method.name}
                  >
                    {method.icon}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { NewsletterForm, FooterLinkColumn, SocialLink, ContactInfo };