import { PrismaClient } from '@prisma/client';

/**
 * Singleton Prisma Client.
 * 
 * Mengapa: 
 * Dalam mode development, Next.js melakukan "Hot Reload" yang menyebabkan file ini dieksekusi terus menerus.
 * Tanpa singleton (global variable), setiap refresh akan membuka koneksi database baru,
 * yang berujung pada error "Too many connections" di PostgreSQL/MySQL.
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

// Simpan instansi ke global object hanya jika bukan di production
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
