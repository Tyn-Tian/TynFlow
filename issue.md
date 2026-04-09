# Refactor Modul Budget Menggunakan Layered Architecture

## Deskripsi Tugas
Melanjutkan inisiatif perbaikan arsitektur kode (seperti yang sudah dilakukan pada modul Wallet dan Transaction), kita perlu melakukan *refactor* pada modul **Budget**. Saat ini komponen antarmuka (UI) pada modul Budget masih melakukan pemanggilan langsung ke *Supabase Client*. Kita akan memindahkannya ke dalam *Layered Architecture*.

> **Terkait Struktur Arsitektur**: Struktur yang kita jalankan saat ini (`Repository -> Service -> Action -> UI`) sudah sangat direkomendasikan untuk Next.js dengan App Router. Struktur ini memisahkan interaksi database, *business logic*, jembatan komunikasi ke *client* (Server Actions), dan tampilan (UI) dengan sangat rapi dan aman. Oleh karena itu, kita akan melanjutkan pola yang sama tanpa perlu menambah kerumitan baru.

## Tujuan Utama
1. Memusatkan kueri *database* terkait *budget* ke dalam **Repository Layer**.
2. Memusatkan *business logic* terkait *budget* ke dalam **Service Layer**.
3. Menyediakan **Action Layer** (Server Actions) agar komponen *client* (UI) tidak perlu mengakses *database* (*Supabase Client*) secara langsung.
4. Memastikan konsistensi data, terutama kaitannya dengan modul **Transaction** (transaksi pengeluaran yang terhubung ke *budget*).

---

## Tahapan Implementasi

### FASE 1: Melengkapi Repository Layer (`/repository/budget-repository.ts`)
*File ini sebelumnya sudah dibuat sebagian dari refactor modul Transaction (berisi `getBudgetsByUserId` dsb), lengkapi fungsinya.*

1. **Tambahkan Fungsi CRUD Tambahan**:
   - Fungsi untuk mengambil satu data budget (`getBudgetById`).
   - Fungsi untuk menyimpan budget baru (`insertBudget`).
   - Fungsi untuk memperbarui budget (`updateBudgetById`).
   - Fungsi untuk menghapus budget (`deleteBudgetById`).
   - *Catatan: Pastikan semua kueri ini murni interaksi Supabase dengan menargetkan tabel `budgets`.*

### FASE 2: Melengkapi Service Layer (`/services/budget-service.ts`)
*File ini adalah pusat business logic.*

1. **Buat Fungsi Operasi Utama**:
   - `getBudget`: mengambil data satu budget dengan memanggil fungsi repository.
   - `addBudget`: memvalidasi input dan menyimpan budget baru ke repository.
   - `editBudget`: memvalidasi perubahan nilai *budget limit*, menghitung ulang nilai *leftover* jika *limit* berubah, lalu menyimpannya ke repository.
   - `removeBudget`: menghapus *budget*. 
2. **Penanganan Cross-Module (Budget ↔ Transaction)**:
   - Saat *budget* dihapus (`removeBudget`), pastikan kita memikirkan dampak pada *Transaction* (seperti mengatur *budget_id* menjadi `null` atau logika penghapusan terkait). Konsultasikan atau cek skema *database* apakah Supabase sudah menangani lewat *Cascade/Set Null*. Jika butuh pembaruan pada data transaksi, panggil fungsi `updateTransactionById` dari `transaction-repository` secara langsung dari dalam `budget-service`.

### FASE 3: Melengkapi Action Layer (`/actions/budget-actions.ts`)
*Action (Server Actions) menjadi jembatan antara komponen client dan service layer.*

1. **Buat Server Actions Baru**:
   - `addBudgetAction`: memanggil `budgetService.addBudget`, lalu panggil `revalidatePath("/budget")` dan rute terkait lainnya.
   - `editBudgetAction`: memanggil `budgetService.editBudget`, lalu revalidasi.
   - `removeBudgetAction`: memanggil `budgetService.removeBudget`, lalu revalidasi.
   - Selalu lakukan pengecekan hak akses internal (`supabase.auth.getUser()`) di setiap fungsi aksi untuk menjamin keamanan.

### FASE 4: Refactor Komponen UI (`/components/budgets/*`)
*Setiap komponen UI tidak boleh lagi mengimpor Supabase secara langsung. Ganti dengan memanggil Server Actions.*

1. **`add-budget-dialog.tsx`**: Ganti logika unggah (insert) menjadi memanggil `addBudgetAction`. Hapus import dan setup `createClient` dari *client*.
2. **`edit-budget-dialog.tsx`**: Ganti proses pengeditan (dan logika sinkronisasi antara tabel budget dan limit barunya) menjadi memanggil `editBudgetAction`.
3. **`delete-budget-dialog.tsx`**: Ganti tindakan hapus melalui antarmuka menjadi memanggil `removeBudgetAction`.
4. **`budget-list.tsx`**: Ganti sistem *fetch* yang manual menggunakan Supabase dengan panggilan fungsi dari aksi `getBudgetsAction`.

---

## Kriteria Selesai (Acceptance Criteria)
1. Modul UI pada folder `/components/budgets` berubah menjadi jauh lebih bersih dan tidak lagi mengimpor `createClient` dari `@/lib/supabase/client` untuk melakukan operasi CRUD.
2. Ketika menambah, mengedit, atau menghapus budget, transaksi (yang memanfaatkan budget tersebut) masih terekam dengan akurat baik jumlah sisa (leftover) maupun history transaksinya.
3. Arsitektur konsisten dengan konsep `Repository -> Service -> Action -> UI`.
