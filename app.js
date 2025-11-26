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
    themeColor: '#6366f1'
};

// ============================================
// Utility Functions (Defined First!)
// ============================================

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification fade-in';
    notification.textContent = message;
    
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

function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).substr(-2));
}

// ============================================
// Initialize App
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    loadFromStorage();
    initEventListeners();
    renderMenuItems();
    generateQRCode();
});

// ============================================
// Event Listeners
// ============================================

function initEventListeners() {
    // Tab Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabName = link.dataset.tab;
            switchTab(tabName);
        });
    });

    // Menu Item Form
    document.getElementById('menuItemForm').addEventListener('submit', handleAddMenuItem);

    // Image Upload Preview
    document.getElementById('itemImage').addEventListener('change', handleImagePreview);

    // QR Code Generation
    document.getElementById('generateQR').addEventListener('click', generateQRCode);
    document.getElementById('downloadQR').addEventListener('click', downloadQRCode);
    document.getElementById('restaurantName').addEventListener('input', (e) => {
        settings.restaurantName = e.target.value;
        saveToStorage();
    });

    // Settings Form
    document.getElementById('settingsForm').addEventListener('submit', handleSaveSettings);

    // Export/Import
    document.getElementById('exportBtn').addEventListener('click', exportData);
    document.getElementById('importBtn').addEventListener('click', () => {
        document.getElementById('importFile').click();
    });
    document.getElementById('importFile').addEventListener('change', importData);

    // Clear All Data
    document.getElementById('clearAllData').addEventListener('click', clearAllData);
    
    // Print QR
    document.getElementById('printQR').addEventListener('click', handlePrintQR);
}

// ============================================
// Tab Management
// ============================================

function switchTab(tabName) {
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    document.getElementById(`${tabName}-tab`).style.display = 'block';

    // Regenerate QR if switching to QR tab
    if (tabName === 'qr') {
        setTimeout(() => generateQRCode(), 100);
    }
}

// ============================================
// Menu Item Management
// ============================================

function handleAddMenuItem(e) {
    e.preventDefault();

    const form = e.target; // Store form reference
    if (file) {
        const reader = new FileReader();
        reader.onload = function(event) {
            document.getElementById('previewImg').src = event.target.result;
            document.getElementById('imagePreview').style.display = 'block';
            document.getElementById('fileLabel').textContent = file.name;
        };
        reader.readAsDataURL(file);
    }
}

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

    // Populate form
    document.getElementById('itemName').value = item.name;
    document.getElementById('itemCategory').value = item.category;
    document.getElementById('itemPrice').value = item.price;
    document.getElementById('itemDescription').value = item.description;
    
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

function renderMenuItems() {
    const container = document.getElementById('menuItemsList');
    
    if (menuItems.length === 0) {
        container.innerHTML = `
            <div class="text-center" style="grid-column: 1/-1; padding: 3rem; color: var(--gray);">
                <p style="font-size: 3rem; margin-bottom: 1rem;">🍽️</p>
                <p>Hozircha menyu bo'sh. Yuqorida yangi taom qo'shing!</p>
            </div>
        `;
        return;
    }

    container.innerHTML = menuItems.map(item => `
        <div class="menu-item-card fade-in">
            <img src="${item.image}" alt="${item.name}" class="menu-item-image">
            <div class="menu-item-content">
                <span class="menu-item-category">${item.category}</span>
                <h4 class="menu-item-name">${item.name}</h4>
                <p class="menu-item-description">${item.description}</p>
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
    `).join('');
}

// ============================================
// QR Code Generation
// ============================================

function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
    const urlContainer = document.getElementById('menuUrl');
    
    // Check if QRCode library is loaded
    if (typeof QRCode === 'undefined') {
        showNotification('⚠️ QR kod kutubxonasi yuklanmadi. Sahifani yangilang!');
        console.error('QRCode library not loaded!');
        return;
    }
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    try {
        // Save data to localStorage so menu.html can access it
        saveToStorage();
        
        // Use simple URL - menu.html will load data from localStorage
        const baseURL = window.location.href.replace('index.html', '');
        const menuURL = `${baseURL}menu.html`;
        
        // Generate QR Code with simple URL
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
            <p style="margin-top: 1rem; font-size: 0.875rem; color: var(--gray);">
                💡 QR kod skan qilinganda, menyu ma'lumotlari avtomatik yuklanadi.
            </p>
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
    document.getElementById('settingsRestaurantName').value = settings.restaurantName;
    document.getElementById('restaurantName').value = settings.restaurantName;
    document.getElementById('settingsPhone').value = settings.phone;
    document.getElementById('settingsAddress').value = settings.address;
    document.getElementById('settingsHours').value = settings.hours;
    document.getElementById('settingsPromoText').value = settings.promoText || '';
    document.getElementById('settingsThemeColor').value = settings.themeColor || '#6366f1';

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

function saveToStorage() {
    localStorage.setItem('qr_menu_items', JSON.stringify(menuItems));
    localStorage.setItem('qr_menu_settings', JSON.stringify(settings));
}

function loadFromStorage() {
    const savedItems = localStorage.getItem('qr_menu_items');
    const savedSettings = localStorage.getItem('qr_menu_settings');
    
    if (savedItems) {
        menuItems = JSON.parse(savedItems);
    }
    
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        loadSettings();
    }
}

function exportData() {
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
            showNotification('🗑️ Barcha ma\'lumotlar o\'chirildi');
        }
    }
}
