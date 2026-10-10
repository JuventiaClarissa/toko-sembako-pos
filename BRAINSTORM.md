# Brainstorm: Aplikasi Manajemen Toko (PWA)

Dokumen ini merangkum seluruh hasil diskusi digitalisasi usaha keluarga: manajemen stok, pemasukan, keuntungan, kas, dan akuntansi.

---

## 1. Konteks Usaha

| Produk | Keterangan |
|---|---|
| Garam krosok | Karung 50 kg. Dijual per karung, atau dibuka lalu dibungkus 1 kg untuk eceran |
| Garam sawi (garam makan) | Dijual per bungkus, pak, atau bal (isi 20 bungkus). Isi pak/bal bisa dikustomisasi |
| Beras | 5 kg, 10 kg, 20 kg (berbagai merek) |
| Minyak sachet | Dibeli per karton/renteng, dijual satuan |
| Aqua galon | Sistem **tukar galon kosong** |
| Minuman showcase | Banyak item kecil |

**Fakta operasional**
- Gudang hanya 1 dan **hanya menyimpan garam krosok**. Barang lain diambil dari supplier atau dibeli langsung di toko grosir.
- Sekali stok garam bisa **ratusan karung**.
- Perkiraan total produk (SKU): **40-80**.
- Ada harga **langganan** yang kadang disesuaikan.
- Uang saat ini dipisah dalam **beberapa kotak uang berdasarkan modal** (manual).
- Pemilik kadang mengambil uang dari kasir untuk pembayaran tertentu.
- Staf: **1 orang** (angkat garam krosok ke mobil pelanggan), digaji **mingguan**. Ongkos angkut **tidak** ditagihkan ke pelanggan.
- Kasir: **pemilik sendiri**, kadang saudara menjaga toko saat force majeure.

**Pengguna:** keluarga kurang teknis, memakai **HP Android**. Pencatatan sekarang manual (buku/nota).
**Pendekatan terpilih:** membangun aplikasi custom (web/PWA).

---

## 2. Prinsip UX

- Bahasa Indonesia sederhana, hindari istilah akuntansi di tampilan utama (misal "Untung", bukan "Gross Margin").
- Tombol dan font besar. Layar utama minimal: **Jual**, **Stok Masuk**, **Laporan**.
- Target satu penjualan tercatat **kurang dari 10 detik**.
- **Offline-first**, sinkron saat ada sinyal.
- Bisa dipasang di layar utama HP (PWA).
- Login PIN dengan peran berbeda.
- Tombol Batalkan untuk transaksi yang salah.

> **Risiko terbesar adalah adopsi.** Jika mencatat lebih lama daripada buku tulis, pengguna kembali ke buku.

---

## 3. Keputusan Desain Inti

### 3.1 Satuan dan konversi (custom per produk)
- **Satuan dasar** = satuan terkecil yang dijual (bungkus, sachet, botol, kg).
- **Satuan kemasan** (pak, bal, karton, renteng, karung) beserta isi **diisi bebas oleh pengguna**.
- Tiap satuan punya **harga jual sendiri**. Biaya kemasan diisi pengguna pada produk.

Contoh Garam Sawi:

| Satuan | Isi | Harga jual |
|---|---|---|
| Bungkus (dasar) | 1 | diisi |
| Pak | bebas | diisi |
| Bal | 20 | diisi |

### 3.2 Buka Karung (repack garam krosok)
Produk dibuat terpisah: "Krosok Karung 50kg" dan "Krosok Eceran 1kg", dihubungkan fitur **Buka Karung**.

Alur: pilih krosok karung, isi jumlah karung dibuka, isi jumlah bungkus 1 kg yang dihasilkan, lalu sistem menghitung susut dan modal per bungkus.

- Modal eceran = (harga beli karung / jumlah bungkus) + biaya kemasan (plastik).
- Selisih berat dicatat sebagai **susut**.

### 3.3 Harga berlapis
1. Harga standar per satuan.
2. **Harga langganan** per pelanggan per produk (otomatis terisi saat pelanggan dipilih).
3. Edit harga manual saat transaksi, dengan peringatan lembut bila di bawah modal (tetap bisa disimpan).

### 3.4 Stok multi-lokasi
- Dua lokasi tetap: **Gudang** dan **Toko**.
- Produk non-krosok hanya ada di Toko (pilihan lokasi disembunyikan).
- Fitur **Pindah Stok** Gudang ke Toko (praktis untuk krosok).
- Peringatan stok menipis dan stok opname dilakukan per lokasi.

### 3.5 Pengadaan
Satu form **Stok Masuk** dengan kolom **Sumber** (supplier atau toko grosir). Tersedia **mode belanja cepat** (banyak item dalam satu nota). Modal dihitung dengan **rata-rata tertimbang (average cost)**, dan modal disimpan di tiap transaksi penjualan agar laba historis tidak berubah.

### 3.6 Galon Aqua (sistem tukar)

| Barang | Keterangan |
|---|---|
| Galon isi | Barang dagangan |
| Galon kosong | Hasil tukar pelanggan, dikembalikan ke supplier |

- **Tukar (ada galon kosong):** isi -1, kosong +1, harga isi ulang.
- **Beli baru (tanpa galon):** isi -1, harga lebih tinggi (termasuk harga galon).
- Pembelian dari supplier: isi masuk, kosong keluar sejumlah yang ditukar.
- Dua harga jual = dua satuan jual pada produk yang sama.
- Beranda menampilkan stok isi, kosong, dan galon yang harus dikembalikan ke supplier.
- Jaminan galon (opsional, fase 3): dicatat sebagai kewajiban, bukan pendapatan.

---

## 4. Kas dan Dompet

### 4.1 Dompet / Akun Kas
Meniru kebiasaan **kotak uang** keluarga. Setiap tempat uang adalah satu dompet dengan saldo sendiri, dan bebas ditambah atau diganti nama.

Contoh: Laci kasir, Kotak modal garam, Kotak modal beras, Kotak modal minyak/minuman, Rekening bank, QRIS, Kotak laba/pribadi.

- Setiap penjualan memilih **metode bayar** (tunai, transfer, QRIS) yang masuk ke dompet yang sesuai.
- Setiap pembelian memilih **dompet sumber**.
- Fitur **Pindah Dana** antar dompet.
- **Aturan alokasi otomatis** (opsional): bagian modal masuk ke kotak modal produk terkait, sisanya (laba) ke laci atau kotak laba.
- QRIS: catat biaya potongan dan status belum cair (H+1).
- Peringatan saat saldo kotak modal hampir habis.

### 4.2 Ambil Uang (hanya pemilik)

| Jenis | Contoh | Dampak |
|---|---|---|
| Pengeluaran usaha | Supplier, listrik, bensin, gaji | Mengurangi laba |
| Pengambilan pribadi (**Prive**) | Kebutuhan rumah | Tidak mengurangi laba, mengurangi modal pemilik |
| Pindah dana | Laci ke kotak modal | Hanya pindah saldo |
| Pinjaman/kasbon | Kasbon staf | Dicatat sebagai piutang |
| Bayar hutang supplier | - | Mengurangi hutang |

Alur: Ambil Uang, isi jumlah, pilih tujuan (tombol besar), catatan opsional, simpan.

- Tombol hanya muncul di akun pemilik. **Tidak ada alur persetujuan atau batas wajib.**
- Ukuran dan frekuensi pengambilan tidak pasti, jadi peringatan bersifat lembut (saldo kurang, nominal jauh di atas biasanya) dan tetap bisa disimpan.
- Tidak bisa dihapus, hanya dibatalkan dengan alasan, dan masuk audit log.
- Laporan bulanan memisahkan **pengeluaran usaha** dan **pengambilan pribadi**. Contoh: "Laba Rp 8 jt, diambil pribadi Rp 5 jt, tertahan di usaha Rp 3 jt".

### 4.3 Gaji dan pengeluaran berulang
- Gaji staf dicatat sebagai pengeluaran usaha kategori **Gaji**, dengan jadwal berulang **mingguan** (pengingat, satu ketukan, nominal bisa diubah).
- Kasbon staf dapat dipotong dari gaji.
- **Gaji pemilik ditunda.** Saat ini pengambilan pribadi dicatat sebagai prive.
- Foto nota: tombol opsional, prioritas rendah.

---

## 5. Peran Pengguna

| Peran | Akses |
|---|---|
| **Pemilik** | Semua fitur: laba, harga beli, prive, audit log, pengaturan |
| **Penjaga Toko** (saudara, sementara) | Jual, cek stok, stok masuk, tutup kasir. Tanpa laba, harga beli, prive, atau audit log |
| **Staf angkut** | Tidak memakai aplikasi |

- Akses Penjaga diaktifkan lewat **PIN sementara** (misal aktif sampai besok sore) dan bisa dimatikan pemilik.
- Tampilan Penjaga dibuat paling sederhana, dengan petunjuk singkat.
- **Serah terima shift:** hitung uang laci saat mulai dan selesai, selisih tercatat atas nama penjaga.

---

## 6. Daftar Fitur

### 6.1 Inti
- Produk, satuan custom, harga standar, biaya kemasan
- Stok Gudang dan Toko, pindah stok, stok opname
- Stok masuk (termasuk belanja cepat) dan riwayat batch beli
- Buka Karung
- Kasir dengan harga langganan dan edit harga
- Pelanggan, harga langganan, dan **bon/piutang** (status lunas, bayar sebagian, jatuh tempo)
- Dompet kas dan metode bayar
- Ambil Uang
- Pengeluaran
- Galon tukar
- Laporan harian, bulanan, tahunan

### 6.2 Tutup Kasir Harian
- Sistem menampilkan uang yang **seharusnya** ada di laci:
  saldo awal + penjualan tunai + uang masuk lain - pengeluaran tunai - pengambilan pemilik - pindah dana keluar.
- Kasir memasukkan uang fisik (bisa hitung per pecahan). Sistem menampilkan selisih dan meminta catatan.
- Rekap per metode bayar, saldo awal besok terisi otomatis, hasil bisa dikunci.
- Pengambilan tanpa catatan ditandai "belum lengkap".

### 6.3 Audit Log
- Mencatat siapa, kapan, apa, nilai sebelum dan sesudah: edit harga, batal transaksi, koreksi stok, ubah harga beli, hapus data, ambil uang, perubahan pengguna.
- Tidak bisa diedit atau dihapus siapa pun. Hanya pemilik yang melihat, dengan filter dan penanda kejadian mencurigakan.

### 6.4 Backup Otomatis
- Backup harian di server, ekspor mingguan ke Google Drive atau email pemilik.
- Tombol Backup Sekarang, fitur pulihkan data dengan konfirmasi, backup lokal untuk mode offline.
- Uji pemulihan secara berkala.

### 6.5 Saran Restock
- Dari rata-rata penjualan 30 hari, hitung **perkiraan sisa hari stok** dengan memperhitungkan lead time supplier atau grosir.
- Daftar belanja bisa dikirim ke WhatsApp atau dicetak. Mempertimbangkan saldo kotak modal. Musiman setelah data setahun.

### 6.6 Alert Perubahan Harga Beli
- Bandingkan dengan pembelian terakhir dan rata-rata. Contoh: "Minyak naik 8%, margin turun dari 12% ke 5%".
- Tampilkan harga jual yang disarankan dengan tombol Perbarui harga jual. Riwayat harga beli per produk dan per supplier.

### 6.7 Margin Rendah
- Ambang margin per produk atau kategori. Daftar produk margin tipis atau **dijual rugi** (harga langganan atau hasil edit).
- Margin per pelanggan. Margin memperhitungkan modal rata-rata, kemasan, dan biaya QRIS.

### 6.8 Stok Mati
- Produk tanpa penjualan N hari (default 30), dengan nilai **modal tertahan** dan saran tindakan.
- Opsional: tanggal kedaluwarsa untuk minuman dan minyak.

### 6.9 Pelanggan
- Nama, HP, alamat, catatan, harga langganan (dengan riwayat), riwayat dan total belanja, margin yang diberikan.
- Bon/piutang dengan batas kredit dan jatuh tempo. Segmentasi: terbaik, tidak aktif, menunggak. Pengingat tagihan via WhatsApp.

### 6.10 Akuntansi (dua lapis)
Akuntansi berjalan otomatis di belakang layar (setiap transaksi menghasilkan jurnal). Pengguna melihat versi yang mudah dipahami.

| Mode Sederhana (default) | Mode Akuntansi |
|---|---|
| "Uang saya sekarang berapa?" | Neraca |
| "Untung bulan ini berapa?" | Laba rugi |
| "Berapa hutang dan piutang?" | Buku besar dan jurnal umum |
| "Nilai barang di toko dan gudang" | Arus kas, neraca saldo |

**Edukasi (fitur "Belajar"):**
- Tombol **Apa ini?** di setiap laporan, dengan contoh dari usaha sendiri.
- Terjemahan istilah: Persediaan = nilai stok barang, Piutang = uang yang masih di pelanggan, HPP = modal barang yang laku, Ekuitas = kekayaan bersih usaha.
- Mini-pelajaran: beda omzet, untung, dan uang tunai; kenapa untung besar belum tentu uang banyak; cara membaca neraca.

**Catatan:**
- Pisahkan keuangan usaha dan pribadi (Prive).
- Perlu **saldo awal** (wizard): kas, stok, piutang, hutang, modal.
- Mode Akuntansi dibuka belakangan. Tidak menggantikan akuntan untuk pajak.

Jurnal otomatis contoh:
- Pengeluaran usaha: Beban (D) / Kas (K)
- Prive: Prive (D) / Kas (K)
- Pindah dana: Kas tujuan (D) / Kas asal (K)

---

## 7. Laporan

Satu sumber data, filter: Hari ini / Minggu ini / Bulan ini / Tahun ini / Pilih tanggal.

**Bulanan**
- Omzet, modal barang terjual (HPP), laba kotor, pengeluaran, **laba bersih**, perbandingan bulan lalu.
- Grafik per hari, produk terlaris dan paling menguntungkan, laba per kategori, pengeluaran per jenis, pembelian per sumber, susut dan koreksi stok, nilai stok akhir, pengambilan pribadi.

**Tahunan**
- Grafik per bulan (omzet, laba kotor, laba bersih), bulan terbaik dan terburuk, total dan rata-rata, perbandingan tahun lalu, tren musiman, pelanggan terbesar, nilai stok awal dan akhir.

**Ekspor:** PDF dan Excel/CSV. Ringkasan WhatsApp (fase 4).

**Catatan penting**
- Laba bulan lalu tidak boleh berubah karena modal disimpan per transaksi.
- Opsional: **tutup buku bulanan** untuk mengunci data.
- Laporan laba hanya untuk Pemilik.

---

## 8. Model Data (ringkas)

- `products`, `product_units` (isi, harga jual, biaya kemasan), `product_links` (galon isi dan kosong)
- `locations` (Gudang, Toko), `stock_levels`, `stock_movements`
- `purchases`, `purchase_items`, `suppliers`
- `customers`, `customer_prices`
- `sales`, `sale_items` (harga aktual, modal saat transaksi, `exchange_empty_qty`)
- `repack_logs`
- `wallets`, `wallet_transactions`
- `cash_withdrawals` (type: expense / prive / transfer / loan / supplier_payment)
- `expenses`, `expense_categories`, `recurring_expenses`
- `cash_closings`
- `supplier_payables`, `receivables` (bon)
- `deposits` (jaminan galon, opsional)
- `users`, `temporary_access`
- `audit_logs`
- `month_closings` (opsional)
- Tabel akuntansi (fase 4): akun, jurnal, entri jurnal

---

## 9. Tech Stack (usulan)

- **Frontend:** PWA (React atau Svelte) dengan Tailwind
- **Backend dan database:** Supabase (auth, realtime, backup). Alternatif: Firebase
- **Offline:** IndexedDB dengan sinkronisasi
- **Hosting:** Vercel atau Netlify
- **Laporan:** grafik sederhana, ekspor PDF dan Excel

Skala data kecil (40-80 SKU, transaksi harian), jadi paket gratis cukup. Fokus utama adalah kemudahan input.

---

## 10. Roadmap

| Fase | Isi |
|---|---|
| **MVP** | Produk dan satuan custom, stok Gudang/Toko, stok masuk, Buka Karung, kasir dan harga langganan, pelanggan dan bon, dompet kas dan metode bayar, **Ambil Uang (pemilik)**, pengeluaran, **galon tukar**, laporan harian/bulanan/tahunan sederhana, PIN dengan peran Pemilik dan Penjaga |
| **Fase 2** | Tutup kasir dan serah terima shift, audit log, backup otomatis, hutang supplier, pengeluaran berulang (gaji mingguan), akses sementara penjaga, aturan alokasi kotak modal |
| **Fase 3** | Alert harga beli, margin rendah, stok mati, saran restock, ekspor PDF/Excel, jaminan galon, foto nota |
| **Fase 4** | Akuntansi (jurnal otomatis, neraca, laba rugi, arus kas) dengan edukasi, notifikasi WhatsApp, struk Bluetooth |

Dompet kas dimasukkan sejak MVP karena menjadi fondasi tutup kasir dan akuntansi.

**Ditunda atau tidak dikerjakan:** barcode scanner, poin loyalitas/promo, multi-cabang, integrasi marketplace.

---

## 11. Persiapan Sebelum Mulai

- Hitung **stok fisik** awal (gudang dan toko).
- Siapkan daftar produk, satuan, harga beli, dan harga jual awal.
- Pakai aplikasi dan buku **paralel 1-2 minggu**.
- Siapkan **saldo awal** kas dan kotak uang.

---

## 12. Pertanyaan Terbuka

- Nama dan jumlah **kotak uang** yang dipakai saat ini, beserta fungsinya.
- Pembagian modal ke kotak: **per transaksi** atau **di akhir hari**?
- Metode **QRIS/transfer** yang sudah dipakai (bank atau e-wallet apa)?
- Daftar produk lengkap dengan harga awal.
- Apakah jaminan galon diperlukan?
- Apakah foto nota akan dipakai setelah beberapa bulan?

## 13. Langkah Berikutnya

1. Susun **PRD ringkas** (fitur, aturan bisnis, model data).
2. Buat **mockup layar utama**: Beranda, Kasir, Ambil Uang, Stok, Buka Karung, Galon, Laporan.
3. Bangun MVP dan uji coba di toko dengan data asli.

---

## 14. Keputusan Teknis: Platform, Database, dan Backup

### 14.1 Platform: PWA (website yang dipasang di HP)
- Update otomatis, bisa dibantu dari jarak jauh, cepat dibuat, dan kodenya bisa dibungkus jadi APK (Capacitor/TWA) bila perlu (misalnya struk Bluetooth, fase 4).
- Pengguna gaptek: **Anda yang memasang** ikon "Toko" di HP mereka. Data utama di server, data lokal hanya antrean offline. Sediakan panduan bergambar satu halaman dan pendampingan 1-2 minggu.
- **Uji dulu di HP orang tua** (merek, versi Android, browser) sebelum mengembangkan.
- Desain untuk gaptek: tombol besar, satu layar satu tugas, beranda 3-4 tombol, konfirmasi aksi penting, opsi mode font besar.

### 14.2 Database: PostgreSQL (Supabase Free), mulai gratis
- Relasional karena transaksi multi-tabel (stok, kas, piutang, jurnal) harus atomik dan laporan butuh agregasi.
- Prinsip: stok berbasis pergerakan (`stock_movements`) plus tabel ringkasan; uang dalam integer rupiah; modal dan harga aktual disimpan per `sale_items`; transaksi append-only (koreksi lewat transaksi pembalik); soft delete untuk data master; operasi penting lewat fungsi database atomik; UUID dari klien; audit log via trigger; simpan UTC, tampilkan WIB.
- Offline: antrean IndexedDB, transaksi tidak pernah ditimpa, data master versi terbaru menang, indikator "Tersimpan, menunggu sinyal".
- Keamanan: Row Level Security; harga beli, laba, dan prive **tidak dikirim** ke akun Penjaga; pembatasan percobaan PIN; kunci rahasia hanya di server.
- Hosting gratis: Vercel/Netlify/Cloudflare Pages. Review setelah 3 bulan, naik ke berbayar (sekitar USD 25 per bulan) bila perlu. Karena Postgres standar, bisa pindah ke Neon/Railway/VPS lewat `pg_dump`.

### 14.3 Proyek Supabase Free dijeda
- Proyek tidak aktif sekitar 7 hari dijeda (tidak dihapus). Pulihkan lewat dashboard (**Restore project**) dalam batas waktu pemulihan (sekitar 90 hari; verifikasi di dokumentasi terbaru). Setelah itu data diunduh dan dipulihkan ke proyek baru.
- Pencegahan: dipakai harian, ping terjadwal (GitHub Actions/cron-job.org), email aktif untuk notifikasi, dan backup di luar Supabase.
- Saat dijeda, mode offline PWA tetap bisa jualan, lalu sinkron setelah proyek hidup.

### 14.4 Backup ke Google Drive dan email
- **Tombol "Backup Sekarang"** (khusus pemilik) memanggil Supabase Edge Function yang mengekspor data (Excel/CSV/JSON terkompresi) dan mengunggah ke Google Drive pemilik.
- **Google Drive: OAuth** (bukan Service Account karena tidak punya kuota di Drive pribadi). Cakupan `drive.file`, token penyegaran di server, aplikasi OAuth berstatus **Production** (mode Testing kedaluwarsa 7 hari). Status koneksi tampil di aplikasi dan ada peringatan bila perlu dihubungkan ulang.
- **Email pemilik:** berkas dilampirkan (Resend atau SMTP Gmail), dilindungi password. Dikirim untuk backup manual dan ringkasan mingguan. Berkas besar diganti tautan Drive.
- **Backup terjadwal:** GitHub Actions (`pg_dump`) ke Drive tiap malam, berjalan di luar Supabase. Retensi 7 harian dan 4 mingguan.
- `backup_logs` (waktu, ukuran, status, pemicu manual atau otomatis). Notifikasi bila backup gagal. Pembatasan frekuensi backup manual.
- Edge Function punya batas waktu dan memori. Aman untuk data kecil, dipecah per tabel bila tumbuh.
- Ekspor JSON/CSV tidak sama dengan `pg_dump`, jadi pemulihan penuh proyek tetap lewat `pg_dump` oleh Anda.

### 14.5 Tombol Pulihkan (restore)
- Hanya pemilik, PIN ulang, pilih backup dari daftar dengan **pratinjau** ("berisi data sampai tanggal X, transaksi setelahnya akan hilang").
- **Konfirmasi ganda** (ketik "PULIHKAN"), **snapshot otomatis sebelum restore**, restore ke tabel sementara lalu validasi (jumlah baris, debit sama dengan kredit, saldo stok) baru ditukar, **mode pemeliharaan** selama proses, antrean offline dikirim setelah selesai.
- Tercatat di audit log dan riwayat backup. Pemulihan sebagian (satu tabel atau rentang tanggal) di fase 3.
- Restore dari aplikasi memakai berkas format aplikasi. Wajib diuji dengan data tiruan sebelum dipakai.

### 14.6 Roadmap tambahan (backup)
| Fase | Isi |
|---|---|
| Fase 2 | Backup Sekarang, sambung Drive (OAuth), kirim ke email, riwayat dan retensi, backup terjadwal GitHub Actions |
| Fase 3 | Tombol Pulihkan, notifikasi gagal, pemulihan sebagian |

### 14.7 Keputusan yang sudah diambil
- Google Drive milik **pemilik**, backup juga dikirim ke **email**, tombol **Pulihkan perlu ada di aplikasi**.
- Mulai dengan opsi **gratis**.
