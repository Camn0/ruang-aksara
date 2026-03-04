import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

const handler = NextAuth(authOptions);

// Mengapa: Next.js App Router API secara spesifik mensyaratkan handler diekspor di standard metode HTTP 
// yang diperbolehkan route tersebut untuk menangani dynamic GET dan POST login requests Auth.js
export { handler as GET, handler as POST };
