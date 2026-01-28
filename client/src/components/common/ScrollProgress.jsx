/**
 * Scroll Progress Indicator
 * Shows reading/scroll progress at the top of the page
 */

import { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';

export default function ScrollProgress({ color = 'amber' }) {
    const { scrollYProgress } = useScroll();
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001,
    });

    const colorClasses = {
        amber: 'from-amber-400 via-amber-500 to-orange-500',
        blue: 'from-blue-400 via-blue-500 to-indigo-500',
        green: 'from-green-400 via-emerald-500 to-teal-500',
        purple: 'from-purple-400 via-purple-500 to-pink-500',
    };

    return (
        <motion.div
            className={`fixed top-0 left-0 right-0 h-1 bg-gradient-to-r ${colorClasses[color]} origin-left z-[100]`}
            style={{ scaleX }}
        />
    );
}

/**
 * Reading Progress for Articles/Notes
 * Shows percentage and estimated time remaining
 */
export function ReadingProgress({ totalTime = 5 }) {
    const [progress, setProgress] = useState(0);
    const [timeLeft, setTimeLeft] = useState(totalTime);

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY;
            const docHeight = document.documentElement.scrollHeight - window.innerHeight;
            const scrollProgress = (scrollTop / docHeight) * 100;

            setProgress(Math.min(scrollProgress, 100));
            setTimeLeft(Math.ceil(totalTime * (1 - scrollProgress / 100)));
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [totalTime]);

    if (progress < 5) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="fixed top-4 right-4 bg-white dark:bg-gray-800 rounded-xl px-4 py-2 shadow-lg border border-gray-200 dark:border-gray-700 z-50"
        >
            <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                    <svg className="w-10 h-10 -rotate-90">
                        <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            className="text-gray-200 dark:text-gray-700"
                        />
                        <circle
                            cx="20"
                            cy="20"
                            r="16"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="3"
                            strokeDasharray={100}
                            strokeDashoffset={100 - progress}
                            className="text-amber-500"
                            strokeLinecap="round"
                        />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-gray-700 dark:text-gray-300">
                        {Math.round(progress)}%
                    </span>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                    {timeLeft > 0 ? `~${timeLeft} min left` : 'Almost done!'}
                </div>
            </div>
        </motion.div>
    );
}
