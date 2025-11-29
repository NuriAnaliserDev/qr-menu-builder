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
    // Auth Check
    auth.onAuthStateChanged((user) => {
        if (user) {
            console.log('User is logged in:', user.email);
            loadFromStorage(); // We will replace this with Firestore later
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

    // Download HTML
    document.getElementById('downloadHtml').addEventListener('click', downloadStandaloneMenu);
    // Category Filtering
    // We use event delegation on the document to handle clicks on category cards
    // even if they are dynamically added or if the DOM structure changes.
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.category-card');
        if (card) {
            const category = card.dataset.category;
            console.log('Category clicked:', category);
            switchTab('manage');
            // Small delay to allow tab switch to complete
            setTimeout(() => {
                renderMenuItems(category);
            }, 50);
        }
    });
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
    
    // Note: We removed the automatic renderMenuItems() call here 
    // to prevent overriding the category filter when switching tabs via category click.
    // If switching manually to 'manage', we might want to clear filter, but for now let's keep it simple.
}

// ============================================
// Menu Item Management
// ============================================

function handleAddMenuItem(e) {
    e.preventDefault();

    const form = e.target;
    const name = document.getElementById('itemName').value;
    const category = document.getElementById('itemCategory').value;
    const price = document.getElementById('itemPrice').value;
    const description = document.getElementById('itemDescription').value;
    const imageInput = document.getElementById('itemImage');
    
    if (imageInput.files && imageInput.files[0]) {
        compressImage(imageInput.files[0])
            .then(compressedImage => {
                const menuItem = {
                    id: Date.now(),
                    name,
                    category,
                    price: parseInt(price),
                    description,
                    image: compressedImage
                };
                saveAndReset(menuItem);
            })
            .catch(err => {
                console.error('Image compression failed:', err);
                showNotification('❌ Rasm yuklashda xatolik!');
            });
    } else {
        const menuItem = {
            id: Date.now(),
            name,
            category,
            price: parseInt(price),
            description,
            image: 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300"%3E%3Crect fill="%23334155" width="400" height="300"/%3E%3Ctext fill="%23cbd5e1" font-family="Arial" font-size="24" x="50%25" y="50%25" text-anchor="middle" dominant-baseline="middle"%3ENo Image%3C/text%3E%3C/svg%3E'
        };
        saveAndReset(menuItem);
    }

    function saveAndReset(menuItem) {
        menuItems.push(menuItem);
        saveToStorage();
        renderMenuItems();
        
        // Reset form
        form.reset();
        document.getElementById('imagePreview').style.display = 'none';
        document.getElementById('fileLabel').textContent = 'Rasm tanlang';

        showNotification('✅ Taom muvaffaqiyatli qo\'shildi!');
    }
}

function handleImagePreview(e) {
    const file = e.target.files[0];
    if (file) {
        compressImage(file)
            .then(compressedImage => {
                document.getElementById('previewImg').src = compressedImage;
                document.getElementById('imagePreview').style.display = 'block';
                document.getElementById('fileLabel').textContent = file.name;
            })
            .catch(err => {
                console.error('Preview failed:', err);
            });
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

function renderMenuItems(filterCategory = null) {
    const container = document.getElementById('menuItemsList');
    
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

    container.innerHTML = filterHtml + itemsToRender.map(item => `
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
