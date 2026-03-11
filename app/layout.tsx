import type { Metadata } from "next";
import { Patrick_Hand } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import { ThemeProvider } from "./components/ThemeProvider";
import InstantLoadingBar from "./components/InstantLoadingBar";
import { Suspense } from "react";

const patrickHand = Patrick_Hand({
    weight: '400',
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "Ruang Aksara",
    description: "Platform Publikasi Sastra Digital",
    manifest: "/manifest.json",
};

export const viewport = {
    themeColor: "#EADDBF",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="id">
            <body className={`${patrickHand.className} min-h-screen flex justify-center selection:bg-pine/30`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <Suspense fallback={null}>
                        <InstantLoadingBar />
                    </Suspense>
                    <div className="w-full mx-auto bg-parchment-light dark:bg-parchment min-h-screen relative flex flex-col overflow-x-hidden transition-colors duration-300">
                        <AuthProvider>
                            <main className="flex-grow flex flex-col relative pb-32">
                                {children}
                                {/* Final Polish: Cat Logo Watermark */}
                                <div className="fixed bottom-24 right-4 w-20 h-20 cat-watermark pointer-events-none -z-10 rotate-12" />
                            </main>
                            <BottomNav />
                        </AuthProvider>
                    </div>
                </ThemeProvider>
            </body>
        </html>
    );
}
