// ============================================
// QR Menu Builder - Admin Panel JavaScript
// ============================================

// State Management
let menuItems = [];
let settings = {
    restaurantName: 'Mening Restoranim',
    phone: '',
    address: '',
    hours: '09:00 - 23:00',
    promoText: '',
    themeColor: '#6366f1',
    language: localStorage.getItem('nurify_lang') || 'uz'
};

// ============================================
// Utility Functions (Defined First!)
// ============================================

function changeLanguage(lang) {
    settings.language = lang;
    localStorage.setItem('nurify_lang', lang);
    updateTranslations();
    
    // Update active button state
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.lang === lang);
    });
}

function updateTranslations() {
    const lang = settings.language;
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
    
    // Update category names in cards if they exist
    document.querySelectorAll('.category-card').forEach(card => {
        const catKey = 'cat_' + card.dataset.category.toLowerCase().replace(' ', '');
        // Mapping for specific categories if needed, or rely on data-i18n inside card
    });
}

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function showNotification(message, type = 'success') {
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

function showLoading(message = 'Yuklanmoqda...') {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
        <div class="spinner"></div>
        <h3>${message}</h3>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.style.opacity = '0';
        setTimeout(() => overlay.remove(), 300);
    }
}

function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

function compressImage(file, maxWidth = 300, quality = 0.7) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(event) {
            const img = new Image();
            img.src = event.target.result;
            img.onload = function() {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.onerror = function(error) {
                reject(error);
            };
        };
        reader.onerror = function(error) {
            reject(error);
        };
    });
}

// ============================================
// Initialize App
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Trial Check
    const trialStart = localStorage.getItem('trialStartDate');
    if (!trialStart) {
        localStorage.setItem('trialStartDate', Date.now());
    } else {
        const daysUsed = (Date.now() - parseInt(trialStart)) / (1000 * 60 * 60 * 24);
        if (daysUsed > 14) {
            document.body.innerHTML = `
                <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;background:#050505;color:white;text-align:center;">
                    <h1>⏳ Sinov Davri Tugadi</h1>
                    <p>14 kunlik bepul foydalanish muddati tugadi.</p>
                    <p>Davom ettirish uchun to'lov qiling.</p>
                    <a href="landing.html" style="color:#6366f1;margin-top:1rem;">Bosh sahifaga qaytish</a>
                </div>
            `;
            return;
        }
    }

    // Auth Check
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User is logged in:', user.email);
            loadFromStorage();
            initEventListeners();
            updateTranslations(); // Apply language settings
            renderMenuItems();
            generateQRCode();
        } else {
            console.log('User is not logged in');
            window.location.href = 'login.html';
        }
    });
});

function logout() {
    auth.signOut().then(() => {
        window.location.href = 'login.html';
    }).catch((error) => {
        console.error('Logout error:', error);
    });
}

// ============================================
// Event Listeners
// ============================================

function initEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabBtn = e.target.closest('.nav-link');
            if (tabBtn) {
                const tabName = tabBtn.dataset.tab;
                switchTab(tabName);
            }
        });
    });

    // Category Card Navigation
    document.querySelectorAll('.category-card').forEach(card => {
        card.addEventListener('click', () => {
            const category = card.dataset.category;
            switchTab('manage');
            setTimeout(() => {
                renderMenuItems(category);
            }, 50);
        });
    });

    // Add Menu Item Form
    const menuForm = document.getElementById('menuItemForm');
    if (menuForm) {
        menuForm.addEventListener('submit', handleAddMenuItem);
    }

    // Settings Form
    const settingsForm = document.getElementById('settingsForm');
    if (settingsForm) {
        settingsForm.addEventListener('submit', handleSaveSettings);
    }

    // Clear Data
    const clearBtn = document.getElementById('clearAllData');
    if (clearBtn) {
        clearBtn.addEventListener('click', clearAllData);
    }

    // QR Actions
    document.getElementById('generateQR')?.addEventListener('click', generateQRCode);
    document.getElementById('downloadQR')?.addEventListener('click', downloadQRCode);
    document.getElementById('printQR')?.addEventListener('click', handlePrintQR);
    document.getElementById('downloadHtml')?.addEventListener('click', downloadStandaloneMenu);
}

// ============================================
// Tab Management
// ============================================

function switchTab(tabName) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    const activeLink = document.querySelector(`[data-tab="${tabName}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(`${tabName}-tab`).style.display = 'block';

    // Regenerate QR if switching to QR tab
    if (tabName === 'qr') {
        setTimeout(() => generateQRCode(), 100);
    }
    
    // Load Analytics if switching to analytics tab
    if (tabName === 'analytics') {
        loadAnalytics();
    }

    // Load Orders if switching to orders tab
    if (tabName === 'orders') {
        listenForOrders();
    }
}

// ============================================
// Analytics
// ============================================

let analyticsChart = null;
let categoryChart = null;

async function loadAnalytics() {
    const user = auth.currentUser;
    if (!user) return;

    showLoading('Statistika yuklanmoqda...');

    try {
        // Get last 7 days
        const dates = [];
        const views = [];
        const categories = {};
        let totalViews = 0;

        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dates.push(dateStr);
            
            const docId = `${user.uid}_${dateStr}`;
            const doc = await db.collection('analytics').doc(docId).get();
            
            if (doc.exists) {
                const data = doc.data();
                const dayViews = data.events?.page_view || 0;
                views.push(dayViews);
                totalViews += dayViews;

                // Aggregate categories
                if (data.categories) {
                    Object.entries(data.categories).forEach(([cat, count]) => {
                        categories[cat] = (categories[cat] || 0) + count;
                    });
                }
            } else {
                views.push(0);
            }
        }

        // Update Total Views
        document.getElementById('totalViews').textContent = totalViews;

        // Render Main Chart
        const ctx = document.getElementById('analyticsChart').getContext('2d');
        
        if (analyticsChart) analyticsChart.destroy();

        analyticsChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: dates.map(d => d.slice(5)), // MM-DD
                datasets: [{
                    label: 'Sahifa Ko\'rishlari',
                    data: views,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        labels: { color: '#9ca3af' }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        ticks: { color: '#9ca3af' }
                    },
                    x: {
                        grid: { display: false },
                        ticks: { color: '#9ca3af' }
                    }
                }
            }
        });

        // Render Category Chart
        const catCtx = document.getElementById('categoryChart').getContext('2d');
        
        if (categoryChart) categoryChart.destroy();

        categoryChart = new Chart(catCtx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        '#6366f1', '#ec4899', '#10b981', '#f59e0b', '#8b5cf6'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: { color: '#9ca3af' }
                    }
                }
            }
        });

    } catch (error) {
        console.error('Error loading analytics:', error);
        showNotification('❌ Statistika yuklashda xatolik');
    } finally {
        hideLoading();
    }
}

// ============================================
// Menu Item Management
// ============================================

// ============================================
// Multi-language Input Helper
// ============================================

function setInputLang(lang) {
    // Update buttons
    document.querySelectorAll('.lang-input-tabs button').forEach(btn => {
        btn.classList.toggle('active', btn.id === `btn-lang-${lang}`);
        btn.classList.toggle('btn-primary', btn.id === `btn-lang-${lang}`);
        btn.classList.toggle('btn-secondary', btn.id !== `btn-lang-${lang}`);
    });

    // Show/Hide fields
    document.querySelectorAll('.lang-field').forEach(field => {
        if (field.dataset.lang === lang) {
            field.style.display = 'block';
        } else {
            field.style.display = 'none';
        }
    });
}

// Make it global
window.setInputLang = setInputLang;

// ============================================
// Menu Item Management
// ============================================

function handleAddMenuItem(e) {
    e.preventDefault();

    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalBtnText = submitBtn.innerHTML;
    
    // Disable button and show loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '⏳ Yuklanmoqda...';

    // Collect Multi-language Data
    const name = {
        uz: document.getElementById('itemName_uz').value,
        ru: document.getElementById('itemName_ru').value || document.getElementById('itemName_uz').value,
        en: document.getElementById('itemName_en').value || document.getElementById('itemName_uz').value
    };

    const description = {
        uz: document.getElementById('itemDescription_uz').value,
        ru: document.getElementById('itemDescription_ru').value || document.getElementById('itemDescription_uz').value,
        en: document.getElementById('itemDescription_en').value || document.getElementById('itemDescription_uz').value
    };

    const category = document.getElementById('itemCategory').value;
    const price = document.getElementById('itemPrice').value;
    const imageInput = document.getElementById('itemImage');
    
    const user = auth.currentUser;
    if (!user) {
        showNotification('❌ Tizimga kiring!');
        resetBtn();
        return;
    }

    async function processItem() {
        try {
            let imageUrl = 'https://placehold.co/400x300?text=No+Image'; // Default

            if (imageInput.files && imageInput.files[0]) {
                const file = imageInput.files[0];
                const compressedDataUrl = await compressImage(file);
                const blob = dataURLtoBlob(compressedDataUrl);
                imageUrl = await uploadImageToStorage(blob, user.uid);
            }

            const menuItem = {
                id: Date.now(),
                name, // Object {uz, ru, en}
                category,
                price: parseInt(price),
                description, // Object {uz, ru, en}
                image: imageUrl
            };

            menuItems.push(menuItem);
            saveToStorage();
            renderMenuItems();
            
            // Reset form
            form.reset();
            document.getElementById('imagePreview').style.display = 'none';
            document.getElementById('fileLabel').textContent = 'Rasm tanlang';
            
            // Reset to UZ tab
            setInputLang('uz');

            showNotification('✅ Taom muvaffaqiyatli qo\'shildi!');
        } catch (error) {
            console.error('Error adding item:', error);
            showNotification('❌ Xatolik yuz berdi: ' + error.message);
        } finally {
            resetBtn();
        }
    }

    processItem();

    function resetBtn() {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalBtnText;
    }
}

// ... (uploadImageToStorage and dataURLtoBlob helpers remain same) ...

function deleteMenuItem(id) {
    if (confirm('Ushbu taomni o\'chirmoqchimisiz?')) {
        menuItems = menuItems.filter(item => item.id !== id);
        saveToStorage();
        renderMenuItems();
        showNotification('🗑️ Taom o\'chirildi');
    }
}

function editMenuItem(id) {
    const item = menuItems.find(item => item.id === id);
    if (!item) return;

    // Populate form (Handle both old string format and new object format)
    const name = typeof item.name === 'object' ? item.name : { uz: item.name, ru: item.name, en: item.name };
    const desc = typeof item.description === 'object' ? item.description : { uz: item.description, ru: item.description, en: item.description };

    document.getElementById('itemName_uz').value = name.uz || '';
    document.getElementById('itemName_ru').value = name.ru || '';
    document.getElementById('itemName_en').value = name.en || '';

    document.getElementById('itemDescription_uz').value = desc.uz || '';
    document.getElementById('itemDescription_ru').value = desc.ru || '';
    document.getElementById('itemDescription_en').value = desc.en || '';

    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemPrice').value = item.price;
    
    if (item.image) {
        document.getElementById('previewImg').src = item.image;
        document.getElementById('imagePreview').style.display = 'block';
    }

    // Remove item (so it can be re-added)
    menuItems = menuItems.filter(i => i.id !== id);
    saveToStorage();
    renderMenuItems();
    
    // Switch to manage tab
    switchTab('manage');
}

function renderMenuItems(filterCategory = null) {
    const container = document.getElementById('menuItemsList');
    const currentLang = settings.language || 'uz';
    
    let itemsToRender = menuItems;
    let filterHtml = '';

    if (filterCategory) {
        itemsToRender = menuItems.filter(item => item.category === filterCategory);
        filterHtml = `
            <div style="grid-column: 1/-1; margin-bottom: 1rem; display: flex; align-items: center; justify-content: space-between; background: var(--dark-soft); padding: 1rem; border-radius: 0.5rem;">
                <span>🔍 Kategoriya: <strong>${filterCategory}</strong> (${itemsToRender.length} ta)</span>
                <button class="btn btn-sm btn-secondary" onclick="renderMenuItems()">❌ Filterni tozalash</button>
            </div>
        `;
    }

    if (itemsToRender.length === 0) {
        container.innerHTML = filterHtml + `
            <div class="text-center" style="grid-column: 1/-1; padding: 3rem; color: var(--gray);">
                <p style="font-size: 3rem; margin-bottom: 1rem;">🍽️</p>
                <p>${filterCategory ? 'Bu kategoriyada taomlar yo\'q.' : 'Hozircha menyu bo\'sh. Yuqorida yangi taom qo\'shing!'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = filterHtml + itemsToRender.map(item => {
        // Handle both old string format and new object format
        const name = typeof item.name === 'object' ? (item.name[currentLang] || item.name['uz']) : item.name;
        const desc = typeof item.description === 'object' ? (item.description[currentLang] || item.description['uz']) : item.description;

        return `
        <div class="menu-item-card fade-in">
            <img src="${item.image}" alt="${name}" class="menu-item-image">
            <div class="menu-item-content">
                <span class="menu-item-category">${item.category}</span>
                <h4 class="menu-item-name">${name}</h4>
                <p class="menu-item-description">${desc}</p>
                <div class="menu-item-price">${formatPrice(item.price)} so'm</div>
                <div class="menu-item-actions">
                    <button class="btn btn-secondary btn-sm" onclick="editMenuItem(${item.id})">
                        ✏️ Tahrirlash
                    </button>
                    <button class="btn btn-danger btn-sm" onclick="deleteMenuItem(${item.id})">
                        🗑️ O'chirish
                    </button>
                </div>
            </div>
        </div>
    `}).join('');
}

// ============================================
// QR Code Generation
// ============================================

function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
    const urlContainer = document.getElementById('menuUrl');
    const user = auth.currentUser;
    
    if (!user) return;

    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
        showNotification('⚠️ QR kod kutubxonasi yuklanmadi. Sahifani yangilang!');
        console.error('QRCode library not loaded!');
        return;
    }
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    try {
        // Generate menu URL with ID
        // In production, this would be your deployed URL
        const menuURL = `${window.location.origin}${window.location.pathname.replace('admin.html', '')}menu.html?id=${user.uid}`;
        
        // Generate QR Code
        new QRCode(qrContainer, {
            text: menuURL,
            width: 256,
            height: 256,
            colorDark: "#000000",
            colorLight: "#ffffff",
            correctLevel: QRCode.CorrectLevel.H
        });

        // Display URL
        urlContainer.innerHTML = `
            <strong>Menyu URL:</strong><br>
           <a href="${menuURL}" target="_blank" style="color: var(--primary-light); text-decoration: none;">
                ${menuURL}
            </a>
        `;
        
        showNotification('✅ QR kod yaratildi!');
    } catch (error) {
        console.error('QR kod yaratishda xatolik:', error);
        showNotification('❌ QR kod yaratishda xatolik yuz berdi!');
    }
}

function downloadQRCode() {
    const canvas = document.querySelector('#qrcode canvas');
    if (!canvas) {
        showNotification('⚠️ Avval QR kod yarating!');
        return;
    }

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `${settings.restaurantName.replace(/\s+/g, '_')}_QR_Menu.png`;
    link.href = url;
    link.click();
    
    showNotification('✅ QR kod yuklab olindi!');
}

function handlePrintQR() {
    const restaurantName = document.getElementById('restaurantName').value || 'Mening Restoranim';
    const qrCodeImg = document.querySelector('#qrcode img');
    
    if (!qrCodeImg) {
        showNotification("⚠️ Avval QR kod yarating!");
        return;
    }

    // Update print area
    document.getElementById('printRestaurantName').textContent = restaurantName;
    const printQrContainer = document.getElementById('printQrCode');
    printQrContainer.innerHTML = '';
    printQrContainer.appendChild(qrCodeImg.cloneNode(true));

    // Print
    window.print();
}

function downloadStandaloneMenu() {
    // 1. Get current menu data
    const menuData = {
        items: menuItems,
        settings: settings
    };

    // 2. Fetch menu.html content
    fetch('menu.html')
        .then(response => response.text())
        .then(htmlContent => {
            // 3. Inject data into HTML
            // We look for the script tag where we can inject data
            // Or simply append a script tag at the beginning of head or body
            
            const scriptToInject = `
    <script>
        window.MENU_DATA = ${JSON.stringify(menuData)};
    </script>
            `;
            
            // Inject before the first script tag or in head
            const modifiedHtml = htmlContent.replace('</head>', `${scriptToInject}</head>`);
            
            // 4. Create blob and download
            const blob = new Blob([modifiedHtml], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = `${settings.restaurantName.replace(/\s+/g, '_')}_menu.html`;
            link.href = url;
            link.click();
            
            showNotification('✅ HTML menyu yuklab olindi!');
            
            // 5. Show advice
            setTimeout(() => {
                alert('Fayl yuklab olindi!\n\nEndi bu faylni istalgan hostingga (Netlify, Vercel) yuklashingiz yoki shunchaki mijozlarga yuborishingiz mumkin.');
            }, 1000);
        })
        .catch(err => {
            console.error('Error fetching menu.html:', err);
            showNotification('❌ Fayl yaratishda xatolik!');
        });
}

// ============================================
// Order Management
// ============================================

let ordersUnsubscribe = null;
let audioContext = null;

function listenForOrders() {
    const user = auth.currentUser;
    if (!user) return;

    // Unsubscribe previous listener if exists
    if (ordersUnsubscribe) ordersUnsubscribe();

    // Listen for orders
    ordersUnsubscribe = db.collection('orders')
        .where('restaurantId', '==', user.uid)
        .orderBy('createdAt', 'desc')
        .limit(50)
        .onSnapshot((snapshot) => {
            const orders = [];
            let newOrdersCount = 0;

            snapshot.forEach((doc) => {
                const order = { id: doc.id, ...doc.data() };
                orders.push(order);
                if (order.status === 'new') newOrdersCount++;
            });

            renderOrders(orders);
            updateOrdersBadge(newOrdersCount);

            // Play sound if new order added (check if it's a real new addition, not initial load)
            snapshot.docChanges().forEach((change) => {
                if (change.type === "added" && change.doc.data().status === 'new') {
                    // Only play if timestamp is very recent (to avoid playing on page load)
                    const createdAt = change.doc.data().createdAt;
                    if (createdAt && (Date.now() - createdAt.toMillis()) < 10000) {
                        playNotificationSound();
                        showNotification('🔔 Yangi buyurtma!', 'success');
                    }
                }
            });
        }, (error) => {
            console.error("Error listening for orders:", error);
        });
}

function renderOrders(orders) {
    const container = document.getElementById('ordersList');
    
    if (orders.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📭</div>
                <h3>Buyurtmalar yo'q</h3>
                <p>Yangi buyurtmalar shu yerda paydo bo'ladi</p>
            </div>
        `;
        return;
    }

    container.innerHTML = orders.map(order => renderOrderCard(order)).join('');
}

function renderOrderCard(order) {
    const statusColors = {
        'new': 'border-left: 4px solid #ef4444;',
        'cooking': 'border-left: 4px solid #f59e0b;',
        'ready': 'border-left: 4px solid #10b981;',
        'delivered': 'border-left: 4px solid #6366f1;',
        'cancelled': 'border-left: 4px solid #9ca3af;'
    };

    const statusLabels = {
        'new': '🆕 Yangi',
        'cooking': '🍳 Tayyorlanmoqda',
        'ready': '✅ Tayyor',
        'delivered': '🚀 Yetkazildi',
        'cancelled': '❌ Bekor qilindi'
    };

    const date = order.createdAt ? new Date(order.createdAt.toMillis()).toLocaleTimeString() : '';

    return `
        <div class="order-card fade-in" style="background: var(--bg-card); padding: 1rem; margin-bottom: 1rem; border-radius: 0.5rem; ${statusColors[order.status] || ''}">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <h4 style="font-size: 1.1rem;">Stol: ${order.table}</h4>
                <span style="color: var(--gray); font-size: 0.9rem;">${date}</span>
            </div>
            
            <div style="margin-bottom: 1rem; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); padding: 0.5rem 0;">
                ${order.items.map(item => {
                    const name = typeof item.name === 'object' ? (item.name['uz'] || item.name) : item.name;
                    return `
                    <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
                        <span>${item.quantity}x ${name}</span>
                        <span>${formatPrice(item.price * item.quantity)}</span>
                    </div>
                `}).join('')}
            </div>

            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
                <span style="font-weight: bold; font-size: 1.1rem;">Jami: ${formatPrice(order.total)} so'm</span>
                <span class="badge status-${order.status}" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; background: var(--dark-soft);">${statusLabels[order.status]}</span>
            </div>

            <div class="order-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                ${order.status === 'new' ? `
                    <button class="btn btn-sm btn-primary" onclick="updateOrderStatus('${order.id}', 'cooking')">🍳 Pishirish</button>
                    <button class="btn btn-sm btn-danger" onclick="updateOrderStatus('${order.id}', 'cancelled')">❌ Bekor qilish</button>
                ` : ''}
                
                ${order.status === 'cooking' ? `
                    <button class="btn btn-sm btn-success" onclick="updateOrderStatus('${order.id}', 'ready')" style="background: #10b981;">✅ Tayyor</button>
                ` : ''}

                ${order.status === 'ready' ? `
                    <button class="btn btn-sm btn-primary" onclick="updateOrderStatus('${order.id}', 'delivered')">🚀 Yetkazish</button>
                ` : ''}
            </div>
        </div>
    `;
}

function updateOrderStatus(orderId, status) {
    db.collection('orders').doc(orderId).update({
        status: status
    }).then(() => {
        showNotification('Status yangilandi');
    }).catch(err => {
        console.error("Error updating status:", err);
        showNotification('❌ Xatolik', 'error');
    });
}

function updateOrdersBadge(count) {
    const badge = document.getElementById('ordersBadge');
    if (count > 0) {
        badge.textContent = count;
        badge.style.display = 'inline-flex';
        badge.style.background = '#ef4444';
        badge.style.color = 'white';
        badge.style.padding = '0.1rem 0.4rem';
        badge.style.borderRadius = '1rem';
        badge.style.fontSize = '0.7rem';
        badge.style.marginLeft = '0.5rem';
    } else {
        badge.style.display = 'none';
    }
}

function playNotificationSound() {
    const soundToggle = document.getElementById('soundToggle');
    if (soundToggle && !soundToggle.checked) return;

    // Simple beep using AudioContext
    if (!audioContext) audioContext = new (window.AudioContext || window.webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(500, audioContext.currentTime);
    oscillator.frequency.exponentialRampToValueAtTime(1000, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.5);
}

// ============================================
// Settings Management
// ============================================

function handleSaveSettings(e) {
    e.preventDefault();
    
    settings.restaurantName = document.getElementById('settingsRestaurantName').value;
    settings.phone = document.getElementById('settingsPhone').value;
    settings.address = document.getElementById('settingsAddress').value;
    settings.hours = document.getElementById('settingsHours').value;
    settings.promoText = document.getElementById('settingsPromoText').value;
    settings.themeColor = document.getElementById('settingsThemeColor').value;
    
    // Socials
    settings.whatsapp = document.getElementById('settingsWhatsapp').value;
    settings.instagram = document.getElementById('settingsInstagram').value;
    settings.telegram = document.getElementById('settingsTelegram').value;
    
    // Update restaurant name in QR tab
    document.getElementById('restaurantName').value = settings.restaurantName;
    
    // Apply theme color immediately
    document.documentElement.style.setProperty('--primary', settings.themeColor);
    document.documentElement.style.setProperty('--primary-dark', adjustColor(settings.themeColor, -20));
    document.documentElement.style.setProperty('--primary-light', adjustColor(settings.themeColor, 20));

    saveToStorage();
    showNotification('✅ Sozlamalar saqlandi!');
}

function loadSettings() {
    document.getElementById('settingsRestaurantName').value = settings.restaurantName || '';
    document.getElementById('restaurantName').value = settings.restaurantName || '';
    document.getElementById('settingsPhone').value = settings.phone || '';
    document.getElementById('settingsAddress').value = settings.address || '';
    document.getElementById('settingsHours').value = settings.hours || '';
    document.getElementById('settingsPromoText').value = settings.promoText || '';
    document.getElementById('settingsThemeColor').value = settings.themeColor || '#6366f1';
    
    // Socials
    document.getElementById('settingsWhatsapp').value = settings.whatsapp || '';
    document.getElementById('settingsInstagram').value = settings.instagram || '';
    document.getElementById('settingsTelegram').value = settings.telegram || '';

    // Apply theme color
    if (settings.themeColor) {
        document.documentElement.style.setProperty('--primary', settings.themeColor);
        document.documentElement.style.setProperty('--primary-dark', adjustColor(settings.themeColor, -20));
        document.documentElement.style.setProperty('--primary-light', adjustColor(settings.themeColor, 20));
    }
}

// ============================================
// Data Management (LocalStorage)
// ============================================

// ============================================
// Data Management (Firestore)
// ============================================

function saveToStorage() {
    const user = auth.currentUser;
    if (!user) return;

    db.collection('restaurants').doc(user.uid).set({
        menuItems: menuItems,
        settings: settings,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
        console.log("Document successfully written!");
    })
    .catch((error) => {
        console.error("Error writing document: ", error);
        showNotification('❌ Saqlashda xatolik!');
    });
}

function loadFromStorage() {
    const user = auth.currentUser;
    if (!user) return;

    db.collection('restaurants').doc(user.uid).get().then((doc) => {
        if (doc.exists) {
            const data = doc.data();
            menuItems = data.menuItems || [];
            settings = data.settings || settings;
            
            renderMenuItems();
            loadSettings();
            generateQRCode(); // Regenerate QR with new ID
        } else {
            console.log("No such document!");
            // Initialize with default data
            saveToStorage();
            renderMenuItems();
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
        showNotification('❌ Ma\'lumotlarni yuklashda xatolik!');
    });
}

function exportData() {
    // Deprecated or can be kept as backup
    const data = {
        menuItems,
        settings,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `${settings.restaurantName.replace(/\s+/g, '_')}_menu_backup.json`;
    link.href = url;
    link.click();
    
    showNotification('✅ Ma\'lumotlar eksport qilindi!');
}

function triggerImport() {
    document.getElementById('importFile').click();
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const data = JSON.parse(event.target.result);
            
            if (confirm('Mavjud ma\'lumotlar almashtiriladi. Davom etasizmi?')) {
                menuItems = data.menuItems || [];
                settings = data.settings || settings;
                
                saveToStorage();
                renderMenuItems();
                loadSettings();
                
                showNotification('✅ Ma\'lumotlar import qilindi!');
            }
        } catch (error) {
            showNotification('❌ Noto\'g\'ri fayl formati!');
        }
    };
    reader.readAsText(file);
}

function clearAllData() {
    if (confirm('DIQQAT! Barcha ma\'lumotlar o\'chiriladi va qaytarib bo\'lmaydi. Davom etasizmi?')) {
        if (confirm('Ishonchingiz komilmi? Bu amal qaytarib bo\'lmaydi!')) {
            localStorage.clear();
            menuItems = [];
            settings = {
                restaurantName: 'Mening Restoranim',
                phone: '',
                address: '',
                hours: '09:00 - 23:00',
                promoText: '',
                themeColor: '#6366f1'
            };
            renderMenuItems();
            loadSettings();
            saveToStorage(); // Save empty state to Firestore
            showNotification('🗑️ Barcha ma\'lumotlar o\'chirildi');
        }
    }
}
