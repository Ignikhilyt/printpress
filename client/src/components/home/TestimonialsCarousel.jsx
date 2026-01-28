/**
 * Testimonials Carousel
 * Auto-scrolling testimonials with smooth animations
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon, StarIcon } from '@heroicons/react/24/solid';

const TESTIMONIALS = [
    {
        id: 1,
        name: 'Priya Sharma',
        role: 'UPSC Aspirant',
        image: 'https://randomuser.me/api/portraits/women/1.jpg',
        content: 'PrintPress notes helped me crack UPSC Prelims in my first attempt! The quality of print and concise content is unmatched.',
        rating: 5,
        exam: 'UPSC CSE 2024',
    },
    {
        id: 2,
        name: 'Rahul Verma',
        role: 'SSC CGL Qualified',
        image: 'https://randomuser.me/api/portraits/men/2.jpg',
        content: 'Best investment for my exam preparation. The notes are well-organized and cover all important topics. Highly recommended!',
        rating: 5,
        exam: 'SSC CGL 2024',
    },
    {
        id: 3,
        name: 'Ananya Patel',
        role: 'Bank PO',
        image: 'https://randomuser.me/api/portraits/women/3.jpg',
        content: 'Quick delivery and excellent print quality. These notes made my revision so much easier. Thank you PrintPress!',
        rating: 5,
        exam: 'IBPS PO 2024',
    },
    {
        id: 4,
        name: 'Vikash Kumar',
        role: 'State PCS Aspirant',
        image: 'https://randomuser.me/api/portraits/men/4.jpg',
        content: 'The custom page selection feature is amazing! I could order exactly what I needed without buying full sets.',
        rating: 4,
        exam: 'BPSC 2024',
    },
];

export default function TestimonialsCarousel() {
    const [current, setCurrent] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying) return;

        const interval = setInterval(() => {
            setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [isAutoPlaying]);

    const next = () => {
        setIsAutoPlaying(false);
        setCurrent((prev) => (prev + 1) % TESTIMONIALS.length);
    };

    const prev = () => {
        setIsAutoPlaying(false);
        setCurrent((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    };

    const testimonial = TESTIMONIALS[current];

    return (
        <section className="py-20 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <span className="inline-block px-4 py-2 bg-amber-500/10 text-amber-400 rounded-full text-sm font-medium mb-4">
                        💬 Success Stories
                    </span>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                        What Our Students Say
                    </h2>
                    <p className="text-gray-400 max-w-2xl mx-auto">
                        Join thousands of successful candidates who trusted PrintPress for their exam preparation
                    </p>
                </motion.div>

                {/* Testimonial Card */}
                <div className="relative max-w-4xl mx-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, x: 100 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -100 }}
                            transition={{ duration: 0.5 }}
                            className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 md:p-12 border border-white/10"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-8">
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <motion.div
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        className="relative"
                                    >
                                        <img
                                            src={testimonial.image}
                                            alt={testimonial.name}
                                            className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-amber-500"
                                        />
                                        <div className="absolute -bottom-2 -right-2 bg-amber-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                                            ✓ Verified
                                        </div>
                                    </motion.div>
                                </div>

                                {/* Content */}
                                <div className="flex-1 text-center md:text-left">
                                    {/* Stars */}
                                    <div className="flex items-center justify-center md:justify-start gap-1 mb-4">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                            <StarIcon
                                                key={i}
                                                className={`w-5 h-5 ${i < testimonial.rating ? 'text-amber-400' : 'text-gray-600'
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    {/* Quote */}
                                    <blockquote className="text-lg md:text-xl text-gray-300 mb-6 leading-relaxed">
                                        "{testimonial.content}"
                                    </blockquote>

                                    {/* Author */}
                                    <div>
                                        <p className="font-semibold text-white text-lg">{testimonial.name}</p>
                                        <p className="text-amber-400">{testimonial.role}</p>
                                        <p className="text-gray-500 text-sm mt-1">{testimonial.exam}</p>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <button
                            onClick={prev}
                            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <ChevronLeftIcon className="w-5 h-5 text-white" />
                        </button>

                        {/* Dots */}
                        <div className="flex gap-2">
                            {TESTIMONIALS.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        setCurrent(index);
                                        setIsAutoPlaying(false);
                                    }}
                                    className={`w-3 h-3 rounded-full transition-all ${index === current
                                            ? 'bg-amber-500 w-8'
                                            : 'bg-white/30 hover:bg-white/50'
                                        }`}
                                />
                            ))}
                        </div>

                        <button
                            onClick={next}
                            className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                        >
                            <ChevronRightIcon className="w-5 h-5 text-white" />
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 pt-16 border-t border-white/10"
                >
                    {[
                        { value: '10,000+', label: 'Happy Students' },
                        { value: '4.9/5', label: 'Average Rating' },
                        { value: '500+', label: 'Success Stories' },
                        { value: '99%', label: 'Satisfaction Rate' },
                    ].map((stat, index) => (
                        <div key={index} className="text-center">
                            <p className="text-2xl md:text-3xl font-bold text-white mb-1">{stat.value}</p>
                            <p className="text-gray-400 text-sm">{stat.label}</p>
                        </div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
