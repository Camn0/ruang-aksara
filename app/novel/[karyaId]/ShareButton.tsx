/**
 * @file ShareButton.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Reader Exploration architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { Share2, Check, Copy } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
    title: string;
    karyaId: string;
}

/**
 * ShareButton: Invokes native navigator.share APIs or fallback clipboard mechanisms to virally distribute chapters.
 */
export default function ShareButton({ title, karyaId }: ShareButtonProps) {
    const [copied, setCopied] = useState(false);

    const handleShare = async () => {
        const shareData = {
            title: `Baca ${title} — Ruang Aksara`,
            text: `Yuk baca karya keren "${title}" di Ruang Aksara!`,
            url: `${window.location.origin}/novel/${karyaId}`,
        };

        if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
            try {
                await navigator.share(shareData);
            } catch (err) {
                console.log("Share failed:", err);
            }
        } else {
            // Fallback: Copy to clipboard
            try {
                await navigator.clipboard.writeText(shareData.url);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error("Failed to copy:", err);
            }
        }
    };

    return (
        <button
            onClick={handleShare}
            className="w-10 h-10 flex items-center justify-center bg-tan-primary/5 dark:bg-brown-mid/50 text-tan-primary/60 dark:text-tan-light rounded-xl active:scale-95 transition-all hover:bg-tan-primary/10 dark:hover:bg-slate-800 border border-tan-primary/5 dark:border-brown-mid"
            title="Bagikan"
        >
            {copied ? (
                <Check className="w-4 h-4 text-green-500" />
            ) : (
                <Share2 className="w-4 h-4" />
            )}
        </button>
    );
}
