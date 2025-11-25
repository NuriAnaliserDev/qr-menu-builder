// ============================================
// QR Menu Builder - Admin Panel JavaScript
// ============================================

// State Management
let menuItems = [];
let settings = {
    restaurantName: 'Mening Restoranim',
    phone: '',
    address: '',
    hours: '09:00 - 23:00'
};

// Initialize App
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

    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const price = document.getElementById('itemPrice').value;
    const description = document.getElementById('itemDescription').value;
    const imageInput = document.getElementById('itemImage');
    
    const reader = new FileReader();
    
    reader.onload = function(event) {
        const menuItem = {
            id: Date.now(),
            name,
            category,
            price: parseInt(price),
            description,
            image: event.target.result || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23334155" width="400" height="300"/%3E%3Ctext fill="%23cbd5e1" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
        };

        menuItems.push(menuItem);
        saveToStorage();
        renderMenuItems();
        
        // Reset form
        e.target.reset();
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('fileLabel').textContent = 'Rasm tanlang';

        // Show success animation
        showNotification('✅ Taom muvaffaqiyatli qo\'shildi!');
    };

    if (imageInput.files && imageInput.files[0]) {
        reader.readAsDataURL(imageInput.files[0]);
    } else {
        reader.onload({ target: { result: null } });
    }
}

function handleImagePreview(e) {
    const file = e.target.files[0];
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

    // Delete the old item
    menuItems = menuItems.filter(i => i.id !== id);
    saveToStorage();
    renderMenuItems();

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    // Clear previous QR code
    qrContainer.innerHTML = '';
    
    // Generate menu URL with data
    const menuData = encodeURIComponent(JSON.stringify({
        restaurant: settings.restaurantName,
        items: menuItems,
        settings: settings
    }));
    
    // For demo purposes, we'll use a local URL. In production, this would be your deployed URL
    const menuURL = `${window.location.origin}${window.location.pathname.replace('index.html', '')}menu.html?data=${menuData}`;
    
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
            ${menuURL.substring(0, 80)}${menuURL.length > 80 ? '...' : ''}
        </a>
    `;
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

// ============================================
// Settings Management
// ============================================

function handleSaveSettings(e) {
    e.preventDefault();
    
    settings.restaurantName = document.getElementById('settingsRestaurantName').value;
    settings.phone = document.getElementById('settingsPhone').value;
    settings.address = document.getElementById('settingsAddress').value;
    settings.hours = document.getElementById('settingsHours').value;
    
    // Update restaurant name in QR tab
    document.getElementById('restaurantName').value = settings.restaurantName;
    
    saveToStorage();
    showNotification('✅ Sozlamalar saqlandi!');
}

function loadSettings() {
    document.getElementById('settingsRestaurantName').value = settings.restaurantName;
    document.getElementById('restaurantName').value = settings.restaurantName;
    document.getElementById('settingsPhone').value = settings.phone;
    document.getElementById('settingsAddress').value = settings.address;
    document.getElementById('settingsHours').value = settings.hours;
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
                hours: '09:00 - 23:00'
            };
            renderMenuItems();
            loadSettings();
            showNotification('🗑️ Barcha ma\'lumotlar o\'chirildi');
        }
    }
}

// ============================================
// Utility Functions
// ============================================

function formatPrice(price) {
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ");
}

function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: var(--gradient-primary);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: var(--shadow-xl);
        z-index: 9999;
        animation: fadeIn 0.3s ease-out;
        font-weight: 600;
    `;
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        from {
            opacity: 1;
            transform: translateY(0);
        }
        to {
            opacity: 0;
            transform: translateY(-20px);
        }
    }
`;
document.head.appendChild(style);
