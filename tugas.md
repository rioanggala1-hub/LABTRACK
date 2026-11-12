# MASTER PROMPT — CODING TALENT CHALLENGE
## Laboratory Inventory & Borrowing Management System

Bertindaklah sebagai Senior Full-Stack Developer, UI/UX Designer, Database Architect, dan Software Engineer profesional.

Saya ingin kamu membangun sebuah aplikasi web bernama **Laboratory Inventory & Borrowing Management System** berdasarkan spesifikasi tugas Coding Talent Challenge.

Aplikasi ini digunakan untuk mengelola inventaris barang laboratorium komputer, transaksi peminjaman, pengembalian barang, dan pengguna sistem.

PENTING:
- Database wajib menggunakan SUPABASE (PostgreSQL).
- Aplikasi harus benar-benar berfungsi, bukan sekadar UI prototype.
- Seluruh data harus tersimpan secara permanen di Supabase.
- Aplikasi wajib dapat diakses secara online.
- Jangan menggunakan data dummy sebagai pengganti database sebenarnya.
- Jangan hanya memberikan contoh kode. Bangun seluruh proyek secara langsung di workspace.

---

# 1. TEKNOLOGI YANG DIGUNAKAN

Gunakan teknologi berikut:

Frontend:
- React.js
- Vite
- TypeScript
- Tailwind CSS
- Lucide React untuk icon
- Recharts untuk grafik dashboard

Backend dan Database:
- Supabase PostgreSQL
- Supabase Authentication
- Supabase Row Level Security (RLS)
- Supabase SQL Functions / RPC untuk transaksi stok yang aman

Deployment:
- Vercel untuk hosting.
- GitHub untuk repository.
- Supabase untuk database dan autentikasi.

Gunakan struktur kode yang modular, bersih, mudah dipahami, dan mudah dikembangkan.

---

# 2. DESAIN UI/UX APLIKASI

Buat desain aplikasi modern, profesional, minimalis, dan elegan.

Konsep desain:
- Modern Laboratory Management Dashboard.
- Clean Dashboard Design.
- Responsive Web Application.
- Sidebar Navigation.
- Topbar Navigation.
- Card-based Dashboard.
- Data Table Modern.
- Modal Form.
- Toast Notification.
- Loading Skeleton.
- Empty State.
- Confirmation Dialog.

Gunakan kombinasi warna:
- Primary: Navy Blue (#1E3A5F).
- Secondary: Blue (#2563EB).
- Background: Light Gray (#F8FAFC).
- Surface: White (#FFFFFF).
- Success: Green (#16A34A).
- Warning: Orange (#F59E0B).
- Danger: Red (#DC2626).

Gunakan font Inter.

Pastikan seluruh halaman memiliki konsistensi desain, spacing, typography, warna, tombol, input, tabel, badge, sidebar, dan topbar.

Desain harus responsive untuk desktop, tablet, dan smartphone.

---

# 3. ROLE DAN SISTEM HAK AKSES

Buat dua role pengguna:

A. ADMIN

Admin memiliki akses:
1. Login dan logout.
2. Melihat dashboard keseluruhan.
3. Melihat seluruh data inventaris.
4. Menambah barang.
5. Mengedit barang.
6. Menghapus barang.
7. Mengelola kategori barang.
8. Melihat seluruh transaksi peminjaman.
9. Memproses pengembalian barang.
10. Melihat riwayat transaksi.
11. Menambah akun Staff.
12. Mengedit akun Staff.
13. Mengaktifkan dan menonaktifkan akun Staff.
14. Melihat seluruh aktivitas sistem.

B. STAFF

Staff memiliki akses:
1. Login dan logout.
2. Melihat dashboard Staff.
3. Melihat daftar barang.
4. Mencari barang.
5. Melihat stok tersedia.
6. Mencatat transaksi peminjaman.
7. Memproses pengembalian.
8. Melihat riwayat transaksi yang relevan.

BATASAN STAFF:
- Tidak boleh menambah barang.
- Tidak boleh mengedit barang.
- Tidak boleh menghapus barang.
- Tidak boleh mengelola akun pengguna.
- Tidak boleh mengakses pengaturan Admin.

Terapkan pembatasan akses melalui frontend dan Supabase RLS, bukan hanya menyembunyikan tombol.

---

# 4. HALAMAN APLIKASI

Buat halaman berikut:

A. AUTHENTICATION

1. Login Page
- Username.
- Password.
- Show/Hide Password.
- Tombol Login.
- Validasi input.
- Pesan kesalahan apabila login gagal.
- Redirect sesuai role pengguna.

Gunakan Supabase Authentication untuk autentikasi.

Jika login menggunakan username, buat mekanisme pemetaan username ke email yang aman melalui backend/Edge Function. Jangan pernah mengekspos Supabase Service Role Key di frontend.

B. ADMIN DASHBOARD

Tampilkan:
- Total Barang.
- Total Kategori.
- Barang Tersedia.
- Barang Sedang Dipinjam.
- Total Transaksi Peminjaman.
- Total Pengembalian.
- Jumlah Staff Aktif.

Tambahkan:
- Grafik transaksi peminjaman.
- Grafik kategori barang.
- Aktivitas terbaru.
- Daftar barang yang paling sering dipinjam.
- Informasi stok barang.

Semua angka dan grafik harus mengambil data asli dari Supabase.

C. STAFF DASHBOARD

Tampilkan:
- Total Barang.
- Barang Tersedia.
- Barang Sedang Dipinjam.
- Total Transaksi Staff.
- Aktivitas peminjaman terbaru.
- Daftar barang yang tersedia.

D. MANAJEMEN BARANG

Buat halaman inventaris dengan fitur:

- Tabel daftar barang.
- Pencarian barang.
- Filter kategori.
- Filter ketersediaan.
- Tambah barang.
- Edit barang.
- Hapus barang (Admin).
- Detail barang.

Data barang:
- Kode Barang.
- Nama Barang.
- Kategori.
- Deskripsi.
- Total Stok.
- Stok Tersedia.
- Stok Dipinjam.
- Kondisi Barang.
- Tanggal Ditambahkan.

Gunakan modal untuk tambah dan edit barang.

Pastikan kode barang bersifat unik.

Barang yang sedang dipinjam tidak boleh dihapus sembarangan.

E. MANAJEMEN PEMINJAMAN

Buat halaman transaksi peminjaman.

Form peminjaman berisi:
- Nama Peminjam.
- Identitas/NIM Peminjam (opsional).
- Pilih Barang.
- Jumlah Barang.
- Tanggal Peminjaman.
- Rencana Tanggal Pengembalian (opsional).
- Catatan.

Fitur:
- Tambah transaksi.
- Tambah beberapa barang dalam satu transaksi.
- Validasi stok.
- Simpan transaksi.
- Lihat detail transaksi.
- Cari transaksi.
- Filter status transaksi.

Status transaksi:
- Dipinjam.
- Sebagian Dikembalikan.
- Selesai.

Setelah peminjaman berhasil, stok tersedia harus otomatis berkurang.

Jangan izinkan jumlah peminjaman melebihi stok tersedia.

G. MANAJEMEN PENGEMBALIAN

Buat halaman pengembalian barang.

Fitur:
- Menampilkan transaksi yang belum selesai.
- Menampilkan nama peminjam.
- Menampilkan daftar barang yang dipinjam.
- Menampilkan jumlah yang dipinjam.
- Menampilkan jumlah yang sudah dikembalikan.
- Input jumlah pengembalian.
- Tombol proses pengembalian.
- Riwayat pengembalian.

Sistem harus mendukung pengembalian sebagian maupun seluruh barang.

Setelah pengembalian berhasil:
- Stok tersedia bertambah sesuai jumlah barang yang dikembalikan.
- Jumlah barang yang belum dikembalikan diperbarui.
- Status transaksi diperbarui.
- Riwayat pengembalian disimpan.

Hindari pengembalian ganda dan pengembalian melebihi jumlah yang masih dipinjam.

H. MANAJEMEN PENGGUNA

Khusus Admin.

Fitur:
- Daftar Staff.
- Tambah Staff.
- Edit Staff.
- Aktifkan Staff.
- Nonaktifkan Staff.
- Pencarian Staff.
- Detail Staff.

Data Staff:
- Nama Lengkap.
- Username.
- Email.
- Password saat pembuatan akun.
- Role.
- Status Akun.

Gunakan mekanisme pembuatan akun yang aman. Jangan menempatkan Service Role Key di browser.

I. RIWAYAT TRANSAKSI

Buat halaman riwayat yang memuat:
- Kode Transaksi.
- Nama Peminjam.
- Barang.
- Jumlah.
- Tanggal Peminjaman.
- Tanggal Pengembalian.
- Petugas.
- Status.

Tambahkan:
- Search.
- Filter tanggal.
- Filter status.
- Detail transaksi.

Admin dapat melihat seluruh transaksi, sedangkan Staff hanya dapat melihat transaksi yang relevan sesuai kebijakan akses.

---

# 5. DATABASE SUPABASE

Buat database menggunakan Supabase PostgreSQL.

Minimal gunakan tabel:

1. profiles
Kolom:
- id (UUID, relasi auth.users).
- username.
- full_name.
- role.
- is_active.
- created_at.
- updated_at.

2. categories
Kolom:
- id.
- category_name.
- description.
- created_at.

3. items
Kolom:
- id.
- item_code.
- item_name.
- category_id.
- description.
- stock.
- available_stock.
- condition.
- created_at.
- updated_at.

4. borrowings
Kolom:
- id.
- borrowing_code.
- borrower_name.
- borrower_identity.
- borrowing_date.
- expected_return_date.
- status.
- notes.
- created_by.
- created_at.

5. borrowing_details
Kolom:
- id.
- borrowing_id.
- item_id.
- quantity.
- returned_quantity.
- created_at.

6. return_history
Kolom:
- id.
- borrowing_detail_id.
- quantity_returned.
- return_date.
- notes.
- processed_by.
- created_at.

Buat foreign key, index, constraint, dan relasi antar tabel dengan benar.

Gunakan UUID sebagai primary key.

Buat SQL migration lengkap agar database dapat dibuat melalui Supabase SQL Editor.

Pastikan setiap perubahan transaksi stok dilakukan secara atomik menggunakan PostgreSQL function/RPC agar tidak terjadi stok negatif atau ketidaksesuaian stok akibat transaksi bersamaan.

Buat validasi:
- Stock tidak boleh negatif.
- Available Stock tidak boleh negatif.
- Jumlah pinjaman harus lebih dari nol.
- Jumlah pengembalian tidak boleh melebihi jumlah yang belum dikembalikan.
- Kode barang harus unik.
- Kode transaksi harus unik.

---

# 6. SUPABASE AUTHENTICATION DAN SECURITY

Konfigurasikan Supabase Authentication.

Persyaratan:
- Login menggunakan username dan password sesuai kebutuhan aplikasi.
- Role Admin dan Staff.
- Proteksi halaman berdasarkan role.
- Logout.
- Session persistence.
- Protected Routes.
- Validasi akun aktif.
- Penanganan session expired.

Buat Row Level Security (RLS) pada seluruh tabel.

Aturan:
- Admin dapat mengelola data sesuai kewenangannya.
- Staff hanya dapat melakukan operasi yang diizinkan.
- Staff tidak dapat menghapus atau mengubah inventaris.
- Staff tidak dapat mengelola pengguna.
- Pengguna tidak boleh mengubah role miliknya sendiri.
- Pengguna tidak boleh mengakses data yang tidak diizinkan.

Jangan pernah:
- Menaruh Service Role Key di frontend.
- Menonaktifkan RLS hanya agar aplikasi berjalan.
- Mempercayai role dari localStorage.
- Menggunakan autentikasi palsu.

---

# 7. DATA SEED AWAL

Masukkan minimal lima data berikut:

| Kode | Nama Barang | Stok |
| BR001 | Laptop Lenovo | 5 |
| BR002 | Mouse Logitech | 10 |
| BR003 | Keyboard Mechanical | 8 |
| BR004 | Proyektor Epson | 3 |
| BR005 | Monitor LG | 6 |

Tambahkan kategori:
- Komputer.
- Perangkat Input.
- Perangkat Output.
- Perangkat Jaringan.

Buat SQL seed yang dapat dijalankan dengan aman tanpa membuat data duplikat ketika dijalankan ulang.

Buat akun demo:
- Admin.
- Staff.

Akun harus dibuat melalui Supabase Authentication dan profilnya disinkronkan ke tabel profiles.

Jangan menuliskan password demo ke repository publik.

---

# 8. STRUKTUR PROJECT

Gunakan struktur folder yang terorganisasi, misalnya:

src/
  components/
    ui/
    layout/
    dashboard/
    inventory/
    borrowing/
    returning/
  pages/
    auth/
    admin/
    staff/
  hooks/
  contexts/
  services/
  lib/
    supabase.ts
  types/
  utils/
  routes/

supabase/
  migrations/
  seed.sql
  functions/

Buat komponen reusable untuk:
- Sidebar.
- Topbar.
- Stat Cards.
- Data Tables.
- Modal.
- Form.
- Search.
- Filter.
- Pagination.
- Notification.
- Loading State.

---

# 9. PENGUJIAN APLIKASI

Lakukan pengujian terhadap seluruh fitur.

Skenario pengujian:

1. Admin berhasil login.
2. Staff berhasil login.
3. Staff tidak dapat membuka halaman Admin.
4. Admin dapat menambahkan barang.
5. Admin dapat mengedit barang.
6. Admin dapat menghapus barang yang aman untuk dihapus.
7. Staff dapat melakukan peminjaman.
8. Stok otomatis berkurang setelah peminjaman.
9. Sistem menolak peminjaman melebihi stok.
10. Staff dapat melakukan pengembalian.
11. Stok otomatis bertambah setelah pengembalian.
12. Pengembalian sebagian berfungsi.
13. Status transaksi berubah menjadi selesai setelah seluruh barang dikembalikan.
14. Riwayat transaksi tersimpan.
15. Admin dapat mengelola akun Staff.
16. Akun Staff nonaktif tidak dapat login atau menggunakan aplikasi.
17. Data tetap tersedia setelah halaman di-refresh.
18. Seluruh fitur dapat diuji melalui URL publik.

Perbaiki seluruh error yang ditemukan.

Jangan menganggap aplikasi selesai hanya karena halaman berhasil ditampilkan.

---

# 10. DEPLOYMENT

Deploy aplikasi ke Vercel.

Persyaratan:
- Aplikasi dapat diakses melalui URL publik.
- Konfigurasi Supabase URL dan Anon/Publishable Key menggunakan environment variables.
- Buat file .env.example tanpa secret.
- Konfigurasikan redirect URL Supabase Authentication.
- Pastikan routing React berjalan saat halaman di-refresh.
- Pastikan database Supabase dapat diakses dari aplikasi online.
- Pastikan login dan transaksi berfungsi di production.

Jangan menggunakan localhost sebagai URL pengumpulan.

---

# 11. HASIL AKHIR YANG HARUS DIKERJAKAN

Saya ingin kamu menyelesaikan proyek sampai benar-benar siap diuji.

Hasil yang wajib disediakan:

1. Source code lengkap.
2. Seluruh halaman aplikasi.
3. Database schema SQL.
4. SQL migration.
5. SQL seed data.
6. Supabase Authentication.
7. RLS policies.
8. RPC functions untuk transaksi stok.
9. Akun demo Admin dan Staff.
10. File .env.example.
11. README.md berisi panduan instalasi.
12. Panduan konfigurasi Supabase.
13. Panduan menjalankan aplikasi.
14. Panduan deployment Vercel.
15. Repository GitHub.
16. URL aplikasi yang sudah online.

---

# 12. ATURAN PENGERJAAN AI AGENT

Kerjakan proyek secara bertahap dan jangan melewatkan fitur wajib.

Tahap 1: Analisis kebutuhan dan rancang arsitektur aplikasi.

Tahap 2: Buat desain UI/UX dan design system.

Tahap 3: Buat database Supabase, relasi, migration, seed, dan RLS.

Tahap 4: Implementasikan autentikasi dan role Admin/Staff.

Tahap 5: Implementasikan seluruh halaman dan fitur aplikasi.

Tahap 6: Hubungkan seluruh frontend dengan database Supabase.

Tahap 7: Lakukan pengujian semua fungsi dan perbaiki error.

Tahap 8: Deploy ke Vercel.

Tahap 9: Siapkan dokumentasi dan akun demo.

Jika ada konfigurasi yang membutuhkan tindakan manual dari saya, jelaskan secara spesifik:
- Menu yang harus dibuka.
- Pengaturan yang harus diisi.
- SQL yang harus dijalankan.
- Environment variables yang harus ditambahkan.

Jangan mengarang URL, kredensial, atau menyatakan deployment berhasil sebelum benar-benar diverifikasi.

Jika ada informasi yang belum tersedia, gunakan keputusan teknis yang aman dan masuk akal, lalu jelaskan asumsi tersebut.

**TARGET AKHIR: Aplikasi Laboratory Inventory & Borrowing Management System yang profesional, responsif, aman, terhubung sepenuhnya dengan Supabase, dan siap dipresentasikan serta diuji oleh dosen.**