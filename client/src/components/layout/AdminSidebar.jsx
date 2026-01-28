import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HomeIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ShoppingCartIcon,
  ArrowLeftOnRectangleIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  UsersIcon,
  BellIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  ChevronLeftIcon,
  Bars3Icon,
  XMarkIcon,
  TagIcon,
  CurrencyRupeeIcon,
  TruckIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  BookOpenIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { cn } from '../../utils/helpers';

// ============================================================================
// NAVIGATION CONFIGURATION
// ============================================================================

const MAIN_NAVIGATION = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: HomeIcon,
    description: 'Overview & analytics',
  },
  {
    name: 'Orders',
    href: '/admin/orders',
    icon: ShoppingCartIcon,
    badge: 5,
    badgeColor: 'amber',
    description: 'Manage customer orders',
  },
  {
    name: 'Notes',
    href: '/admin/notes',
    icon: DocumentTextIcon,
    description: 'Manage study notes',
    children: [
      { name: 'All Notes', href: '/admin/notes' },
      { name: 'Add New', href: '/admin/notes/new' },
      { name: 'Categories', href: '/admin/notes/categories' },
    ],
  },
  {
    name: 'Books',
    href: '/admin/books',
    icon: BookOpenIcon,
    description: 'Manage book catalog',
    isNew: true,
  },
  {
    name: 'Institutes',
    href: '/admin/institutes',
    icon: BuildingOfficeIcon,
    description: 'Partner institutes',
  },
];

const SECONDARY_NAVIGATION = [
  {
    name: 'Customers',
    href: '/admin/customers',
    icon: UsersIcon,
    description: 'Customer management',
  },
  {
    name: 'Analytics',
    href: '/admin/analytics',
    icon: ChartBarIcon,
    description: 'Sales & traffic data',
  },
  {
    name: 'Promotions',
    href: '/admin/promotions',
    icon: TagIcon,
    description: 'Discounts & coupons',
  },
  {
    name: 'Shipping',
    href: '/admin/shipping',
    icon: TruckIcon,
    description: 'Delivery settings',
  },
];

const FOOTER_NAVIGATION = [
  { name: 'Settings', href: '/admin/settings', icon: Cog6ToothIcon },
  { name: 'Help', href: '/admin/help', icon: QuestionMarkCircleIcon },
  { name: 'Feedback', href: '/admin/feedback', icon: ChatBubbleLeftRightIcon },
];

// ============================================================================
// ICONS
// ============================================================================

const Icons = {
  chevronRight: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  ),
  bell: (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
    </svg>
  ),
};

// ============================================================================
// NOTIFICATION BADGE
// ============================================================================

const NotificationBadge = ({ count, color = 'amber', size = 'sm' }) => {
  if (!count || count <= 0) return null;

  const sizeClasses = {
    xs: 'min-w-[14px] h-[14px] text-[9px]',
    sm: 'min-w-[18px] h-[18px] text-[10px]',
    md: 'min-w-[20px] h-[20px] text-xs',
  };

  const colorClasses = {
    amber: 'bg-amber-500 text-black',
    red: 'bg-red-500 text-white',
    green: 'bg-emerald-500 text-white',
    blue: 'bg-blue-500 text-white',
  };

  return (
    <motion.span
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      className={cn(
        'rounded-full flex items-center justify-center font-bold',
        sizeClasses[size],
        colorClasses[color]
      )}
    >
      {count > 99 ? '99+' : count}
    </motion.span>
  );
};

// ============================================================================
// NAVIGATION ITEM
// ============================================================================

const NavItem = ({
  item,
  isCollapsed = false,
  onNavigate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const location = useLocation();
  const hasChildren = item.children && item.children.length > 0;
  const isActive = location.pathname === item.href ||
    item.children?.some(child => location.pathname === child.href);

  const handleClick = (e) => {
    if (hasChildren) {
      e.preventDefault();
      setIsExpanded(!isExpanded);
    } else {
      onNavigate?.();
    }
  };

  return (
    <div>
      <NavLink
        to={hasChildren ? '#' : item.href}
        end={item.href === '/admin'}
        onClick={handleClick}
        className={({ isActive: linkActive }) =>
          cn(
            'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
            (linkActive && !hasChildren) || (hasChildren && isActive)
              ? 'bg-amber-500/10 text-amber-500'
              : 'text-gray-400 hover:bg-gray-800 hover:text-white'
          )
        }
      >
        <item.icon className="w-5 h-5 flex-shrink-0" />

        {!isCollapsed && (
          <>
            <span className="flex-1">{item.name}</span>

            {item.badge && (
              <NotificationBadge count={item.badge} color={item.badgeColor} />
            )}

            {item.isNew && (
              <span className="px-1.5 py-0.5 text-[9px] font-bold bg-emerald-500 text-white rounded-full">
                NEW
              </span>
            )}

            {hasChildren && (
              <motion.span
                animate={{ rotate: isExpanded ? 180 : 0 }}
                transition={{ duration: 0.2 }}
              >
                <ChevronDownIcon className="w-4 h-4" />
              </motion.span>
            )}
          </>
        )}

        {/* Tooltip for collapsed state */}
        {isCollapsed && (
          <div className="absolute left-full ml-2 px-3 py-2 bg-gray-800 rounded-lg text-white text-sm font-medium opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 shadow-xl">
            {item.name}
            {item.description && (
              <p className="text-xs text-gray-400 mt-0.5">{item.description}</p>
            )}
          </div>
        )}
      </NavLink>

      {/* Children */}
      {hasChildren && !isCollapsed && (
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="ml-6 pl-3 border-l border-gray-800 mt-1 space-y-1">
                {item.children.map((child) => (
                  <NavLink
                    key={child.name}
                    to={child.href}
                    onClick={onNavigate}
                    className={({ isActive }) =>
                      cn(
                        'block px-3 py-2 rounded-lg text-sm transition-colors',
                        isActive
                          ? 'text-amber-500 bg-amber-500/10'
                          : 'text-gray-400 hover:text-white hover:bg-gray-800'
                      )
                    }
                  >
                    {child.name}
                  </NavLink>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
};

// ============================================================================
// SEARCH BOX
// ============================================================================

const SearchBox = ({ isCollapsed = false }) => {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  if (isCollapsed) {
    return (
      <button className="w-full p-2.5 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors flex items-center justify-center">
        <MagnifyingGlassIcon className="w-5 h-5" />
      </button>
    );
  }

  return (
    <div className={cn(
      'relative rounded-xl transition-all',
      isFocused ? 'ring-2 ring-amber-500/50' : ''
    )}>
      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search..."
        className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-gray-800 border-0 text-white placeholder-gray-500 text-sm focus:outline-none"
      />
      <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] text-gray-500 bg-gray-700 rounded">
        ⌘K
      </kbd>
    </div>
  );
};

// ============================================================================
// USER PROFILE
// ============================================================================

const UserProfile = ({ admin, isCollapsed = false, onLogout }) => {
  const [showMenu, setShowMenu] = useState(false);

  if (isCollapsed) {
    return (
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-bold text-lg mx-auto"
      >
        {admin?.name?.charAt(0) || 'A'}
      </button>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-800 transition-colors"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-black font-bold">
          {admin?.name?.charAt(0) || 'A'}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-white truncate">
            {admin?.name || 'Admin User'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {admin?.email || 'admin@printpress.in'}
          </p>
        </div>
        <ChevronDownIcon className={cn(
          'w-4 h-4 text-gray-500 transition-transform',
          showMenu && 'rotate-180'
        )} />
      </button>

      <AnimatePresence>
        {showMenu && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute bottom-full left-0 right-0 mb-2 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden"
          >
            {FOOTER_NAVIGATION.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
              >
                <item.icon className="w-4 h-4" />
                {item.name}
              </NavLink>
            ))}
            <hr className="border-gray-700" />
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
            >
              <ArrowLeftOnRectangleIcon className="w-4 h-4" />
              Logout
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// NOTIFICATION PANEL
// ============================================================================

const NotificationPanel = ({ isCollapsed = false }) => {
  const [showPanel, setShowPanel] = useState(false);
  const notificationCount = 3;

  const notifications = [
    { id: 1, title: 'New order received', time: '2 min ago', type: 'order' },
    { id: 2, title: 'Payment confirmed', time: '15 min ago', type: 'payment' },
    { id: 3, title: 'Low stock alert', time: '1 hour ago', type: 'alert' },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setShowPanel(!showPanel)}
        className={cn(
          'relative p-2.5 rounded-xl bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white transition-colors',
          isCollapsed ? 'mx-auto' : ''
        )}
      >
        {Icons.bell}
        {notificationCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
            {notificationCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {showPanel && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden z-50"
          >
            <div className="p-3 border-b border-gray-700 flex items-center justify-between">
              <span className="text-sm font-medium text-white">Notifications</span>
              <button className="text-xs text-amber-500 hover:text-amber-400">Mark all read</button>
            </div>
            <div className="max-h-64 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="p-3 hover:bg-gray-700 cursor-pointer border-b border-gray-700/50 last:border-0"
                >
                  <p className="text-sm text-white">{notification.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                </div>
              ))}
            </div>
            <NavLink
              to="/admin/notifications"
              className="block p-3 text-center text-sm text-amber-500 hover:bg-gray-700 border-t border-gray-700"
            >
              View all notifications
            </NavLink>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// MAIN ADMIN SIDEBAR COMPONENT
// ============================================================================

export default function AdminSidebar({ onMobileClose }) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = useCallback(() => {
    logout();
    navigate('/admin/login');
  }, [logout, navigate]);

  const handleNavigate = useCallback(() => {
    onMobileClose?.();
  }, [onMobileClose]);

  return (
    <aside
      className={cn(
        'bg-gray-900 min-h-screen flex flex-col border-r border-gray-800 transition-all duration-300',
        isCollapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Header */}
      <div className={cn(
        'p-4 border-b border-gray-800 flex items-center',
        isCollapsed ? 'justify-center' : 'justify-between'
      )}>
        <NavLink to="/admin" className="flex items-center gap-2">
          <motion.div
            whileHover={{ scale: 1.05, rotate: 5 }}
            className="w-10 h-10 bg-gradient-to-br from-amber-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/30"
          >
            <span className="text-black font-bold text-xl">P</span>
          </motion.div>
          {!isCollapsed && (
            <div>
              <span className="text-lg font-bold text-white">PrintPress</span>
              <p className="text-xs text-gray-500">Admin Panel</p>
            </div>
          )}
        </NavLink>

        {!isCollapsed && (
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Expand button (collapsed state) */}
      {isCollapsed && (
        <button
          onClick={() => setIsCollapsed(false)}
          className="mx-auto mt-4 p-2 rounded-lg text-gray-500 hover:bg-gray-800 hover:text-white transition-colors"
        >
          <Bars3Icon className="w-5 h-5" />
        </button>
      )}

      {/* Search */}
      <div className="p-4">
        <SearchBox isCollapsed={isCollapsed} />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 overflow-y-auto">
        <p className={cn(
          'text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2',
          isCollapsed && 'text-center'
        )}>
          {isCollapsed ? '•' : 'Main'}
        </p>
        <ul className="space-y-1">
          {MAIN_NAVIGATION.map((item) => (
            <li key={item.name}>
              <NavItem
                item={item}
                isCollapsed={isCollapsed}
                onNavigate={handleNavigate}
              />
            </li>
          ))}
        </ul>

        <p className={cn(
          'text-xs font-semibold text-gray-500 uppercase tracking-wider mt-6 mb-2',
          isCollapsed && 'text-center'
        )}>
          {isCollapsed ? '•' : 'Management'}
        </p>
        <ul className="space-y-1">
          {SECONDARY_NAVIGATION.map((item) => (
            <li key={item.name}>
              <NavItem
                item={item}
                isCollapsed={isCollapsed}
                onNavigate={handleNavigate}
              />
            </li>
          ))}
        </ul>
      </nav>

      {/* Notification */}
      <div className="px-4 py-3 border-t border-gray-800">
        <NotificationPanel isCollapsed={isCollapsed} />
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-gray-800">
        <UserProfile
          admin={admin}
          isCollapsed={isCollapsed}
          onLogout={handleLogout}
        />
      </div>
    </aside>
  );
}

// ============================================================================
// MOBILE SIDEBAR WRAPPER
// ============================================================================

export const MobileAdminSidebar = ({ isOpen, onClose }) => {
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
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed top-0 left-0 bottom-0 z-50 lg:hidden"
          >
            <div className="relative h-full">
              <AdminSidebar onMobileClose={onClose} />
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 rounded-lg bg-gray-800 text-gray-400 hover:text-white"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// EXPORTS
// ============================================================================

export { NavItem, SearchBox, UserProfile, NotificationPanel, NotificationBadge };