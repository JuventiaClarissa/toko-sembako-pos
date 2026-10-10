# 🏪 Toko Berkah Garam (Sistem POS & Pembukuan Digital)

Sistem Kasir (Point of Sale), Manajemen Stok Multi-Gudang, Buku Bon/Piutang Pelanggan, dan Pembukuan Keuangan Digital yang dirancang khusus untuk toko grosir dan eceran sembako/garam.

---

## 📌 Status Pengembangan Proyek

| Fase | Nama Modul | Status | Keterangan |
| :---: | :--- | :---: | :--- |
| **Fase 1** | **Prototyping & Antarmuka Kasir** | ✅ Selesai | Desain katalog, nota belanja, buku bon, dan dual role |
| **Fase 2** | **Database & Cloud Access Layer** | ✅ Selesai | DAL `db.js`, Supabase PostgreSQL real-time sync & fallback offline |
| **Fase 3** | **Hardware POS & Offline PWA** | ✅ Selesai | Cetak Bluetooth thermal ESC/POS (`printer.js`), Barcode camera/gun scanner, PWA offline (`sw.js`) |
| **UI Polish** | **Audit Responsif & Anti-Gencet** | ✅ Selesai | Layout POS h-screen split desktop, zero unwanted scrollbar, modal & header responsif |
| **Fase 4** | **Otomatisasi WA & Cloud Backup** | ⏳ Berikutnya | Notifikasi tutup kasir WhatsApp & ekspor terjadwal ke Google Drive |
| **Fase 5** | **Uji Lapangan & Go-Live** | ⏳ Rencana | Pelatihan staf toko & transisi penuh operasional digital |

---

## 📂 Struktur Folder Proyek

```text
e:\Toko Sembako\
├── 📁 frontend/                     # Seluruh antarmuka web responsif (Mobile & Desktop)
│   ├── index.html                   # Dashboard utama & ringkasan operasional usaha
│   ├── kasir.html                   # Kasir split-screen responsif (Katalog, Nota, Tunai, Bon)
│   ├── buku-bon.html                # Buku Bon & Piutang, cicilan, dan tagihan WhatsApp
│   ├── stok.html                    # Manajemen stok toko depan vs gudang belakang
│   ├── stok-masuk.html              # Pencatatan kulakan barang supplier & pengeluaran kas
│   ├── buka-karung.html             # Repack garam karung 50kg ke 1kg + susut timbangan
│   ├── ambil-uang.html              # Pencatatan prive rumah, upah staf, dan beban usaha
│   ├── tutup-kasir.html             # Rekonsiliasi fisik uang laci saat tutup shift harian
│   ├── laporan.html                 # Grafik analitik omzet, laba bersih, & ekspor data
│   ├── pengaturan.html              # Printer Bluetooth thermal & pengelolaan barcode
│   ├── auth.js                      # Pengendali peran (Mode Pemilik vs Mode Penjaga/Saudara)
│   ├── db.js                        # Database Access Layer Supabase + fallback offline
│   ├── printer.js                   # Web Bluetooth ESC/POS printer driver (58mm/80mm)
│   ├── pwa.js                       # Handler registrasi PWA & prompt install
│   ├── sw.js                        # Service worker untuk mode PWA offline caching
│   ├── manifest.json                # Manifest PWA agar dapat diinstall ke HP
│   └── 📁 icons/                    # Ikon aplikasi PWA multi-resolusi
│
├── 📁 database/                     # Skrip database cloud
│   └── schema.sql                   # Skema PostgreSQL lengkap (8 tabel, seed data, RLS)
│
├── 📁 docs/                         # Panduan dan roadmap proyek
│   ├── TIMELINE_PROJECT_TOKO_DIGITAL.md   # Roadmap dan status progres 5 fase
│   ├── PANDUAN_SETUP_SUPABASE.md          # Panduan 3 langkah menghubungkan Supabase Cloud
│   └── MOCKUP_RESPONSIF.md                # Dokumentasi mockup desain responsif
│
├── BRAINSTORM.md                    # Catatan arsitektur & fitur awal
└── README.md                        # Berkas petunjuk ini
```

---

## 🚀 Cara Menjalankan Aplikasi

1. **Jalankan via Local Server**:
   ```bash
   npx http-server frontend -p 8080 -c-1
   ```
   Akses di browser: `http://localhost:8080/kasir.html` atau `http://localhost:8080/index.html`

2. **Buka Langsung di Browser (Tanpa Install Server)**:
   * Masuk ke folder `frontend/` dan klik dua kali file **`index.html`** atau **`kasir.html`**.

---

## 🔐 Fitur Dual Role (Mode Pemilik vs Mode Penjaga)

* **Mode Pemilik (Aktif)**: Membuka seluruh menu rahasia, melihat harga beli modal, keuntungan bersih, pengaturan printer, dan penarikan kas.
* **Mode Penjaga (Saudara)**: Menyembunyikan data sensitif (Laporan laba, Ambil Uang, Buka Karung, modal beli). Saudara hanya bisa melayani kasir & cek stok barang.
* **PIN Akses Pemilik**: `1234` atau `2026` (Dapat diubah di `frontend/auth.js`).

---

## ☁️ Menghubungkan ke Cloud Database (Supabase)

Aplikasi memiliki fitur sinkronisasi real-time ke Supabase:
1. Baca panduan lengkap di: **`docs/PANDUAN_SETUP_SUPABASE.md`**.
2. Salin isi **`database/schema.sql`** ke SQL Editor di Supabase.
3. Buka aplikasi kasir, klik tombol badge **`[Lokal]`** di bar atas, lalu masukkan Project URL & Anon Key. Data otomatis tersinkronisasi dua arah.
