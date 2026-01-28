/**
 * Social Share Buttons Component
 * Allows users to share notes/pages on social media platforms
 */

import { motion } from 'framer-motion';
import {
    FaWhatsapp,
    FaFacebookF,
    FaTwitter,
    FaLinkedinIn,
    FaTelegram,
    FaShareAlt,
} from 'react-icons/fa';
import { HiOutlineLink } from 'react-icons/hi';
import toast from 'react-hot-toast';

const SHARE_PLATFORMS = {
    whatsapp: {
        name: 'WhatsApp',
        icon: FaWhatsapp,
        color: '#25D366',
        getUrl: (url, title) => `https://wa.me/?text=${encodeURIComponent(`${title}\n\n${url}`)}`,
    },
    facebook: {
        name: 'Facebook',
        icon: FaFacebookF,
        color: '#1877F2',
        getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    twitter: {
        name: 'Twitter',
        icon: FaTwitter,
        color: '#1DA1F2',
        getUrl: (url, title) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
    linkedin: {
        name: 'LinkedIn',
        icon: FaLinkedinIn,
        color: '#0A66C2',
        getUrl: (url) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
    telegram: {
        name: 'Telegram',
        icon: FaTelegram,
        color: '#0088CC',
        getUrl: (url, title) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    },
};

export default function ShareButtons({
    url = window.location.href,
    title = document.title,
    description = '',
    platforms = ['whatsapp', 'facebook', 'twitter', 'linkedin', 'telegram'],
    variant = 'default', // default, compact, floating
    showLabels = true,
    className = '',
}) {
    const handleShare = (platform) => {
        const platformConfig = SHARE_PLATFORMS[platform];
        if (!platformConfig) return;

        const shareUrl = platformConfig.getUrl(url, title);
        window.open(shareUrl, '_blank', 'width=600,height=400');

        // Track share event (Google Analytics)
        if (window.gtag) {
            window.gtag('event', 'share', {
                method: platform,
                content_type: 'note',
                item_id: title,
            });
        }
    };

    const handleCopyLink = async () => {
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link copied to clipboard!');
        } catch (error) {
            toast.error('Failed to copy link');
        }
    };

    const handleNativeShare = async () => {
        if (!navigator.share) {
            handleCopyLink();
            return;
        }

        try {
            await navigator.share({
                title,
                text: description,
                url,
            });
        } catch (error) {
            if (error.name !== 'AbortError') {
                console.error('Share failed:', error);
            }
        }
    };

    if (variant === 'compact') {
        return (
            <div className={`flex items-center gap-2 ${className}`}>
                <span className="text-sm text-gray-500">Share:</span>
                <div className="flex gap-1">
                    {platforms.map((platform) => {
                        const Icon = SHARE_PLATFORMS[platform].icon;
                        const color = SHARE_PLATFORMS[platform].color;
                        return (
                            <motion.button
                                key={platform}
                                onClick={() => handleShare(platform)}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-all hover:shadow-lg"
                                style={{ backgroundColor: color }}
                                title={`Share on ${SHARE_PLATFORMS[platform].name}`}
                            >
                                <Icon className="w-4 h-4" />
                            </motion.button>
                        );
                    })}
                    <motion.button
                        onClick={handleCopyLink}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all hover:shadow-lg"
                        title="Copy link"
                    >
                        <HiOutlineLink className="w-4 h-4" />
                    </motion.button>
                </div>
            </div>
        );
    }

    if (variant === 'floating') {
        return (
            <div className={`fixed right-4 top-1/2 -translate-y-1/2 z-40 ${className}`}>
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-2 space-y-2">
                    {platforms.map((platform, index) => {
                        const Icon = SHARE_PLATFORMS[platform].icon;
                        const color = SHARE_PLATFORMS[platform].color;
                        return (
                            <motion.button
                                key={platform}
                                onClick={() => handleShare(platform)}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                whileHover={{ scale: 1.15, x: -5 }}
                                whileTap={{ scale: 0.9 }}
                                className="w-12 h-12 rounded-full flex items-center justify-center text-white transition-all hover:shadow-xl"
                                style={{ backgroundColor: color }}
                                title={`Share on ${SHARE_PLATFORMS[platform].name}`}
                            >
                                <Icon className="w-5 h-5" />
                            </motion.button>
                        );
                    })}
                    <motion.button
                        onClick={handleCopyLink}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: platforms.length * 0.1 }}
                        whileHover={{ scale: 1.15, x: -5 }}
                        whileTap={{ scale: 0.9 }}
                        className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 transition-all hover:shadow-xl"
                        title="Copy link"
                    >
                        <HiOutlineLink className="w-5 h-5" />
                    </motion.button>
                </div>
            </div>
        );
    }

    // Default variant with labels
    return (
        <div className={className}>
            <div className="flex flex-wrap gap-3">
                {platforms.map((platform) => {
                    const Icon = SHARE_PLATFORMS[platform].icon;
                    const platformConfig = SHARE_PLATFORMS[platform];
                    return (
                        <motion.button
                            key={platform}
                            onClick={() => handleShare(platform)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg text-white font-medium transition-all hover:shadow-lg"
                            style={{ backgroundColor: platformConfig.color }}
                        >
                            <Icon className="w-4 h-4" />
                            {showLabels && <span>{platformConfig.name}</span>}
                        </motion.button>
                    );
                })}

                {/* Copy Link Button */}
                <motion.button
                    onClick={handleCopyLink}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium transition-all hover:shadow-lg"
                >
                    <HiOutlineLink className="w-4 h-4" />
                    {showLabels && <span>Copy Link</span>}
                </motion.button>

                {/* Native Share (Mobile) */}
                {navigator.share && (
                    <motion.button
                        onClick={handleNativeShare}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all hover:shadow-lg"
                    >
                        <FaShareAlt className="w-4 h-4" />
                        {showLabels && <span>Share</span>}
                    </motion.button>
                )}
            </div>
        </div>
    );
}

// Example usage:
// <ShareButtons />
// <ShareButtons variant="compact" showLabels={false} />
// <ShareButtons variant="floating" platforms={['whatsapp', 'facebook', 'twitter']} />
