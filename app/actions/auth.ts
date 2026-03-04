'use server';

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export async function registerUser(formData: FormData) {
    try {
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const display_name = formData.get('display_name') as string;

        if (!username || !password || !display_name) {
            return { error: "Semua field (Username, Password, Display Name) wajib diisi." };
        }

        if (password.length < 6) {
            return { error: "Password minimal 6 karakter." };
        }

        const existingUser = await prisma.user.findUnique({
            where: { username }
        });

        if (existingUser) {
            return { error: "Username sudah terdaftar. Silakan pilih username lain." };
        }

        const password_hash = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: {
                username,
                password_hash,
                display_name,
                role: 'user', // Secara default, pendaftar baru adalah pembaca (Reader)
            }
        });

        return { success: true, data: { username: newUser.username } };

    } catch (error) {
        console.error("Register Error:", error);
        return { error: "Terjadi kesalahan sistem saat mendaftar." };
    }
}
