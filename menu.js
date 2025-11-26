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
});

// ============================================
// Data Loading
// ============================================

function loadMenuData() {
    // Get data from URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const dataParam = urlParams.get('data');

    if (dataParam) {
        try {
            const data = JSON.parse(decodeURIComponent(dataParam));
            allMenuItems = data.items || [];
            settings = data.settings || {};

            // Update page
            updatePageInfo();
            renderCategories();
            renderMenuItems();
        } catch (error) {
            console.error('Error parsing menu data:', error);
            showEmptyState('Menyu ma\'lumotlari yuklanmadi');
        }
    } else {
        // Load from localStorage for testing
        loadFromLocalStorage();
    }
}

function loadFromLocalStorage() {
    const savedItems = localStorage.getItem('qr_menu_items');
    const savedSettings = localStorage.getItem('qr_menu_settings');

    if (savedItems) {
        allMenuItems = JSON.parse(savedItems);
    }

    if (savedSettings) {
        settings = JSON.parse(savedSettings);
    }

    if (allMenuItems.length === 0) {
        showEmptyState('Hozircha menyu bo\'sh');
        return;
    }

    updatePageInfo();
    renderCategories();
    renderMenuItems();
}

// ============================================
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
    });
    event.target.classList.add('active');

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

    categoriesContainer.innerHTML = categories.map(category => `
        <button 
            class="category-btn ${category === 'all' ? 'active' : ''}" 
            onclick="handleCategoryFilter('${category}')"
        >
            ${categoryEmojis[category] || '📋'} ${category === 'all' ? 'Barchasi' : category}
        </button>
    `).join('');
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
            <img src="${item.image}" alt="${item.name}" class="menu-item-image">
            <div class="menu-item-content">
                <span class="menu-item-category">${item.category}</span>
                <h4 class="menu-item-name">${item.name}</h4>
                <p class="menu-item-description">${item.description}</p>
                <div class="menu-item-price">${formatPrice(item.price)} so'm</div>
            </div>
        </div>
    `;
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
