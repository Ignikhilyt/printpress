/**
 * Enhanced Dashboard Charts
 * Revenue, Category Breakdown, Order Pipeline, Monthly Comparison
 */

import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { motion } from 'framer-motion';

// Color palette
const COLORS = {
    primary: '#f59e0b',
    success: '#10b981',
    danger: '#ef4444',
    info: '#3b82f6',
    warning: '#eab308',
    purple: '#8b5cf6',
    cyan: '#06b6d4',
    pink: '#ec4899',
};

const CHART_COLORS = [
    COLORS.primary,
    COLORS.success,
    COLORS.info,
    COLORS.purple,
    COLORS.cyan,
    COLORS.pink,
    COLORS.warning,
    COLORS.danger,
];

// Custom Tooltip
const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl border border-gray-700">
                <p className="font-semibold mb-2">{label}</p>
                {payload.map((entry, index) => (
                    <p key={index} className="text-sm" style={{ color: entry.color }}>
                        {entry.name}: {entry.name.includes('₹') ? '' : '₹'}{entry.value.toLocaleString()}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// Revenue Chart Component
export function RevenueChart({ data, loading }) {
    if (loading) {
        return <ChartSkeleton />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Revenue Overview
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        Last 30 days performance
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        ₹{data.reduce((sum, item) => sum + item.revenue, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-green-600 dark:text-green-400">
                        +12.5% from last month
                    </p>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data}>
                    <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3} />
                            <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis
                        dataKey="date"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke={COLORS.primary}
                        strokeWidth={3}
                        fill="url(#revenueGradient)"
                    />
                </AreaChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

// Category Breakdown Pie Chart
export function CategoryBreakdown({ data, loading }) {
    if (loading) {
        return <ChartSkeleton />;
    }

    const total = data.reduce((sum, item) => sum + item.value, 0);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Category Distribution
            </h3>

            <div className="flex items-center gap-6">
                {/* Pie Chart */}
                <div className="flex-shrink-0">
                    <ResponsiveContainer width={200} height={200}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex-1 space-y-2">
                    {data.map((entry, index) => (
                        <div key={entry.name} className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">
                                    {entry.name}
                                </span>
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                                    {entry.value}
                                </p>
                                <p className="text-xs text-gray-500">
                                    {((entry.value / total) * 100).toFixed(1)}%
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

// Order Status Pipeline
export function OrdersPipeline({ data, loading }) {
    if (loading) {
        return <ChartSkeleton />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Order Pipeline
            </h3>

            <ResponsiveContainer width="100%" height={250}>
                <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis
                        dataKey="status"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" fill={COLORS.primary} radius={[8, 8, 0, 0]} />
                </BarChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

// Monthly Comparison Chart
export function MonthlyComparison({ data, loading }) {
    if (loading) {
        return <ChartSkeleton />;
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700"
        >
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Monthly Comparison
            </h3>

            <ResponsiveContainer width="100%" height={250}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
                    <XAxis
                        dataKey="month"
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                    />
                    <YAxis
                        stroke="#9ca3af"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => `₹${value / 1000}k`}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line
                        type="monotone"
                        dataKey="thisYear"
                        stroke={COLORS.primary}
                        strokeWidth={2}
                        name="2026"
                        dot={{ fill: COLORS.primary, r: 4 }}
                    />
                    <Line
                        type="monotone"
                        dataKey="lastYear"
                        stroke={COLORS.info}
                        strokeWidth={2}
                        name="2025"
                        strokeDasharray="5 5"
                        dot={{ fill: COLORS.info, r: 4 }}
                    />
                </LineChart>
            </ResponsiveContainer>
        </motion.div>
    );
}

// Chart Skeleton Loader
function ChartSkeleton() {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-6" />
            <div className="h-[250px] bg-gray-100 dark:bg-gray-700/50 rounded" />
        </div>
    );
}

// Export sample data generator for testing
export function generateSampleData() {
    // Revenue data - last 30 days
    const revenueData = Array.from({ length: 30 }, (_, i) => ({
        date: `${i + 1} Jan`,
        revenue: Math.floor(Math.random() * 50000) + 20000,
    }));

    // Category data
    const categoryData = [
        { name: 'UPSC', value: 145 },
        { name: 'SSC', value: 98 },
        { name: 'Banking', value: 76 },
        { name: 'State PCS', value: 54 },
        { name: 'Railway', value: 43 },
        { name: 'Defence', value: 32 },
    ];

    // Order pipeline
    const orderPipeline = [
        { status: 'Pending', count: 45 },
        { status: 'Processing', count: 32 },
        { status: 'Shipped', count: 28 },
        { status: 'Delivered', count: 156 },
        { status: 'Cancelled', count: 8 },
    ];

    // Monthly comparison
    const monthlyData = [
        { month: 'Jan', thisYear: 124000, lastYear: 98000 },
        { month: 'Feb', thisYear: 145000, lastYear: 112000 },
        { month: 'Mar', thisYear: 167000, lastYear: 125000 },
        { month: 'Apr', thisYear: 189000, lastYear: 142000 },
        { month: 'May', thisYear: 198000, lastYear: 156000 },
        { month: 'Jun', thisYear: 212000, lastYear: 167000 },
    ];

    return {
        revenueData,
        categoryData,
        orderPipeline,
        monthlyData,
    };
}
