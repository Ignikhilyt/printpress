/**
 * About Page
 * Premium about us page with hero section, story, team, values,
 * milestones timeline, partner logos, and CTA section.
 */

import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, useScroll, useTransform } from 'framer-motion';
import {
    AcademicCapIcon,
    TruckIcon,
    ShieldCheckIcon,
    SparklesIcon,
    BookOpenIcon,
    UserGroupIcon,
    BuildingOfficeIcon,
    HeartIcon,
    LightBulbIcon,
    RocketLaunchIcon,
    ChartBarIcon,
    GlobeAltIcon,
    ArrowRightIcon,
    CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';
import Button from '../../components/common/Button';

// ============================================================================
// DATA
// ============================================================================

const TEAM = [
    { name: 'Rajesh Kumar', role: 'Founder & CEO', emoji: '👨‍💼', bio: 'Former IAS officer with 15 years in education' },
    { name: 'Priya Sharma', role: 'Head of Operations', emoji: '👩‍💻', bio: 'Ex-Amazon logistics expert' },
    { name: 'Amit Patel', role: 'Quality Manager', emoji: '👨‍🔬', bio: 'Publishing industry veteran' },
    { name: 'Sneha Gupta', role: 'Customer Success', emoji: '👩‍🎓', bio: 'UPSC mentor & educator' },
    { name: 'Vikram Singh', role: 'Tech Lead', emoji: '👨‍💻', bio: 'IIT Delhi, Ex-Google engineer' },
    { name: 'Anita Reddy', role: 'Marketing Head', emoji: '👩‍💼', bio: 'EdTech marketing specialist' },
];

const STATS = [
    { value: '50K+', label: 'Happy Students', icon: UserGroupIcon, color: 'from-blue-500 to-blue-600' },
    { value: '200+', label: 'Study Notes', icon: BookOpenIcon, color: 'from-emerald-500 to-emerald-600' },
    { value: '15+', label: 'Partner Institutes', icon: BuildingOfficeIcon, color: 'from-purple-500 to-purple-600' },
    { value: '4.9⭐', label: 'Average Rating', icon: SparklesIcon, color: 'from-amber-500 to-amber-600' },
];

const VALUES = [
    {
        icon: SparklesIcon,
        title: 'Quality First',
        desc: 'Premium paper quality and crystal-clear printing for the best study experience.',
        color: 'from-amber-500 to-orange-500'
    },
    {
        icon: RocketLaunchIcon,
        title: 'Fast Delivery',
        desc: 'Lightning-quick turnaround times with reliable delivery across all of India.',
        color: 'from-blue-500 to-indigo-500'
    },
    {
        icon: HeartIcon,
        title: 'Student Focused',
        desc: 'Everything we do is designed with student success as our north star.',
        color: 'from-pink-500 to-rose-500'
    },
    {
        icon: ShieldCheckIcon,
        title: 'Trust & Transparency',
        desc: 'No hidden charges, authentic materials, and honest service every time.',
        color: 'from-emerald-500 to-teal-500'
    },
];

const MILESTONES = [
    { year: '2022', title: 'The Beginning', desc: 'Started as a small printing shop in Delhi', icon: LightBulbIcon },
    { year: '2023', title: 'First Partnership', desc: 'Partnered with Vision IAS and Vajiram & Ravi', icon: BuildingOfficeIcon },
    { year: '2023', title: 'Pan-India Delivery', desc: 'Expanded delivery network to all states', icon: TruckIcon },
    { year: '2024', title: '50K+ Students', desc: 'Reached milestone of 50,000 happy students', icon: UserGroupIcon },
    { year: '2025', title: 'Digital Platform', desc: 'Launched enhanced website with premium features', icon: RocketLaunchIcon },
];

const PARTNERS = [
    'Vision IAS', 'Vajiram & Ravi', 'Drishti IAS', 'Forum IAS',
    'Insights IAS', 'Shankar IAS', 'GS Score', 'Next IAS'
];

// ============================================================================
// ANIMATED STAT CARD
// ============================================================================

const StatCard = ({ stat, index }) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: index * 0.1 }}
            className="text-center p-6"
        >
            <div className={cn(
                'w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center bg-gradient-to-br shadow-lg',
                stat.color
            )}>
                <stat.icon className="w-7 h-7 text-white" />
            </div>
            <p className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                {stat.value}
            </p>
            <p className="text-sm text-gray-400 mt-1">{stat.label}</p>
        </motion.div>
    );
};

// ============================================================================
// VALUE CARD
// ============================================================================

const ValueCard = ({ value, index }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -8 }}
        className="group p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
    >
        <div className={cn(
            'w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br',
            value.color
        )}>
            <value.icon className="w-6 h-6 text-white" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
            {value.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {value.desc}
        </p>
    </motion.div>
);

// ============================================================================
// TEAM CARD
// ============================================================================

const TeamCard = ({ member, index }) => (
    <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: index * 0.1 }}
        whileHover={{ y: -8 }}
        className="group p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-center hover:shadow-xl transition-all"
    >
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg">
            {member.emoji}
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white">{member.name}</h3>
        <p className="text-sm text-amber-600 dark:text-amber-400 mb-2">{member.role}</p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{member.bio}</p>
    </motion.div>
);

// ============================================================================
// TIMELINE
// ============================================================================

const Timeline = () => (
    <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -translate-x-1/2" />

        {MILESTONES.map((milestone, index) => (
            <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={cn(
                    'relative flex items-center mb-8 last:mb-0',
                    index % 2 === 0 ? 'md:justify-start' : 'md:justify-end'
                )}
            >
                {/* Content */}
                <div className={cn(
                    'ml-16 md:ml-0 md:w-5/12 p-4 rounded-xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm',
                    index % 2 === 0 ? 'md:text-right md:mr-auto' : 'md:ml-auto'
                )}>
                    <span className="text-xs font-bold text-amber-500">{milestone.year}</span>
                    <h4 className="font-bold text-gray-900 dark:text-white">{milestone.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{milestone.desc}</p>
                </div>

                {/* Icon */}
                <div className="absolute left-8 md:left-1/2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center -translate-x-1/2 z-10 shadow-lg">
                    <milestone.icon className="w-4 h-4 text-white" />
                </div>
            </motion.div>
        ))}
    </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function AboutPage() {
    const heroRef = useRef(null);
    const { scrollYProgress } = useScroll({
        target: heroRef,
        offset: ['start start', 'end start'],
    });
    const heroY = useTransform(scrollYProgress, [0, 1], [0, 150]);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <section
                ref={heroRef}
                className="relative py-24 lg:py-32 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900"
            >
                <motion.div style={{ y: heroY }} className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500 rounded-full blur-3xl" />
                </motion.div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium mb-6">
                            <BuildingOfficeIcon className="w-4 h-4" />
                            About PrintPress
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Empowering Students with{' '}
                            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                                Quality Study Materials
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto">
                            We're on a mission to make premium study notes accessible to every student preparing for competitive exams across India.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-12 -mt-16 relative z-20">
                <div className="max-w-5xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-xl"
                    >
                        {STATS.map((stat, i) => (
                            <StatCard key={i} stat={stat} index={i} />
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-12"
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4">
                            <BookOpenIcon className="w-4 h-4" />
                            Our Story
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                            From Small Beginnings to India's Trusted Platform
                        </h2>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="p-8 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm"
                    >
                        <div className="prose prose-lg dark:prose-invert max-w-none">
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                PrintPress was born out of a simple observation: students preparing for competitive exams often struggle to find quality printed study materials that are both affordable and well-organized.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                                Founded in 2022, we started as a small printing service in Delhi, catering to local coaching institute students. Today, we've grown to serve <strong className="text-amber-600">50,000+ aspirants across India</strong>, partnering with top coaching institutes like Vision IAS, Vajiram & Ravi, and Drishti IAS.
                            </p>
                            <p className="text-gray-600 dark:text-gray-400 leading-relaxed mt-4">
                                Our commitment to quality, fast delivery, and student success drives everything we do. We believe that every student deserves access to the best study materials, regardless of where they are located.
                            </p>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Our Values */}
            <section className="py-20 px-4 bg-white dark:bg-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4">
                            <HeartIcon className="w-4 h-4" />
                            Our Values
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                            What We Stand For
                        </h2>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {VALUES.map((value, i) => (
                            <ValueCard key={i} value={value} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Timeline */}
            <section className="py-20 px-4">
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4">
                            <ChartBarIcon className="w-4 h-4" />
                            Our Journey
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                            Milestones We're Proud Of
                        </h2>
                    </div>
                    <Timeline />
                </div>
            </section>

            {/* Team Section */}
            <section className="py-20 px-4 bg-white dark:bg-gray-800">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4">
                            <UserGroupIcon className="w-4 h-4" />
                            Our Team
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                            Meet the People Behind PrintPress
                        </h2>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {TEAM.map((member, i) => (
                            <TeamCard key={i} member={member} index={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Partners */}
            <section className="py-20 px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 text-sm font-medium mb-4">
                            <BuildingOfficeIcon className="w-4 h-4" />
                            Our Partners
                        </span>
                        <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white">
                            Trusted by Top Coaching Institutes
                        </h2>
                    </div>
                    <div className="flex flex-wrap justify-center gap-4">
                        {PARTNERS.map((partner, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.05 }}
                                className="px-6 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 font-medium text-gray-700 dark:text-gray-300 shadow-sm"
                            >
                                {partner}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-4 bg-gradient-to-br from-amber-500 to-amber-600">
                <div className="max-w-3xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl lg:text-4xl font-bold text-black mb-4">
                            Ready to Start Your Journey?
                        </h2>
                        <p className="text-lg text-black/80 mb-8">
                            Browse our collection of premium notes and get them delivered to your doorstep.
                        </p>
                        <Link to="/notes">
                            <Button variant="secondary" className="bg-white text-amber-600 hover:bg-gray-100">
                                Browse Notes
                                <ArrowRightIcon className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </motion.div>
                </div>
            </section>
        </div>
    );
}
