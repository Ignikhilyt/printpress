/**
 * Notification Bell Component
 * Shows notification count and dropdown with notifications
 */

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BellIcon,
    CheckCircleIcon,
    ExclamationCircleIcon,
    InformationCircleIcon,
    ShoppingCartIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline';
import { BellIcon as BellSolidIcon } from '@heroicons/react/24/solid';
import { formatDistanceToNow } from 'date-fns';

// Sample notifications - in production, fetch from API
const SAMPLE_NOTIFICATIONS = [
    {
        id: 1,
        type: 'order',
        title: 'New Order Received',
        message: 'Order #PP-2024-0156 has been placed',
        timestamp: new Date(Date.now() - 5 * 60 * 1000),
        read: false,
    },
    {
        id: 2,
        type: 'success',
        title: 'Order Delivered',
        message: 'Order #PP-2024-0150 was delivered successfully',
        timestamp: new Date(Date.now() - 3600 * 1000),
        read: false,
    },
    {
        id: 3,
        type: 'info',
        title: 'New Notes Added',
        message: '5 new UPSC notes have been added to the catalog',
        timestamp: new Date(Date.now() - 24 * 3600 * 1000),
        read: true,
    },
];

export default function NotificationBell() {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState(SAMPLE_NOTIFICATIONS);
    const containerRef = useRef(null);

    const unreadCount = notifications.filter(n => !n.read).length;

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = (id) => {
        setNotifications(prev =>
            prev.map(n => n.id === id ? { ...n, read: true } : n)
        );
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order':
                return <ShoppingCartIcon className="w-5 h-5 text-blue-500" />;
            case 'success':
                return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
            case 'warning':
                return <ExclamationCircleIcon className="w-5 h-5 text-yellow-500" />;
            case 'error':
                return <ExclamationCircleIcon className="w-5 h-5 text-red-500" />;
            default:
                return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
        }
    };

    return (
        <div ref={containerRef} className="relative">
            {/* Bell Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
                {unreadCount > 0 ? (
                    <BellSolidIcon className="w-6 h-6 text-amber-500" />
                ) : (
                    <BellIcon className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                )}

                {/* Badge */}
                {unreadCount > 0 && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center"
                    >
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </motion.span>
                )}
            </motion.button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Notifications
                            </h3>
                            {unreadCount > 0 && (
                                <button
                                    onClick={markAllAsRead}
                                    className="text-sm text-amber-600 hover:text-amber-700 font-medium"
                                >
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* Notification List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {notifications.length === 0 ? (
                                <div className="py-12 text-center">
                                    <BellIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                                    <p className="text-gray-500 dark:text-gray-400">No notifications</p>
                                </div>
                            ) : (
                                notifications.map((notification) => (
                                    <motion.div
                                        key={notification.id}
                                        layout
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        className={`relative px-4 py-3 border-b border-gray-50 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${!notification.read ? 'bg-amber-50/50 dark:bg-amber-900/10' : ''
                                            }`}
                                        onClick={() => markAsRead(notification.id)}
                                    >
                                        <div className="flex gap-3">
                                            <div className="flex-shrink-0 mt-1">
                                                {getIcon(notification.type)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-sm font-medium ${notification.read
                                                        ? 'text-gray-700 dark:text-gray-300'
                                                        : 'text-gray-900 dark:text-white'
                                                    }`}>
                                                    {notification.title}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                    {notification.message}
                                                </p>
                                                <p className="text-xs text-gray-400 mt-1">
                                                    {formatDistanceToNow(notification.timestamp, { addSuffix: true })}
                                                </p>
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeNotification(notification.id);
                                                }}
                                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <XMarkIcon className="w-4 h-4 text-gray-400" />
                                            </button>
                                        </div>

                                        {/* Unread indicator */}
                                        {!notification.read && (
                                            <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-2 h-2 bg-amber-500 rounded-full" />
                                        )}
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer */}
                        {notifications.length > 0 && (
                            <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                                <button className="w-full text-center text-sm text-amber-600 hover:text-amber-700 font-medium">
                                    View all notifications
                                </button>
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
