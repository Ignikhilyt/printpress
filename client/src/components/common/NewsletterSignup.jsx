/**
 * Newsletter Signup Component
 * Allows users to subscribe to email updates, promotions, and new notes announcements
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { EnvelopeIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import api from '../../services/api';

export default function NewsletterSignup({ variant = 'footer', className = '' }) {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [subscribed, setSubscribed] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Please enter a valid email address');
            return;
        }

        setLoading(true);
        try {
            await api.post('/newsletter/subscribe', { email });
            setSubscribed(true);
            toast.success('Successfully subscribed to our newsletter!');
            setEmail('');

            // Reset after 3 seconds
            setTimeout(() => setSubscribed(false), 3000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to subscribe. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (variant === 'footer') {
        return (
            <div className={className}>
                <h3 className="text-lg font-semibold text-white mb-2">Stay Updated</h3>
                <p className="text-gray-400 text-sm mb-4">
                    Get the latest notes, exclusive discounts, and study tips delivered to your inbox.
                </p>
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your email"
                        disabled={loading || subscribed}
                        className="flex-1 px-4 py-2.5 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent disabled:opacity-50"
                    />
                    <motion.button
                        type="submit"
                        disabled={loading || subscribed}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {subscribed ? (
                            <>
                                <CheckCircleIcon className="w-5 h-5" />
                                Subscribed
                            </>
                        ) : loading ? (
                            'Subscribing...'
                        ) : (
                            <>
                                <EnvelopeIcon className="w-5 h-5" />
                                Subscribe
                            </>
                        )}
                    </motion.button>
                </form>
                <p className="text-gray-500 text-xs mt-2">
                    We respect your privacy. Unsubscribe anytime.
                </p>
            </div>
        );
    }

    // Inline variant for homepage or other pages
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={`bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-8 text-white ${className}`}
        >
            <div className="max-w-2xl mx-auto text-center">
                <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                    <EnvelopeIcon className="w-8 h-8" />
                </motion.div>
                <h2 className="text-3xl font-bold mb-2">Never Miss an Update</h2>
                <p className="text-white/90 mb-6">
                    Join 10,000+ students getting exclusive deals, new notes, and study tips every week.
                </p>
                <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your.email@example.com"
                        disabled={loading || subscribed}
                        className="flex-1 px-4 py-3 rounded-lg bg-white/10 backdrop-blur border border-white/20 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 disabled:opacity-50"
                    />
                    <motion.button
                        type="submit"
                        disabled={loading || subscribed}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3 bg-white text-amber-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {subscribed ? (
                            <>
                                <CheckCircleIcon className="w-5 h-5" />
                                You're In!
                            </>
                        ) : loading ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                                Subscribing
                            </div>
                        ) : (
                            'Subscribe Free'
                        )}
                    </motion.button>
                </form>
                <p className="text-white/70 text-sm mt-3">
                    📧 No spam, ever. ❌ Unsubscribe with one click.
                </p>
            </div>
        </motion.div>
    );
}
