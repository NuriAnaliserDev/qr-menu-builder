# QR Menu Builder - Nurify

Restoran va kafelar uchun zamonaviy QR menyu yaratish platformasi.

## 🚀 Xususiyatlari

- **Tezkor O'rnatish**: 5 daqiqada menyu yarating
- **QR Kod Generator**: Avtomatik QR kod yaratish va chop etish
- **Mobil Moslashuv**: Barcha qurilmalarda ishlaydi
- **Ko'p Tillilik**: UZ, RU, EN tillarini qo'llab-quvvatlaydi
- **Firebase Integratsiyasi**: Real-time ma'lumotlar va rasmlar
- **PWA**: Ilova kabi o'rnatish imkoniyati

## 🛠️ O'rnatish

1. **Repozitoriyni klonlash:**

   ```bash
   git clone https://github.com/username/qr-menu-builder.git
   cd qr-menu-builder
   ```

2. **Firebase Sozlash:**

   - `firebase-config.example.js` faylini nusxalang va `firebase-config.js` deb nomlang.
   - [Firebase Console](https://console.firebase.google.com/) da yangi loyiha yarating.
   - Web App qo'shing va config ma'lumotlarini `firebase-config.js` ga joylang.
   - **Authentication**: Email/Password ni yoqing.
   - **Firestore**: Database yarating va qoidalarni sozlang.
   - **Storage**: Storage ni yoqing va qoidalarni sozlang.

3. **Ishga tushirish:**
   - Loyihani istalgan statik serverda (Live Server, http-server) oching.
   - `index.html` - Landing page
   - `admin.html` - Admin panel
   - `menu.html` - Mijozlar uchun menyu

## 📦 Fayl Strukturasi

- `index.html`: Asosiy sahifa (Landing Page)
- `admin.html`: Restoran egasi uchun boshqaruv paneli
- `menu.html`: Mijozlar ko'radigan menyu sahifasi
- `login.html`: Tizimga kirish
- `app.js`: Admin panel logikasi
- `menu.js`: Menyu sahifasi logikasi
- `landing.js`: Landing page logikasi
- `styles.css`: Umumiy stillar
- `landing.css`: Landing page stillari

## 🔒 Xavfsizlik

- `firebase-config.js` faylini hech qachon Git ga yuklamang (u `.gitignore` da).
- Firebase qoidalarini (Rules) to'g'ri sozlang.

## 📄 Litsenziya

MIT License
