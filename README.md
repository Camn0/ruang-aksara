# Ruang Aksara - Platform Publikasi Sastra Digital

Proyek ini adalah template MVP full-stack yang dibangun dengan Next.js 14, React, TailwindCSS, TypeScript, dan Prisma ORM dengan PostgreSQL.

## Video Demo
https://github.com/user-attachments/assets/74bd4d46-a017-4a51-ad69-2966b29a57b3

## Prasyarat (Dependencies)

Pastikan Anda memiliki hal-hal berikut terinstal:
- Node.js (v18.0.0 atau lebih tinggi)
- npm (v9.0.0 atau lebih tinggi)
- PostgreSQL (Lokal atau Cloud instance)

## Instalasi

1. Clone repositori ini atau salin file-filenya ke direktori lokal Anda.
2. Jalankan perintah berikut di root proyek:
   ```bash
   npm install
   ```
   *Catatan: Perintah ini juga akan menjalankan `prisma generate` secara otomatis.*

## Konfigurasi Database

1. Buka file `.env` di root proyek.
2. Perbarui nilai `DATABASE_URL` dengan kredensial PostgreSQL Anda:
   ```env
   DATABASE_URL="postgresql://USUARIO:PASSWORD@HOST:PORT/DATABASE?schema=public"
   ```
3. Sinkronkan skema database Anda dengan skema Prisma:
   ```bash
   npx prisma db push
   ```
   *Gunakan `db push` untuk prototyping MVP yang cepat. Untuk lingkungan produksi, gunakan `npx prisma migrate dev`.*

## Cara Menjalankan

### Mode Pengembangan (Development)
Jalankan server pengembangan:
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di browser Anda.

### Mode Produksi (Build \& Start)
Build proyek untuk produksi:
```bash
npm run build
```
Jalankan aplikasi yang sudah di-build:
```bash
npm run start
```

## Struktur Proyek Penting

- `app/api/`: Berisi logika backend (API Routes).
- `app/admin/dashboard/`: Halaman khusus God Account.
- `app/novel/[karyaId]/[chapterNo]/`: Halaman pembaca karya.
- `prisma/schema.prisma`: Definisi model database.

## Tips Pengembangan Selanjutnya

- **Autentikasi**: Anda dapat mengintegrasikan NextAuth.js untuk sistem login yang lebih aman.
- **State Management**: Untuk state yang lebih kompleks, pertimbangkan menggunakan TanStack Query atau Zustand.
- **Optimasi**: Gunakan `next/image` untuk penanganan gambar dan `next/font` untuk tipografi yang optimal.
