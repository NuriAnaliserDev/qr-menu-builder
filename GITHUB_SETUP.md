# 🔧 GitHub Setup - Qadamma-Qadam

## 1. GitHub Account Yaratish (Agar yo'q bo'lsa)

1. [github.com](https://github.com) ga o'ting
2. "Sign Up" bosing
3. Email, username, password kiriting
4. Email verify qiling

---

## 2. GitHub Repository Yaratish

### Web orqali (OSON):

1. GitHub'ga login qiling
2. O'ng yuqori burchakda "+" → "New repository"
3. Repository nomi: `qr-menu-builder`
4. Description: "Professional QR Menu Builder for restaurants"
5. **Public** yoki **Private** tanlang
6. ❌ README, .gitignore, license qo'shMANG (bizda bor)
7. "Create repository" bosing

---

## 3. Local Kodlarni GitHub ga Push Qilish

Repository yaratgandan keyin, GitHub sizga commandlar ko'rsatadi. 

**Quyidagi commandlarni Terminal/PowerShell da bajaring:**

```powershell
# QR Menu papkasiga o'ting
cd "c:\Users\New\Desktop\QR Menu"

# GitHub URL ni qo'shing (SIZNING URL ni qo'ying!)
git remote add origin https://github.com/SIZNING-USERNAME/qr-menu-builder.git

# Branch nomini o'zgartirish
git branch -M main

# Push qilish
git push -u origin main
```

**DIQQAT:** `SIZNING-USERNAME` ni o'z GitHub username ingiz bilan almashtiring!

Masalan:
```powershell
git remote add origin https://github.com/john_doe/qr-menu-builder.git
```

---

## 4. GitHub Login

Push qilishda GitHub login so'raydi:

### Variant A: Personal Access Token (Tavsiya)

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. "Generate new token" → "Generate new token (classic)"
3. Name: "QR Menu Builder"
4. Scopes: `repo` ni belgilang
5. "Generate token" bosing
6. **TOKENNI SAQLANG** (bir marta ko'rsatiladi!)

Push qilishda:
- Username: GitHub username
- Password: Token (parol emas!)

### Variant B: GitHub Desktop (Eng Oson)

1. [GitHub Desktop](https://desktop.github.com/) yuklab oling
2. O'rnatib, login qiling
3. "Add Existing Repository" → `QR Menu` papkani tanlang
4. "Publish repository" tugmasini bosing
5. ✅ Tayyor!

---

## 5. Tekshirish

GitHub repository sahifangizga o'ting:
```
https://github.com/SIZNING-USERNAME/qr-menu-builder
```

Barcha fayllar ko'rinishi kerak:
- ✅ index.html
- ✅ menu.html
- ✅ styles.css
- ✅ app.js
- ✅ menu.js
- ✅ README.md
- ✅ DEPLOYMENT.md
- ✅ etc...

---

## 6. Vercel Deploy (Keyingi qadam)

GitHub'da bo'lgandan keyin:

1. [vercel.com](https://vercel.com) ga o'ting
2. GitHub bilan login qiling
3. "New Project" → Repository tanlang
4. "Deploy" bosing
5. ✅ 2 daqiqada live!

---

## ⚠️ Muammolar?

### "Permission denied"
→ Token kerak (Variant A yuqorida)

### "Repository not found"
→ URL to'g'ri yozilganini tekshiring

### "fatal: remote origin already exists"
→ Avval remove qiling:
```powershell
git remote remove origin
git remote add origin https://github.com/...
```

---

## 💡 Yordamchi Commandlar

```powershell
# Remote tekshirish
git remote -v

# Status ko'rish
git status

# Branchlarni ko'rish
git branch

# Oxirgi commitlarni ko'rish
git log --oneline
```

---

**Omad! 🚀**
