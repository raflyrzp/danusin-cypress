# Danus.in E2E Automation Testing (Cypress + TypeScript)

Repositori ini berisi rangkaian pengujian End-to-End (E2E) otomatis untuk aplikasi **Danus.in** menggunakan **Cypress** dan **TypeScript**. Rangkaian pengujian ini dirancang untuk memvalidasi seluruh siklus bisnis aplikasi, mulai dari autentikasi, manajemen toko oleh penjual, pengelolaan produk, hingga siklus pemesanan, pembayaran digital, dan peninjauan pesanan.

---

## 🛠️ Prasyarat (Prerequisites)

Pastikan lingkungan lokal Anda telah terinstalasi perangkat lunak berikut:
- **Node.js** (Versi >= 18.x)
- **npm** (Versi >= 9.x)

---

## 📂 Struktur Proyek

```bash
cypress/
├── e2e/
│   ├── auth.cy.ts          # Pengujian Registrasi, Login, dan Otorisasi (Guard)
│   ├── store.cy.ts         # Pengujian Upgrade Peran menjadi Seller (Toko Baru)
│   ├── product.cy.ts       # Pengujian CRUD Produk & Validasi PO (Pre-Order)
│   ├── transaction.cy.ts   # Pengujian checkout (COD) & validasi sisa stok
│   ├── payment.cy.ts       # Pengujian webhook simulasi pembayaran Midtrans
│   └── management.cy.ts    # Pengujian siklus status order, ulasan, notifikasi & dashboard
├── fixtures/
│   ├── risol.jpg           # File contoh gambar produk untuk pengujian upload (Format valid)
│   └── katalog_produk.pdf  # File contoh non-gambar untuk pengujian upload (Format tidak valid)
├── tsconfig.json           # Konfigurasi TypeScript untuk kompilasi Cypress
└── package.json            # Daftar dependensi & script otomatisasi Cypress
```

---

## 🚀 Instalasi & Persiapan

1. Masuk ke dalam direktori pengujian `cypress`:
   ```bash
   cd cypress
   ```

2. Instal seluruh dependensi yang diperlukan menggunakan Bun:
   ```bash
   bun install
   ```

3. Siapkan file mock/fixtures di dalam direktori `cypress/fixtures/`:
   - Pastikan terdapat file `risol.jpg` (maks. 5MB) dan `katalog_produk.pdf` sebagai bahan pengujian upload gambar.

---

## ⚙️ Variabel Lingkungan & Konfigurasi

Secara default, pengujian diatur untuk berjalan pada Base URL lokal frontend:
- **Frontend URL**: `http://localhost:3000`

Jika Anda ingin menyesuaikan Base URL, silakan ubah konstanta `baseUrl` di dalam masing-masing berkas pengujian `.cy.ts` atau konfigurasikan file `cypress.config.ts` di direktori utama Anda.

---

## 🏃 Cara Menjalankan Pengujian

Tersedia dua opsi untuk mengeksekusi otomatisasi Cypress:

### 1. Menjalankan via Cypress Test Runner (Interactive Mode)
Opsi ini mempermudah Anda melakukan proses *debugging* secara visual melalui peramban (browser) grafis:
```bash
bun run cypress:open
```
*Setelah jendela Cypress terbuka, pilih opsi **E2E Testing**, tentukan browser pilihan Anda (misalnya Chrome), dan klik berkas pengujian yang ingin dijalankan.*

### 2. Menjalankan via Command Line (Headless Mode)
Opsi ini mengeksekusi semua tes di latar belakang secara cepat tanpa membuka antarmuka grafis:
```bash
bun run cypress:run
```

---

## 📝 Detail Cakupan Kasus Uji (Test Cases Coverage)

| ID Kasus Uji | Kategori | Skenario Pengujian |
| :--- | :--- | :--- |
| **TP-AUTH-01** | Autentikasi | Registrasi Akun Baru dengan Data Valid (Positif) |
| **TP-AUTH-02** | Autentikasi | Registrasi Akun Menggunakan NIM yang Sudah Terdaftar (Negatif) |
| **TP-AUTH-03** | Autentikasi | Login Pengguna Menggunakan Email dan Password Valid (Positif) |
| **TP-AUTH-04** | Autentikasi | Akses Halaman Terproteksi Seller oleh Pengguna Berperan Buyer (Negatif) |
| **TP-STORE-01** | Manajemen Toko | Upgrade ke Akun Seller dengan Data Lengkap dan Valid (Positif) |
| **TP-STORE-02** | Manajemen Toko | Upgrade ke Akun Seller Tanpa Menentukan Lokasi Pengambilan (Negatif) |
| **TP-PRODUCT-01**| Kelola Produk | Membuat Produk PO Baru dengan Detail Rentang Tanggal Valid (Positif) |
| **TP-PRODUCT-02**| Kelola Produk | Membuat Produk PO dengan Tanggal Tutup Mendahului Buka PO (Negatif) |
| **TP-UPLOAD-01** | Upload Gambar | Mengunggah Gambar Produk dengan Format dan Ukuran Valid (Positif) |
| **TP-UPLOAD-02** | Upload Gambar | Mengunggah Berkas Gambar Berformat Tidak Valid (Negatif) |
| **TP-CATALOG-01** | Katalog & Cari | Mencari dan Menyaring Produk Aktif Berdasarkan Filter PO (Positif) |
| **TP-CATALOG-02** | Katalog & Cari | Mencari Produk dengan Kata Kunci Karakter Khusus (Negatif) |
| **TP-TX-01** | Transaksi PO | Membuat Pesanan Baru (Checkout) Menggunakan Metode COD (Positif) |
| **TP-TX-02** | Transaksi PO | Membuat Pesanan Melebihi Batas Stok Produk Tersedia (Negatif) |
| **TP-PAY-01** | Pembayaran | Pembayaran Berhasil via Midtrans Snap (Simulasi Webhook Settlement) |
| **TP-PAY-02** | Pembayaran | Transaksi Pembayaran Kedaluwarsa di Midtrans Sandbox (Simulasi Webhook Expire) |
| **TP-STATUS-01** | Status Siklus | Pembaruan Status Siklus Hidup Transaksi Berurutan oleh Seller (Positif) |
| **TP-STATUS-02** | Status Siklus | Memperbarui Status Pesanan yang Sudah Dibatalkan oleh Seller (Negatif) |
| **TP-REVIEW-01** | Ulasan | Buyer Mengirimkan Ulasan Valid pada Pesanan Selesai (Positif) |
| **TP-NOTIF-01** | Notifikasi | Menandai Seluruh Notifikasi Aktif Sebagai Dibaca (Positif) |
| **TP-DASH-01** | Dashboard | Akurasi Pembaruan Data Ringkasan Pendapatan Seller |
