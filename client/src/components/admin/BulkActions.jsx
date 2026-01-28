/**
 * Bulk Actions Component
 * Enables bulk selection and operations on admin tables
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    TrashIcon,
    CheckIcon,
    XMarkIcon,
    ArrowPathIcon,
    EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import Button from '../common/Button';
import { cn } from '../../utils/helpers';

export default function BulkActions({
    selectedIds = [],
    onSelectAll,
    onDeselectAll,
    onBulkAction,
    actions = [],
    totalCount = 0,
}) {
    const [isOpen, setIsOpen] = useState(false);
    const isAllSelected = selectedIds.length === totalCount && totalCount > 0;
    const isPartiallySelected = selectedIds.length > 0 && selectedIds.length < totalCount;

    const handleSelectAll = () => {
        if (isAllSelected) {
            onDeselectAll?.();
        } else {
            onSelectAll?.();
        }
    };

    const handleAction = async (action) => {
        setIsOpen(false);
        await onBulkAction?.(action, selectedIds);
    };

    if (selectedIds.length === 0) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4"
            >
                <div className="flex items-center justify-between">
                    {/* Selection Info */}
                    <div className="flex items-center gap-4">
                        {/* Select All Checkbox */}
                        <button
                            onClick={handleSelectAll}
                            className="relative w-5 h-5 rounded border-2 border-amber-600 flex items-center justify-center hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors"
                        >
                            {isAllSelected ? (
                                <CheckIcon className="w-4 h-4 text-amber-600" />
                            ) : isPartiallySelected ? (
                                <div className="w-2 h-2 bg-amber-600 rounded-sm" />
                            ) : null}
                        </button>

                        {/* Count */}
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedIds.length} {selectedIds.length === 1 ? 'item' : 'items'} selected
                        </span>

                        {/* Deselect Button */}
                        <button
                            onClick={onDeselectAll}
                            className="text-sm text-amber-600 dark:text-amber-400 hover:underline"
                        >
                            Clear selection
                        </button>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        {actions.slice(0, 2).map((action) => (
                            <Button
                                key={action.id}
                                variant={action.variant || 'outline'}
                                size="sm"
                                onClick={() => handleAction(action)}
                                className={cn(
                                    'flex items-center gap-2',
                                    action.variant === 'danger' && 'text-red-600 border-red-300 hover:bg-red-50'
                                )}
                            >
                                {action.icon && <action.icon className="w-4 h-4" />}
                                {action.label}
                            </Button>
                        ))}

                        {actions.length > 2 && (
                            <div className="relative">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsOpen(!isOpen)}
                                    className="px-2"
                                >
                                    <EllipsisVerticalIcon className="w-5 h-5" />
                                </Button>

                                <AnimatePresence>
                                    {isOpen && (
                                        <>
                                            {/* Backdrop */}
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => setIsOpen(false)}
                                            />

                                            {/* Dropdown */}
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                                                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 z-20 py-1"
                                            >
                                                {actions.slice(2).map((action) => (
                                                    <button
                                                        key={action.id}
                                                        onClick={() => handleAction(action)}
                                                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                                    >
                                                        {action.icon && <action.icon className="w-4 h-4" />}
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </motion.div>
                                        </>
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

// Hook for managing bulk selection
export function useBulkSelection(items = []) {
    const [selectedIds, setSelectedIds] = useState([]);

    const handleSelectAll = () => {
        setSelectedIds(items.map(item => item.id));
    };

    const handleDeselectAll = () => {
        setSelectedIds([]);
    };

    const handleToggleItem = (id) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const isSelected = (id) => selectedIds.includes(id);

    return {
        selectedIds,
        handleSelectAll,
        handleDeselectAll,
        handleToggleItem,
        isSelected,
        hasSelection: selectedIds.length > 0,
    };
}
