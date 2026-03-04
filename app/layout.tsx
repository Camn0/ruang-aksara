import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import Navbar from "./components/Navbar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: "Ruang Aksara",
    description: "Platform Publikasi Sastra Digital",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <body className={`${inter.className} bg-gray-50 text-gray-900 min-h-screen flex flex-col`}>
                <AuthProvider>
                    <Navbar />
                    <main className="flex-grow">
                        {children}
                    </main>
                    {/* Mengapa: Footer global simpel ditaruh di Root agar konsisten */}
                    <footer className="bg-white border-t border-gray-200 mt-auto py-6 text-center text-sm text-gray-500">
                        © {new Date().getFullYear()} Ruang Aksara. Prototipe MVP.
                    </footer>
                </AuthProvider>
            </body>
        </html>
    );
}
