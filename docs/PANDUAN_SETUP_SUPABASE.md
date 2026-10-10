# 🚀 Panduan Setup Database Cloud Supabase (3 Menit Selesai)

> Panduan menghubungkan POS Toko Berkah Garam ke Cloud Database **Supabase (Gratis)** agar data transaksi, stok garam, dan buku bon tersinkronisasi otomatis antar HP dan Laptop.

---

### Langkah 1: Buat Proyek Baru di Supabase (Gratis)
1. Buka situs [supabase.com](https://supabase.com/) di browser dan login (bisa login dengan akun Google atau GitHub).
2. Klik tombol **`New Project`**.
3. Isi kolom:
   * **Name**: `Toko Berkah Garam`
   * **Database Password**: Buat password yang mudah Anda ingat (atau simpan di catatan).
   * **Region**: Pilih **Singapore (`ap-southeast-1`)** agar koneksi dari Indonesia sangat cepat.
4. Klik **`Create new project`** dan tunggu sekitar 1-2 menit hingga proyek selesai disiapkan.

---

### Langkah 2: Jalankan Skema Database (1x Klik)
1. Di dashboard Supabase Anda, buka menu **`SQL Editor`** di panel sebelah kiri (ikon terminal/dokumen).
2. Klik **`New query`**.
3. Buka file skrip yang sudah kami siapkan di proyek Anda:  
   [`database/schema.sql`](file:///C:/Users/User/.gemini/antigravity/scratch/toko-digital/database/schema.sql)
4. Salin seluruh isi teks SQL tersebut, lalu tempel (*paste*) ke dalam kolom query di Supabase.
5. Klik tombol **`Run`** (ikon panah hijau di kanan bawah).
6. Akan muncul pesan hijau: `Success. No rows returned`. Seluruh tabel (`products`, `transactions`, `customer_debts`, `cash_movements`, dll) dan data awal garam langsung siap dipakai!

---

### Langkah 3: Ambil Kunci & Hubungkan di Aplikasi
1. Di dashboard Supabase, buka menu **`Project Settings`** (ikon roda gigi di kiri bawah) > pilih **`API`**.
2. Anda akan melihat 2 informasi penting:
   * **Project URL**: (Contoh: `https://abcdefghijklmn.supabase.co`)
   * **Project API keys** bagian **`anon` `public`**: (Rangkaian kode panjang diawali `eyJ...`)
3. Buka halaman mana saja di aplikasi kasir Anda (misalnya [`frontend/kasir.html`](file:///C:/Users/User/.gemini/antigravity/scratch/toko-digital/frontend/kasir.html) atau [`frontend/index.html`](file:///C:/Users/User/.gemini/antigravity/scratch/toko-digital/frontend/index.html)).
4. Klik tombol kecil **`[Lokal]`** atau **`[Database: Lokal]`** di bar atas.
5. Tempelkan **Project URL** dan **Anon Key** ke kolom yang tersedia, lalu klik **`[Simpan & Hubungkan]`**.

---

### 🟢 Hasil Setelah Terhubung:
* Indikator di bar atas akan otomatis berubah menjadi hijau: **`🟢 Cloud Aktif`**.
* Setiap kali kasir input penjualan atau mencatat bon, data langsung masuk ke server cloud detik itu juga.
* Jika sewaktu-waktu HP tidak ada sinyal/internet, aplikasi **tidak akan error**—aplikasi otomatis tetap menyimpan transaksi di memori lokal (*offline mode*).
