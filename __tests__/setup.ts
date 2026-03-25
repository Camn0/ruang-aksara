import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => {
    return {
        useRouter: vi.fn(() => ({
            push: vi.fn(),
            replace: vi.fn(),
            prefetch: vi.fn(),
            refresh: vi.fn(),
        })),
        useSearchParams: vi.fn(() => ({
            get: vi.fn(),
        })),
        usePathname: vi.fn(() => '/'),
    }
})

// Mock next-auth react side
vi.mock('next-auth/react', () => {
    return {
        signOut: vi.fn(),
        useSession: vi.fn(() => ({
            data: { user: { id: "test-id", name: "Test User" } },
            status: "authenticated",
        })),
        SessionProvider: ({ children }: { children: React.ReactNode }) => children,
    }
})

// Mock next-auth server side
vi.mock('next-auth', () => ({
    getServerSession: vi.fn(() => Promise.resolve({ user: { id: 'test-user-id', username: 'testuser' } })),
}))

// Mock Prisma Client
vi.mock('@/lib/prisma', () => ({
    prisma: {
        user: {
            findUnique: vi.fn(),
            findFirst: vi.fn(),
            create: vi.fn(),
            update: vi.fn(),
            delete: vi.fn(),
        },
        comment: {
            create: vi.fn(),
            findMany: vi.fn(),
        },
        bab: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
        },
        karya: {
            findUnique: vi.fn(),
            findMany: vi.fn(),
        },
        notification: {
            findMany: vi.fn(),
            count: vi.fn(),
            updateMany: vi.fn(),
        },
        chapterReaction: {
            upsert: vi.fn(),
        }
    }
}))

// Mock Next.js Cache
vi.mock('next/cache', () => ({
    revalidateTag: vi.fn(),
    revalidatePath: vi.fn(),
}))
