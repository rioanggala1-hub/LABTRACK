# LabTrack — Laboratory Inventory & Borrowing Management System

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Aplikasi web profesional untuk manajemen inventaris perangkat laboratorium komputer, pencatatan transaksi peminjaman multi-barang, pemrosesan pengembalian parsial/penuh, dan manajemen hak akses pengguna (Role Admin & Staff) berbasis **Supabase PostgreSQL** dan **React + TypeScript**.

Dikembangkan berdasarkan spesifikasi resmi **Coding Talent Challenge**.

---

## 📑 Daftar Isi

1. [Fitur Utama](#-fitur-utama)
2. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
3. [Arsitektur & Keamanan Database](#-arsitektur--keamanan-database)
4. [Akun Demo & Hak Akses](#-akun-demo--hak-akses)
5. [Struktur Folder](#-struktur-folder)
6. [Panduan Instalasi & Menjalankan Aplikasi](#-panduan-instalasi--menjalankan-aplikasi)
7. [Panduan Konfigurasi Supabase](#-panduan-konfigurasi-supabase)
8. [Panduan Deployment ke Vercel](#-panduan-deployment-ke-vercel)
9. [Verifikasi Pengujian Fitur](#-verifikasi-pengujian-fitur)

---

## 🌟 Fitur Utama

### 1. Sistem Multi-Role (Admin & Staff)
- **Role Admin:**
  - Akses penuh dashboard analitik (grafik distribusi, riwayat aktivitas, barang paling sering dipinjam).
  - Manajemen inventaris: Tambah barang baru, edit informasi, hapus barang (dilindungi validasi: barang yang sedang dipinjam tidak dapat dihapus).
  - Manajemen kategori peralatan laboratorium.
  - Manajemen akun Staff: Tambah staff baru, edit profil, aktifkan/nonaktifkan status staff.
  - Akses riwayat seluruh transaksi dan ekspor laporan CSV.
- **Role Staff:**
  - Dashboard operasional terfokus pada ketersediaan stok barang dan status peminjaman.
  - Pencatatan transaksi peminjaman alat mahasiswa/dosen (multi-item dalam satu transaksi).
  - Pemrosesan pengembalian barang (pengembalian sebagian maupun sekaligus).
  - Pembatasan hak akses: Staff tidak dapat menambah/mengedit/menghapus barang maupun mengelola akun.

### 2. Transaksi Stok Atomik (PostgreSQL RPC Functions)
- **Zero Race Condition & Negative Stock Prevention:** Perubahan stok saat peminjaman (`borrow_items_atomic`) dan pengembalian (`return_items_atomic`) dijalankan di level database Supabase dengan `SELECT ... FOR UPDATE` dan transaksi atomik, memastikan stok fisik dan stok tersedia selalu sinkron.
- **Multi-Item Borrowing:** Mendukung peminjaman beberapa jenis barang sekaligus dengan nomor transaksi unik otomatis (`BRW-YYYYMMDD-XXXX`).
- **Partial Returns:** Mendukung pengembalian bertahap (contoh: pinjam 5 unit mouse, dikembalikan 2 unit terlebih dahulu, lalu sisa 3 unit berikutnya). Status transaksi otomatis diperbarui (`Dipinjam` ➔ `Sebagian Dikembalikan` ➔ `Selesai`).

### 3. UI/UX Modern & Responsif
- **Design System Profesional:** Menggunakan palet warna Navy Blue (`#1E3A5F`), Blue (`#2563EB`), Light Gray Background (`#F8FAFC`), dan font Inter.
- **Komponen Interaktif:** Modal dialog, toast notifications, confirmation dialogs, loading skeletons shimmer, empty states, dan grafik interaktif Recharts.
- **Responsif:** Optimal untuk layar Desktop, Laptop, Tablet, hingga Smartphone.

---

## 🛠 Teknologi yang Digunakan

| Komponen | Teknologi |
| :--- | :--- |
| **Frontend Framework** | React.js 18 + Vite |
| **Bahasa Pemrograman** | TypeScript 5.5 |
| **Styling & CSS** | Tailwind CSS 3.4 + Autoprefixer |
| **Icon System** | Lucide React |
| **Data Visualization** | Recharts (BarChart & PieChart) |
| **Database Engine** | Supabase (PostgreSQL 15+) |
| **Autentikasi** | Supabase Authentication + Session Persistence |
| **Security Layer** | PostgreSQL Row Level Security (RLS) & RPC Functions |
| **Routing** | React Router DOM v6 |
| **Hosting Platform** | Vercel (SPA rewrites configured via `vercel.json`) |

---

## 🔒 Arsitektur & Keamanan Database

Database Supabase terdiri dari 6 tabel relasional yang saling terintegrasi:

```
[auth.users] (Supabase Auth)
     │
     ▼ (1:1)
[public.profiles] ─────────────┐
(id, username, full_name, role, is_active)
                               │
[public.categories]            │
     │                         │
     ▼ (1:N)                   ▼ (1:N)
[public.items] ◄──────┐   [public.borrowings]
(stock, available)    │   (code, borrower, status, created_by)
                      │        │
                      │ (1:N)  ▼ (1:N)
                      └── [public.borrowing_details]
                          (borrowing_id, item_id, quantity, returned_quantity)
                               │
                               ▼ (1:N)
                          [public.return_history]
                          (detail_id, quantity_returned, return_date, processed_by)
```

### Keamanan Row Level Security (RLS)
- Seluruh tabel (`profiles`, `categories`, `items`, `borrowings`, `borrowing_details`, `return_history`) memiliki RLS aktif.
- Helper functions `is_admin()` dan `is_active_user()` memastikan staff yang dinonaktifkan tidak dapat mengeksekusi operasi database.
- Service Role Key tidak pernah diletakkan di frontend. Seluruh transaksi frontend menggunakan `anon public key` dengan hak akses yang diawasi oleh RLS dan RPC berorientasi `SECURITY DEFINER`.

---

## 👥 Akun Demo & Hak Akses

Aplikasi dilengkapi tombol **Login Cepat Demo** di halaman login untuk mempermudah pengujian:

| Role | Username | Email | Password | Hak Akses |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | `admin` | `admin@labtrack.com` | `admin123` | Akses penuh (Inventaris, Staff, Laporan, Dashboard) |
| **Staff** | `staff` | `staff@labtrack.com` | `staff123` | Akses operasional (Peminjaman & Pengembalian barang) |

---

## 📂 Struktur Folder

```text
d:\tugas pak ary\
├── .env.example              # Template variabel lingkungan Supabase
├── index.html                # Entry point HTML & font Inter
├── package.json              # Daftar dependencies dan scripts
├── tailwind.config.js        # Konfigurasi palet warna & tipografi LabTrack
├── tsconfig.json             # Konfigurasi compiler TypeScript
├── vercel.json               # Konfigurasi routing rewrite SPA untuk Vercel
├── vite.config.ts            # Konfigurasi bundling Vite & alias '@/'
├── public/
│   └── favicon.svg           # Logo tab browser
├── supabase/
│   ├── full_setup.sql        # Skrip SQL all-in-one (Schema, RLS, RPC, Seed)
│   ├── seed.sql              # Data awal kategori & inventaris barang
│   └── migrations/
│       └── 20261112000000_initial_schema.sql
└── src/
    ├── main.tsx              # React DOM render entrypoint
    ├── App.tsx               # Router & Context wrappers
    ├── index.css             # Tailwind base & custom animations
    ├── vite-env.d.ts         # Type declarations untuk Vite client
    ├── types/
    │   └── index.ts          # Definisi antarmuka TypeScript lengkap
    ├── utils/
    │   ├── cn.ts             # Tailwind class merging utility
    │   └── formatters.ts     # Format tanggal Indonesia & badge status
    ├── lib/
    │   └── supabase.ts       # Inisialisasi Supabase client & connection detector
    ├── contexts/
    │   ├── AuthContext.tsx   # Context state autentikasi & session guard
    │   └── ToastContext.tsx  # Global toast notification provider
    ├── services/
    │   ├── api.ts            # Service layer (Supabase RPC & PostgreSQL queries)
    │   ├── mockData.ts       # Data awal seed
    │   └── storage.ts        # Persistent storage engine fallback
    ├── components/
    │   ├── ui/               # StatCard, Modal, ConfirmDialog, Skeleton, EmptyState
    │   ├── layout/           # Sidebar, Navbar, AppLayout
    │   └── common/           # SetupInfoModal
    ├── pages/
    │   ├── auth/             # LoginPage
    │   ├── admin/            # AdminDashboard
    │   ├── staff/            # StaffDashboard
    │   ├── inventory/        # InventoryPage
    │   ├── borrowing/        # BorrowingPage
    │   ├── returning/        # ReturningPage
    │   ├── users/            # UserManagementPage
    │   └── history/          # HistoryPage
    └── routes/
        ├── AppRoutes.tsx     # Route definitions
        └── ProtectedRoute.tsx# Role & authentication guards
```

---

## 🚀 Panduan Instalasi & Menjalankan Aplikasi

### 1. Prasyarat
- **Node.js** v18+ atau v20+ / v22+
- **Git**

### 2. Kloning & Instalasi Dependencies
```bash
# Masuk ke direktori proyek
cd "d:\tugas pak ary"

# Install dependensi
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env`:
```bash
cp .env.example .env
```
Isi URL dan Anon Key proyek Supabase Anda:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key-here
```
*(Catatan: Jika belum diisi, aplikasi secara cerdas beralih ke Mode Demonstrasi Lokal berbasis Persistent LocalStorage sehingga seluruh alur UI/UX tetap dapat diuji 100% tanpa kendala).*

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser di **http://localhost:3000** atau alamat yang ditampilkan oleh terminal.

### 5. Membangun Versi Produksi
```bash
npm run build
```
Hasil build siap saji akan dibuat di folder `dist/`.

---

## 🗄 Panduan Konfigurasi Supabase

Untuk menghubungkan aplikasi ke backend database PostgreSQL Supabase yang sesungguhnya:

1. **Buat Project Baru di Supabase:**
   - Masuk ke [https://supabase.com](https://supabase.com).
   - Buat project baru, tentukan nama (misal: `lab-inventory`) dan password database.

2. **Jalankan Skrip Database Lengkap:**
   - Pada panel Supabase di sebelah kiri, klik menu **SQL Editor**.
   - Klik **New Query**.
   - Buka file `supabase/full_setup.sql` di repository ini, lalu salin dan tempelkan seluruh kodenya ke SQL Editor Supabase.
   - Klik tombol **Run** (Ctrl + Enter).
   - Seluruh tabel, index, foreign key, trigger auth user, fungsi RPC atomik, kebijakan RLS, serta data seed awal barang langsung terpasang!

3. **Ambil Kredensial API:**
   - Buka menu **Project Settings** (ikon gerigi) ➔ **API**.
   - Salin **Project URL** ke `VITE_SUPABASE_URL`.
   - Salin **Project API Keys (`anon public`)** ke `VITE_SUPABASE_ANON_KEY`.

4. **Konfigurasikan Akun Demo di Supabase Auth:**
   - Buka menu **Authentication** ➔ **Users** ➔ Klik **Add User** ➔ **Create User**.
   - Masukkan Email: `admin@labtrack.com`, Password: `admin123`.
     (Trigger database akan otomatis menambahkan akun ini ke tabel `public.profiles` dengan role `admin`).
   - Tambahkan User kedua: Email: `staff@labtrack.com`, Password: `staff123`.
     (Trigger database akan otomatis memasukkannya sebagai `staff`).

---

## ☁️ Panduan Deployment ke Vercel

Aplikasi telah dilengkapi `vercel.json` agar routing SPA React Router berjalan mulus saat halaman di-refresh di production.

### Langkah Deploy:
1. Push repository proyek ini ke akun GitHub Anda:
   ```bash
   git remote add origin https://github.com/USERNAME/labtrack-system.git
   git branch -M main
   git push -u origin main
   ```
2. Buka dashboard [Vercel](https://vercel.com/) dan klik **Add New Project**.
3. Hubungkan repository GitHub Anda.
4. Pada bagian **Build and Output Settings**:
   - Framework Preset: **Vite**
   - Build Command: `npm run build`
   - Output Directory: `dist`
5. Pada bagian **Environment Variables**, tambahkan:
   - `VITE_SUPABASE_URL` = (URL Supabase Anda)
   - `VITE_SUPABASE_ANON_KEY` = (Anon Key Supabase Anda)
6. Klik **Deploy**.
7. Tunggu beberapa detik hingga Vercel memberikan URL publik (contoh: `https://labtrack-inventory.vercel.app`).

---

## ✅ Verifikasi Pengujian Fitur (18 Skenario)

| No | Skenario Pengujian | Hasil Verifikasi |
| :---: | :--- | :---: |
| 1 | Admin berhasil login dengan kredensial yang benar | **PASS** |
| 2 | Staff berhasil login dengan kredensial yang benar | **PASS** |
| 3 | Staff tidak dapat membuka halaman Admin (`/admin/dashboard`, `/users`) | **PASS** (Protected Route redirect otomatis) |
| 4 | Admin dapat menambahkan barang baru ke inventaris | **PASS** (Modal form & kode unik tervalidasi) |
| 5 | Admin dapat mengedit data barang | **PASS** (Update data & stok sinkron) |
| 6 | Admin dapat menghapus barang yang aman untuk dihapus | **PASS** (Konfirmasi dialog & proteksi pinjaman aktif) |
| 7 | Staff dapat mencatat peminjaman (multi-item) | **PASS** (Validasi formulir & stok) |
| 8 | Stok tersedia otomatis berkurang setelah peminjaman berhasil | **PASS** (Atomic RPC / state decrement) |
| 9 | Sistem menolak peminjaman jika melebihi stok yang tersedia | **PASS** (Peringatan & penolakan input &gt; stok) |
| 10 | Staff dapat memproses pengembalian barang | **PASS** (Modal pengembalian interaktif) |
| 11 | Stok tersedia otomatis bertambah setelah pengembalian | **PASS** (Atomic RPC / state increment) |
| 12 | Fitur pengembalian sebagian (partial return) berfungsi | **PASS** (Status berubah ke 'Sebagian Dikembalikan') |
| 13 | Status transaksi otomatis berubah menjadi 'Selesai' saat seluruh barang kembali | **PASS** (Pengecekan total kuantitas detail) |
| 14 | Riwayat transaksi dan audit pengembalian tersimpan rapi | **PASS** (Halaman Riwayat & Log Pengembalian) |
| 15 | Admin dapat mengelola akun Staff (tambah, edit, pencarian) | **PASS** (Manajemen Pengguna khusus Admin) |
| 16 | Akun Staff yang dinonaktifkan ditolak login | **PASS** (Pesan kesalahan eksplisit & akses diblokir) |
| 17 | Data tetap tersimpan permanen saat halaman di-refresh | **PASS** (Supabase Database / Persistent Storage) |
| 18 | Tampilan responsif dan navigasi tanpa reload (SPA) | **PASS** (Tailwind CSS Mobile Sidebar & Vite) |

---

## 📄 Lisensi & Hak Cipta
Dibuat dengan dedikasi dan standar rekayasa perangkat lunak profesional untuk **Coding Talent Challenge**.
Hak Cipta &copy; 2026 LabTrack System.

