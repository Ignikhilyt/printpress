/**
 * Admin Manage Orders Page
 * Comprehensive order management with bulk actions, advanced filtering,
 * export functionality, and quick status updates.
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  EyeIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
  CheckIcon,
  ChevronDownIcon,
  PrinterIcon,
  TruckIcon,
  DocumentTextIcon,
  CalendarIcon,
  CurrencyRupeeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { ordersService } from '../../services/ordersService';
import { formatCurrency, formatDate, cn } from '../../utils/helpers';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

// ============================================================================
// ORDER STATUS BADGE
// ============================================================================

const OrderStatusBadge = ({ status, size = 'default' }) => {
  const config = ORDER_STATUSES[status] || { label: status };

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
      'inline-flex items-center font-medium rounded-full',
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs',
      colors[status] || 'bg-gray-100 text-gray-800'
    )}>
      {config.label || status}
    </span>
  );
};

// ============================================================================
// PAYMENT STATUS BADGE
// ============================================================================

const PaymentStatusBadge = ({ status }) => {
  const config = PAYMENT_STATUSES[status] || { label: status };

  const colors = {
    PENDING: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
    FAILED: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    REFUNDED: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <span className={cn(
      'inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full',
      colors[status] || 'bg-gray-100 text-gray-800'
    )}>
      {config.label || status}
    </span>
  );
};

// ============================================================================
// STATUS QUICK UPDATE DROPDOWN
// ============================================================================

const StatusUpdateDropdown = ({ order, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [updating, setUpdating] = useState(false);

  const availableStatuses = Object.keys(ORDER_STATUSES).filter(
    (s) => s !== 'CANCELLED' && s !== order.status
  );

  const handleStatusUpdate = async (newStatus) => {
    setUpdating(true);
    try {
      await ordersService.updateStatus(order.id, { status: newStatus });
      toast.success(`Order status updated to ${ORDER_STATUSES[newStatus]?.label}`);
      onUpdate();
    } catch (error) {
      toast.error('Failed to update status');
    } finally {
      setUpdating(false);
      setIsOpen(false);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={updating || order.status === 'CANCELLED' || order.status === 'DELIVERED'}
        className="flex items-center gap-1 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <OrderStatusBadge status={order.status} size="sm" />
        {order.status !== 'CANCELLED' && order.status !== 'DELIVERED' && (
          <ChevronDownIcon className="w-4 h-4 text-gray-400" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden"
            >
              <p className="px-3 py-2 text-xs font-medium text-gray-400 uppercase">Update Status</p>
              {availableStatuses.map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusUpdate(status)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <OrderStatusBadge status={status} size="sm" />
                </button>
              ))}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// FILTER TABS
// ============================================================================

const FilterTabs = ({ value, onChange }) => {
  const tabs = [
    { value: '', label: 'All Orders', count: null },
    { value: 'PENDING', label: 'Pending', icon: ClockIcon },
    { value: 'PROCESSING', label: 'Processing', icon: PrinterIcon },
    { value: 'SHIPPED', label: 'Shipped', icon: TruckIcon },
    { value: 'DELIVERED', label: 'Delivered', icon: CheckCircleIcon },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
            value === tab.value
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          )}
        >
          {tab.icon && <tab.icon className="w-4 h-4" />}
          {tab.label}
        </button>
      ))}
    </div>
  );
};

// ============================================================================
// ORDER ROW
// ============================================================================

const OrderRow = ({ order, isSelected, onSelect, onUpdate }) => {
  const navigate = useNavigate();

  return (
    <motion.tr
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={cn(
        'transition-colors cursor-pointer',
        isSelected ? 'bg-amber-50 dark:bg-amber-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
      )}
    >
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onSelect(order.id)}
          className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="px-4 py-4" onClick={() => navigate(`/admin/orders/${order.id}`)}>
        <div>
          <span className="font-semibold text-amber-600 dark:text-amber-400 hover:underline">
            {order.orderNumber}
          </span>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            {order.items?.length || 0} {order.items?.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </td>
      <td className="px-4 py-4" onClick={() => navigate(`/admin/orders/${order.id}`)}>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{order.customerName}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{order.customerPhone}</p>
        </div>
      </td>
      <td className="px-4 py-4" onClick={() => navigate(`/admin/orders/${order.id}`)}>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {order.city}, {order.state}
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="font-semibold text-gray-900 dark:text-white">
          {formatCurrency(order.totalAmount)}
        </span>
      </td>
      <td className="px-4 py-4">
        <StatusUpdateDropdown order={order} onUpdate={onUpdate} />
      </td>
      <td className="px-4 py-4">
        <PaymentStatusBadge status={order.paymentStatus} />
      </td>
      <td className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
        {formatDate(order.createdAt)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => navigate(`/admin/orders/${order.id}`)}
            className="p-2 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title="View Details"
          >
            <EyeIcon className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle download
            }}
            className="p-2 text-gray-500 hover:text-amber-600 dark:hover:text-amber-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            title="Download Summary"
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
        </div>
      </td>
    </motion.tr>
  );
};

// ============================================================================
// BULK ACTIONS BAR
// ============================================================================

const BulkActionsBar = ({ selectedCount, onClear, onBulkAction }) => {
  if (selectedCount === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 dark:bg-gray-800 text-white px-6 py-3 rounded-xl shadow-xl flex items-center gap-4 z-50"
    >
      <span className="text-sm">
        <strong>{selectedCount}</strong> orders selected
      </span>
      <div className="h-6 w-px bg-gray-700" />
      <button
        onClick={() => onBulkAction('CONFIRMED')}
        className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-lg"
      >
        Confirm All
      </button>
      <button
        onClick={() => onBulkAction('PROCESSING')}
        className="px-3 py-1.5 text-sm bg-indigo-600 hover:bg-indigo-700 rounded-lg"
      >
        Mark Processing
      </button>
      <button
        onClick={() => onBulkAction('SHIPPED')}
        className="px-3 py-1.5 text-sm bg-cyan-600 hover:bg-cyan-700 rounded-lg"
      >
        Mark Shipped
      </button>
      <button
        onClick={onClear}
        className="p-1.5 text-gray-400 hover:text-white rounded-lg hover:bg-gray-700"
      >
        <XMarkIcon className="w-5 h-5" />
      </button>
    </motion.div>
  );
};

// ============================================================================
// EXPORT DROPDOWN
// ============================================================================

const ExportDropdown = ({ onExport }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
      >
        <ArrowDownTrayIcon className="w-4 h-4" />
        Export
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden"
            >
              <button
                onClick={() => { onExport('csv'); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <DocumentTextIcon className="w-4 h-4" />
                Export as CSV
              </button>
              <button
                onClick={() => { onExport('excel'); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <DocumentTextIcon className="w-4 h-4" />
                Export as Excel
              </button>
              <button
                onClick={() => { onExport('pdf'); setIsOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-left text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                <DocumentTextIcon className="w-4 h-4" />
                Export as PDF
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// ============================================================================
// EMPTY STATE
// ============================================================================

const EmptyState = ({ hasFilters, onClearFilters }) => (
  <div className="text-center py-16">
    <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
      <DocumentTextIcon className="w-8 h-8 text-gray-400" />
    </div>
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No orders found</h3>
    <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
      {hasFilters
        ? 'Try adjusting your filters to find what you\'re looking for.'
        : 'Orders will appear here once customers start placing them.'}
    </p>
    {hasFilters && (
      <Button variant="outline" className="mt-6" onClick={onClearFilters}>
        Clear filters
      </Button>
    )}
  </div>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function ManageOrdersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [search, setSearch] = useState(searchParams.get('search') || '');

  const filters = useMemo(() => ({
    page: parseInt(searchParams.get('page')) || 1,
    limit: 20,
    status: searchParams.get('status') || '',
    paymentStatus: searchParams.get('paymentStatus') || '',
    search: searchParams.get('search') || '',
    dateFrom: searchParams.get('dateFrom') || '',
    dateTo: searchParams.get('dateTo') || '',
  }), [searchParams]);

  const hasActiveFilters = filters.status || filters.paymentStatus || filters.search;

  const fetchOrders = useCallback(async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const response = await ordersService.getAll(filters);
      setOrders(response.data || []);
      setPagination(response.pagination);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handleSearch = () => {
    handleFilterChange('search', search);
  };

  const handleClearFilters = () => {
    setSearch('');
    setSearchParams(new URLSearchParams());
  };

  const handleSelectOrder = (orderId) => {
    setSelectedOrders((prev) =>
      prev.includes(orderId)
        ? prev.filter((id) => id !== orderId)
        : [...prev, orderId]
    );
  };

  const handleSelectAll = () => {
    if (selectedOrders.length === orders.length) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(orders.map((o) => o.id));
    }
  };

  const handleBulkAction = async (newStatus) => {
    try {
      await Promise.all(
        selectedOrders.map((id) =>
          ordersService.updateStatus(id, { status: newStatus })
        )
      );
      toast.success(`${selectedOrders.length} orders updated to ${ORDER_STATUSES[newStatus]?.label}`);
      setSelectedOrders([]);
      fetchOrders(true);
    } catch (error) {
      toast.error('Failed to update some orders');
    }
  };

  const handleExport = (format) => {
    toast.success(`Exporting orders as ${format.toUpperCase()}...`);
    // Implement actual export functionality
  };

  const handlePageChange = (page) => {
    handleFilterChange('page', page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) return <PageLoader />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Orders</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Manage and track all customer orders
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchOrders(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
          >
            <ArrowPathIcon className={cn('w-4 h-4', refreshing && 'animate-spin')} />
            Refresh
          </button>
          <ExportDropdown onExport={handleExport} />
        </div>
      </div>

      {/* Filter Tabs */}
      <FilterTabs
        value={filters.status}
        onChange={(value) => handleFilterChange('status', value)}
      />

      {/* Search & Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] max-w-md relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Search by order #, customer name, or phone..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent"
            />
          </div>
          <Button onClick={handleSearch} size="sm">Search</Button>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600"
            >
              <XMarkIcon className="w-4 h-4" />
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        {orders.length === 0 ? (
          <EmptyState hasFilters={hasActiveFilters} onClearFilters={handleClearFilters} />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedOrders.length === orders.length}
                        onChange={handleSelectAll}
                        className="w-4 h-4 rounded border-gray-300 text-amber-500 focus:ring-amber-500"
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Order
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {orders.map((order) => (
                    <OrderRow
                      key={order.id}
                      order={order}
                      isSelected={selectedOrders.includes(order.id)}
                      onSelect={handleSelectOrder}
                      onUpdate={() => fetchOrders(true)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.pages > 1 && (
              <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {orders.length} of {pagination.total} orders
                </p>
                <Pagination
                  currentPage={filters.page}
                  totalPages={pagination.pages}
                  onPageChange={handlePageChange}
                  compact
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Bulk Actions Bar */}
      <AnimatePresence>
        <BulkActionsBar
          selectedCount={selectedOrders.length}
          onClear={() => setSelectedOrders([])}
          onBulkAction={handleBulkAction}
        />
      </AnimatePresence>
    </div>
  );
}