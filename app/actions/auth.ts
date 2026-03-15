'use server';

import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const RegisterSchema = z.object({
    username: z.string().min(3, "Username minimal 3 karakter").max(20, "Username maksimal 20 karakter").regex(/^[a-zA-Z0-9_]+$/, "Username hanya boleh huruf, angka, dan underscore"),
    password: z.string().min(6, "Password minimal 6 karakter"),
    display_name: z.string().min(2, "Display name minimal 2 karakter").max(50, "Display name maksimal 50 karakter"),
});

/**
 * Server Action: Mendaftarkan user baru dengan role 'user' (Reader).
 */
export async function registerUser(formData: FormData) {
    try {
        const username = formData.get('username') as string;
        const password = formData.get('password') as string;
        const display_name = formData.get('display_name') as string;

        const validation = RegisterSchema.safeParse({ username, password, display_name });
        if (!validation.success) {
            return { error: `Validasi gagal: ${validation.error.issues[0].message}` };
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
                role: 'user',
            }
        });

        return { success: true, data: { username: newUser.username } };
    } catch (error) {
        console.error("[registerUser] Error:", error);
        return { error: "Terjadi kesalahan sistem saat mendaftar." };
    }
}
