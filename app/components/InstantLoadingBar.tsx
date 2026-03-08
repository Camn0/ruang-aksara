'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * InstantLoadingBar
 * 
 * Memberikan feedback visual instan saat navigasi dimulai.
 * Karena Next.js App Router tidak memiliki event router.events, 
 * kita menggunakan kombinasi pathname tracking.
 */
export default function InstantLoadingBar() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);
    const [visible, setVisible] = useState(false);
    const [progress, setProgress] = useState(0);

    // Reset bar saat halaman benar-benar berubah
    useEffect(() => {
        setLoading(false);
        setVisible(false);
        setProgress(100);
        const timer = setTimeout(() => {
            setProgress(0);
        }, 400);
        return () => clearTimeout(timer);
    }, [pathname, searchParams]);

    // [New Logic] Threshold Visibility
    // Mengapa: Menghindari flicker pada load instan (cache). 
    // Bar hanya muncul jika loading > 200ms.
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (loading) {
            timer = setTimeout(() => {
                setVisible(true);
            }, 200);
        } else {
            setVisible(false);
        }
        return () => clearTimeout(timer);
    }, [loading]);

    // Simulasikan progress saat navigasi
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (loading) {
            setProgress(10);
            interval = setInterval(() => {
                setProgress((prev) => {
                    if (prev >= 90) return 90;
                    return prev + 5;
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [loading]);

    // Listener global klik link
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor &&
                anchor.href &&
                anchor.href.startsWith(window.location.origin) &&
                !anchor.target &&
                anchor.href !== window.location.href) {
                setLoading(true);
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    if (!visible && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            <div
                className={`h-1 bg-indigo-600 transition-all duration-300 ease-out shadow-[0_0_10px_rgba(79,70,229,0.5)] ${visible ? 'opacity-100' : 'opacity-0'}`}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
