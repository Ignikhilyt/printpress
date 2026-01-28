/**
 * Floating WhatsApp Button
 * Quick access to WhatsApp contact for customer support
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaWhatsapp } from 'react-icons/fa';
import { XMarkIcon } from '@heroicons/react/24/outline';

export default function WhatsAppButton({
    phoneNumber = '919876543210', // Default phone number (update in production)
    message = 'Hi! I have a question about PrintPress notes.',
    position = 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    showTooltip = true,
    className = '',
}) {
    const [isVisible, setIsVisible] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);

    useEffect(() => {
        // Show button after 2 seconds
        const timer = setTimeout(() => setIsVisible(true), 2000);

        // Show prompt after 5 seconds (first visit only)
        const promptTimer = setTimeout(() => {
            const hasSeenPrompt = localStorage.getItem('whatsapp_prompt_seen');
            if (!hasSeenPrompt) {
                setShowPrompt(true);
                localStorage.setItem('whatsapp_prompt_seen', 'true');
                // Auto-hide prompt after 5 seconds
                setTimeout(() => setShowPrompt(false), 5000);
            }
        }, 5000);

        return () => {
            clearTimeout(timer);
            clearTimeout(promptTimer);
        };
    }, []);

    const handleClick = () => {
        const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');

        // Track event
        if (window.gtag) {
            window.gtag('event', 'whatsapp_click', {
                event_category: 'engagement',
                event_label: 'whatsapp_button',
            });
        }
    };

    const positionClasses = {
        'bottom-right': 'bottom-6 right-6',
        'bottom-left': 'bottom-6 left-6',
        'top-right': 'top-24 right-6',
        'top-left': 'top-24 left-6',
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className={`fixed ${positionClasses[position]} z-50 ${className}`}
                >
                    {/* Tooltip/Prompt */}
                    <AnimatePresence>
                        {showPrompt && showTooltip && (
                            <motion.div
                                initial={{ opacity: 0, x: position.includes('right') ? 20 : -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: position.includes('right') ? 20 : -20 }}
                                className={`absolute ${position.includes('right') ? 'right-full mr-4' : 'left-full ml-4'} bottom-0 bg-white dark:bg-gray-800 shadow-2xl rounded-2xl p-4 w-64 border border-gray-100 dark:border-gray-700`}
                            >
                                <button
                                    onClick={() => setShowPrompt(false)}
                                    className="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <XMarkIcon className="w-4 h-4 text-gray-400" />
                                </button>
                                <div className="flex items-start gap-3">
                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                                        <FaWhatsapp className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white text-sm mb-1">
                                            Need Help?
                                        </p>
                                        <p className="text-gray-600 dark:text-gray-400 text-xs">
                                            Chat with us on WhatsApp for instant support!
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* WhatsApp Button */}
                    <motion.button
                        onClick={handleClick}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="group relative w-16 h-16 bg-green-500 hover:bg-green-600 rounded-full shadow-2xl flex items-center justify-center transition-all hover:shadow-green-500/50"
                        aria-label="Chat on WhatsApp"
                    >
                        {/* Pulse animation */}
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: 'easeInOut',
                            }}
                            className="absolute inset-0 bg-green-500 rounded-full"
                        />

                        {/* Icon */}
                        <FaWhatsapp className="w-8 h-8 text-white relative z-10" />

                        {/* Tooltip on hover */}
                        {showTooltip && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                className={`absolute ${position.includes('right') ? 'right-full mr-3' : 'left-full ml-3'} bottom-0 bg-gray-900 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}
                            >
                                Chat with us
                                <div className={`absolute top-1/2 -translate-y-1/2 ${position.includes('right') ? '-right-1' : '-left-1'} w-2 h-2 bg-gray-900 rotate-45`} />
                            </motion.div>
                        )}
                    </motion.button>

                    {/* Online indicator */}
                    <div className="absolute top-0 right-0 w-4 h-4 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full" />
                </motion.div>
            )}
        </AnimatePresence>
    );
}
