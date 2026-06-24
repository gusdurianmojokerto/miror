# Scrcpy Web Mirror

Web interface untuk mirroring HP ke PC/Laptop menggunakan scrcpy.

## Cara Menggunakan

### 1. Install Dependencies
```bash
npm install
```

### 2. Jalankan Server di Laptop
```bash
npm start
```

### 3. Setup di HP
1. Aktifkan USB Debugging di HP:
   - Masuk ke Settings > About Phone
   - Tap "Build Number" 7 kali untuk mengaktifkan Developer Options
   - Masuk ke Settings > Developer Options
   - Aktifkan "USB Debugging"

2. Sambungkan HP ke laptop via kabel USB (pertama kali saja)

3. Buka browser di HP, akses: `http://[IP-LAPTOP]:5555`
   - IP laptop akan muncul di console saat server jalan

4. Di browser HP:
   - Klik "Enable Wireless" 
   - Tunggu sampai muncul IP HP
   - Cabut kabel USB
   - Klik "Connect"

5. Jalankan command yang muncul di layar HP ke command prompt laptop

6. Layar HP akan muncul di laptop!

## Troubleshooting

- Pastikan HP dan laptop terhubung ke jaringan yang sama (untuk akses web)
- Pastikan USB Debugging sudah aktif
- Pastikan driver USB HP sudah terinstall di laptop
- Coba cabut dan colok ulang kabel USB
- Pastikan port 8080 dan 8081 tidak digunakan aplikasi lain

## Requirements

- Node.js (v14 atau lebih baru)
- Windows PC/Laptop
- Android Phone dengan USB Debugging enabled
- Kabel USB
