// ============================================
// QR Menu Builder - Customer Menu View
// ============================================

let allMenuItems = [];
let filteredItems = [];
let currentCategory = 'all';
let settings = {};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadMenuData();
    initEventListeners();
    
    // Initialize language
    const savedLang = localStorage.getItem('qr_menu_lang') || 'uz';
    changeLanguage(savedLang);
});

// ============================================
// Language Management
// ============================================

let currentLang = 'uz';

function changeLanguage(lang) {
    currentLang = lang;
    // Don't save to local storage here as it might be set by URL or user preference for this session
    // But for consistency let's save it if user explicitly changes it.
    
    const t = translations[lang];
    if (!t) return;

    // Update static texts
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.dataset.i18n;
        if (t[key]) {
             if (el.tagName === 'INPUT') {
                el.placeholder = t[key];
            } else {
                el.textContent = t[key];
            }
        }
    });
    
    // Re-render categories to update names
    renderCategories();
    // Re-render items if needed (though items content is user generated, category names might need translation if we display them)
    renderMenuItems();
}

// ============================================
// Data Loading
// ============================================

function loadMenuData() {
    try {
        // Get data from URL
        const urlParams = new URLSearchParams(window.location.search);
        const dataParam = urlParams.get('data');

        let data;

        if (dataParam) {
            // Parse data from URL
            data = JSON.parse(decodeURIComponent(dataParam));
        } else if (window.MENU_DATA) {
            // Use embedded data
            data = window.MENU_DATA;
        } else {
            showEmptyState('Menyu ma\'lumotlari topilmadi');
            return;
        }
        
        // Validate data
        if (!data || !data.items) {
            throw new Error('Noto\'g\'ri ma\'lumot formati');
        }

        // Set global variables
        allMenuItems = data.items || [];
        settings = data.settings || {};
        
        // Initial render
        updatePageInfo();
        renderCategories();
        
        // Set initial filter
        filteredItems = allMenuItems;
        renderMenuItems();
        
        // Show promo banner if exists
        if (settings.promoText) {
            const banner = document.getElementById('promoBanner');
            const text = document.getElementById('promoText');
            if (banner && text) {
                text.textContent = settings.promoText;
                banner.style.display = 'block';
            }
        }

        // Apply theme color
        if (settings.themeColor) {
            document.documentElement.style.setProperty('--primary', settings.themeColor);
            document.documentElement.style.setProperty('--primary-dark', adjustColor(settings.themeColor, -20));
            document.documentElement.style.setProperty('--primary-light', adjustColor(settings.themeColor, 20));
        }

    } catch (error) {
        console.error('Error loading menu:', error);
        showEmptyState('Menyuni yuklashda xatolik yuz berdi');
    }
}
// Event Listeners
// ============================================

function initEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);
}

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();

    if (searchTerm === '') {
        filteredItems = allMenuItems;
    } else {
        filteredItems = allMenuItems.filter(item =>
            item.name.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm)
        );
    }

    renderMenuItems();
}

function handleCategoryFilter(category) {
    currentCategory = category;

    // Update active button
    document.querySelectorAll('.category-btn').forEach(btn => {
        btn.classList.remove('active');
        // Check if this button corresponds to the selected category
        // The onclick handler is on the button itself, so we can check the text or attribute if we added one.
        // Better yet, let's rely on the fact that we are rebuilding the buttons or just add a data attribute.
    });
    
    // Since we re-render buttons in renderCategories, we might lose the active state if we don't handle it there.
    // But renderCategories is only called once.
    // Let's find the button that was clicked.
    // Actually, the simplest way is to re-render the categories with the new active state, 
    // OR just find the button by text/content.
    
    // Let's use a more robust approach: add data-category to buttons in renderCategories (already done in HTML template?)
    // In renderCategories: class="category-btn ${category === 'all' ? 'active' : ''}"
    // So we just need to update the class here.
    
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => {
        if (btn.textContent.includes(category === 'all' ? 'Barchasi' : category)) {
             btn.classList.add('active');
        } else {
             btn.classList.remove('active');
        }
    });

    // Reset search
    document.getElementById('searchInput').value = '';

    // Filter items
    if (category === 'all') {
        filteredItems = allMenuItems;
    } else {
        filteredItems = allMenuItems.filter(item => item.category === category);
    }

    renderMenuItems();
}

// ============================================
// Rendering Functions
// ============================================

function updatePageInfo() {
    // Update page title and restaurant name
    const restaurantName = settings.restaurantName || 'Mening Restoranim';
    document.getElementById('pageTitle').textContent = `${restaurantName} - Menyu`;
    document.getElementById('restaurantName').textContent = restaurantName;

    // Update restaurant info
    const infoContainer = document.getElementById('restaurantInfo');

    if (settings.phone || settings.address || settings.hours) {
        infoContainer.style.display = 'block';

        if (settings.phone) {
            document.getElementById('phoneInfo').style.display = 'flex';
            document.getElementById('phoneText').textContent = settings.phone;
        }

        if (settings.address) {
            document.getElementById('addressInfo').style.display = 'flex';
            document.getElementById('addressText').textContent = settings.address;
        }

        if (settings.hours) {
            document.getElementById('hoursInfo').style.display = 'flex';
            document.getElementById('hoursText').textContent = settings.hours;
        }
    }
}

function renderCategories() {
    const categoriesContainer = document.getElementById('categoryFilter');
    const categories = ['all', ...new Set(allMenuItems.map(item => item.category))];

    const categoryEmojis = {
        'all': '🍽️',
        'Ovqatlar': '🍲',
        'Ichimliklar': '🥤',
        'Desertlar': '🍰',
        'Salatlar': '🥗',
        'Fast Food': '🍔'
    };

    const t = translations[currentLang];
    
    categoriesContainer.innerHTML = categories.map(category => {
        let displayName = category;
        if (category === 'all') displayName = t.cat_all;
        else if (category === 'Ovqatlar') displayName = t.cat_food;
        else if (category === 'Ichimliklar') displayName = t.cat_drinks;
        else if (category === 'Desertlar') displayName = t.cat_desserts;
        else if (category === 'Salatlar') displayName = t.cat_salads;
        else if (category === 'Fast Food') displayName = t.cat_fastfood;
        
        return `
        <button 
            class="category-btn ${category === 'all' ? 'active' : ''}" 
            onclick="handleCategoryFilter('${category}')"
            data-category="${category}"
        >
            ${categoryEmojis[category] || '📋'} ${displayName}
        </button>
    `}).join('');
}

function renderMenuItems() {
    const container = document.getElementById('menuContent');
    const itemsToRender = filteredItems.length > 0 ? filteredItems :
        (currentCategory === 'all' ? allMenuItems :
            allMenuItems.filter(item => item.category === currentCategory));

    if (itemsToRender.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🔍</div>
                <h3 style="margin-bottom: 1rem;">Hech narsa topilmadi</h3>
                <p>Boshqa kategoriyani tanlang yoki qidiruv so'zini o'zgartiring</p>
            </div>
        `;
        return;
    }

    // Group by category
    const groupedItems = {};
    itemsToRender.forEach(item => {
        if (!groupedItems[item.category]) {
            groupedItems[item.category] = [];
        }
        groupedItems[item.category].push(item);
    });

    // Render grouped items
    container.innerHTML = Object.entries(groupedItems).map(([category, items]) => `
        <div class="category-section">
            <h2 class="category-section-title">
                ${getCategoryEmoji(category)} ${category}
            </h2>
            <div class="menu-grid">
                ${items.map(renderMenuItem).join('')}
            </div>
        </div>
    `).join('');
}

function renderMenuItem(item) {
    return `
        <div class="menu-item-card fade-in">
            <img src="${item.image}" alt="${escapeHtml(item.name)}" class="menu-item-image">
            <div class="menu-item-content">
                <span class="menu-item-category">${escapeHtml(item.category)}</span>
                <h4 class="menu-item-name">${escapeHtml(item.name)}</h4>
                <p class="menu-item-description">${escapeHtml(item.description)}</p>
                <div class="menu-item-price">${formatPrice(item.price)} so'm</div>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showEmptyState(message) {
    const container = document.getElementById('menuContent');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon">🍽️</div>
            <h3 style="margin-bottom: 1rem;">${message}</h3>
            <p>Admin panelda menyu qo'shing</p>
        </div>
    `;
}

// ============================================
// Utility Functions
// ============================================

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function getCategoryEmoji(category) {
    const emojis = {
        'Ovqatlar': '🍲',
        'Ichimliklar': '🥤',
        'Desertlar': '🍰',
        'Salatlar': '🥗',
        'Fast Food': '🍔'
    };
    return emojis[category] || '📋';
}

// Make handleCategoryFilter available globally
window.handleCategoryFilter = handleCategoryFilter;

// ============================================
// Share & Feedback
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Share Button
    const shareBtn = document.getElementById('shareBtn');
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            if (navigator.share) {
                try {
                    await navigator.share({
                        title: document.title,
                        text: 'Ajoyib restoran menyusi!',
                        url: window.location.href
                    });
                } catch (err) {
                    console.log('Share failed:', err);
                }
            } else {
                // Fallback
                try {
                    await navigator.clipboard.writeText(window.location.href);
                    alert('Link nusxalandi!');
                } catch (err) {
                    prompt('Linkni nusxalang:', window.location.href);
                }
            }
        });
    }

    // Feedback Button
    const feedbackBtn = document.getElementById('feedbackBtn');
    if (feedbackBtn) {
        feedbackBtn.addEventListener('click', () => {
            // Check if phone number exists in settings
            if (settings.phone) {
                const phone = settings.phone.replace(/\D/g, ''); // Remove non-digits
                const message = encodeURIComponent("Assalomu alaykum! Menyu bo'yicha fikrim bor edi...");
                window.open(`https://wa.me/${phone}?text=${message}`, '_blank');
            } else {
                alert("Bog'lanish uchun telefon raqam kiritilmagan.");
            }
        });
    }
});

// Helper to darken/lighten color
function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}
