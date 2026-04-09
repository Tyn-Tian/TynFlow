# Issue: Refactor Modul Wallet ke Layered Architecture

## Deskripsi
Saat ini, logika pengolahan data (business logic) dan interaksi langsung dengan database (Supabase) masih tergabung di dalam komponen UI (seperti pada `wallet-list.tsx`, `add-wallet-dialog.tsx`, dll). Hal ini membuat kode UI menjadi kompleks, sulit di-maintain, dan sulit dipisahkan saat ada perubahan logika bisnis.

Tujuan dari task ini adalah melakukan refactoring terhadap *Wallet Module* agar mengadopsi pola **Layered Architecture** (Arsitektur Berlapis), sehingga ada pemisahan tanggung jawab (Separation of Concerns) yang jelas antara UI, Business Logic, dan Database Interaction.

---

## Rekomendasi Struktur & Arsitektur

Berdasarkan permintaan, struktur minimal yang akan dibuat adalah `/services` dan `/repository`. 
**Rekomendasi Tambahan untuk Next.js App Router:**
Karena kita menggunakan Next.js (App Router), Client Components (UI yang interaktif, react hooks) tidak bisa memanggil kode sisi server (Supabase Server Client, business logic rahasia) secara langsung. Oleh karena itu, saya menyarankan penambahan **Action Layer (Server Actions)** sebagai jembatan.

Struktur folder yang disarankan di root project:
- `/repository/wallet-repository.ts` -> Khusus query ke Supabase.
- `/services/wallet-service.ts` -> Khusus business logic (menghubungkan repository dengan aplikasi, validasi data, dsb).
- `/actions/wallet-actions.ts` *(Rekomendasi)* -> Server Actions yang dipanggil oleh UI dan akan menjalankan layer Services. 
- `/components/wallets/...` -> UI komponen menjadi bersih, murni presentasi dan memanggil data via Server Components atau mutasi via Action.

> **Pertanyaan untuk Reviewer/Lead:** Apakah penambahan folder `/actions` menggunakan pola Next.js Server Actions bisa disetujui? Ataukah Anda lebih memilih untuk mengekspos Services melalui API Routes standar (`/app/api/...`)? Silakan putuskan sebelum implementasi dilanjutkan.

---

## Tahapan Implementasi (Step-by-Step)

Tahapan di bawah ini disusun secara berurutan agar Junior Programmer atau AI Model dapat mengimplementasikannya dengan aman tanpa merusak fitur utama.

### Tahap 1: Setup Repository Layer
1. Buat folder `/repository` di root project jika belum ada.
2. Buat file `wallet-repository.ts` di dalam folder tersebut.
3. Ekstrak logika database Supabase (CRUD: *Create*, *Read*, *Update*, *Delete*) dari komponen modal/dialog dan `wallet-list.tsx` ke dalam fungsi-fungsi di repository. Pastikan repository hanya mengembalikan raw data atau melempar error database.
   - Contoh nama fungsi: `findWalletsByUserId`, `insertWallet`, `updateWalletById`, `deleteWalletById`.

### Tahap 2: Setup Service Layer
1. Buat folder `/services` di root project jika belum ada.
2. Buat file `wallet-service.ts` di dalam folder tersebut.
3. Buat kumpulan fungsi (bisa berbasis Class atau function biasa) yang mewakili fungsi-fungsi bisnis (contoh: `getWallets`, `addWallet`, `editWallet`, `removeWallet`).
4. Fungsi di Service ini harus memanggil fungsi-fungsi dari `wallet-repository.ts`.
5. Terapkan logika bisnis di sini (misalnya memastikan `user_id` selalu disisipkan dari pemanggil sesi aktif, validasi saldo yang tidak boleh negatif secara sistematis, dll).

### Tahap 3: Pembuatan Jembatan Komunikasi (Server Actions)
1. Buat direktori `/actions` dan file `wallet-actions.ts`.
2. Di bagian paling atas file, deklarasikan `"use server"`.
3. Buat Server Actions yang akan memanggil `wallet-service.ts`. Function-function ini yang akan di-export agar bisa dipanggil oleh form submission atau handler di dalam komponen.
4. Tangani error dari service dan ubah pesannya supaya aman & mudah dipahami bagi UI.

### Tahap 4: Refactor UI Components
1. **Refactor Fetch Wallets:** Di dalam `app/(auth)/wallet/page.tsx` atau `wallet-list.tsx`, ubah cara pemanggilan data agar mengambil data dari layer Service/Action. Jika memungkinkan, *fetch data* dilakukan di Next.js Server Component (`page.tsx`), sehingga client component `wallet-list.tsx` hanya menerima *props* `wallets`.
2. **Refactor Dialogs:** Ubah `add-wallet-dialog.tsx`, `edit-wallet-dialog.tsx`, dan `delete-wallet-dialog.tsx` untuk menghapus penggunaan `createClient()` yang ditujukan langsung guna CRUD. Ganti pemanggilannya dengan menggunakan **Server Actions** yang dibuat pada Tahap 3.

### Tahap 5: Testing & Cleanup
1. Pastikan semua *flow* berjalan normal (menambah wallet, mengedit, melihat list, menghapus wallet).
2. Bersihkan `console.log` sisa-sisa debug, dan hapus dependensi atau import Supabase di UI komponen yang sudah tidak dipakai.

---

## Kriteria Selesai (Acceptance Criteria)
- [ ] Folder `/repository` terbentuk berisi file `wallet-repository.ts`.
- [ ] Folder `/services` terbentuk berisi file `wallet-service.ts`.
- [ ] Komponen UI dalam `components/wallets/` dan `app/(auth)/wallet/page.tsx` tidak lagi berisi *query* langsung ke `supabase.from("wallets")`.
- [ ] Aplikasi wallet berjalan dengan sempurna sebagaimana mestinya, tetapi struktur kode lebih moduler dan bersih.
