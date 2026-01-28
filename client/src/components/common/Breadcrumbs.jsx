/**
 * Breadcrumbs Component
 * Displays navigation path to help users understand their location
 */

import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const ROUTE_LABELS = {
    '': 'Home',
    'notes': 'Notes',
    'about': 'About Us',
    'contact': 'Contact',
    'faq': 'FAQ',
    'order': 'Order',
    'admin': 'Admin',
    'dashboard': 'Dashboard',
    'orders': 'Orders',
    'institutes': 'Institutes',
    'login': 'Login',
};

export default function Breadcrumbs({ className = '', customLabels = {} }) {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    // Don't show breadcrumbs on home page
    if (pathnames.length === 0) return null;

    const mergedLabels = { ...ROUTE_LABELS, ...customLabels };

    const breadcrumbs = [
        { path: '/', label: 'Home', icon: HomeIcon },
        ...pathnames.map((segment, index) => {
            const path = `/${pathnames.slice(0, index + 1).join('/')}`;
            const label = mergedLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
            return { path, label };
        }),
    ];

    return (
        <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    const Icon = crumb.icon;

                    return (
                        <li key={crumb.path} className="flex items-center">
                            {index > 0 && (
                                <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
                            )}
                            {isLast ? (
                                <span className="text-gray-900 dark:text-white font-medium flex items-center gap-1">
                                    {Icon && <Icon className="w-4 h-4" />}
                                    {crumb.label}
                                </span>
                            ) : (
                                <Link
                                    to={crumb.path}
                                    className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
                                >
                                    {Icon && <Icon className="w-4 h-4" />}
                                    {crumb.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

// Animated variant
export function AnimatedBreadcrumbs({ className = '', customLabels = {} }) {
    const location = useLocation();
    const pathnames = location.pathname.split('/').filter((x) => x);

    if (pathnames.length === 0) return null;

    const mergedLabels = { ...ROUTE_LABELS, ...customLabels };

    const breadcrumbs = [
        { path: '/', label: 'Home', icon: HomeIcon },
        ...pathnames.map((segment, index) => {
            const path = `/${pathnames.slice(0, index + 1).join('/')}`;
            const label = mergedLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
            return { path, label };
        }),
    ];

    return (
        <nav className={`flex items-center space-x-2 text-sm ${className}`} aria-label="Breadcrumb">
            <ol className="flex items-center space-x-2">
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    const Icon = crumb.icon;

                    return (
                        <motion.li
                            key={crumb.path}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="flex items-center"
                        >
                            {index > 0 && (
                                <ChevronRightIcon className="w-4 h-4 text-gray-400 mx-2" />
                            )}
                            {isLast ? (
                                <span className="text-gray-900 dark:text-white font-medium flex items-center gap-1">
                                    {Icon && <Icon className="w-4 h-4" />}
                                    {crumb.label}
                                </span>
                            ) : (
                                <Link
                                    to={crumb.path}
                                    className="text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1"
                                >
                                    {Icon && <Icon className="w-4 h-4" />}
                                    {crumb.label}
                                </Link>
                            )}
                        </motion.li>
                    );
                })}
            </ol>
        </nav>
    );
}
