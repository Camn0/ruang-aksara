import type { Metadata } from "next";
import { Inter, Lobster, Open_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
import { SidebarProvider } from "./components/SidebarContext";
import LayoutContent from "./components/LayoutContent";
import { ThemeProvider } from "./components/ThemeProvider";
import InstantLoadingBar from "./components/InstantLoadingBar";
import { Suspense } from "react";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const lobster = Lobster({ weight: '400', subsets: ["latin"], variable: '--font-lobster' });
const openSans = Open_Sans({ subsets: ["latin"], variable: '--font-open-sans' });

export const metadata: Metadata = {
    title: "Ruang Aksara",
    description: "Platform Publikasi Sastra Digital",
    manifest: "/manifest.json",
};

export const viewport = {
    themeColor: "#AF8F6F",
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
        <html lang="id" className={`${inter.variable} ${lobster.variable} ${openSans.variable}`}>
            <body className={`${inter.className} bg-bg-cream dark:bg-slate-900 min-h-screen flex text-text-main dark:text-gray-100`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <Suspense fallback={null}>
                        <InstantLoadingBar />
                    </Suspense>
                    <SidebarProvider>
                        <LayoutContent>
                            {children}
                        </LayoutContent>
                    </SidebarProvider>
                </ThemeProvider>
            </body>
        </html >
    );
}
