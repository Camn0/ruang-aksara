'use client';

import { Share2, Check, Copy } from "lucide-react";
import { useState } from "react";

interface ShareButtonProps {
    title: string;
    karyaId: string;
}

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
            className="w-10 h-10 flex items-center justify-center bg-gray-50 dark:bg-slate-800/50 text-gray-500 dark:text-gray-400 rounded-full active:scale-95 transition-all hover:bg-gray-100 dark:hover:bg-slate-800 border border-gray-100 dark:border-slate-800"
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
