# GitHubga Yuklash Bo'yicha Qo'llanma

Loyiha allaqachon GitHubga ulangan (`origin` mavjud). O'zgarishlarni yuklash uchun quyidagi buyruqlarni ketma-ket terminalda (PowerShell yoki CMD) bajaring.

## 1. O'zgarishlarni belgilash

Hamma o'zgargan fayllarni "yuklashga tayyorlash" uchun:

```bash
git add .
```

## 2. O'zgarishlarni saqlash (Commit)

O'zgarishlarga nom berib saqlash uchun:

```bash
git commit -m "Barcha xatoliklar tuzatildi va yangi funksiyalar qo'shildi"
```

## 3. GitHubga yuborish (Push)

Saqlangan o'zgarishlarni internetdagi GitHub serveriga yuklash uchun:

```bash
git push origin main
```

---

**Qo'shimcha:**
Agar kelajakda yana o'zgarish qilsangiz, shu 3 ta buyruqni qaytadan bajarasiz:

1. `git add .`
2. `git commit -m "Yangi o'zgarish nomi"`
3. `git push origin main`
