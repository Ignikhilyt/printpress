/**
 * Format currency in Indian Rupees
 * @param {number} amount - The amount to format
 * @returns {string} Formatted currency string
 */
export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

/**
 * Format date in Indian format
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted date string
 */
export function formatDate(date) {
    return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

/**
 * Format date with time
 * @param {Date|string} date - The date to format
 * @returns {string} Formatted datetime string
 */
export function formatDateTime(date) {
    return new Date(date).toLocaleString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param {Date|string} date - The date to format
 * @returns {string} Relative time string
 */
export function formatRelativeTime(date) {
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return formatDate(date);
}

/**
 * Truncate string with ellipsis
 * @param {string} str - String to truncate
 * @param {number} len - Maximum length
 * @returns {string} Truncated string
 */
export function truncate(str, len = 50) {
    if (!str) return '';
    return str.length > len ? str.substring(0, len) + '...' : str;
}

/**
 * Format file size
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
export function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Format phone number (Indian format)
 * @param {string} phone - Phone number
 * @returns {string} Formatted phone number
 */
export function formatPhone(phone) {
    if (!phone) return '';
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
        return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
}

/**
 * Format order number
 * @param {string} orderNumber - Order number
 * @returns {string} Formatted order number
 */
export function formatOrderNumber(orderNumber) {
    return orderNumber?.toUpperCase() || '';
}
