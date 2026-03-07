import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";

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
            <body className={`${inter.className} bg-gray-100 min-h-screen flex justify-center text-gray-900`}>
                <div className="w-full max-w-md md:max-w-4xl mx-auto bg-white min-h-screen shadow-2xl relative flex flex-col overflow-x-hidden">
                    <AuthProvider>
                        {/* Navbar desktop/old hidden di mobile if we want, but let's keep for now */}
                        <main className="flex-grow flex flex-col relative pb-20">
                            {children}
                        </main>
                        <BottomNav />
                    </AuthProvider>
                </div>
            </body>
        </html >
    );
}
