# LabTrack — Laboratory Inventory & Borrowing Management System

[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?logo=vercel&logoColor=white)](https://labtrack-ivory.vercel.app/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

Aplikasi web profesional untuk **Manajemen Inventaris & Transaksi Peminjaman Alat Laboratorium Komputer**, mendukung pencatatan peminjaman multi-barang, pengembalian bertahap (parsial/penuh), kalkulasi stok atomik anti race-condition, serta otorisasi multi-role (Admin & Staff) berbasis **React 18**, **TypeScript**, **Tailwind CSS**, dan **Supabase PostgreSQL**.

---

## 🎓 Informasi Akademik & Proyek

| Informasi | Detail |
| :--- | :--- |
| **Nama Pengembang** | **Rio Anggala** |
| **NIM** | **241420035** |
| **Dosen Pembimbing** | **Ari Muzakir, S.Kom., M.Cs.** |
| **Nama Proyek** | LabTrack (Sistem Manajemen Inventaris & Peminjaman Laboratorium) |
| **Live Production URL** | [https://labtrack-ivory.vercel.app](https://labtrack-ivory.vercel.app) |
| **Repository GitHub** | [https://github.com/rioanggala1-hub/LABTRACK](https://github.com/rioanggala1-hub/LABTRACK) |

---

## 📑 Daftar Isi

1. [Fitur Utama](#-fitur-utama)
2. [Teknologi yang Digunakan](#-teknologi-yang-digunakan)
3. [Arsitektur & Keamanan Database](#-arsitektur--keamanan-database)
4. [Akun Autentikasi & Hak Akses](#-akun-autentikasi--hak-akses)
5. [Struktur Folder](#-struktur-folder)
6. [Panduan Instalasi & Menjalankan Lokal](#-panduan-instalasi--menjalankan-lokal)
7. [Panduan Konfigurasi Supabase](#-panduan-konfigurasi-supabase)
8. [Panduan Deployment ke Vercel](#-panduan-deployment-ke-vercel)
9. [Matriks Verifikasi Pengujian (18 Skenario)](#-matriks-verifikasi-pengujian-18-skenario)
10. [Lisensi & Penutup](#-lisensi--penutup)

---

## 🌟 Fitur Utama

### 1. Manajemen Pengguna Multi-Role (RBAC)
- **Role Admin:**
  - **Analytics Dashboard:** Ringkasan KPI total inventaris, alat dipinjam, stok kritis, dan total pengguna aktif disertai visualisasi chart Recharts.
  - **Manajemen Inventaris:** Menambah alat baru, memperbarui detail barang, serta menghapus barang (terproteksi: alat yang sedang aktif dipinjam tidak dapat dihapus).
  - **Manajemen Kategori:** Mengelompokkan inventaris ke dalam kategori (Komputer, Input, Output, Jaringan, dll.).
  - **Manajemen Akun Staff:** Mendaftarkan staf baru, mengedit profil staf, serta menonaktifkan akun staf (staf nonaktif ditolak masuk sistem).
  - **Audit Riwayat & Export CSV:** Melihat seluruh transaksi peminjaman/pengembalian dan mengekspor laporan ke format `.csv`.
- **Role Staff:**
  - **Operational Dashboard:** Fokus pada ketersediaan stok fisik dan peminjaman yang sedang berlangsung.
  - **Pencatatan Peminjaman Multi-Item:** Memproses peminjaman beberapa jenis alat sekaligus dalam satu nomor transaksi (`BRW-YYYYMMDD-XXXX`).
  - **Pengembalian Bertahap (Partial Return):** Memproses pengembalian alat secara parsial (sebagian) atau penuh (selesai).
  - **Pembatasan Akses:** Staf tidak dapat mengakses halaman pengaturan akun, menambah/menghapus barang, maupun mengubah konfigurasi sistem.

### 2. Transaksi Stok Atomik (PostgreSQL RPC Functions)
- **Zero Race Condition & Negative Stock Prevention:** Perubahan stok saat peminjaman (`borrow_items_atomic`) dan pengembalian (`return_items_atomic`) dieksekusi di level database PostgreSQL Supabase dengan `SELECT ... FOR UPDATE` dan transaksi atomik, menjamin integritas stok fisik dan stok tersedia selalu sinkron.
- **Peminjaman Fleksibel Multi-Item:** Mahasiswa/dosen dapat meminjam beragam periferal dalam 1 form (misal: 1 Laptop + 2 Mouse + 1 Proyektor).
- **Pengembalian Bertahap:** Status transaksi otomatis berevolusi dari `Dipinjam` ➔ `Sebagian Dikembalikan` ➔ `Selesai` berdasarkan kuantitas alat yang telah diserahkan kembali.

### 3. UI/UX Modern SaaS Dashboard
- **Design System Standar Enterprise:** Palet warna Navy Blue (`#142D4E`), Royal Blue (`#2563EB`), Cyan (`#06B6D4`), Soft Background (`#F4F7FB`), serta tipografi modern *Plus Jakarta Sans*.
- **Interaksi Halus & Responsif:** Komponen modal dialog interaktif, toast notifications, loading skeleton shimmer, konfirmasi penghapusan, dan mobile sidebar drawer yang responsif di Desktop, Tablet, hingga Smartphone.

---

## 🛠 Teknologi yang Digunakan

| Layer | Teknologi | Versi | Peran / Kegunaan |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | React | 18.3 | User interface berbasis komponen reaktif |
| **Bundler & Tooling** | Vite | 5.4 | Build tool modern, fast HMR & TypeScript loader |
| **Language** | TypeScript | 5.5 | Type safety, penanganan interface data transaksi |
| **Styling** | Tailwind CSS | 3.4 | Utilitas styling modern, custom color token & animasi |
| **Icons** | Lucide React | 0.441 | Iconography konsisten dan modern |
| **Data Visualization** | Recharts | 2.12 | Grafik distribusi kategori dan tren aktivitas |
| **Database Engine** | Supabase (PostgreSQL) | 15+ | Relational database, RPC functions, Triggers |
| **Security Layer** | Row Level Security (RLS) | - | Kebijakan akses data di level baris tabel |
| **Autentikasi** | Supabase Auth | - | Session persistence, JWT tokens, RBAC guard |
| **Cloud Hosting** | Vercel | - | Production deployment with SPA rewrites |

---

## 🔒 Arsitektur & Keamanan Database

Database Supabase terdiri dari 6 tabel relasional yang saling terhubung:

```text
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
- Seluruh tabel (`profiles`, `categories`, `items`, `borrowings`, `borrowing_details`, `return_history`) diproteksi dengan RLS aktif.
- Helper function `is_admin()` dan `is_active_user()` memastikan pengguna yang tidak sah atau akun staf nonaktif tidak dapat melakukan modifikasi database.
- Database service secret key hanya digunakan pada layer administratif dan tidak pernah diekspos di frontend.

---

## 👥 Akun Autentikasi & Hak Akses

Aplikasi menyediakan akun siap pakai dan fitur **Quick 1-Click Demo Login** pada antarmuka login:

| Role | Nama Pengguna | Email | Password | Hak Akses Utama |
| :--- | :--- | :--- | :--- | :--- |
| **Admin** | **Rio Anggala (Admin)** | `rio@labtrack.com` | `admin123` | Akses Penuh: Inventaris, Kategori, Staf, Laporan, Dashboard |
| **Admin** | Super Admin | `admin@labtrack.com` | `admin123` | Akses Penuh Administrator |
| **Staff** | Staff Laboratorium | `staff@labtrack.com` | `staff123` | Akses Operasional: Peminjaman & Pengembalian Barang |

---

## 📂 Struktur Folder

```text
d:\tugas pak ary\
├── .env                      # File konfigurasi environment lokal
├── .env.example              # Template variabel lingkungan
├── index.html                # Entry point HTML & Google Fonts
├── package.json              # Dependensi dan scripts Node.js
├── tailwind.config.js        # Konfigurasi tema warna dan animasi
├── tsconfig.json             # Konfigurasi compiler TypeScript
├── vercel.json               # Konfigurasi rewrites SPA di Vercel
├── vite.config.ts            # Konfigurasi bundling Vite
├── supabase/
│   ├── full_setup.sql        # Skrip database lengkap (Schema, RLS, RPC, Seed)
│   ├── seed.sql              # Data awal kategori & inventaris
│   └── migrations/
└── src/
    ├── main.tsx              # React mounting point
    ├── App.tsx               # Context provider & route container
    ├── index.css             # Tailwind base & layout directives
    ├── types/
    │   └── index.ts          # Definisi interface TypeScript (Item, Borrowing, Profile)
    ├── lib/
    │   └── supabase.ts       # Client Supabase & auto-connection detector
    ├── contexts/
    │   ├── AuthContext.tsx   # Pengelolaan state autentikasi & session login
    │   └── ToastContext.tsx  # Sistem notifikasi toast global
    ├── services/
    │   ├── api.ts            # Service layer integrasi Supabase RPC & query
    │   ├── mockData.ts       # Mock data cadangan
    │   └── storage.ts        # LocalStorage fallback engine
    ├── components/
    │   ├── ui/               # StatCard, Modal, ConfirmDialog, Skeleton, EmptyState
    │   ├── layout/           # Modern Sidebar, Header Navbar, AppLayout
    │   └── common/           # SetupInfoModal
    ├── pages/
    │   ├── auth/             # LoginPage (dengan 1-Click Demo Cards)
    │   ├── admin/            # AdminDashboard (SaaS Modern Redesign)
    │   ├── staff/            # StaffDashboard
    │   ├── inventory/        # InventoryPage (Katalog & CRUD Barang)
    │   ├── borrowing/        # BorrowingPage (Transaksi Multi-Item)
    │   ├── returning/        # ReturningPage (Pemrosesan Pengembalian)
    │   ├── users/            # UserManagementPage (Kelola Akun Staf)
    │   └── history/          # HistoryPage (Audit Trail & CSV Export)
    └── routes/
        ├── AppRoutes.tsx     # Definisi routing aplikasi
        └── ProtectedRoute.tsx# Route guard berbasis hak akses & role
```

---

## 🚀 Panduan Instalasi & Menjalankan Lokal

### 1. Prasyarat Sistem
- **Node.js** versi 18.x / 20.x / 22.x
- **Git**

### 2. Kloning & Instalasi Dependencies
```bash
# Masuk ke direktori proyek
cd "d:\tugas pak ary"

# Install dependensi
npm install
```

### 3. Konfigurasi Lingkungan (`.env`)
Salin file `.env.example` menjadi `.env` lalu sesuaikan isinya:
```env
VITE_SUPABASE_URL=https://eposjvzxfxjikhfxaqxg.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_4YrebWRF0gppANTQToNPWQ_CqV01aXV
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka browser pada alamat: **http://localhost:3000**

### 5. Build Versi Produksi
```bash
npm run build
```
File build optimal akan dihasilkan di folder `dist/`.

---

## 🗄 Panduan Konfigurasi Supabase

Untuk memasang database baru di platform Supabase:

1. Buka [Supabase Dashboard](https://supabase.com).
2. Buat project baru.
3. Buka menu **SQL Editor** ➔ **New Query**.
4. Buka file `supabase/full_setup.sql`, salin seluruh kodenya, tempel ke SQL Editor, lalu klik **Run**.
5. Buka menu **Project Settings** ➔ **API**, salin **Project URL** dan **Anon Key** ke dalam file `.env`.
6. Pengguna awal (`admin@labtrack.com`, `staff@labtrack.com`, dan `rio@labtrack.com`) akan otomatis dibuatkan profil dengan hak akses masing-masing.

---

## ☁️ Panduan Deployment ke Vercel

Proyek ini telah dikonfigurasi dengan file `vercel.json` untuk menangani routing SPA (Single Page Application):

1. Hubungkan repository GitHub [LABTRACK](https://github.com/rioanggala1-hub/LABTRACK) ke Vercel.
2. Pada menu **Project Settings ➔ Environment Variables**, masukkan:
   - `VITE_SUPABASE_URL` = `https://eposjvzxfxjikhfxaqxg.supabase.co`
   - `VITE_SUPABASE_ANON_KEY` = `sb_publishable_4YrebWRF0gppANTQToNPWQ_CqV01aXV`
3. Jalankan **Deploy** atau **Redeploy**.
4. Website aktif dapat diakses publik pada:  
   👉 **[https://labtrack-ivory.vercel.app](https://labtrack-ivory.vercel.app)**

---

## ✅ Matriks Verifikasi Pengujian (18 Skenario)

| No | Skenario Pengujian | Hasil | Keterangan Verifikasi |
| :---: | :--- | :---: | :--- |
| 1 | Admin berhasil login dengan email & password yang valid | **PASS** | Token JWT diterima & diarahkan ke `/admin/dashboard` |
| 2 | Staff berhasil login dengan akun staf yang valid | **PASS** | Token JWT diterima & diarahkan ke `/staff/dashboard` |
| 3 | Staff diblokir saat mencoba membuka halaman Admin (`/admin/dashboard`, `/users`) | **PASS** | `ProtectedRoute` otomatis me-redirect ke dashboard staf |
| 4 | Admin dapat menambahkan barang baru ke inventaris | **PASS** | Form modal tervalidasi, kode unik dicek, tersimpan ke DB |
| 5 | Admin dapat memperbarui informasi & stok barang | **PASS** | Data ter-update realtime di tabel inventaris |
| 6 | Admin tidak dapat menghapus barang yang sedang dalam peminjaman aktif | **PASS** | Validasi memunculkan error proteksi relasi transaksi |
| 7 | Staff dapat mencatat transaksi peminjaman multi-barang | **PASS** | Transaksi atomik menyimpan header & detail peminjaman |
| 8 | Stok tersedia (`available_stock`) otomatis berkurang setelah peminjaman | **PASS** | RPC Function `borrow_items_atomic` mengurangi stok |
| 9 | Sistem menolak peminjaman jika jumlah melebihi stok yang tersedia | **PASS** | Validasi input & database memblokir transaksi berlebih |
| 10 | Staff dapat membuka formulir pengembalian barang | **PASS** | Modal menampilkan sisa kuantitas alat yang belum kembali |
| 11 | Stok tersedia otomatis bertambah saat pengembalian diproses | **PASS** | RPC Function `return_items_atomic` menambah kembali stok |
| 12 | Fitur pengembalian sebagian (partial return) berfungsi dengan akurat | **PASS** | Status transaksi otomatis menjadi `Sebagian Dikembalikan` |
| 13 | Status transaksi otomatis berubah menjadi `Selesai` saat semua alat kembali | **PASS** | Logika kalkulasi memeriksa kesesuaian total kuantitas |
| 14 | Riwayat pengembalian dan audit peminjaman tersimpan lengkap | **PASS** | Tabel `return_history` mencatat tanggal, staf, & catatan |
| 15 | Admin dapat mengelola akun staf (tambah, edit, pencarian) | **PASS** | Menu Manajemen Pengguna berfungsi penuh |
| 16 | Akun staf yang dinonaktifkan ditolak masuk ke dalam sistem | **PASS** | RLS & validasi login menolak akses akun nonaktif |
| 17 | Data tetap tersimpan permanen saat halaman di-refresh | **PASS** | PostgreSQL Supabase menyimpan data persisten di cloud |
| 18 | Navigasi halaman cepat tanpa reload serta antarmuka responsif mobile | **PASS** | SPA Client-side Routing & Responsive Sidebar Drawer |

---

## 📄 Lisensi & Penutup

Proyek ini dikembangkan oleh **Rio Anggala** (NIM: **241420035**) di bawah bimbingan dosen **Ari Muzakir, S.Kom., M.Cs.** sebagai implementasi sistem manajemen laboratorium berbasis teknologi web modern.

Hak Cipta &copy; 2026 **LabTrack System**. Seluruh hak cipta dilindungi undang-undang.
