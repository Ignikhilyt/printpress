/**
 * Order Confirmation Page
 * Premium order success page with confetti animation, order details,
 * estimated delivery, next steps, and related products.
 */

import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import {
    CheckCircleIcon,
    DocumentTextIcon,
    TruckIcon,
    EnvelopeIcon,
    PhoneIcon,
    ClipboardDocumentIcon,
    PrinterIcon,
    ArrowRightIcon,
    HomeIcon,
    ShoppingBagIcon,
    SparklesIcon,
    ClockIcon,
    MapPinIcon,
    CreditCardIcon,
    ShareIcon,
} from '@heroicons/react/24/outline';
import { ordersService } from '../../services/ordersService';
import { formatCurrency, formatDate, cn } from '../../utils/helpers';
import { PAPER_TYPES, PRINT_TYPES, BINDING_TYPES, DELIVERY_OPTIONS } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import { PageLoader } from '../../components/common/Loader';
import toast from 'react-hot-toast';

// ============================================================================
// CONFETTI COMPONENT
// ============================================================================

const ConfettiAnimation = ({ show }) => {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }, []);

    if (!show) return null;

    return (
        <Confetti
            width={windowSize.width}
            height={windowSize.height}
            numberOfPieces={200}
            recycle={false}
            colors={['#f59e0b', '#fbbf24', '#fcd34d', '#10b981', '#3b82f6', '#8b5cf6']}
        />
    );
};

// ============================================================================
// SUCCESS ANIMATION
// ============================================================================

const SuccessAnimation = () => (
    <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-emerald-500/30"
    >
        <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
        >
            <CheckCircleIcon className="w-12 h-12 text-white" />
        </motion.div>
    </motion.div>
);

// ============================================================================
// ORDER ITEM CARD
// ============================================================================

const OrderItemCard = ({ item }) => (
    <div className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl">
        <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
            <DocumentTextIcon className="w-7 h-7 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 min-w-0">
            <h4 className="font-medium text-gray-900 dark:text-white truncate">
                {item.note?.title || 'Study Notes'}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
                Qty: {item.quantity} × {formatCurrency(item.unitPrice)}
            </p>
        </div>
        <div className="text-right">
            <p className="font-semibold text-gray-900 dark:text-white">
                {formatCurrency(item.totalPrice)}
            </p>
        </div>
    </div>
);

// ============================================================================
// TIMELINE STEP
// ============================================================================

const TimelineStep = ({ icon: Icon, title, description, isActive, isCompleted }) => (
    <div className="flex gap-4">
        <div className="flex flex-col items-center">
            <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center',
                isCompleted
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400'
                    : isActive
                        ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            )}>
                <Icon className="w-5 h-5" />
            </div>
            <div className="w-0.5 h-8 bg-gray-200 dark:bg-gray-700 last:hidden" />
        </div>
        <div className="pb-8">
            <p className={cn(
                'font-medium',
                isCompleted || isActive
                    ? 'text-gray-900 dark:text-white'
                    : 'text-gray-500 dark:text-gray-400'
            )}>
                {title}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
    </div>
);

// ============================================================================
// QUICK ACTION CARD
// ============================================================================

const QuickActionCard = ({ icon: Icon, title, description, onClick, href }) => {
    const content = (
        <motion.div
            whileHover={{ y: -4 }}
            className="p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-amber-500 dark:hover:border-amber-500 transition-all cursor-pointer"
        >
            <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center mb-3">
                <Icon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <h4 className="font-medium text-gray-900 dark:text-white">{title}</h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </motion.div>
    );

    if (href) {
        return <Link to={href}>{content}</Link>;
    }
    return <button onClick={onClick} className="text-left w-full">{content}</button>;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OrderConfirmationPage() {
    const { orderNumber } = useParams();
    const navigate = useNavigate();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(true);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const response = await ordersService.getByOrderNumber(orderNumber);
                setOrder(response.data);
            } catch (error) {
                console.error('Failed to fetch order:', error);
                toast.error('Order not found');
                navigate('/');
            } finally {
                setLoading(false);
            }
        };

        if (orderNumber) {
            fetchOrder();
        }

        // Hide confetti after 5 seconds
        const timer = setTimeout(() => setShowConfetti(false), 5000);
        return () => clearTimeout(timer);
    }, [orderNumber, navigate]);

    const handleCopyOrderNumber = useCallback(() => {
        navigator.clipboard.writeText(orderNumber);
        toast.success('Order number copied!');
    }, [orderNumber]);

    const handleShare = useCallback(async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'PrintPress Order',
                    text: `Check out my order ${orderNumber} on PrintPress!`,
                    url: window.location.href,
                });
            } catch (err) {
                // User cancelled share
            }
        } else {
            handleCopyOrderNumber();
        }
    }, [orderNumber, handleCopyOrderNumber]);

    if (loading) return <PageLoader />;

    // Fallback data if order not loaded
    const orderData = order || {
        orderNumber,
        createdAt: new Date().toISOString(),
        items: [],
        subtotal: 0,
        bindingCharge: 0,
        deliveryCharge: 0,
        totalAmount: 0,
        paperType: 'GSM_70',
        printType: 'BW',
        bindingType: 'STAPLE',
        deliveryType: 'STANDARD',
        customerName: 'Customer',
        customerEmail: 'customer@email.com',
        customerPhone: '9876543210',
    };

    const paperType = PAPER_TYPES.find(p => p.id === orderData.paperType);
    const printType = PRINT_TYPES.find(p => p.id === orderData.printType);
    const bindingType = BINDING_TYPES.find(b => b.id === orderData.bindingType);
    const deliveryType = DELIVERY_OPTIONS.find(d => d.id === orderData.deliveryType);

    const estimatedDelivery = new Date();
    estimatedDelivery.setDate(estimatedDelivery.getDate() + (orderData.deliveryType === 'EXPRESS' ? 3 : orderData.deliveryType === 'SAME_DAY' ? 1 : 7));

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <ConfettiAnimation show={showConfetti} />

            <div className="max-w-4xl mx-auto px-4">
                {/* Success Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-8"
                >
                    <SuccessAnimation />
                    <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Order Confirmed! 🎉
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        Thank you for your order. We'll send you a confirmation email shortly.
                    </p>
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-500 dark:text-gray-400">Order ID:</span>
                        <span className="font-mono font-bold text-amber-600 dark:text-amber-400 text-lg">
                            {orderNumber}
                        </span>
                        <button
                            onClick={handleCopyOrderNumber}
                            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                            title="Copy order number"
                        >
                            <ClipboardDocumentIcon className="w-5 h-5 text-gray-400" />
                        </button>
                    </div>
                </motion.div>

                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Left Column - Order Details */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Order Items */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <ShoppingBagIcon className="w-5 h-5" />
                                Order Items
                            </h2>
                            <div className="space-y-3">
                                {orderData.items?.length > 0 ? (
                                    orderData.items.map((item, i) => (
                                        <OrderItemCard key={i} item={item} />
                                    ))
                                ) : (
                                    <p className="text-gray-500 dark:text-gray-400 text-center py-4">
                                        Order items will be displayed here
                                    </p>
                                )}
                            </div>

                            {/* Print Options */}
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
                                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Print Options</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    {[
                                        { label: 'Paper', value: paperType?.name || 'Standard' },
                                        { label: 'Print', value: printType?.name || 'B&W' },
                                        { label: 'Binding', value: bindingType?.name || 'Staple' },
                                        { label: 'Delivery', value: deliveryType?.name || 'Standard' },
                                    ].map((opt, i) => (
                                        <div key={i} className="p-3 rounded-xl bg-gray-50 dark:bg-gray-900/50">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{opt.label}</p>
                                            <p className="font-medium text-gray-900 dark:text-white">{opt.value}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Price Summary */}
                            <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-2">
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Subtotal</span>
                                    <span>{formatCurrency(orderData.subtotal || 0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Binding</span>
                                    <span>{formatCurrency(orderData.bindingCharge || 0)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600 dark:text-gray-400">
                                    <span>Delivery</span>
                                    <span>{orderData.deliveryCharge > 0 ? formatCurrency(orderData.deliveryCharge) : 'Free'}</span>
                                </div>
                                <div className="flex justify-between text-lg font-bold pt-3 border-t border-gray-100 dark:border-gray-700">
                                    <span>Total</span>
                                    <span className="text-amber-600 dark:text-amber-400">
                                        {formatCurrency(orderData.totalAmount || 0)}
                                    </span>
                                </div>
                            </div>
                        </motion.div>

                        {/* Next Steps Timeline */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                        >
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                                <ClockIcon className="w-5 h-5" />
                                What Happens Next?
                            </h2>
                            <div>
                                <TimelineStep
                                    icon={CheckCircleIcon}
                                    title="Order Placed"
                                    description="Your order has been received"
                                    isCompleted
                                />
                                <TimelineStep
                                    icon={PrinterIcon}
                                    title="Printing Started"
                                    description="We'll start printing your notes soon"
                                    isActive
                                />
                                <TimelineStep
                                    icon={TruckIcon}
                                    title="Shipped"
                                    description="Your order will be dispatched"
                                />
                                <TimelineStep
                                    icon={HomeIcon}
                                    title="Delivered"
                                    description={`Expected by ${formatDate(estimatedDelivery)}`}
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column - Actions & Info */}
                    <div className="space-y-6">
                        {/* Estimated Delivery */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl p-6 text-black"
                        >
                            <TruckIcon className="w-8 h-8 mb-3" />
                            <h3 className="font-bold mb-1">Estimated Delivery</h3>
                            <p className="text-2xl font-bold">{formatDate(estimatedDelivery)}</p>
                            <p className="text-sm opacity-80 mt-1">{deliveryType?.duration || '5-7 business days'}</p>
                        </motion.div>

                        {/* Payment Info */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <CreditCardIcon className="w-5 h-5" />
                                Payment
                            </h3>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600 dark:text-gray-400">Method</span>
                                <Badge type="soft" variant="warning">Cash on Delivery</Badge>
                            </div>
                        </motion.div>

                        {/* Delivery Address */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700"
                        >
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <MapPinIcon className="w-5 h-5" />
                                Delivery Address
                            </h3>
                            <div className="space-y-2 text-gray-600 dark:text-gray-400 text-sm">
                                <p className="font-medium text-gray-900 dark:text-white">
                                    {orderData.customerName}
                                </p>
                                <p>{orderData.addressLine1}</p>
                                {orderData.addressLine2 && <p>{orderData.addressLine2}</p>}
                                <p>{orderData.city}, {orderData.state} - {orderData.pincode}</p>
                                <p className="flex items-center gap-2">
                                    <PhoneIcon className="w-4 h-4" />
                                    {orderData.customerPhone}
                                </p>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="grid grid-cols-2 gap-3"
                        >
                            <QuickActionCard
                                icon={EnvelopeIcon}
                                title="Email Sent"
                                description="Check your inbox"
                            />
                            <QuickActionCard
                                icon={ShareIcon}
                                title="Share"
                                description="Tell a friend"
                                onClick={handleShare}
                            />
                        </motion.div>

                        {/* Continue Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="space-y-3"
                        >
                            <Link to="/notes" className="block">
                                <Button className="w-full">
                                    Continue Shopping
                                    <ArrowRightIcon className="w-4 h-4 ml-2" />
                                </Button>
                            </Link>
                            <Link to="/" className="block">
                                <Button variant="outline" className="w-full">
                                    <HomeIcon className="w-4 h-4 mr-2" />
                                    Back to Home
                                </Button>
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
}
