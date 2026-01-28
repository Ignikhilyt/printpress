/**
 * Enhanced Data Table Component
 * Sortable, filterable, searchable table for admin panels
 */

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    FunnelIcon,
    ArrowsUpDownIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    CheckIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';

export default function DataTable({
    columns = [],
    data = [],
    onRowClick,
    selectable = false,
    selectedIds = [],
    onToggleSelect,
    sortable = true,
    filterable = true,
    searchable = true,
    emptyState,
    loading = false,
}) {
    const [search, setSearch] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
    const [filters, setFilters] = useState({});

    // Search functionality
    const searchedData = useMemo(() => {
        if (!search) return data;

        return data.filter(row =>
            columns.some(col => {
                const value = row[col.key];
                return value && value.toString().toLowerCase().includes(search.toLowerCase());
            })
        );
    }, [data, search, columns]);

    // Filter functionality
    const filteredData = useMemo(() => {
        let filtered = searchedData;

        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                filtered = filtered.filter(row => row[key] === value);
            }
        });

        return filtered;
    }, [searchedData, filters]);

    // Sort functionality
    const sortedData = useMemo(() => {
        if (!sortConfig.key) return filteredData;

        return [...filteredData].sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [filteredData, sortConfig]);

    const handleSort = (key) => {
        if (!sortable) return;

        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
        }));
    };

    // Loading skeleton
    if (loading) {
        return (
            <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg animate-pulse" />
                ))}
            </div>
        );
    }

    // Empty state
    if (sortedData.length === 0 && !search) {
        return emptyState || (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                No data available
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Search and Filters */}
            {(searchable || filterable) && (
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Search */}
                    {searchable && (
                        <div className="relative flex-1">
                            <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>
                    )}

                    {/* Filter Button */}
                    {filterable && (
                        <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <FunnelIcon className="w-5 h-5" />
                            <span className="text-sm font-medium">Filters</span>
                        </button>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="overflow-x-auto rounded-xl border border-gray-200 dark:border-gray-700">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                        <tr>
                            {selectable && (
                                <th className="w-12 px-4 py-3" />
                            )}
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={cn(
                                        'px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider',
                                        sortable && column.sortable !== false && 'cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors'
                                    )}
                                    onClick={() => column.sortable !== false && handleSort(column.key)}
                                >
                                    <div className="flex items-center gap-2">
                                        {column.label}
                                        {sortable && column.sortable !== false && (
                                            <span className="text-gray-400">
                                                {sortConfig.key === column.key ? (
                                                    sortConfig.direction === 'asc' ? (
                                                        <ChevronUpIcon className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronDownIcon className="w-4 h-4" />
                                                    )
                                                ) : (
                                                    <ArrowsUpDownIcon className="w-4 h-4 opacity-0 group-hover:opacity-100" />
                                                )}
                                            </span>
                                        )}
                                    </div>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                        {sortedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan={columns.length + (selectable ? 1 : 0)}
                                    className="px-4 py-12 text-center text-gray-500 dark:text-gray-400"
                                >
                                    No results found for "{search}"
                                </td>
                            </tr>
                        ) : (
                            sortedData.map((row, index) => (
                                <motion.tr
                                    key={row.id || index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: index * 0.02 }}
                                    className={cn(
                                        'hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors',
                                        onRowClick && 'cursor-pointer'
                                    )}
                                    onClick={() => onRowClick?.(row)}
                                >
                                    {selectable && (
                                        <td className="px-4 py-4">
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onToggleSelect?.(row.id);
                                                }}
                                                className="relative w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center hover:border-amber-500 transition-colors"
                                            >
                                                {selectedIds?.includes(row.id) && (
                                                    <CheckIcon className="w-4 h-4 text-amber-600" />
                                                )}
                                            </button>
                                        </td>
                                    )}
                                    {columns.map((column) => (
                                        <td key={column.key} className="px-4 py-4 text-sm">
                                            {column.render ? column.render(row[column.key], row) : row[column.key]}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Results count */}
            {sortedData.length > 0 && (
                <div className="text-sm text-gray-500 dark:text-gray-400">
                    Showing {sortedData.length} of {data.length} results
                </div>
            )}
        </div>
    );
}
