/**
 * Order/Checkout Page
 * Premium checkout experience with cart items, print options,
 * delivery address, stepper progress, and order summary.
 */

import { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrashIcon,
    MinusIcon,
    PlusIcon,
    ShoppingCartIcon,
    DocumentTextIcon,
    TruckIcon,
    CreditCardIcon,
    CheckCircleIcon,
    ShieldCheckIcon,
    ClockIcon,
    MapPinIcon,
    UserIcon,
    PhoneIcon,
    EnvelopeIcon,
    ChevronRightIcon,
    TagIcon,
} from '@heroicons/react/24/outline';
import { useCartStore } from '../../store/cartStore';
import { ordersService } from '../../services/ordersService';
import { formatCurrency, cn } from '../../utils/helpers';
import { PAPER_TYPES, PRINT_TYPES, BINDING_TYPES, DELIVERY_OPTIONS, INDIAN_STATES } from '../../utils/constants';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

// ============================================================================
// CHECKOUT STEPS
// ============================================================================

const STEPS = [
    { id: 1, name: 'Cart', icon: ShoppingCartIcon },
    { id: 2, name: 'Delivery', icon: TruckIcon },
    { id: 3, name: 'Payment', icon: CreditCardIcon },
];

const CheckoutStepper = ({ currentStep }) => (
    <div className="flex items-center justify-center mb-8">
        {STEPS.map((step, index) => (
            <div key={step.id} className="flex items-center">
                <motion.div
                    initial={{ scale: 0.8 }}
                    animate={{ scale: currentStep >= step.id ? 1 : 0.8 }}
                    className={cn(
                        'flex items-center justify-center w-10 h-10 rounded-full transition-all',
                        currentStep > step.id
                            ? 'bg-emerald-500 text-white'
                            : currentStep === step.id
                                ? 'bg-amber-500 text-black'
                                : 'bg-gray-200 dark:bg-gray-700 text-gray-500'
                    )}
                >
                    {currentStep > step.id ? (
                        <CheckCircleIcon className="w-5 h-5" />
                    ) : (
                        <step.icon className="w-5 h-5" />
                    )}
                </motion.div>
                <span className={cn(
                    'ml-2 text-sm font-medium hidden sm:inline',
                    currentStep >= step.id ? 'text-gray-900 dark:text-white' : 'text-gray-400'
                )}>
                    {step.name}
                </span>
                {index < STEPS.length - 1 && (
                    <div className={cn(
                        'w-12 sm:w-20 h-0.5 mx-3',
                        currentStep > step.id ? 'bg-emerald-500' : 'bg-gray-200 dark:bg-gray-700'
                    )} />
                )}
            </div>
        ))}
    </div>
);

// ============================================================================
// CART ITEM
// ============================================================================

const CartItem = ({ item, onUpdateQuantity, onRemove, options }) => {
    const calculatePrice = () => {
        const basePrice = item.note.pageCount * item.note.pricePerPage;
        const paperMultiplier = options.paperType === 'GSM_80' ? 1.15 : options.paperType === 'GSM_100' ? 1.3 : 1;
        const printMultiplier = options.printType === 'COLOR' ? 3.5 : 1;
        return Math.round(basePrice * paperMultiplier * printMultiplier * item.quantity);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="flex gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl"
        >
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                <DocumentTextIcon className="w-8 h-8 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-medium text-gray-900 dark:text-white truncate">{item.note.title}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.note.pageCount} pages</p>
                <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.note.id, Math.max(1, item.quantity - 1))}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-l-lg"
                        >
                            <MinusIcon className="w-4 h-4" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button
                            type="button"
                            onClick={() => onUpdateQuantity(item.note.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-r-lg"
                        >
                            <PlusIcon className="w-4 h-4" />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={() => onRemove(item.note.id)}
                        className="text-red-500 hover:text-red-600"
                    >
                        <TrashIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>
            <div className="text-right">
                <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(calculatePrice())}</p>
            </div>
        </motion.div>
    );
};

// ============================================================================
// OPTION CARD
// ============================================================================

const OptionCard = ({ option, isSelected, onClick, showPrice }) => (
    <motion.button
        type="button"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={cn(
            'p-4 rounded-xl border-2 text-left transition-all w-full',
            isSelected
                ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
        )}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="font-medium text-gray-900 dark:text-white">{option.name}</p>
                {option.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{option.description}</p>
                )}
            </div>
            {showPrice && option.price > 0 && (
                <span className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                    +{formatCurrency(option.price)}
                </span>
            )}
        </div>
    </motion.button>
);

// ============================================================================
// INPUT FIELD
// ============================================================================

const InputField = ({ label, error, icon: Icon, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label}
        </label>
        <div className="relative">
            {Icon && (
                <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            )}
            <input
                className={cn(
                    'w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all',
                    Icon && 'pl-10',
                    error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                )}
                {...props}
            />
        </div>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
);

// ============================================================================
// ORDER SUMMARY CARD
// ============================================================================

const OrderSummaryCard = ({ subtotal, bindingTotal, deliveryCharge, discount, total, loading }) => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700 sticky top-24">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Summary</h3>

        <div className="space-y-3 mb-4">
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Binding</span>
                <span>{formatCurrency(bindingTotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600 dark:text-gray-400">
                <span>Delivery</span>
                <span>{deliveryCharge > 0 ? formatCurrency(deliveryCharge) : 'Free'}</span>
            </div>
            {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                    <span className="flex items-center gap-1">
                        <TagIcon className="w-4 h-4" />
                        Discount
                    </span>
                    <span>-{formatCurrency(discount)}</span>
                </div>
            )}
        </div>

        <div className="flex justify-between text-lg font-bold pt-4 border-t border-gray-100 dark:border-gray-700 mb-6">
            <span>Total</span>
            <span className="text-amber-600 dark:text-amber-400">{formatCurrency(total)}</span>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-xl p-3 mb-6">
            <p className="text-sm text-amber-800 dark:text-amber-400 flex items-center gap-2">
                <CreditCardIcon className="w-4 h-4" />
                <span><strong>Payment:</strong> Cash on Delivery (COD)</span>
            </p>
        </div>

        <Button type="submit" form="checkout-form" className="w-full" loading={loading}>
            Place Order
        </Button>

        <div className="mt-6 pt-6 border-t border-gray-100 dark:border-gray-700 space-y-3">
            {[
                { icon: ShieldCheckIcon, text: 'Secure checkout' },
                { icon: TruckIcon, text: 'Fast delivery' },
                { icon: ClockIcon, text: '24/7 support' },
            ].map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <item.icon className="w-4 h-4 text-emerald-500" />
                    <span>{item.text}</span>
                </div>
            ))}
        </div>
    </div>
);

// ============================================================================
// EMPTY CART
// ============================================================================

const EmptyCart = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-[60vh] flex items-center justify-center"
    >
        <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <ShoppingCartIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Your Cart is Empty</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8">
                Browse our collection and add some notes to your cart.
            </p>
            <Link to="/notes">
                <Button>
                    Browse Notes
                    <ChevronRightIcon className="w-4 h-4 ml-2" />
                </Button>
            </Link>
        </div>
    </motion.div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function OrderPage() {
    const navigate = useNavigate();

    // Zustand Store Selectors
    const items = useCartStore((state) => state.items);
    const options = useCartStore((state) => state.options);
    const updateOptions = useCartStore((state) => state.updateOptions);
    const updateQuantity = useCartStore((state) => state.updateQuantity);
    const removeItem = useCartStore((state) => state.removeItem);
    const clearCart = useCartStore((state) => state.clearCart);
    const pricing = useCartStore((state) => state.getPricing());

    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    async function onSubmit(data) {
        if (items.length === 0) {
            toast.error('Your cart is empty');
            return;
        }

        setLoading(true);
        try {
            const orderData = {
                ...data,
                paperType: options.paperType,
                printType: options.printType,
                bindingType: options.bindingType,
                deliveryType: options.deliveryType,
                items: items.map((item) => ({
                    noteId: item.note.id,
                    quantity: item.quantity,
                })),
            };

            const response = await ordersService.create(orderData);

            if (response.success) {
                clearCart();
                toast.success('Order placed successfully!');
                navigate(`/order/confirmation/${response.data.orderNumber}`);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to place order');
        } finally {
            setLoading(false);
        }
    }

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <EmptyCart />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white text-center mb-6">
                    Checkout
                </h1>

                <CheckoutStepper currentStep={step} />

                <form id="checkout-form" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Cart Items */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <ShoppingCartIcon className="w-5 h-5" />
                                    Cart Items ({items.length})
                                    {pricing.discountPercentage > 0 && (
                                        <Badge variant="success" className="ml-2">
                                            {pricing.discountPercentage}% off
                                        </Badge>
                                    )}
                                </h2>
                                <AnimatePresence>
                                    <div className="space-y-3">
                                        {items.map((item) => (
                                            <CartItem
                                                key={item.note.id}
                                                item={item}
                                                onUpdateQuantity={updateQuantity}
                                                onRemove={removeItem}
                                                options={options}
                                            />
                                        ))}
                                    </div>
                                </AnimatePresence>
                            </div>

                            {/* Delivery Address */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-100 dark:border-gray-700">
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <MapPinIcon className="w-5 h-5" />
                                    Delivery Address
                                </h2>
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <InputField
                                        label="Full Name *"
                                        icon={UserIcon}
                                        placeholder="John Doe"
                                        error={errors.customerName?.message}
                                        {...register('customerName', { required: 'Name is required' })}
                                    />
                                    <InputField
                                        label="Email *"
                                        icon={EnvelopeIcon}
                                        type="email"
                                        placeholder="john@example.com"
                                        error={errors.customerEmail?.message}
                                        {...register('customerEmail', {
                                            required: 'Email is required',
                                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' },
                                        })}
                                    />
                                    <InputField
                                        label="Phone *"
                                        icon={PhoneIcon}
                                        placeholder="9876543210"
                                        error={errors.customerPhone?.message}
                                        {...register('customerPhone', {
                                            required: 'Phone is required',
                                            pattern: { value: /^[6-9]\d{9}$/, message: 'Invalid phone number' },
                                        })}
                                    />
                                    <InputField
                                        label="Pincode *"
                                        placeholder="110001"
                                        error={errors.pincode?.message}
                                        {...register('pincode', {
                                            required: 'Pincode is required',
                                            pattern: { value: /^\d{6}$/, message: 'Invalid pincode' },
                                        })}
                                    />
                                    <div className="sm:col-span-2">
                                        <InputField
                                            label="Address Line 1 *"
                                            placeholder="House/Flat No., Building, Street"
                                            error={errors.addressLine1?.message}
                                            {...register('addressLine1', { required: 'Address is required' })}
                                        />
                                    </div>
                                    <InputField
                                        label="City *"
                                        placeholder="New Delhi"
                                        error={errors.city?.message}
                                        {...register('city', { required: 'City is required' })}
                                    />
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">State *</label>
                                        <select
                                            {...register('state', { required: 'State is required' })}
                                            className={cn(
                                                'w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500',
                                                errors.state ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                            )}
                                        >
                                            <option value="">Select State</option>
                                            {INDIAN_STATES?.map((state) => (
                                                <option key={state} value={state}>{state}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right: Order Summary */}
                        <div>
                            <OrderSummaryCard
                                subtotal={pricing.subtotal}
                                bindingTotal={pricing.bindingTotal}
                                deliveryCharge={pricing.deliveryCharge}
                                discount={pricing.discount}
                                total={pricing.total}
                                loading={loading}
                            />
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
