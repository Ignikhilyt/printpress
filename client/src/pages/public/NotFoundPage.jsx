/**
 * 404 Not Found Page
 * Displayed when users navigate to a non-existent route
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { HomeIcon, MagnifyingGlassIcon, BookOpenIcon } from '@heroicons/react/24/outline';

export default function NotFoundPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center px-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-2xl"
            >
                {/* 404 Animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                    className="mb-8"
                >
                    <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-500">
                        404
                    </h1>
                </motion.div>

                {/* Error Message */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Oops! Page Not Found
                    </h2>
                    <p className="text-gray-400 text-lg mb-8">
                        The page you're looking for seems to have gone on a study break.
                        <br />
                        Let's get you back on track!
                    </p>
                </motion.div>

                {/* Action Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-wrap gap-4 justify-center"
                >
                    <Link
                        to="/"
                        className="flex items-center gap-2 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-lg transition-colors"
                    >
                        <HomeIcon className="w-5 h-5" />
                        Go Home
                    </Link>
                    <Link
                        to="/notes"
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors backdrop-blur"
                    >
                        <BookOpenIcon className="w-5 h-5" />
                        Browse Notes
                    </Link>
                    <Link
                        to="/notes?search="
                        className="flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg transition-colors backdrop-blur"
                    >
                        <MagnifyingGlassIcon className="w-5 h-5" />
                        Search
                    </Link>
                </motion.div>

                {/* Decoration */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="mt-12 text-gray-500 text-sm"
                >
                    <p>Error Code: 404 | Page Not Found</p>
                </motion.div>
            </motion.div>
        </div>
    );
}
