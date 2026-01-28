/**
 * Contact Page
 * Premium contact page with form validation, contact info cards,
 * office hours, live chat button, and animated elements.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MapPinIcon,
    EnvelopeIcon,
    PhoneIcon,
    ClockIcon,
    ChatBubbleLeftRightIcon,
    PaperAirplaneIcon,
    CheckCircleIcon,
    UserIcon,
    BuildingOfficeIcon,
    ArrowRightIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';
import Button from '../../components/common/Button';
import toast from 'react-hot-toast';

// ============================================================================
// DATA
// ============================================================================

const CONTACT_INFO = [
    {
        icon: MapPinIcon,
        title: 'Visit Us',
        info: '123 Study Lane, Rajouri Garden',
        subInfo: 'New Delhi - 110027',
        color: 'from-blue-500 to-blue-600',
    },
    {
        icon: EnvelopeIcon,
        title: 'Email Us',
        info: 'support@printpress.in',
        subInfo: 'We reply within 24 hours',
        color: 'from-emerald-500 to-emerald-600',
        link: 'mailto:support@printpress.in',
    },
    {
        icon: PhoneIcon,
        title: 'Call Us',
        info: '+91 98765 43210',
        subInfo: 'Mon-Sat, 9:00 AM - 7:00 PM',
        color: 'from-purple-500 to-purple-600',
        link: 'tel:+919876543210',
    },
    {
        icon: ClockIcon,
        title: 'Office Hours',
        info: 'Mon - Sat: 9:00 AM - 7:00 PM',
        subInfo: 'Sunday: Closed',
        color: 'from-amber-500 to-amber-600',
    },
];

const SUBJECTS = [
    { value: '', label: 'Select a subject' },
    { value: 'order', label: '📦 Order Inquiry' },
    { value: 'delivery', label: '🚚 Delivery Issue' },
    { value: 'refund', label: '💰 Refund Request' },
    { value: 'bulk', label: '📚 Bulk Order' },
    { value: 'partnership', label: '🤝 Business Partnership' },
    { value: 'feedback', label: '💬 General Feedback' },
    { value: 'other', label: '❓ Other' },
];

const SOCIALS = [
    { name: 'Facebook', icon: '📘', href: '#' },
    { name: 'Instagram', icon: '📸', href: '#' },
    { name: 'Twitter', icon: '🐦', href: '#' },
    { name: 'LinkedIn', icon: '💼', href: '#' },
    { name: 'YouTube', icon: '🎥', href: '#' },
];

// ============================================================================
// CONTACT INFO CARD
// ============================================================================

const ContactInfoCard = ({ item, index }) => {
    const content = (
        <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all cursor-pointer"
        >
            <div className="flex items-start gap-4">
                <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br flex-shrink-0',
                    item.color
                )}>
                    <item.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                    <h3 className="font-bold text-gray-900 dark:text-white mb-1">
                        {item.title}
                    </h3>
                    <p className="text-gray-700 dark:text-gray-300">{item.info}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{item.subInfo}</p>
                </div>
            </div>
        </motion.div>
    );

    if (item.link) {
        return <a href={item.link}>{content}</a>;
    }
    return content;
};

// ============================================================================
// INPUT FIELD
// ============================================================================

const InputField = ({ label, error, icon: Icon, required, ...props }) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative">
            {Icon && (
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            )}
            <input
                className={cn(
                    'w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all',
                    Icon && 'pl-12',
                    error ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                )}
                {...props}
            />
        </div>
        <AnimatePresence>
            {error && (
                <motion.p
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    className="mt-1.5 text-sm text-red-500"
                >
                    {error}
                </motion.p>
            )}
        </AnimatePresence>
    </div>
);

// ============================================================================
// LIVE CHAT BUTTON
// ============================================================================

const LiveChatButton = () => (
    <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-black font-semibold rounded-full shadow-lg shadow-amber-500/30 hover:shadow-amber-500/50 transition-shadow"
    >
        <ChatBubbleLeftRightIcon className="w-5 h-5" />
        Live Chat
    </motion.button>
);

// ============================================================================
// SUCCESS MESSAGE
// ============================================================================

const SuccessMessage = ({ onReset }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-12"
    >
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
            Message Sent Successfully!
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
            Thank you for reaching out. We've received your message and will get back to you within 24 hours.
        </p>
        <Button onClick={onReset} variant="outline">
            Send Another Message
        </Button>
    </motion.div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }
        if (formData.phone && !/^[6-9]\d{9}$/.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid 10-digit phone number';
        }
        if (!formData.subject) newErrors.subject = 'Please select a subject';
        if (!formData.message.trim()) newErrors.message = 'Message is required';
        if (formData.message.length < 10) newErrors.message = 'Message should be at least 10 characters';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        toast.success('Message sent successfully!');
        setSubmitted(true);
        setLoading(false);
    };

    const handleChange = (field) => (e) => {
        setFormData((prev) => ({ ...prev, [field]: e.target.value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: null }));
        }
    };

    const handleReset = () => {
        setFormData({ name: '', email: '', phone: '', subject: '', message: '' });
        setErrors({});
        setSubmitted(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-24 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500 rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium mb-6">
                            <EnvelopeIcon className="w-4 h-4" />
                            Get in Touch
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            We'd Love to{' '}
                            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                                Hear From You
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                            Have questions or need help? Our friendly support team is here to assist you.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Contact Info Cards */}
            <section className="py-12 -mt-12 relative z-20">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {CONTACT_INFO.map((item, i) => (
                            <ContactInfoCard key={i} item={item} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Form & Info Section */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Sidebar Info */}
                        <div className="space-y-6">
                            {/* Quick Help */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                            >
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                    <SparklesIcon className="w-5 h-5 text-amber-500" />
                                    Quick Help
                                </h3>
                                <div className="space-y-3">
                                    {[
                                        { label: 'Order Status', href: '/orders' },
                                        { label: 'FAQs', href: '/faq' },
                                        { label: 'Returns & Refunds', href: '/faq#returns' },
                                        { label: 'Bulk Orders', href: '/contact?subject=bulk' },
                                    ].map((link, i) => (
                                        <a
                                            key={i}
                                            href={link.href}
                                            className="flex items-center justify-between py-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                        >
                                            {link.label}
                                            <ArrowRightIcon className="w-4 h-4" />
                                        </a>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Social Links */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.1 }}
                                className="p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700"
                            >
                                <h3 className="font-bold text-gray-900 dark:text-white mb-4">
                                    Follow Us
                                </h3>
                                <div className="flex flex-wrap gap-3">
                                    {SOCIALS.map((social, i) => (
                                        <motion.a
                                            key={i}
                                            href={social.href}
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="w-11 h-11 rounded-xl bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-xl hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                            title={social.name}
                                        >
                                            {social.icon}
                                        </motion.a>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Map Placeholder */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                                className="h-48 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center"
                            >
                                <div className="text-center">
                                    <MapPinIcon className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                        Map integration coming soon
                                    </p>
                                </div>
                            </motion.div>
                        </div>

                        {/* Contact Form */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="lg:col-span-2 p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl"
                        >
                            {submitted ? (
                                <SuccessMessage onReset={handleReset} />
                            ) : (
                                <>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                                        Send us a Message
                                    </h2>

                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid md:grid-cols-2 gap-5">
                                            <InputField
                                                label="Full Name"
                                                icon={UserIcon}
                                                required
                                                placeholder="John Doe"
                                                value={formData.name}
                                                onChange={handleChange('name')}
                                                error={errors.name}
                                            />
                                            <InputField
                                                label="Email Address"
                                                icon={EnvelopeIcon}
                                                type="email"
                                                required
                                                placeholder="john@example.com"
                                                value={formData.email}
                                                onChange={handleChange('email')}
                                                error={errors.email}
                                            />
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-5">
                                            <InputField
                                                label="Phone Number"
                                                icon={PhoneIcon}
                                                placeholder="9876543210"
                                                value={formData.phone}
                                                onChange={handleChange('phone')}
                                                error={errors.phone}
                                            />
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Subject <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    value={formData.subject}
                                                    onChange={handleChange('subject')}
                                                    className={cn(
                                                        'w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500',
                                                        errors.subject ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                                    )}
                                                >
                                                    {SUBJECTS.map((subject) => (
                                                        <option key={subject.value} value={subject.value}>
                                                            {subject.label}
                                                        </option>
                                                    ))}
                                                </select>
                                                {errors.subject && (
                                                    <p className="mt-1.5 text-sm text-red-500">{errors.subject}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Message <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                rows={5}
                                                value={formData.message}
                                                onChange={handleChange('message')}
                                                className={cn(
                                                    'w-full px-4 py-3 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500 resize-none',
                                                    errors.message ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                                                )}
                                                placeholder="How can we help you?"
                                            />
                                            {errors.message && (
                                                <p className="mt-1.5 text-sm text-red-500">{errors.message}</p>
                                            )}
                                        </div>

                                        <Button
                                            type="submit"
                                            loading={loading}
                                            className="w-full"
                                        >
                                            <PaperAirplaneIcon className="w-5 h-5 mr-2" />
                                            Send Message
                                        </Button>
                                    </form>
                                </>
                            )}
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Live Chat Button */}
            <LiveChatButton />
        </div>
    );
}
