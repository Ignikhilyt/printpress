/**
 * FAQ Page
 * Premium FAQ page with category tabs, search, accordion items,
 * quick links, and contact CTA section.
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    MagnifyingGlassIcon,
    QuestionMarkCircleIcon,
    ChevronDownIcon,
    ShoppingBagIcon,
    CreditCardIcon,
    TruckIcon,
    ArrowPathIcon,
    DocumentTextIcon,
    ChatBubbleLeftRightIcon,
    EnvelopeIcon,
    PhoneIcon,
    CheckCircleIcon,
    XMarkIcon,
    SparklesIcon,
} from '@heroicons/react/24/outline';
import { cn } from '../../utils/helpers';
import Button from '../../components/common/Button';

// ============================================================================
// FAQ DATA
// ============================================================================

const FAQ_CATEGORIES = [
    { id: 'all', label: 'All Questions', icon: QuestionMarkCircleIcon },
    { id: 'orders', label: 'Orders & Delivery', icon: TruckIcon },
    { id: 'payments', label: 'Payment & Pricing', icon: CreditCardIcon },
    { id: 'returns', label: 'Returns & Refunds', icon: ArrowPathIcon },
    { id: 'products', label: 'Products & Quality', icon: DocumentTextIcon },
];

const FAQS = [
    {
        category: 'orders',
        question: 'How long does delivery take?',
        answer: 'Standard delivery takes 5-7 business days. Express delivery is available in 2-3 business days for an additional charge. Delivery times may vary based on your location.',
    },
    {
        category: 'orders',
        question: 'Do you deliver across India?',
        answer: 'Yes! We deliver to all major cities and towns across India through our trusted courier partners like Delhivery, BlueDart, and DTDC. Remote areas may take 2-3 additional days.',
    },
    {
        category: 'orders',
        question: 'Can I track my order?',
        answer: 'Absolutely! Once your order is shipped, you\'ll receive a tracking link via SMS and email. You can also track your order on our website using your order ID.',
    },
    {
        category: 'orders',
        question: 'What if my order is delayed?',
        answer: 'In case of delays, please contact our support team with your order ID. We\'ll investigate and provide you with an updated delivery timeline. If the delay is due to us, we\'ll compensate accordingly.',
    },
    {
        category: 'orders',
        question: 'Can I change my delivery address after placing an order?',
        answer: 'You can change your delivery address within 2 hours of placing the order. After that, please contact our support team and we\'ll try our best to accommodate the change if the order hasn\'t been shipped yet.',
    },
    {
        category: 'payments',
        question: 'What payment methods do you accept?',
        answer: 'We accept all major credit/debit cards (Visa, Mastercard, RuPay), UPI (GPay, PhonePe, Paytm), net banking, and popular wallets. Cash on Delivery is also available for orders under ₹2000.',
    },
    {
        category: 'payments',
        question: 'Is there a minimum order value?',
        answer: 'There\'s no minimum order value. However, orders below ₹499 will have a delivery charge of ₹49. Orders above ₹499 get FREE delivery!',
    },
    {
        category: 'payments',
        question: 'Do you offer discounts for bulk orders?',
        answer: 'Yes! We offer special discounts for bulk orders: 5% off on 5+ items, 10% off on 10+ items. For larger orders (50+ items), please contact our sales team at bulk@printpress.in for custom quotes.',
    },
    {
        category: 'payments',
        question: 'Are there any hidden charges?',
        answer: 'No hidden charges! The price you see includes all taxes. Only exceptions are COD orders which have an extra ₹29 handling fee, and special binding options which are clearly priced on the product page.',
    },
    {
        category: 'payments',
        question: 'Is my payment information secure?',
        answer: 'Absolutely! We use industry-standard SSL encryption and partner with trusted payment gateways like Razorpay. We never store your card details on our servers.',
    },
    {
        category: 'returns',
        question: 'What is your return policy?',
        answer: 'We accept returns within 7 days of delivery if the product is damaged, defective, or incorrect. Please keep the original packaging for returns. Note: Returns are not accepted for customized or correctly delivered orders.',
    },
    {
        category: 'returns',
        question: 'How do I initiate a return?',
        answer: 'Log into your account, go to Order History, select the order, and click "Request Return". You can also email us at returns@printpress.in with photos of the issue. We\'ll process the return within 24 hours.',
    },
    {
        category: 'returns',
        question: 'How long do refunds take?',
        answer: 'Refunds are processed within 5-7 business days after we receive and verify the returned product. The amount will be credited to your original payment method. UPI refunds are faster (1-2 days).',
    },
    {
        category: 'returns',
        question: 'Can I exchange instead of refund?',
        answer: 'Yes! You can opt for an exchange instead of refund. The replacement will be shipped once we receive the original product. Exchange processing is usually faster than refunds.',
    },
    {
        category: 'products',
        question: 'What type of paper do you use?',
        answer: 'We offer three paper options: 70 GSM (standard, affordable), 80 GSM (premium, recommended for heavy notes), and 100 GSM (executive, best for important materials). Higher GSM means thicker, more durable paper.',
    },
    {
        category: 'products',
        question: 'Are your notes official copies?',
        answer: 'We partner directly with coaching institutes to provide authorized copies of their notes. All materials are genuine, up-to-date, and sourced directly from the institutes. Look for the "Official Partner" badge on products.',
    },
    {
        category: 'products',
        question: 'Do you offer color printing?',
        answer: 'Yes! We offer both black & white and color printing options. Color printing is recommended for notes with diagrams, maps, and images. Color printing costs about 3.5x the B&W price but greatly enhances readability.',
    },
    {
        category: 'products',
        question: 'What binding options are available?',
        answer: 'We offer: Staple binding (free, for thin notes), Spiral binding (₹40, flexible and lies flat), and Hardcover binding (₹150, premium and durable). Choose based on how you plan to use the notes.',
    },
    {
        category: 'products',
        question: 'Can I get a sample before ordering?',
        answer: 'We offer sample pages for most popular notes. Contact us to request a sample. You can also check reviews and sample images on product pages. First-time buyers get a 10% discount!',
    },
];

// ============================================================================
// FAQ ITEM
// ============================================================================

const FAQItem = ({ faq, isOpen, onToggle }) => (
    <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-b border-gray-100 dark:border-gray-800 last:border-0"
    >
        <button
            onClick={onToggle}
            className="w-full py-5 flex items-center justify-between text-left group"
        >
            <span className={cn(
                'font-medium pr-4 transition-colors',
                isOpen ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400'
            )}>
                {faq.question}
            </span>
            <motion.div
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
            >
                <ChevronDownIcon className={cn(
                    'w-5 h-5 transition-colors',
                    isOpen ? 'text-amber-600 dark:text-amber-400' : 'text-gray-400'
                )} />
            </motion.div>
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                >
                    <p className="pb-5 pr-8 text-gray-600 dark:text-gray-400 leading-relaxed">
                        {faq.answer}
                    </p>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
);

// ============================================================================
// CATEGORY TABS
// ============================================================================

const CategoryTabs = ({ selected, onChange }) => (
    <div className="flex flex-wrap gap-2 mb-8">
        {FAQ_CATEGORIES.map((cat) => (
            <motion.button
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onChange(cat.id)}
                className={cn(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                    selected === cat.id
                        ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-amber-500 dark:hover:border-amber-500'
                )}
            >
                <cat.icon className="w-4 h-4" />
                {cat.label}
            </motion.button>
        ))}
    </div>
);

// ============================================================================
// SEARCH BAR
// ============================================================================

const SearchBar = ({ value, onChange, onClear }) => (
    <div className="relative max-w-xl mx-auto mb-8">
        <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
            type="text"
            placeholder="Search for answers..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full pl-12 pr-12 py-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
        />
        {value && (
            <button
                onClick={onClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
                <XMarkIcon className="w-5 h-5" />
            </button>
        )}
    </div>
);

// ============================================================================
// EMPTY STATE
// ============================================================================

const EmptyState = ({ searchQuery, onClear }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-16"
    >
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No results found
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-6">
            No questions match "{searchQuery}". Try a different search term.
        </p>
        <Button variant="outline" onClick={onClear}>
            Clear Search
        </Button>
    </motion.div>
);

// ============================================================================
// QUICK ANSWERS
// ============================================================================

const QuickAnswers = () => {
    const quickItems = [
        { icon: '🚚', question: 'Free delivery?', answer: 'Orders above ₹499' },
        { icon: '⏰', question: 'Delivery time?', answer: '5-7 business days' },
        { icon: '💰', question: 'COD available?', answer: 'Yes, under ₹2000' },
        { icon: '↩️', question: 'Return window?', answer: '7 days' },
    ];

    return (
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 rounded-2xl p-6 mb-8">
            <h3 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <SparklesIcon className="w-5 h-5 text-amber-500" />
                Quick Answers
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {quickItems.map((item, i) => (
                    <div key={i} className="text-center">
                        <span className="text-2xl mb-2 block">{item.icon}</span>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.question}</p>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">{item.answer}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

// ============================================================================
// CONTACT CTA
// ============================================================================

const ContactCTA = () => (
    <section className="py-16 px-4 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 mt-16">
        <div className="max-w-3xl mx-auto text-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
            >
                <h2 className="text-2xl lg:text-3xl font-bold text-white mb-4">
                    Still Have Questions?
                </h2>
                <p className="text-gray-400 mb-8 max-w-md mx-auto">
                    Can't find the answer you're looking for? Our friendly support team is here to help.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link to="/contact">
                        <Button className="min-w-[180px]">
                            <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                            Contact Support
                        </Button>
                    </Link>
                    <a href="mailto:support@printpress.in">
                        <Button variant="outline" className="min-w-[180px] border-white/20 text-white hover:bg-white/10">
                            <EnvelopeIcon className="w-5 h-5 mr-2" />
                            Email Us
                        </Button>
                    </a>
                </div>
                <p className="text-sm text-gray-500 mt-6">
                    <PhoneIcon className="w-4 h-4 inline mr-1" />
                    Or call us at <a href="tel:+919876543210" className="text-amber-400">+91 98765 43210</a>
                </p>
            </motion.div>
        </div>
    </section>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function FAQPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [openItems, setOpenItems] = useState({});

    const filteredFAQs = useMemo(() => {
        return FAQS.filter((faq) => {
            const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
            const matchesSearch = searchQuery === '' ||
                faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [searchQuery, selectedCategory]);

    const toggleItem = (index) => {
        setOpenItems((prev) => ({
            ...prev,
            [index]: !prev[index],
        }));
    };

    const handleClearSearch = () => {
        setSearchQuery('');
    };

    const handleCategoryChange = (category) => {
        setSelectedCategory(category);
        setOpenItems({});
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            {/* Hero Section */}
            <section className="relative py-20 lg:py-24 px-4 overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500 rounded-full blur-3xl" />
                    <div className="absolute bottom-1/4 -right-20 w-[500px] h-[500px] bg-purple-500 rounded-full blur-3xl" />
                </div>

                <div className="max-w-4xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/20 text-amber-400 text-sm font-medium mb-6">
                            <QuestionMarkCircleIcon className="w-4 h-4" />
                            Help Center
                        </span>
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                            Frequently Asked{' '}
                            <span className="bg-gradient-to-r from-amber-400 to-amber-600 bg-clip-text text-transparent">
                                Questions
                            </span>
                        </h1>
                        <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-8">
                            Find quick answers to common questions about our products and services.
                        </p>

                        {/* Search */}
                        <SearchBar
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onClear={handleClearSearch}
                        />
                    </motion.div>
                </div>
            </section>

            {/* FAQ Content */}
            <section className="py-16 px-4 -mt-8">
                <div className="max-w-4xl mx-auto">
                    {/* Quick Answers */}
                    <QuickAnswers />

                    {/* Category Tabs */}
                    <CategoryTabs
                        selected={selectedCategory}
                        onChange={handleCategoryChange}
                    />

                    {/* FAQ List */}
                    {filteredFAQs.length === 0 ? (
                        <EmptyState searchQuery={searchQuery} onClear={handleClearSearch} />
                    ) : (
                        <motion.div
                            layout
                            className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 overflow-hidden"
                        >
                            <div className="px-6">
                                {filteredFAQs.map((faq, index) => (
                                    <FAQItem
                                        key={index}
                                        faq={faq}
                                        isOpen={openItems[index]}
                                        onToggle={() => toggleItem(index)}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Results count */}
                    {searchQuery && filteredFAQs.length > 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 mt-4">
                            Found {filteredFAQs.length} {filteredFAQs.length === 1 ? 'result' : 'results'} for "{searchQuery}"
                        </p>
                    )}
                </div>
            </section>

            {/* Contact CTA */}
            <ContactCTA />
        </div>
    );
}
