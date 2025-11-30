/**
 * Format price with spaces as thousands separators
 * @param {number|string} price 
 * @returns {string} Formatted price
 */
export function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

/**
 * Adjust color brightness
 * @param {string} color Hex color code
 * @param {number} amount Amount to adjust (-100 to 100)
 * @returns {string} Adjusted hex color
 */
export function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

/**
 * Generate a random ID
 * @returns {string} Random ID
 */
export function generateId() {
    return Math.random().toString(36).substr(2, 9);
}
