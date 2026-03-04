import { AuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const authOptions: AuthOptions = {
    session: {
        strategy: "jwt",
    },
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                username: { label: "Username", type: "text", placeholder: "npm atau admin" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                if (!credentials?.username || !credentials?.password) { return null; }

                const user = await prisma.user.findUnique({
                    where: { username: credentials.username }
                });

                if (!user) { return null; }

                const isPasswordValid = await bcrypt.compare(credentials.password, user.password_hash);

                if (!isPasswordValid) { return null; }

                return {
                    id: user.id,
                    name: user.display_name,
                    role: user.role,
                };
            }
        })
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                // @ts-ignore
                token.role = user.role;
                token.id = user.id;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                // @ts-ignore
                session.user.role = token.role;
                // @ts-ignore
                session.user.id = token.id;
            }
            return session;
        }
    },
    secret: process.env.NEXTAUTH_SECRET,
};
