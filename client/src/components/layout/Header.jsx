import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bars3Icon,
  XMarkIcon,
  ShoppingCartIcon,
  HeartIcon,
  SunIcon,
  MoonIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  UserIcon,
  BellIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../../store/cartStore';
import { useWishlist } from '../../context/WishlistContext';
import { useTheme } from '../../context/ThemeContext';
import { cn } from '../../utils/helpers';

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

const MAIN_NAVIGATION = [
  { name: 'Home', href: '/' },
  { name: 'Browse Notes', href: '/notes' },
  { name: 'Books', href: '/books', isNew: true },
  { name: 'Track Order', href: '/track' },
];

const MORE_LINKS = [
  { name: 'About Us', href: '/about', icon: '📖' },
  { name: 'Contact', href: '/contact', icon: '📧' },
  { name: 'FAQ', href: '/faq', icon: '❓' },
  { name: 'Blog', href: '/blog', icon: '📝' },
];

const CATEGORY_MENU = [
  {
    name: 'UPSC Notes',
    href: '/notes?category=UPSC',
    color: '#6366f1',
    description: 'IAS, IPS, IFS exam preparation',
    popular: ['Indian Polity', 'History', 'Geography'],
  },
  {
    name: 'SSC Notes',
    href: '/notes?category=SSC',
    color: '#10b981',
    description: 'CGL, CHSL, MTS exam materials',
    popular: ['Reasoning', 'Quant', 'English'],
  },
  {
    name: 'Banking Notes',
    href: '/notes?category=BANKING',
    color: '#f59e0b',
    description: 'IBPS, SBI, RBI exam prep',
    popular: ['Banking Awareness', 'Current Affairs'],
  },
  {
    name: 'State PCS',
    href: '/notes?category=STATE_PCS',
    color: '#8b5cf6',
    description: 'State civil services exams',
    popular: ['State GK', 'Administration'],
  },
  {
    name: 'Railway Notes',
    href: '/notes?category=RAILWAY',
    color: '#ef4444',
    description: 'RRB, Railway exam materials',
    popular: ['Technical', 'Non-Technical'],
  },
  {
    name: 'Defence Notes',
    href: '/notes?category=DEFENCE',
    color: '#0ea5e9',
    description: 'NDA, CDS, AFCAT exam prep',
    popular: ['GK', 'Mathematics'],
  },
];

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  search: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  user: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  package: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
    </svg>
  ),
  command: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M18 3a3 3 0 00-3 3v12a3 3 0 003 3 3 3 0 003-3 3 3 0 00-3-3H6a3 3 0 00-3 3 3 3 0 003 3 3 3 0 003-3V6a3 3 0 00-3-3 3 3 0 00-3 3 3 3 0 003 3h12a3 3 0 003-3 3 3 0 00-3-3z" />
    </svg>
  ),
};

// ============================================================================
// SEARCH BAR COMPONENT
// ============================================================================

const HeaderSearch = ({ isOpen, onClose, className = '' }) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose?.();
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/notes?search=${encodeURIComponent(query.trim())}`);
      onClose?.();
      setQuery('');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn('absolute left-0 right-0 top-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg', className)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <form onSubmit={handleSubmit} className="relative">
          <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for notes, books, categories..."
            className="w-full pl-12 pr-16 py-3 rounded-xl bg-gray-100 dark:bg-gray-800 border-0 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs text-gray-500">
              ESC
            </kbd>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

// ============================================================================
// MEGA MENU COMPONENT
// ============================================================================

const MegaMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/20 z-40"
        onClick={onClose}
      />

      {/* Menu */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="absolute left-0 right-0 top-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-xl z-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-4 gap-8">
            {/* Categories */}
            <div className="col-span-3">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Browse by Category
              </h3>
              <div className="grid grid-cols-3 gap-4">
                {CATEGORY_MENU.map((category) => (
                  <Link
                    key={category.name}
                    to={category.href}
                    onClick={onClose}
                    className="group p-4 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
                        {category.name}
                      </h4>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      {category.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {category.popular.map((topic) => (
                        <span
                          key={topic}
                          className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                        >
                          {topic}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Featured / Promo */}
            <div className="col-span-1">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
                Featured
              </h3>
              <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800">
                <div className="text-3xl mb-3">🎉</div>
                <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                  New Year Sale!
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Get up to 50% off on all UPSC notes this month.
                </p>
                <Link
                  to="/notes?category=UPSC"
                  onClick={onClose}
                  className="inline-flex items-center gap-2 text-sm font-medium text-amber-600 dark:text-amber-400 hover:text-amber-700"
                >
                  Shop Now
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
              </div>

              <div className="mt-4 space-y-2">
                {MORE_LINKS.map((link) => (
                  <Link
                    key={link.name}
                    to={link.href}
                    onClick={onClose}
                    className="flex items-center gap-2 p-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <span>{link.icon}</span>
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ============================================================================
// NOTIFICATION BADGE
// ============================================================================

const NotificationBadge = ({ count }) => (
  <AnimatePresence>
    {count > 0 && (
      <motion.span
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0 }}
        className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-xs min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center font-bold shadow-lg"
      >
        {count > 99 ? '99+' : count}
      </motion.span>
    )}
  </AnimatePresence>
);

// ============================================================================
// ACTION BUTTON COMPONENT
// ============================================================================

const ActionButton = ({ onClick, icon, badge = 0, title, className = '' }) => (
  <button
    onClick={onClick}
    className={cn(
      'relative p-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700',
      'text-gray-600 dark:text-gray-300 transition-all hover:scale-105 active:scale-95',
      className
    )}
    title={title}
  >
    {icon}
    <NotificationBadge count={badge} />
  </button>
);

// ============================================================================
// MOBILE MENU
// ============================================================================

const MobileMenu = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { isDark, toggle: toggleTheme } = useTheme();

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-[300px] max-w-[85vw] bg-white dark:bg-gray-900 z-50 lg:hidden shadow-2xl overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-800">
              <span className="text-lg font-bold text-gray-900 dark:text-white">Menu</span>
              <button
                onClick={onClose}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* Navigation */}
            <div className="p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Navigation</p>
              {MAIN_NAVIGATION.map((item, index) => (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <NavLink
                    to={item.href}
                    onClick={onClose}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center justify-between py-3.5 px-4 rounded-xl text-base font-medium mb-1 transition-all',
                        isActive
                          ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      )
                    }
                  >
                    <span>{item.name}</span>
                    {item.isNew && (
                      <span className="px-2 py-0.5 text-xs font-bold bg-amber-500 text-black rounded-full">
                        NEW
                      </span>
                    )}
                  </NavLink>
                </motion.div>
              ))}

              {/* Categories */}
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3">Categories</p>
              <div className="space-y-1">
                {CATEGORY_MENU.slice(0, 4).map((category, index) => (
                  <motion.div
                    key={category.name}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: (MAIN_NAVIGATION.length + index) * 0.05 }}
                  >
                    <Link
                      to={category.href}
                      onClick={onClose}
                      className="flex items-center gap-3 py-3 px-4 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: `${category.color}20`, color: category.color }}
                      >
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <span className="text-sm font-medium">{category.name}</span>
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Theme Toggle & Admin */}
              <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center gap-3 py-3.5 px-4 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {isDark ? (
                    <SunIcon className="w-5 h-5" />
                  ) : (
                    <MoonIcon className="w-5 h-5" />
                  )}
                  <span className="text-sm font-medium">
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                  </span>
                </button>
                <Link
                  to="/admin/login"
                  onClick={onClose}
                  className="flex items-center gap-3 py-3.5 px-4 rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <UserIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Admin Login</span>
                </Link>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// MAIN HEADER COMPONENT
// ============================================================================

export default function Header({ className = '' }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const itemCount = useCartStore((state) => state.getPricing().itemCount);
  const { itemCount: wishlistCount, setIsOpen: setWishlistOpen } = useWishlist();
  const { isDark, toggle: toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setMegaMenuOpen(false);
    setSearchOpen(false);
  }, [location.pathname]);

  // Keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg shadow-lg'
            : 'bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800',
          className
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 flex-shrink-0">
              <motion.div
                whileHover={{ scale: 1.05, rotate: 5 }}
                className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30"
              >
                <span className="text-black font-bold text-xl">P</span>
              </motion.div>
              <div className="hidden sm:block">
                <span className="text-xl font-bold text-gray-900 dark:text-white">PrintPress</span>
                <p className="text-xs text-gray-500 dark:text-gray-400 -mt-1">Premium Study Notes</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {MAIN_NAVIGATION.map((item) => (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) =>
                    cn(
                      'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1',
                      isActive
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-amber-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-amber-400'
                    )
                  }
                >
                  {item.name}
                  {item.isNew && (
                    <span className="px-1.5 py-0.5 text-[10px] font-bold bg-amber-500 text-black rounded-full">
                      NEW
                    </span>
                  )}
                </NavLink>
              ))}

              {/* Categories Dropdown */}
              <button
                onClick={() => setMegaMenuOpen(!megaMenuOpen)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1',
                  megaMenuOpen
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400'
                    : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
              >
                Categories
                <ChevronDownIcon className={cn('w-4 h-4 transition-transform', megaMenuOpen && 'rotate-180')} />
              </button>
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search (Desktop) */}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                {Icons.search}
                <span className="text-sm">Search...</span>
                <kbd className="hidden lg:flex items-center gap-0.5 px-1.5 py-0.5 bg-white dark:bg-gray-700 rounded text-xs">
                  <span>⌘</span>K
                </kbd>
              </button>

              {/* Theme Toggle */}
              <ActionButton
                onClick={toggleTheme}
                icon={
                  <motion.div
                    initial={false}
                    animate={{ rotate: isDark ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {isDark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
                  </motion.div>
                }
                title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              />

              {/* Wishlist */}
              <ActionButton
                onClick={() => setWishlistOpen(true)}
                icon={<HeartIcon className="w-5 h-5" />}
                badge={wishlistCount}
                title="Wishlist"
              />

              {/* Cart */}
              <ActionButton
                onClick={() => navigate('/order')}
                icon={<ShoppingCartIcon className="w-5 h-5" />}
                badge={itemCount}
                title="Cart"
              />

              {/* Admin Link (Desktop) */}
              <Link
                to="/admin/login"
                className="hidden md:flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 hover:text-amber-600 dark:text-gray-300 dark:hover:text-amber-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
              >
                {Icons.user}
                <span>Admin</span>
              </Link>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all active:scale-95"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <XMarkIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Bars3Icon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </nav>

        {/* Search Overlay */}
        <AnimatePresence>
          <HeaderSearch isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
        </AnimatePresence>

        {/* Mega Menu */}
        <AnimatePresence>
          {megaMenuOpen && (
            <MegaMenu isOpen={megaMenuOpen} onClose={() => setMegaMenuOpen(false)} />
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export { HeaderSearch, MegaMenu, ActionButton, MobileMenu, NotificationBadge };