/**
 * @file auth.ts
 * @description Core Server Action Proxy handling extreme-security operations (Registration & Identity).
 * @author Ruang Aksara Engineering Team
 */

'use server'; // Directive: Locks this module to the Node.js backend. Prevents bcrypt from leaking to the browser.

import bcrypt from 'bcryptjs'; // Required for hashing. Never import this in a Client Component.

import { prisma } from '@/lib/prisma'; // The singleton DB client connection.

// ==============================================================================
// 1. MUTASI PUBLIK: REGISTRASI USER BARU (READER)
// ==============================================================================
/**
 * Server Action: Mendaftarkan user baru dengan role 'user' (Reader).
 *
 * Alur:
 *   1. Ekstraksi data form secara eksplisit (mencegah payload injection).
 *   2. Validasi panjang sandi untuk mitigasi script kiddie.
 *   3. Pengecekan `findUnique` untuk mencegah bentrok P2002 Unique Constraint.
 *   4. Penguncian sandi via Bcrypt (Cost 10).
 *   5. Penulisan ke DB dengan role 'user' yang hardcoded.
 */
export async function registerUser(formData: FormData) {
    try { // [1] Error Boundary: Catch DB disconnects or bcrypt panic errors.
        
        // [2] Payload parsing: We specifically cast to string to avoid Next.js FormData typing issues.
        const username = formData.get('username') as string; // The selected unique username.
        const password = formData.get('password') as string; // The raw unhashed password from the form.
        const display_name = formData.get('display_name') as string; // The public-facing name.

        // [3] Strict Null Check: If a form field was manipulated by devtools to be null, we block it here.
        if (!username || !password || !display_name) {
            // [4] Validation Rejection: Return safely to trigger client-side error toast.
            return { error: "Semua field (Username, Password, Display Name) wajib diisi." };
        }

        // [5] Security Rule: Enforce minimal entropy for passwords.
        if (password.length < 6) {
            // [6] Reject short passwords, matching the client-side Zod/React-Hook-Form rules.
            return { error: "Password minimal 6 karakter." }; 
        }

        // [7] Pre-flight Check: Does the username already exist in the database?
        // We do this BEFORE hashing because hashing is CPU intensive. If the username is taken, fail fast.
        const existingUser = await prisma.user.findUnique({
            where: { username } // We query the unique B-Tree index on the 'username' column.
        });

        // [8] Conflict Resolution: If `existingUser` is not null, the username is already owned.
        if (existingUser) {
            // [9] Return a graceful UX error rather than crashing the Next.js server with a Prisma Client Known Engine Error.
            return { error: "Username sudah terdaftar. Silakan pilih username lain." };
        }

        // [10] Cryptographic Hasher: We hash the raw password. 
        // 10 salt rounds takes about ~80ms on standard Vercel serverless limits.
        const password_hash = await bcrypt.hash(password, 10); 

        // [11] DB Transaction: Actually instantiate the user in the PostgreSQL instance.
        const newUser = await prisma.user.create({
            data: {
                username, // Pass the chosen username.
                password_hash, // CRITICAL: Only save the bcrypt hash, never the raw string.
                display_name, // Pass the chosen display name.
                role: 'user', // Hardcoded safeguard: Prevents a malicious form payload from injecting role: 'admin'.
            }
        });

        // [12] Success Payload: Only send back harmless data (the username) for the welcome toast UI.
        return { success: true, data: { username: newUser.username } };

    } catch (error) {
        // [13] System Failure: If Prisma cannot connect, or bcrypt fails (memory limits), log the trace.
        console.error("[registerUser] Error:", error);
        // [14] Generic Masking: Return a standard string to avoid leaking OS or Database paths to the public client.
        return { error: "Terjadi kesalahan sistem saat mendaftar." };
    }
}
