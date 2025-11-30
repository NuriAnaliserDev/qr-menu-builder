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
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('id');

    if (!restaurantId) {
        showEmptyState('Restoran ID topilmadi');
        return;
    }

    db.collection('restaurants').doc(restaurantId).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            allMenuItems = data.menuItems || [];
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
            
            // Log Page View
            logEvent('page_view');
        } else {
            showEmptyState('Menyu topilmadi');
        }
    }).catch((error) => {
        console.error("Error getting document:", error);
        showEmptyState('Xatolik yuz berdi');
    });
}
// Event Listeners
// ============================================

function initEventListeners() {
    // Search
    document.getElementById('searchInput').addEventListener('input', handleSearch);
}

// Analytics Helper
const logEvent = async (eventName, params = {}) => {
    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('id');
    
    if (!restaurantId) return;

    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const docId = `${restaurantId}_${today}`;
    
    try {
        await db.collection('analytics').doc(docId).set({
            restaurantId: restaurantId,
            date: today,
            [`events.${eventName}`]: firebase.firestore.FieldValue.increment(1),
            ...(params.itemId ? { [`items.${params.itemId}`]: firebase.firestore.FieldValue.increment(1) } : {}),
            ...(params.category ? { [`categories.${params.category}`]: firebase.firestore.FieldValue.increment(1) } : {})
        }, { merge: true });
    } catch (error) {
        console.error('Analytics error:', error);
    }
};

function handleSearch(e) {
    const searchTerm = e.target.value.toLowerCase();

    if (searchTerm === '') {
        filteredItems = allMenuItems;
    } else {
        filteredItems = allMenuItems.filter(item => {
            // Helper to check if any language version matches
            const checkMultiLang = (field) => {
                if (typeof field === 'object') {
                    return Object.values(field).some(val => val.toLowerCase().includes(searchTerm));
                }
                return field.toLowerCase().includes(searchTerm);
            };

            return checkMultiLang(item.name) || 
                   checkMultiLang(item.description) || 
                   item.category.toLowerCase().includes(searchTerm);
        });
    }

    renderMenuItems();
}

function handleCategoryFilter(category) {
    currentCategory = category;
    
    // Log category click
    logEvent('category_view', { category: category });

    // Update active button
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

        // Social Links
        let socialContainer = document.getElementById('socialInfo');
        if (!socialContainer) {
            socialContainer = document.createElement('div');
            socialContainer.id = 'socialInfo';
            socialContainer.className = 'info-row';
            socialContainer.style.display = 'none';
            socialContainer.style.gap = '1rem';
            socialContainer.style.marginTop = '1rem';
            socialContainer.style.justifyContent = 'center';
            infoContainer.appendChild(socialContainer);
        }

        let socialHtml = '';
        if (settings.whatsapp) {
            const phone = settings.whatsapp.replace(/\D/g, '');
            socialHtml += `<a href="https://wa.me/${phone}" target="_blank" style="text-decoration:none;font-size:1.5rem;">💚</a>`;
        }
        if (settings.instagram) {
            const username = settings.instagram.replace('@', '');
            socialHtml += `<a href="https://instagram.com/${username}" target="_blank" style="text-decoration:none;font-size:1.5rem;">📸</a>`;
        }
        if (settings.telegram) {
            const username = settings.telegram.replace('@', '');
            socialHtml += `<a href="https://t.me/${username}" target="_blank" style="text-decoration:none;font-size:1.5rem;">✈️</a>`;
        }

        if (socialHtml) {
            socialContainer.innerHTML = socialHtml;
            socialContainer.style.display = 'flex';
        } else {
            socialContainer.style.display = 'none';
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
    // Handle both old string format and new object format
    const name = typeof item.name === 'object' ? (item.name[currentLang] || item.name['uz']) : item.name;
    const desc = typeof item.description === 'object' ? (item.description[currentLang] || item.description['uz']) : item.description;

    return `
        <div class="menu-item-card fade-in">
            <img src="${item.image}" alt="${escapeHtml(name)}" class="menu-item-image">
            <div class="menu-item-content">
                <span class="menu-item-category">${escapeHtml(item.category)}</span>
                <h4 class="menu-item-name">${escapeHtml(name)}</h4>
                <p class="menu-item-description">${escapeHtml(desc)}</p>
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

// ============================================
// Cart Management
// ============================================

let cart = [];

function addToCart(item) {
    const existingItem = cart.find(i => i.id === item.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: item.id,
            name: item.name, // Object or string
            price: item.price,
            quantity: 1
        });
    }
    
    updateCartUI();
    showNotification('🛒 Savatga qo\'shildi');
    
    // Log Add to Cart
    logEvent('add_to_cart', { itemId: item.id });
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartUI();
}

function updateQuantity(itemId, change) {
    const item = cart.find(i => i.id === itemId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(itemId);
        } else {
            updateCartUI();
        }
    }
}

function updateCartUI() {
    const cartBtn = document.getElementById('cartBtn');
    const cartCount = document.getElementById('cartCount');
    const cartItems = document.getElementById('cartItems');
    const cartTotal = document.getElementById('cartTotal');
    
    // Update FAB
    const totalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalQty;
    
    if (totalQty > 0) {
        cartBtn.style.display = 'flex';
    } else {
        cartBtn.style.display = 'none';
        document.getElementById('cartModal').classList.remove('active');
    }

    // Update Modal
    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-state"><p>Savat bo\'sh</p></div>';
    } else {
        cartItems.innerHTML = cart.map(item => {
            // Handle name translation
            const name = typeof item.name === 'object' ? (item.name[currentLang] || item.name['uz']) : item.name;
            
            return `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${name}</h4>
                    <p>${formatPrice(item.price)} so'm</p>
                </div>
                <div class="cart-item-controls">
                    <button onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span>${item.quantity}</span>
                    <button onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
        `}).join('');
    }

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    cartTotal.textContent = formatPrice(total) + " so'm";
}

function toggleCart() {
    const modal = document.getElementById('cartModal');
    modal.classList.toggle('active');
}

// Make global
window.addToCart = addToCart;
window.updateQuantity = updateQuantity;
window.toggleCart = toggleCart;
window.checkout = checkout;

async function checkout() {
    if (cart.length === 0) return;

    const urlParams = new URLSearchParams(window.location.search);
    const restaurantId = urlParams.get('id');
    const tableNumber = document.getElementById('tableNumber').value;

    if (!restaurantId) return;

    showLoading('Buyurtma yuborilmoqda...');

    try {
        const order = {
            restaurantId: restaurantId,
            table: tableNumber || 'Noma\'lum',
            items: cart,
            total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
            status: 'new', // new, cooking, ready, delivered, cancelled
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        await db.collection('orders').add(order);
        
        // Log Checkout
        logEvent('checkout', { total: order.total });

        cart = [];
        updateCartUI();
        toggleCart();
        
        alert('✅ Buyurtmangiz qabul qilindi! Tez orada ofitsiant keladi.');
    } catch (error) {
        console.error('Checkout error:', error);
        alert('❌ Xatolik yuz berdi. Iltimos ofitsiantni chaqiring.');
    } finally {
        hideLoading();
    }
}

// Helper to darken/lighten color
function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

// ============================================
// Render Update
// ============================================

function renderMenuItem(item) {
    // Handle both old string format and new object format
    const name = typeof item.name === 'object' ? (item.name[currentLang] || item.name['uz']) : item.name;
    const desc = typeof item.description === 'object' ? (item.description[currentLang] || item.description['uz']) : item.description;

    // We need to pass the item object to addToCart. 
    // Since we are in a template string, we can't pass the object directly easily.
    // We'll attach it to the button as data attribute or use a global lookup.
    // Simplest is to look it up by ID in addToCart wrapper, but here we have the item.
    // Let's use a trick: onclick='addToCart(allMenuItems.find(i => i.id === ${item.id}))'
    
    return `
        <div class="menu-item-card fade-in">
            <img src="${item.image}" alt="${escapeHtml(name)}" class="menu-item-image">
            <div class="menu-item-content">
                <span class="menu-item-category">${escapeHtml(item.category)}</span>
                <h4 class="menu-item-name">${escapeHtml(name)}</h4>
                <p class="menu-item-description">${escapeHtml(desc)}</p>
                <div class="menu-item-footer">
                    <div class="menu-item-price">${formatPrice(item.price)} so'm</div>
                    <button class="btn btn-sm btn-primary" onclick='addToCart(allMenuItems.find(i => i.id === ${item.id}))'>
                        🛒 Qo'shish
                    </button>
                </div>
            </div>
        </div>
    `;
}
