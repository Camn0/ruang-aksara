/**
 * @file InstantLoadingBar.tsx
 * @description Top-level routing indicator providing visual feedback utilizing Next.js top-loading algorithms.
 * @author Ruang Aksara Engineering Team
 */

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
/**
 * InstantLoadingBar: Top-level routing indicator providing visual feedback during Next.js chunk transitions.
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
    // Bar hanya muncul jika loading > 50ms.
    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (loading) {
            timer = setTimeout(() => {
                setVisible(true);
            }, 50);
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
                    if (prev >= 90) return 94; // Slow down but don't stop
                    return prev + 2; // More gradual
                });
            }, 100);
        }
        return () => clearInterval(interval);
    }, [loading]);

    // Listener global klik link & submit form
    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            const anchor = target.closest('a');

            if (anchor &&
                anchor.href &&
                anchor.href.startsWith(window.location.origin) &&
                !anchor.target &&
                anchor.href !== window.location.href &&
                !anchor.href.includes('#')) {
                setLoading(true);
            }
        };

        const handleSubmit = (e: SubmitEvent) => {
            const form = e.target as HTMLFormElement;
            const action = form.getAttribute('action');
            if (action && (action.startsWith('/') || action.startsWith(window.location.origin))) {
                // Hanya aktifkan jika bukan ke URL yang sama persis (untuk pencarian repetitif)
                setLoading(true);
            }
        };

        const handlePopState = () => {
            setLoading(true);
        };

        document.addEventListener('click', handleClick);
        document.addEventListener('submit', handleSubmit);
        window.addEventListener('popstate', handlePopState);
        return () => {
            document.removeEventListener('click', handleClick);
            document.removeEventListener('submit', handleSubmit);
            window.removeEventListener('popstate', handlePopState);
        };
    }, []);

    if (!visible && progress === 0) return null;

    return (
        <div className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none">
            <div
                className={`h-[3px] bg-tan-primary dark:bg-brown-mid transition-all duration-300 ease-out shadow-[0_0_15px_rgba(175,143,111,0.5)] ${visible ? 'opacity-100 animate-pulse' : 'opacity-0'}`}
                style={{ width: `${progress}%` }}
            />
        </div>
    );
}
