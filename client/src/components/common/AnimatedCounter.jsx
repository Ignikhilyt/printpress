/**
 * Animated Counter Component
 * Smooth counting animation for statistics
 */

import { useState, useEffect, useRef } from 'react';
import { motion, useInView, useSpring, useTransform } from 'framer-motion';

export default function AnimatedCounter({
    value,
    duration = 2,
    prefix = '',
    suffix = '',
    decimals = 0,
    className = '',
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    const spring = useSpring(0, {
        duration: duration * 1000,
        bounce: 0,
    });

    const display = useTransform(spring, (latest) => {
        return `${prefix}${Number(latest).toFixed(decimals)}${suffix}`;
    });

    useEffect(() => {
        if (isInView) {
            spring.set(value);
        }
    }, [isInView, value, spring]);

    return (
        <motion.span ref={ref} className={className}>
            {display}
        </motion.span>
    );
}

// Stats display with icons and animation
export function AnimatedStat({
    icon: Icon,
    value,
    label,
    prefix = '',
    suffix = '',
    trend,
    color = 'amber',
}) {
    const colors = {
        amber: 'from-amber-500 to-orange-500 text-amber-500',
        blue: 'from-blue-500 to-indigo-500 text-blue-500',
        green: 'from-green-500 to-emerald-500 text-green-500',
        purple: 'from-purple-500 to-pink-500 text-purple-500',
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
        >
            <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${colors[color].split(' ')[0]} ${colors[color].split(' ')[1]} flex items-center justify-center shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
            </div>
            <div className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-1">
                <AnimatedCounter
                    value={value}
                    prefix={prefix}
                    suffix={suffix}
                    decimals={suffix === '%' ? 1 : 0}
                />
            </div>
            <p className="text-gray-600 dark:text-gray-400">{label}</p>
            {trend && (
                <span className={`text-sm font-medium ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {trend > 0 ? '↑' : '↓'} {Math.abs(trend)}%
                </span>
            )}
        </motion.div>
    );
}

// Progress ring with animation
export function AnimatedProgress({
    value,
    max = 100,
    size = 120,
    strokeWidth = 8,
    color = 'amber',
    showLabel = true,
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    const percentage = (value / max) * 100;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    const colors = {
        amber: '#f59e0b',
        blue: '#3b82f6',
        green: '#10b981',
        purple: '#8b5cf6',
    };

    return (
        <div ref={ref} className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="-rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    className="text-gray-200 dark:text-gray-700"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke={colors[color]}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={isInView ? {
                        strokeDashoffset: circumference - (percentage / 100) * circumference,
                    } : {}}
                    transition={{ duration: 1.5, ease: 'easeOut' }}
                    style={{
                        strokeDasharray: circumference,
                    }}
                />
            </svg>
            {showLabel && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xl font-bold text-gray-900 dark:text-white">
                        <AnimatedCounter value={percentage} suffix="%" />
                    </span>
                </div>
            )}
        </div>
    );
}
