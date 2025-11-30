import { auth } from './modules/auth.js';
import { db } from './modules/db.js';
import { showNotification, showLoading, hideLoading, updateTranslations } from './modules/ui.js';
import { generateId } from './modules/utils.js';

// State
let currentUser = null;
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

// DOM Elements
const loginSection = document.getElementById('loginSection');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const navItems = document.querySelectorAll('.nav-item');
const tabContents = document.querySelectorAll('.tab-content');

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    auth.init(handleLogin, handleLogout);
    setupEventListeners();
});

function handleLogin(user) {
    currentUser = user;
    loginSection.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    loadData();
}

function handleLogout() {
    currentUser = null;
    loginSection.classList.remove('hidden');
    adminPanel.classList.add('hidden');
    menuItems = [];
}

async function loadData() {
    if (!currentUser) return;
    showLoading();
    try {
        const data = await db.getRestaurant(currentUser.uid);
        if (data) {
            menuItems = data.menuItems || [];
            settings = { ...settings, ...data.settings };
        }
        renderMenuItems();
        loadSettings();
        generateQRCode();
    } catch (error) {
        console.error(error);
    } finally {
        hideLoading();
    }
}

function setupEventListeners() {
    // Login
    loginBtn?.addEventListener('click', () => auth.loginWithGoogle());
    logoutBtn?.addEventListener('click', () => auth.logout());

    // Tabs
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            tabContents.forEach(tab => tab.classList.remove('active'));
            item.classList.add('active');
            document.getElementById(item.dataset.tab).classList.add('active');
        });
    });

    // Add Menu Item
    document.getElementById('addItemBtn')?.addEventListener('click', () => {
        // Simple prompt for now, can be improved to a modal later
        const name = prompt('Taom nomi:');
        if (name) {
            const price = prompt('Narxi:');
            if (price) {
                addItem(name, price);
            }
        }
    });

    // Save Settings
    document.getElementById('saveSettingsBtn')?.addEventListener('click', saveSettings);
}

function addItem(name, price) {
    const newItem = {
        id: generateId(),
        name,
        price,
        category: 'Boshqa',
        image: 'https://via.placeholder.com/150'
    };
    menuItems.push(newItem);
    renderMenuItems();
    saveData();
}

function renderMenuItems() {
    const grid = document.getElementById('menuGrid');
    if (!grid) return;
    
    grid.innerHTML = menuItems.map(item => `
        <div class="menu-item-card">
            <img src="${item.image}" alt="${item.name}">
            <div class="menu-item-info">
                <h4>${item.name}</h4>
                <p>${item.price} so'm</p>
            </div>
            <button onclick="window.deleteItem('${item.id}')" class="btn-delete">🗑️</button>
        </div>
    `).join('');
}

// Expose delete function to window for inline onclick
window.deleteItem = function(id) {
    if (confirm('O\'chirilsinmi?')) {
        menuItems = menuItems.filter(i => i.id !== id);
        renderMenuItems();
        saveData();
    }
};

function loadSettings() {
    document.getElementById('restaurantName').value = settings.restaurantName;
    // Load other settings...
}

function saveSettings() {
    settings.restaurantName = document.getElementById('restaurantName').value;
    // Save other settings...
    saveData();
}

async function saveData() {
    if (!currentUser) return;
    await db.saveRestaurant(currentUser.uid, {
        menuItems,
        settings
    });
}

function generateQRCode() {
    const qrContainer = document.getElementById('qrcode');
    if (qrContainer && currentUser) {
        qrContainer.innerHTML = '';
        new QRCode(qrContainer, {
            text: `https://qr-menu-builder-one.vercel.app/menu.html?id=${currentUser.uid}`,
            width: 200,
            height: 200
        });
    }
}
