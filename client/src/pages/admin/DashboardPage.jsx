/**
 * Admin Dashboard Page
 * Comprehensive dashboard with analytics, charts, recent activity,
 * and quick actions for managing the PrintPress admin panel.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingCartIcon,
  DocumentTextIcon,
  CurrencyRupeeIcon,
  PrinterIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UsersIcon,
  BuildingOfficeIcon,
  EyeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  BellIcon,
  CalendarIcon,
  ChartBarIcon,
  TruckIcon,
} from '@heroicons/react/24/outline';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDate, cn } from '../../utils/helpers';
import { ORDER_STATUSES } from '../../utils/constants';
import { PageLoader } from '../../components/common/Loader';

// ============================================================================
// STAT CARD COMPONENT
// ============================================================================

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg = 'bg-blue-100',
  iconColor = 'text-blue-600',
  trend = null,
  trendLabel = '',
  loading = false,
  onClick,
}) => (
  <motion.div
    whileHover={{ y: -4, boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)' }}
    className={cn(
      'bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 transition-all',
      onClick && 'cursor-pointer'
    )}
    onClick={onClick}
  >
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        {loading ? (
          <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mt-2" />
        ) : (
          <p className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        )}
      </div>
      <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center', iconBg)}>
        <Icon className={cn('w-6 h-6', iconColor)} />
      </div>
    </div>
    {(subtitle || trend !== null) && (
      <div className="flex items-center gap-2 mt-4">
        {trend !== null && (
          <div className={cn(
            'flex items-center gap-1 text-sm font-medium',
            trend >= 0 ? 'text-emerald-600' : 'text-red-500'
          )}>
            {trend >= 0 ? (
              <ArrowTrendingUpIcon className="w-4 h-4" />
            ) : (
              <ArrowTrendingDownIcon className="w-4 h-4" />
            )}
            <span>{Math.abs(trend)}%</span>
          </div>
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {trendLabel || subtitle}
        </span>
      </div>
    )}
  </motion.div>
);

// ============================================================================
// ORDER STATUS PIPELINE
// ============================================================================

const OrderPipeline = ({ stats, loading }) => {
  const stages = [
    { key: 'pending', label: 'Pending', color: 'bg-yellow-500', icon: ClockIcon },
    { key: 'processing', label: 'Processing', color: 'bg-blue-500', icon: PrinterIcon },
    { key: 'shipped', label: 'Shipped', color: 'bg-purple-500', icon: TruckIcon },
    { key: 'delivered', label: 'Delivered', color: 'bg-emerald-500', icon: CheckCircleIcon },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Order Pipeline</h3>
      <div className="grid grid-cols-4 gap-4">
        {stages.map((stage, index) => (
          <div key={stage.key} className="text-center">
            <div className="relative">
              <div className={cn(
                'w-14 h-14 mx-auto rounded-full flex items-center justify-center',
                stage.color
              )}>
                <stage.icon className="w-6 h-6 text-white" />
              </div>
              {index < stages.length - 1 && (
                <div className="absolute top-1/2 left-full w-full h-0.5 bg-gray-200 dark:bg-gray-700 -translate-y-1/2" />
              )}
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mt-3">{stage.label}</p>
            {loading ? (
              <div className="h-6 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mt-1" />
            ) : (
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {stats?.overview?.[`${stage.key}Orders`] || 0}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// RECENT ORDERS TABLE
// ============================================================================

const RecentOrdersTable = ({ orders = [], loading }) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-12">
        <ShoppingCartIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
        <p className="text-gray-500 dark:text-gray-400">No recent orders</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-100 dark:border-gray-700">
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Order
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Customer
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Amount
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Status
            </th>
            <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Date
            </th>
            <th className="py-3 px-4"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
          {orders.map((order, index) => (
            <motion.tr
              key={order.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer"
              onClick={() => navigate(`/admin/orders/${order.id}`)}
            >
              <td className="py-4 px-4">
                <span className="font-medium text-amber-600 dark:text-amber-400">
                  {order.orderNumber}
                </span>
              </td>
              <td className="py-4 px-4">
                <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
              </td>
              <td className="py-4 px-4">
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(order.totalAmount)}
                </span>
              </td>
              <td className="py-4 px-4">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="py-4 px-4">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDate(order.createdAt)}
                </span>
              </td>
              <td className="py-4 px-4">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// ============================================================================
// ORDER STATUS BADGE
// ============================================================================

const OrderStatusBadge = ({ status }) => {
  const statusConfig = ORDER_STATUSES[status] || { label: status, color: 'bg-gray-100 text-gray-800' };

  const colors = {
    PENDING: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    CONFIRMED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    PROCESSING: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
    PRINTED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    SHIPPED: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
    DELIVERED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
      colors[status] || 'bg-gray-100 text-gray-800'
    )}>
      {statusConfig.label || status}
    </span>
  );
};

// ============================================================================
// QUICK ACTIONS
// ============================================================================

const QuickActions = () => {
  const actions = [
    { label: 'Add Note', href: '/admin/notes/new', icon: DocumentTextIcon, color: 'bg-blue-500' },
    { label: 'View Orders', href: '/admin/orders', icon: ShoppingCartIcon, color: 'bg-amber-500' },
    { label: 'Add Institute', href: '/admin/institutes/new', icon: BuildingOfficeIcon, color: 'bg-purple-500' },
    { label: 'Analytics', href: '/admin/analytics', icon: ChartBarIcon, color: 'bg-emerald-500' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 gap-3">
        {actions.map((action) => (
          <Link
            key={action.label}
            to={action.href}
            className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', action.color)}>
              <action.icon className="w-5 h-5 text-white" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-white">{action.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

// ============================================================================
// CATEGORY BREAKDOWN
// ============================================================================

const CategoryBreakdown = ({ stats, loading }) => {
  const categories = stats?.byCategory || [];
  const maxCount = Math.max(...categories.map(c => c.count), 1);

  const categoryColors = {
    UPSC: '#6366f1',
    SSC: '#10b981',
    BANKING: '#f59e0b',
    STATE_PCS: '#8b5cf6',
    RAILWAY: '#ef4444',
    DEFENCE: '#0ea5e9',
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 bg-gray-100 dark:bg-gray-700 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => (
        <div key={category.category}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {category.category}
            </span>
            <span className="text-sm font-semibold text-gray-900 dark:text-white">
              {category.count} notes
            </span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(category.count / maxCount) * 100}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="h-full rounded-full"
              style={{ backgroundColor: categoryColors[category.category] || '#64748b' }}
            />
          </div>
        </div>
      ))}
    </div>
  );
};

// ============================================================================
// ACTIVITY FEED
// ============================================================================

const ActivityFeed = ({ activities = [] }) => {
  const getActivityIcon = (type) => {
    switch (type) {
      case 'order': return ShoppingCartIcon;
      case 'note': return DocumentTextIcon;
      case 'payment': return CurrencyRupeeIcon;
      default: return BellIcon;
    }
  };

  return (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No recent activity</p>
      ) : (
        activities.map((activity, index) => {
          const Icon = getActivityIcon(activity.type);
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start gap-3"
            >
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-gray-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-900 dark:text-white">{activity.message}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
              </div>
            </motion.div>
          );
        })
      )}
    </div>
  );
};

// ============================================================================
// MAIN DASHBOARD PAGE
// ============================================================================

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchStats = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      const response = await adminService.getDashboardStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchStats(), 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  // Mock activity data
  const recentActivity = [
    { type: 'order', message: 'New order #PP-2024-0123 received', time: '2 minutes ago' },
    { type: 'payment', message: 'Payment confirmed for #PP-2024-0122', time: '15 minutes ago' },
    { type: 'order', message: 'Order #PP-2024-0121 shipped via Delhivery', time: '1 hour ago' },
    { type: 'note', message: 'New note added: Indian Economy Basics', time: '2 hours ago' },
  ];

  if (loading) {
    return <PageLoader />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Welcome back! Here's what's happening with your store.
          </p>
        </div>
        <button
          onClick={() => fetchStats(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={cn('w-4 h-4', refreshing && 'animate-spin')} />
          <span className="text-sm font-medium">Refresh</span>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Orders"
          value={stats?.overview?.totalOrders || 0}
          subtitle={`${stats?.overview?.todayOrders || 0} today`}
          icon={ShoppingCartIcon}
          iconBg="bg-blue-100 dark:bg-blue-900/30"
          iconColor="text-blue-600 dark:text-blue-400"
          loading={loading}
          onClick={() => navigate('/admin/orders')}
        />
        <StatCard
          title="Revenue (This Month)"
          value={formatCurrency(stats?.revenue?.thisMonth || 0)}
          trend={stats?.revenue?.growth}
          trendLabel="vs last month"
          icon={CurrencyRupeeIcon}
          iconBg="bg-emerald-100 dark:bg-emerald-900/30"
          iconColor="text-emerald-600 dark:text-emerald-400"
          loading={loading}
        />
        <StatCard
          title="Pending Orders"
          value={stats?.overview?.pendingOrders || 0}
          subtitle={`${stats?.overview?.processingOrders || 0} processing`}
          icon={PrinterIcon}
          iconBg="bg-amber-100 dark:bg-amber-900/30"
          iconColor="text-amber-600 dark:text-amber-400"
          loading={loading}
          onClick={() => navigate('/admin/orders?status=PENDING')}
        />
        <StatCard
          title="Total Notes"
          value={stats?.overview?.totalNotes || 0}
          subtitle={`${stats?.overview?.totalInstitutes || 0} institutes`}
          icon={DocumentTextIcon}
          iconBg="bg-purple-100 dark:bg-purple-900/30"
          iconColor="text-purple-600 dark:text-purple-400"
          loading={loading}
          onClick={() => navigate('/admin/notes')}
        />
      </div>

      {/* Order Pipeline */}
      <OrderPipeline stats={stats} loading={loading} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Orders</h2>
            <Link
              to="/admin/orders"
              className="text-sm font-medium text-amber-600 dark:text-amber-400 hover:underline"
            >
              View All
            </Link>
          </div>
          <div className="p-6">
            <RecentOrdersTable orders={stats?.recentOrders} loading={loading} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <QuickActions />

          {/* Category Breakdown */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notes by Category</h3>
            <CategoryBreakdown stats={stats} loading={loading} />
          </div>

          {/* Activity Feed */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
            <ActivityFeed activities={recentActivity} />
          </div>
        </div>
      </div>
    </div>
  );
}