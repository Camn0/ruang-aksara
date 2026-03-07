import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import { ThemeProvider } from "./components/ThemeProvider";

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
            <body className={`${inter.className} bg-gray-100 dark:bg-slate-900 min-h-screen flex justify-center text-gray-900 dark:text-gray-100`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <div className="w-full sm:max-w-md md:max-w-4xl mx-auto bg-white dark:bg-slate-950 min-h-screen shadow-2xl relative flex flex-col overflow-x-hidden transition-colors duration-300">
                        <AuthProvider>
                            {/* Navbar desktop/old hidden di mobile if we want, but let's keep for now */}
                            <main className="flex-grow flex flex-col relative pb-20">
                                {children}
                            </main>
                            <BottomNav />
                        </AuthProvider>
                    </div>
                </ThemeProvider>
            </body>
        </html >
    );
}
