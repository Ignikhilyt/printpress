/**
 * Optimized Image Component
 * Lazy loading, blur placeholder, error handling
 */

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PhotoIcon } from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';

export default function OptimizedImage({
    src,
    alt = '',
    width,
    height,
    className = '',
    objectFit = 'cover',
    placeholder = true,
    onLoad,
    onError,
    fallback = null,
}) {
    const [loaded, setLoaded] = useState(false);
    const [error, setError] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef(null);

    // Intersection Observer for lazy loading
    useEffect(() => {
        if (!imgRef.current) return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            { rootMargin: '50px' } // Start loading 50px before viewport
        );

        observer.observe(imgRef.current);

        return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
        setLoaded(true);
        onLoad?.();
    };

    const handleError = () => {
        setError(true);
        onError?.();
    };

    // Error/fallback state
    if (error) {
        if (fallback) {
            return fallback;
        }

        return (
            <div
                ref={imgRef}
                style={{ width, height }}
                className={cn(
                    'flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg',
                    className
                )}
            >
                <PhotoIcon className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-2" />
                <span className="text-xs text-gray-400">Image not available</span>
            </div>
        );
    }

    return (
        <div
            ref={imgRef}
            style={{ width, height }}
            className={cn('relative overflow-hidden', className)}
        >
            {/* Placeholder/blur */}
            {placeholder && !loaded && (
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-800 animate-pulse" />
            )}

            {/* Actual image */}
            {(isInView || !placeholder) && (
                <motion.img
                    src={src}
                    alt={alt}
                    onLoad={handleLoad}
                    onError={handleError}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: loaded ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                    className={cn(
                        'w-full h-full',
                        objectFit === 'cover' && 'object-cover',
                        objectFit === 'contain' && 'object-contain',
                        objectFit === 'fill' && 'object-fill'
                    )}
                />
            )}

            {/* Loading spinner */}
            {!loaded && !error && isInView && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 border-3 border-gray-300 border-t-amber-500 rounded-full animate-spin" />
                </div>
            )}
        </div>
    );
}

// Avatar variation
export function Avatar({
    src,
    alt,
    size = 'md',
    fallbackText,
    className = '',
}) {
    const [error, setError] = useState(false);

    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-12 h-12 text-base',
        xl: 'w-16 h-16 text-lg',
        '2xl': 'w-20 h-20 text-xl',
    };

    const sizeClass = sizes[size] || sizes.md;

    if (error || !src) {
        const initials = fallbackText
            ? fallbackText.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
            : '?';

        return (
            <div
                className={cn(
                    'rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center font-semibold text-white',
                    sizeClass,
                    className
                )}
            >
                {initials}
            </div>
        );
    }

    return (
        <OptimizedImage
            src={src}
            alt={alt}
            className={cn('rounded-full', sizeClass, className)}
            onError={() => setError(true)}
            objectFit="cover"
        />
    );
}

// Product image with aspect ratio
export function ProductImage({ src, alt, className = '' }) {
    return (
        <div className={cn('relative aspect-[4/3]', className)}>
            <OptimizedImage
                src={src}
                alt={alt}
                className="absolute inset-0 rounded-xl"
                objectFit="cover"
            />
        </div>
    );
}
