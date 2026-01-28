import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import toast from 'react-hot-toast';

// Constants
const PAPER_TYPES = {
    GSM_70: { multiplier: 1, name: '70 GSM' },
    GSM_80: { multiplier: 1.15, name: '80 GSM' },
    GSM_100: { multiplier: 1.3, name: '100 GSM' },
};

const PRINT_TYPES = {
    BLACK_WHITE: { multiplier: 1, name: 'Black & White' },
    COLOR: { multiplier: 3.5, name: 'Color' },
};

const BINDING_TYPES = {
    NONE: { price: 0, name: 'None' },
    STAPLE: { price: 10, name: 'Staple' },
    SPIRAL: { price: 40, name: 'Spiral' },
    HARDCOVER: { price: 150, name: 'Hardcover' },
};

const DELIVERY_TYPES = {
    STANDARD: { price: 50, name: 'Standard' },
    EXPRESS: { price: 100, name: 'Express' },
    SAME_DAY: { price: 200, name: 'Same Day' },
};

const COUPONS = {
    WELCOME10: { code: 'WELCOME10', discount: 10, minAmount: 299 },
    STUDY20: { code: 'STUDY20', discount: 20, minAmount: 599 },
    BULK30: { code: 'BULK30', discount: 30, minAmount: 999 },
};

export const useCartStore = create(
    persist(
        (set, get) => ({
            items: [],
            options: {
                paperType: 'GSM_70',
                printType: 'BLACK_WHITE',
                bindingType: 'SPIRAL',
                deliveryType: 'STANDARD',
            },
            coupon: null,
            isDrawerOpen: false,

            // Actions
            addItem: (note, quantity = 1) => {
                set((state) => {
                    const existingIndex = state.items.findIndex((item) => item.note.id === note.id);
                    if (existingIndex > -1) {
                        const updated = [...state.items];
                        updated[existingIndex].quantity += quantity;
                        toast.success(`Added ${quantity} more to cart`);
                        return { items: updated };
                    }
                    toast.success('Added to cart!');
                    return { items: [...state.items, { note, quantity }] };
                });
            },

            removeItem: (noteId) => {
                set((state) => ({
                    items: state.items.filter((item) => item.note.id !== noteId),
                }));
                toast.success('Removed from cart');
            },

            updateQuantity: (noteId, quantity) => {
                if (quantity < 1) {
                    get().removeItem(noteId);
                    return;
                }
                set((state) => ({
                    items: state.items.map((item) =>
                        item.note.id === noteId ? { ...item, quantity } : item
                    ),
                }));
            },

            updateOptions: (newOptions) => {
                set((state) => ({
                    options: { ...state.options, ...newOptions },
                }));
            },

            clearCart: () => {
                set({ items: [], coupon: null });
                toast.success('Cart cleared');
            },

            applyCoupon: (code) => {
                const pricing = get().getPricing();
                const validCoupon = COUPONS[code];

                if (!validCoupon) {
                    toast.error('Invalid coupon code');
                    return false;
                }
                if (pricing.subtotal < validCoupon.minAmount) {
                    toast.error(`Minimum order of ₹${validCoupon.minAmount} required`);
                    return false;
                }
                set({ coupon: validCoupon });
                toast.success(`Coupon applied: ${validCoupon.discount}% off!`);
                return true;
            },

            removeCoupon: () => {
                set({ coupon: null });
                toast.success('Coupon removed');
            },

            openDrawer: () => set({ isDrawerOpen: true }),
            closeDrawer: () => set({ isDrawerOpen: false }),

            // Computed Pricing
            getPricing: () => {
                const state = get();
                const { items, options, coupon } = state;

                const calculateItemPrice = (item) => {
                    const basePrice = item.note.pageCount * item.note.pricePerPage;
                    const paperMult = PAPER_TYPES[options.paperType]?.multiplier || 1;
                    const printMult = PRINT_TYPES[options.printType]?.multiplier || 1;
                    return Math.round(basePrice * paperMult * printMult * item.quantity);
                };

                const subtotal = items.reduce((sum, item) => sum + calculateItemPrice(item), 0);
                const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

                // Bulk discount
                const discountPercentage = totalQuantity >= 10 ? 10 : totalQuantity >= 5 ? 5 : 0;
                const discount = Math.round((subtotal * discountPercentage) / 100);

                // Coupon discount
                let couponDiscount = 0;
                if (coupon && subtotal >= coupon.minAmount) {
                    couponDiscount = Math.round((subtotal * coupon.discount) / 100);
                }

                // Binding
                const bindingPrice = BINDING_TYPES[options.bindingType]?.price || 0;
                const bindingTotal = bindingPrice * totalQuantity;

                // Delivery
                const deliveryPrice = DELIVERY_TYPES[options.deliveryType]?.price || 50;
                const deliveryCharge = subtotal >= 499 ? 0 : deliveryPrice;

                const total = subtotal + bindingTotal + deliveryCharge - discount - couponDiscount;

                return {
                    subtotal,
                    discount,
                    discountPercentage,
                    couponDiscount,
                    bindingTotal,
                    deliveryCharge,
                    total,
                    isFreeDelivery: subtotal >= 499,
                    itemCount: totalQuantity,
                };
            },
        }),
        {
            name: 'cart-storage', // unique name
            getStorage: () => localStorage, // (optional) by default, 'localStorage' is used
        }
    )
);
