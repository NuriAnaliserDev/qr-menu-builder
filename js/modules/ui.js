/**
 * Show a notification toast
 * @param {string} message Message to display
 * @param {string} type 'success' or 'error'
 */
export function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type} fade-in`;
    
    const icon = type === 'success' ? '✅' : '❌';
    notification.innerHTML = `<span>${icon}</span> <span>${message}</span>`;
    
    document.body.appendChild(notification);
    
    // Trigger reflow
    notification.offsetHeight;
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

/**
 * Show full screen loading overlay
 * @param {string} message Loading message
 */
export function showLoading(message = 'Yuklanmoqda...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
        <div class="spinner"></div>
        <h3>${message}</h3>
    `;
    document.body.appendChild(overlay);
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    }
}

/**
 * Update UI translations
 * @param {string} lang Language code
 * @param {object} translations Translation object
 */
export function updateTranslations(lang, translations) {
    const texts = translations[lang];
    if (!texts) return;

    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.dataset.i18n;
        if (texts[key]) {
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.placeholder = texts[key];
            } else {
                element.textContent = texts[key];
            }
        }
    });
}
