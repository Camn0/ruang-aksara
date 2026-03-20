import type { Metadata } from "next";
import { Inter, Lobster, Open_Sans } from "next/font/google";
import "./globals.css";
import AuthProvider from "./components/AuthProvider";
import BottomNav from "./components/BottomNav";
import Sidebar from "./components/Sidebar";
import { SidebarProvider } from "./components/SidebarContext";
import LayoutContent from "./components/LayoutContent";
import { ThemeProvider } from "./components/ThemeProvider";
import InstantLoadingBar from "./components/InstantLoadingBar";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import RealTimeNotificationListener from "./components/RealTimeNotificationListener";
import PushManager from "./components/PushManager";
import PwaRegistration from "./components/PwaRegistration";
import { Suspense } from "react";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const lobster = Lobster({ weight: '400', subsets: ["latin"], variable: '--font-lobster' });
const openSans = Open_Sans({ subsets: ["latin"], variable: '--font-open-sans' });

export const metadata: Metadata = {
    title: "Ruang Aksara",
    description: "Sanctuari Literasi Digital: Tempat di mana setiap kata bernafas dan setiap cerita menemukan rumahnya.",
    manifest: "/manifest.json",
    appleWebApp: {
        title: "Ruang Aksara",
        statusBarStyle: "default",
        capable: true,
    },
};

export const viewport = {
    themeColor: "#AF8F6F",
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
};

export default async function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const session = await getServerSession(authOptions);
    return (
        <html lang="id" className={`${inter.variable} ${lobster.variable} ${openSans.variable}`}>
            <body className={`${inter.className} bg-bg-cream dark:bg-bg-dark min-h-screen flex text-text-main dark:text-text-accent`}>
                <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                    <Suspense fallback={null}>
                        <InstantLoadingBar />
                    </Suspense>
                    <SidebarProvider>
                        <LayoutContent>
                            {children}
                        </LayoutContent>
                    </SidebarProvider>
                    <Toaster position="top-center" richColors />
                    <RealTimeNotificationListener currentUserId={session?.user?.id} />
                    <PushManager />
                    <PwaRegistration />
                </ThemeProvider>
            </body>
        </html >
    );
}
