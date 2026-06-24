# Scrcpy Web Mirror

2 Versi tersedia:

## 1. WebADB Version (Deploy ke Vercel) ✅

**Full browser-based, tidak perlu install!**

### Deploy ke Vercel:
```bash
vercel --prod
```

Atau push ke GitHub dan connect ke Vercel.

### Cara Pakai:
1. Buka web yang sudah di-deploy
2. Colok HP via USB
3. Aktifkan USB Debugging
4. Klik "Connect via USB"
5. Browser minta izin - klik Allow
6. Pilih device HP
7. Start Screen Capture!

**Browser yang support:** Chrome 89+, Edge 89+

---

## 2. Scrcpy Desktop Version (Lokal)

### Di Laptop:
```bash
npm start
```

Buka: `http://localhost:8080`

### Fitur:
- Auto-detect HP via USB
- One-click start mirroring
- Notifikasi desktop

---

## Rekomendasi

- **Untuk cloud/remote:** Pakai WebADB version
- **Untuk performance:** Pakai Scrcpy desktop version
