import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const CopyIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
);

const socialPlatforms = [
    {
        name: 'WhatsApp',
        color: '#25D366',
        icon: 'W',
        getUrl: (url, title) => `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
    },
    {
        name: 'Facebook',
        color: '#1877F2',
        icon: 'F',
        getUrl: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    },
    {
        name: 'Twitter',
        color: '#1DA1F2',
        icon: 'X',
        getUrl: (url, title) => `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
    },
    {
        name: 'LinkedIn',
        color: '#0A66C2',
        icon: 'L',
        getUrl: (url, title) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    },
];

export default function SocialShareButtons({
    url,
    title,
    description,
    showLabel = true,
    className = '',
}) {
    const shareUrl = url || window.location.href;
    const shareTitle = title || document.title;

    const copyToClipboard = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.success('Link copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = shareUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast.success('Link copied!');
        }
    };

    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {showLabel && (
                <span className="text-sm text-gray-600 mr-1">Share:</span>
            )}

            {socialPlatforms.map(platform => (
                <motion.a
                    key={platform.name}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    href={platform.getUrl(shareUrl, shareTitle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={`Share on ${platform.name}`}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-transform"
                    style={{
                        background: `${platform.color}15`,
                        color: platform.color,
                    }}
                >
                    {platform.icon}
                </motion.a>
            ))}

            <motion.button
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={copyToClipboard}
                title="Copy link"
                className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"
            >
                <CopyIcon />
            </motion.button>
        </div>
    );
}
