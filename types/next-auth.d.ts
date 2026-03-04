import { DefaultSession } from "next-auth"

// Mengapa: Mendeklarasikan ulang (Module Augmentation) modul "next-auth" agar TypeScript 
// mengenali properti kustom (id dan role) yang kita inject ke dalam session.user di route auth.
declare module "next-auth" {
    interface Session {
        user: {
            id: string
            role: string
        } & DefaultSession["user"]
    }

    interface User {
        id: string
        role: string
    }
}
