// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Memulai proses seeding (inisialisasi data)...');

    // Mengapa: Kita men-hash password di sini agar sesuai dengan verifikasi NextAuth di backend.
    const salt = await bcrypt.genSalt(10);
    const hashedAdminPassword = await bcrypt.hash('adminpassword123', salt);

    // Menambahkan God Account (Admin) ke database
    // Mengapa: Database membutuhkan uploader yang valid (id ini dipakai di Dashboard)
    // agar foreign key constraint pada tabel Karya terpenuhi.
    // Sekarang menggunakan 'password_hash' sesuai skema terbaru.
    const admin = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {
            password_hash: hashedAdminPassword, // Pastikan password terupdate jika ada perubahan skema
        },
        create: {
            id: 'mock-god-account-id',
            username: 'admin',
            password_hash: hashedAdminPassword,
            role: 'admin',
            display_name: 'Super Admin Ruang Aksara',
        },
    });

    console.log('Berhasil membuat/memastikan God Account:', admin);
}

main()
    .catch((e) => {
        console.error('Terjadi kesalahan saat seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
