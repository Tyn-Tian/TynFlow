# [Live Module] Fitur Filter Berdasarkan Bulan

## Deskripsi Tugas
Tugas ini bertujuan untuk menambahkan fungsionalitas filter bulan pada halaman Live. Secara default, daftar live hanya akan menampilkan data untuk bulan berjalan (current month). Filter ini ditempatkan bersebelahan dengan tombol "Add Live".

## Persyaratan UI & Desain (Frontend-Design Skills)
- Gunakan komponen `Select` dari Shadcn UI untuk *dropdown* pemilihan bulan.
- Letakkan *dropdown* filter di sebelah kiri tombol "Add Live" dengan jarak (gap) yang proporsional agar sejajar dan rapi secara visual.
- Pastikan ukuran tombol *dropdown* seimbang dengan tombol "Add Live" (konsistensi padding dan tinggi).
- Desain *Select trigger* harus terlihat rapi dan elegan, menyatu dengan gaya komponen *Card* atau elemen *header* yang ada di proyek ini.

## Tahapan Implementasi

### 1. Pembuatan Komponen Filter Bulan (Month Filter)
- **File:** Buat komponen baru, misalnya di `components/live/live-month-filter.tsx`.
- **Tugas:**
  - Buat sebuah komponen *Client Component* (`"use client"`).
  - Gunakan `useRouter`, `usePathname`, dan `useSearchParams` dari `next/navigation` untuk mengelola *state* filter ke dalam parameter URL (misalnya `?month=2026-07`). Menggunakan URL params adalah *best practice* di Next.js App Router agar filter bisa di-share atau direfresh.
  - Gunakan komponen `Select` Shadcn UI.
  - Jika parameter `month` di URL kosong, set nilai default ke bulan saat ini (berformat `YYYY-MM`).
  - *Optionally*, buat daftar bulan (dari data live yang ada, atau *hardcode* 12 bulan terakhir) sebagai opsi *dropdown*.

### 2. Modifikasi Halaman Utama Live
- **File:** `app/(auth)/live/page.tsx`
- **Tugas:**
  - Tambahkan komponen `LiveMonthFilter` yang baru dibuat.
  - Posisikan di sebelah `AddLiveDialog` menggunakan utilitas Flexbox Tailwind (contoh: `flex items-center gap-3`).
  - Pastikan halaman ini dilengkapi dengan `<Suspense>` boundary jika diperlukan (karena menggunakan `useSearchParams` di dalam komponen turunannya).

### 3. Update Logika Filter pada Live List
- **File:** `components/live/live-list.tsx`
- **Tugas:**
  - Tambahkan `"use client"` (jika belum ada) dan panggil `useSearchParams()` untuk membaca nilai `month` dari URL.
  - Terapkan fallback ke bulan saat ini (misal: `new Date().toISOString().slice(0, 7)`) apabila URL parameter `month` tidak ditemukan.
  - Modifikasi perhitungan `useMemo` pada variabel `transactions` atau `groupedMonths` agar **hanya me-return/merender data yang bulan dan tahunnya cocok** dengan filter yang sedang aktif.
  - Jika filter diatur ke "Semua Bulan" (opsional, jika Anda ingin menambahkannya), lewati logika filter ini.

### 4. Pengujian (Testing)
- Pastikan saat *dropdown* bulan diubah, URL berubah, dan daftar data *Live* langsung ter-update (terfilter) tanpa me-reload halaman secara penuh.
- Pastikan desain UI tidak pecah pada tampilan *mobile* (responsif). 
