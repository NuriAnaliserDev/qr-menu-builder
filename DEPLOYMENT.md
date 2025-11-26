# 🚀 QR Menu Builder - Deployment Guide

## Bosqich 1: GitHub ga yuklash

### 1.1 Git o'rnatish (agar o'rnatilmagan bo'lsa)

[Git yuklab olish](https://git-scm.com/downloads)

### 1.2 GitHub Repository yaratish

**Variant A: GitHub.com orqali (Oson)**

1. [github.com](https://github.com) ga kiring
2. "New repository" tugmasini bosing
3. Repository nomi: `qr-menu-builder`
4. Public yoki Private tanlang
5. "Create repository" bosing

**Variant B: Komanda satri orqali**

```bash
# QR Menu papkasiga o'ting
cd "c:\Users\New\Desktop\QR Menu"

# Git initialize
git init

# Fayllarni qo'shish
git add .

# Commit
git commit -m "Initial commit: QR Menu Builder"

# GitHub repository yarating va URL oling, keyin:
git remote add origin https://github.com/SIZNING-USERNAME/qr-menu-builder.git
git branch -M main
git push -u origin main
```

---

## Bosqich 2: Vercel ga Deploy (TAVSIYA ETILADI)

### 2.1 Vercel Account yaratish

1. [vercel.com](https://vercel.com) ga o'ting
2. "Sign Up" → GitHub bilan ro'yxatdan o'ting
3. GitHub accountingizni ulang

### 2.2 Deploy qilish

1. Vercel dashboardda "New Project" bosing
2. GitHub repository'ingizni tanlang (`qr-menu-builder`)
3. Import qiling
4. **Deploy** tugmasini bosing!

⏱️ 1-2 daqiqa ichida tayyor bo'ladi!

### 2.3 Natija

Vercel sizga URL beradi, masalan:

```
https://qr-menu-builder.vercel.app
```

### 2.4 Custom Domain (Ixtiyoriy)

Agar o'z domeningiz bo'lsa:

1. Vercel → Project Settings → Domains
2. Domeningizni qo'shing (masalan: `menyu.uz`)
3. DNS sozlamalarini yangilang
4. Tayyor!

---

## Bosqich 3: Netlify ga Deploy (Alternativa)

### 3.1 Netlify Account

1. [netlify.com](https://netlify.com) ga o'ting
2. GitHub bilan ro'yxatdan o'ting

### 3.2 Deploy qilish

**Variant A: Drag & Drop (Eng Oson!)**

1. [netlify.com/drop](https://app.netlify.com/drop)
2. `QR Menu` papkasini brauzerga sudrab tashlang
3. Tayyor! ✅

**Variant B: GitHub orqali**

1. "New site from Git" bosing
2. GitHub repository tanlang
3. Deploy bosing

---

## Bosqich 4: GitHub Pages (Bepul)

```bash
# Settings.js yaratish kerak
# GitHub repository → Settings → Pages
# Source: main branch
# Save

# URL:
# https://SIZNING-USERNAME.github.io/qr-menu-builder
```

---

## 🧪 Deploy qilgandan keyin test qilish

1. **Admin Panel:** `https://sizning-url.com/index.html`
2. **Menu Display:** `https://sizning-url.com/menu.html`
3. **QR Code yarating** admin panelda
4. **QR kodni skan qiling** telefondan
5. **Menu ochilishini** tekshiring

---

## ⚠️ Muhim Eslatmalar

### LocalStorage

- Har bir domen uchun alohida storage
- `vercel.app` da qo'shgan ma'lumotlar custom domainda ko'rinmaydi
- Export qiling va yangi domenda Import qiling

### QR Code URL

- Deploy qilgandan keyin QR kodni **qayta yarating**
- Yangi domen URLi bilan QR kod bo'lishi kerak

### CORS Issues

- Hozirgi loyiha 100% client-side
- CORS muammolari bo'lmasligi kerak
- Agar bo'lsa, Vercel headers sozlash mumkin

---

## 📊 Deploy Qilish Natijalari

| Platform     | Deploy Vaqt | SSL     | Custom Domain | Narx  |
| ------------ | ----------- | ------- | ------------- | ----- |
| Vercel       | 1-2 min     | ✅ Auto | ✅ Bepul      | Bepul |
| Netlify      | 1-2 min     | ✅ Auto | ✅ Bepul      | Bepul |
| GitHub Pages | 5-10 min    | ✅ Auto | ⚠️ CNAME      | Bepul |

---

## 🎯 Keyingi Qadamlar

Deploy qilgandan keyin:

1. ✅ URL ni saqlab qo'ying
2. ✅ Birinchi test mijoz toping
3. ✅ Feedback oling
4. ✅ Premium features boshlang
5. ✅ Marketing qiling!

---

## 💡 Maslahatlar

**O'zbek domenlar:**

- `.uz` domain: [cctld.uz](https://cctld.uz)
- Narx: ~100,000 so'm/yil
- Professional ko'rinish

**Branding:**

- `menyu.uz`
- `qrmenu.uz`
- `digitalmenu.uz`

**Performance:**

- Vercel global CDN
- Tez yuklash
- Automatic HTTPS

---

**Omad tilaymiz! 🚀**
