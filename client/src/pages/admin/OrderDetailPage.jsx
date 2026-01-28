/**
 * Admin Order Detail Page
 * Comprehensive order management with status updates, customer info,
 * timeline tracking, print queue, and shipping management.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    ArrowLeftIcon,
    PrinterIcon,
    TruckIcon,
    CheckCircleIcon,
    ClockIcon,
    XCircleIcon,
    PhoneIcon,
    EnvelopeIcon,
    MapPinIcon,
    DocumentTextIcon,
    CurrencyRupeeIcon,
    UserIcon,
    CalendarIcon,
    ChevronDownIcon,
    ArrowPathIcon,
    PencilIcon,
    TrashIcon,
    DocumentDuplicateIcon,
    ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { ordersService } from '../../services/ordersService';
import { formatCurrency, formatDate, cn } from '../../utils/helpers';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { PageLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

// ============================================================================
// STATUS TIMELINE
// ============================================================================

const StatusTimeline = ({ currentStatus }) => {
    const statuses = [
        { key: 'PENDING', label: 'Order Placed', icon: ClockIcon },
        { key: 'CONFIRMED', label: 'Confirmed', icon: CheckCircleIcon },
        { key: 'PROCESSING', label: 'Processing', icon: PrinterIcon },
        { key: 'PRINTED', label: 'Printed', icon: DocumentTextIcon },
        { key: 'SHIPPED', label: 'Shipped', icon: TruckIcon },
        { key: 'DELIVERED', label: 'Delivered', icon: CheckCircleIcon },
    ];

    const currentIndex = statuses.findIndex(s => s.key === currentStatus);
    const isCancelled = currentStatus === 'CANCELLED';

    return (
        <div className="relative">
            <div className="flex justify-between">
                {statuses.map((status, index) => {
                    const isCompleted = index <= currentIndex && !isCancelled;
                    const isCurrent = index === currentIndex && !isCancelled;
                    const StatusIcon = status.icon;

                    return (
                        <div key={status.key} className="flex flex-col items-center relative z-10">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                                className={cn(
                                    'w-10 h-10 rounded-full flex items-center justify-center',
                                    isCompleted
                                        ? 'bg-emerald-500 text-white'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                                )}
                            >
                                <StatusIcon className="w-5 h-5" />
                            </motion.div>
                            <p className={cn(
                                'text-xs mt-2 text-center',
                                isCompleted ? 'text-gray-900 dark:text-white font-medium' : 'text-gray-400'
                            )}>
                                {status.label}
                            </p>
                            {isCurrent && (
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 2 }}
                                    className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-800"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
            {/* Progress line */}
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200 dark:bg-gray-700 -z-0">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: isCancelled ? 0 : `${(currentIndex / (statuses.length - 1)) * 100}%` }}
                    transition={{ duration: 0.5 }}
                    className="h-full bg-emerald-500"
                />
            </div>
        </div>
    );
};

// ============================================================================
// INFO CARD
// ============================================================================

const InfoCard = ({ title, icon: Icon, children, actions }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-gray-400" />
                <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
            </div>
            {actions}
        </div>
        <div className="p-6">{children}</div>
    </div>
);

// ============================================================================
// STATUS UPDATE MODAL
// ============================================================================

const StatusUpdateModal = ({ isOpen, onClose, order, onUpdate }) => {
    const [status, setStatus] = useState(order?.status || '');
    const [tracking, setTracking] = useState(order?.trackingNumber || '');
    const [courier, setCourier] = useState(order?.courierName || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await ordersService.updateStatus(order.id, {
                status,
                trackingNumber: tracking,
                courierName: courier,
            });
            toast.success('Order status updated');
            onUpdate();
            onClose();
        } catch (error) {
            toast.error('Failed to update status');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Update Order Status" size="md">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        {Object.entries(ORDER_STATUSES).map(([key, value]) => (
                            <option key={key} value={key}>{value.label}</option>
                        ))}
                    </select>
                </div>

                {status === 'SHIPPED' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-2">Courier Name</label>
                            <input
                                type="text"
                                value={courier}
                                onChange={(e) => setCourier(e.target.value)}
                                placeholder="e.g., Delhivery, BlueDart"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Tracking Number</label>
                            <input
                                type="text"
                                value={tracking}
                                onChange={(e) => setTracking(e.target.value)}
                                placeholder="Enter tracking number"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    </>
                )}

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Cancel
                    </Button>
                    <Button type="submit" loading={loading} className="flex-1">
                        Update Status
                    </Button>
                </div>
            </form>
        </Modal>
    );
};

// ============================================================================
// CANCEL ORDER MODAL
// ============================================================================

const CancelOrderModal = ({ isOpen, onClose, order, onCancel }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleCancel = async () => {
        setLoading(true);
        try {
            await ordersService.cancelOrder(order.id, { reason });
            toast.success('Order cancelled');
            onCancel();
            onClose();
        } catch (error) {
            toast.error('Failed to cancel order');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Cancel Order" size="md">
            <div className="space-y-4">
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
                    <div className="flex gap-3">
                        <ExclamationTriangleIcon className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <div>
                            <p className="text-sm text-red-700 dark:text-red-400 font-medium">
                                Are you sure you want to cancel this order?
                            </p>
                            <p className="text-sm text-red-600 dark:text-red-500 mt-1">
                                This action cannot be undone.
                            </p>
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-2">Reason for cancellation</label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        rows={3}
                        placeholder="Enter reason for cancellation..."
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                </div>

                <div className="flex gap-3 pt-4">
                    <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                        Keep Order
                    </Button>
                    <Button
                        type="button"
                        onClick={handleCancel}
                        loading={loading}
                        className="flex-1 bg-red-600 hover:bg-red-700"
                    >
                        Cancel Order
                    </Button>
                </div>
            </div>
        </Modal>
    );
};

// ============================================================================
// ORDER ITEM ROW
// ============================================================================

const OrderItemRow = ({ item }) => (
    <div className="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-gray-700 last:border-0">
        <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <DocumentTextIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
            <p className="font-medium text-gray-900 dark:text-white truncate">
                {item.note?.title || 'Note'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                {item.pageCount} pages × {item.quantity} copies
            </p>
        </div>
        <div className="text-right">
            <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(item.totalPrice)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
                @ {formatCurrency(item.pricePerPage)}/page
            </p>
        </div>
    </div>
);

// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function OrderDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [cancelModalOpen, setCancelModalOpen] = useState(false);

    const fetchOrder = useCallback(async () => {
        try {
            const response = await ordersService.getById(id);
            setOrder(response.data);
        } catch (error) {
            console.error('Failed to fetch order:', error);
            toast.error('Order not found');
            navigate('/admin/orders');
        } finally {
            setLoading(false);
        }
    }, [id, navigate]);

    useEffect(() => {
        fetchOrder();
    }, [fetchOrder]);

    const handleCopyOrderNumber = () => {
        navigator.clipboard.writeText(order.orderNumber);
        toast.success('Order number copied!');
    };

    if (loading) return <PageLoader />;
    if (!order) return null;

    const canCancel = !['SHIPPED', 'DELIVERED', 'CANCELLED'].includes(order.status);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate('/admin/orders')}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                        <ArrowLeftIcon className="w-5 h-5" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                {order.orderNumber}
                            </h1>
                            <button
                                onClick={handleCopyOrderNumber}
                                className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800"
                                title="Copy order number"
                            >
                                <DocumentDuplicateIcon className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Placed on {formatDate(order.createdAt)}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {canCancel && (
                        <Button
                            variant="outline"
                            onClick={() => setCancelModalOpen(true)}
                            className="text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                        >
                            <XCircleIcon className="w-4 h-4 mr-2" />
                            Cancel Order
                        </Button>
                    )}
                    <Button onClick={() => setStatusModalOpen(true)}>
                        <PencilIcon className="w-4 h-4 mr-2" />
                        Update Status
                    </Button>
                </div>
            </div>

            {/* Status Timeline */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Order Progress</h3>
                <StatusTimeline currentStatus={order.status} />
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Left column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Order Items */}
                    <InfoCard title="Order Items" icon={DocumentTextIcon}>
                        {order.items?.map((item, index) => (
                            <OrderItemRow key={index} item={item} />
                        ))}
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Binding</span>
                                <span>{formatCurrency(order.bindingTotal || 0)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Delivery</span>
                                <span>{order.deliveryCharge > 0 ? formatCurrency(order.deliveryCharge) : 'Free'}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between text-sm text-emerald-600">
                                    <span>Discount</span>
                                    <span>-{formatCurrency(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-100 dark:border-gray-700">
                                <span>Total</span>
                                <span className="text-amber-600">{formatCurrency(order.totalAmount)}</span>
                            </div>
                        </div>
                    </InfoCard>

                    {/* Print Options */}
                    <InfoCard title="Print Options" icon={PrinterIcon}>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Paper Type</p>
                                <p className="font-medium text-gray-900 dark:text-white">{order.paperType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Print Type</p>
                                <p className="font-medium text-gray-900 dark:text-white">{order.printType}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Binding</p>
                                <p className="font-medium text-gray-900 dark:text-white">{order.bindingType}</p>
                            </div>
                        </div>
                        {order.customerNotes && (
                            <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Customer Notes</p>
                                <p className="text-sm text-gray-700 dark:text-gray-300">{order.customerNotes}</p>
                            </div>
                        )}
                    </InfoCard>
                </div>

                {/* Right column */}
                <div className="space-y-6">
                    {/* Customer Info */}
                    <InfoCard title="Customer" icon={UserIcon}>
                        <div className="space-y-3">
                            <p className="font-semibold text-gray-900 dark:text-white text-lg">
                                {order.customerName}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <PhoneIcon className="w-4 h-4" />
                                <a href={`tel:${order.customerPhone}`} className="hover:text-amber-600">
                                    {order.customerPhone}
                                </a>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <EnvelopeIcon className="w-4 h-4" />
                                <a href={`mailto:${order.customerEmail}`} className="hover:text-amber-600">
                                    {order.customerEmail}
                                </a>
                            </div>
                        </div>
                    </InfoCard>

                    {/* Shipping Address */}
                    <InfoCard title="Shipping Address" icon={MapPinIcon}>
                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                            {order.addressLine1}<br />
                            {order.addressLine2 && <>{order.addressLine2}<br /></>}
                            {order.city}, {order.state} - {order.pincode}
                            {order.landmark && <><br />Landmark: {order.landmark}</>}
                        </p>
                    </InfoCard>

                    {/* Payment Info */}
                    <InfoCard title="Payment" icon={CurrencyRupeeIcon}>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Method</span>
                                <Badge type="soft" variant="default">
                                    {order.paymentMethod || 'COD'}
                                </Badge>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500 dark:text-gray-400">Status</span>
                                <Badge
                                    type="soft"
                                    variant={order.paymentStatus === 'PAID' ? 'success' : 'warning'}
                                >
                                    {PAYMENT_STATUSES[order.paymentStatus]?.label || order.paymentStatus}
                                </Badge>
                            </div>
                            {order.transactionId && (
                                <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Transaction ID</p>
                                    <p className="font-mono text-sm">{order.transactionId}</p>
                                </div>
                            )}
                        </div>
                    </InfoCard>

                    {/* Shipping Info */}
                    {(order.trackingNumber || order.courierName) && (
                        <InfoCard title="Tracking" icon={TruckIcon}>
                            <div className="space-y-2">
                                {order.courierName && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Courier</p>
                                        <p className="font-medium">{order.courierName}</p>
                                    </div>
                                )}
                                {order.trackingNumber && (
                                    <div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Tracking Number</p>
                                        <p className="font-mono">{order.trackingNumber}</p>
                                    </div>
                                )}
                            </div>
                        </InfoCard>
                    )}
                </div>
            </div>

            {/* Modals */}
            <StatusUpdateModal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                order={order}
                onUpdate={fetchOrder}
            />
            <CancelOrderModal
                isOpen={cancelModalOpen}
                onClose={() => setCancelModalOpen(false)}
                order={order}
                onCancel={fetchOrder}
            />
        </div>
    );
}
