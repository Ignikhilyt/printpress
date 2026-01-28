import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import Button from '../common/Button';

const TagIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
    </svg>
);

const CloseIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

export default function CouponInput({
    onApply,
    appliedCoupon,
    onRemove,
    className = '',
}) {
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleApply = async () => {
        if (!code.trim()) return;

        setLoading(true);
        setError('');

        // Simulated coupon validation - in production, call API
        setTimeout(() => {
            if (code.toUpperCase() === 'SAVE10') {
                onApply?.({ code: 'SAVE10', type: 'percentage', value: 10 });
                setCode('');
                toast.success('Coupon applied! 10% discount');
            } else if (code.toUpperCase() === 'FLAT50') {
                onApply?.({ code: 'FLAT50', type: 'fixed', value: 50 });
                setCode('');
                toast.success('Coupon applied! ₹50 off');
            } else if (code.toUpperCase() === 'WELCOME20') {
                onApply?.({ code: 'WELCOME20', type: 'percentage', value: 20 });
                setCode('');
                toast.success('Coupon applied! 20% discount for new users');
            } else {
                setError('Invalid coupon code');
            }
            setLoading(false);
        }, 500);
    };

    if (appliedCoupon) {
        return (
            <div
                className={`flex items-center justify-between p-3 bg-green-50 rounded-lg border border-dashed border-green-500 ${className}`}
            >
                <div className="flex items-center gap-2">
                    <span className="text-green-600"><TagIcon /></span>
                    <span className="font-semibold text-green-600">{appliedCoupon.code}</span>
                    <span className="text-sm text-gray-600">
                        ({appliedCoupon.type === 'percentage' ? `${appliedCoupon.value}% off` : `₹${appliedCoupon.value} off`})
                    </span>
                </div>
                <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onRemove}
                    className="text-red-500 hover:text-red-600"
                >
                    <CloseIcon />
                </motion.button>
            </div>
        );
    }

    return (
        <div className={className}>
            <div className="flex gap-2">
                <input
                    type="text"
                    value={code}
                    onChange={(e) => { setCode(e.target.value.toUpperCase()); setError(''); }}
                    placeholder="Enter coupon code"
                    className={`flex-1 px-4 py-3 border-2 rounded-lg text-sm uppercase focus:outline-none focus:border-indigo-500 ${error ? 'border-red-300' : 'border-gray-200'
                        }`}
                />
                <Button
                    variant="secondary"
                    onClick={handleApply}
                    loading={loading}
                    disabled={!code.trim()}
                >
                    Apply
                </Button>
            </div>
            {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
            <p className="text-xs text-gray-500 mt-1">
                Try: SAVE10, FLAT50, or WELCOME20
            </p>
        </div>
    );
}
