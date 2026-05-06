# TynFlow

TynFlow adalah aplikasi manajemen keuangan pribadi dan pelacakan berbasis web yang dirancang untuk membantu pengguna mengelola transaksi (Pemasukan, Pengeluaran, Investasi), memantau anggaran (Budget), serta melacak portofolio dan dompet (Wallet) secara terpusat. Aplikasi ini juga memiliki fitur tambahan untuk manajemen pekerjaan (Job) dan pemantauan langsung (Live).

## 🏗️ Arsitektur & Struktur Folder

Aplikasi ini menggunakan pola arsitektur yang memisahkan antara UI, state/business logic (*Services*), dan data access layer (*Repository*). Struktur folder utamanya adalah sebagai berikut:

- **`app/`**: Berisi routing aplikasi menggunakan fitur Next.js App Router.
  - **`(auth)/`**: Grup route yang diproteksi (membutuhkan autentikasi), menampung semua halaman modul utama aplikasi.
  - **`api/`**: Endpoint API internal Next.js.
  - **`login/`**: Halaman autentikasi pengguna.
- **`components/`**: Kumpulan komponen UI yang dapat digunakan kembali (*reusable*), termasuk komponen-komponen dasar (menggunakan komponen berbasis Shadcn UI) dan komponen spesifik fitur.
- **`services/`**: Layer yang menangani *business logic*, agregasi data, serta pemrosesan data sebelum ditampilkan ke UI.
- **`repository/`**: Layer akses data (*Data Access Layer*) yang bertanggung jawab penuh untuk melakukan operasi CRUD langsung ke database (Supabase).
- **`actions/`**: Berisi Next.js Server Actions untuk mutasi data secara *server-side*.
- **`hooks/`**: Kumpulan Custom React Hooks untuk merangkum *stateful logic* (contoh: `useShipment`).
- **`lib/`**: Fungsi-fungsi utilitas umum, konfigurasi, dan *helper* (misalnya utils untuk styling, formatter angka, dll).

## 🧩 Modul Tersedia

TynFlow memiliki beberapa modul utama yang terletak di dalam route `app/(auth)/`:

1. **Dashboard (`/dashboard`)**: Halaman ringkasan utama yang menampilkan analitik dan grafik transaksi (misal: *Stacked Bar Chart* untuk Pemasukan vs Pengeluaran).
2. **Transaction (`/transaction`)**: Modul untuk mencatat dan mengelola aktivitas keuangan seperti Pemasukan (*Income*), Pengeluaran (*Expense*), dan Investasi (*Invest*).
3. **Budget (`/budget`)**: Modul untuk menetapkan dan memantau target anggaran pengeluaran. Dilengkapi kalkulasi analitik harian seperti *Daily Spending* dan *Total Realization*.
4. **Portfolio (`/portfolio`)**: Modul untuk melacak performa dan alokasi aset investasi pengguna.
5. **Wallet (`/wallet`)**: Modul manajemen dompet atau rekening, melacak saldo aktif dari berbagai sumber yang berubah seiring adanya transaksi.
6. **Job (`/job`)**: Modul pelacakan pekerjaan atau pengiriman barang (*Shipment Tracker*).
7. **Live (`/live`)**: Modul pelacakan atau pemantauan data secara *real-time*.

## 🚀 Teknologi yang Digunakan (Tech Stack)

Aplikasi ini dibangun menggunakan teknologi web modern:

- **Framework:** Next.js (v16.1 - App Router)
- **Library UI:** React (v19)
- **Bahasa Pemrograman:** TypeScript
- **Styling:** Tailwind CSS (v4)
- **Backend & Database:** Supabase (menggunakan `@supabase/ssr` & `@supabase/supabase-js`)

### Library Pendukung:
- **UI Primitives & Components:** Radix UI & Shadcn UI (dibantu dengan `class-variance-authority`, `clsx`, `tailwind-merge`)
- **Form & Validasi:** React Hook Form terintegrasi dengan Zod
- **Tabel Data:** TanStack React Table (`@tanstack/react-table`)
- **Grafik / Chart:** Recharts
- **Drag & Drop:** `@dnd-kit` (core, sortable, utilities)
- **Ikon:** Lucide React & Tabler Icons
- **Notifikasi:** Sonner
- **Lainnya:** `date-fns` (manipulasi waktu), `next-themes` (Dark/Light mode)

## 🛠️ Cara Setup Project

Ikuti langkah-langkah berikut untuk menjalankan proyek ini di mesin lokal Anda:

1. **Clone Repository**
   ```bash
   git clone <url-repository>
   cd tynflow
   ```

2. **Install Dependencies**
   Pastikan Anda menggunakan Node.js versi terbaru (>= v20 direkomendasikan).
   ```bash
   npm install
   # atau
   yarn install
   # atau
   pnpm install
   ```

3. **Konfigurasi Environment Variables**
   Buat file `.env.local` di root folder proyek, kemudian masukkan kredensial Supabase Anda:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
   *(Cek file `.env` yang sudah ada untuk melihat detail key lain yang dibutuhkan).*

## ▶️ Cara Menjalankan Aplikasi

Setelah setup selesai, Anda dapat menjalankan server pengembangan (*development server*) dengan perintah berikut:

```bash
npm run dev
# atau
yarn dev
# atau
pnpm dev
```

Buka [http://localhost:3000](http://localhost:3000) di browser Anda untuk melihat aplikasi berjalan secara lokal.

Jika ingin melakukan proses *build* ke tahap produksi, gunakan:
```bash
npm run build
npm run start
```
