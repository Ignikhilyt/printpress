/**
 * ConfirmDialog Component
 * Displays a confirmation modal for destructive or important actions
 */

import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ExclamationTriangleIcon, CheckCircleIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import Button from './Button';

const VARIANTS = {
    danger: {
        icon: ExclamationTriangleIcon,
        iconColor: 'text-red-600',
        iconBg: 'bg-red-100 dark:bg-red-900/30',
        confirmColor: 'danger',
    },
    warning: {
        icon: ExclamationTriangleIcon,
        iconColor: 'text-yellow-600',
        iconBg: 'bg-yellow-100 dark:bg-yellow-900/30',
        confirmColor: 'warning',
    },
    success: {
        icon: CheckCircleIcon,
        iconColor: 'text-green-600',
        iconBg: 'bg-green-100 dark:bg-green-900/30',
        confirmColor: 'primary',
    },
    info: {
        icon: InformationCircleIcon,
        iconColor: 'text-blue-600',
        iconBg: 'bg-blue-100 dark:bg-blue-900/30',
        confirmColor: 'primary',
    },
};

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger',
    loading = false,
}) {
    const config = VARIANTS[variant] || VARIANTS.danger;
    const Icon = config.icon;

    const handleConfirm = async () => {
        const result = await onConfirm?.();
        // Auto-close if onConfirm doesn't return false
        if (result !== false) {
            onClose?.();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full p-6 relative"
                        >
                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                disabled={loading}
                            >
                                <XMarkIcon className="w-5 h-5" />
                            </button>

                            {/* Icon */}
                            <div className={`w-14 h-14 rounded-full ${config.iconBg} flex items-center justify-center mx-auto mb-4`}>
                                <Icon className={`w-7 h-7 ${config.iconColor}`} />
                            </div>

                            {/* Content */}
                            <div className="text-center mb-6">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    {title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {message}
                                </p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={onClose}
                                    disabled={loading}
                                    className="flex-1"
                                >
                                    {cancelText}
                                </Button>
                                <Button
                                    variant={config.confirmColor}
                                    onClick={handleConfirm}
                                    loading={loading}
                                    className="flex-1"
                                >
                                    {confirmText}
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}

// Hook for easier usage
import { useState } from 'react';

export function useConfirmDialog() {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState({});

    const confirm = (options) => {
        return new Promise((resolve) => {
            setConfig({
                ...options,
                onConfirm: async () => {
                    const result = await options.onConfirm?.();
                    resolve(true);
                    return result;
                },
                onClose: () => {
                    setIsOpen(false);
                    resolve(false);
                },
            });
            setIsOpen(true);
        });
    };

    const ConfirmDialogComponent = () => (
        <ConfirmDialog isOpen={isOpen} {...config} />
    );

    return { confirm, ConfirmDialog: ConfirmDialogComponent };
}
