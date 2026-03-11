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
            className="w-12 h-12 shrink-0 flex items-center justify-center bg-white border-2 border-ink/5 wobbly-border text-ink/20 hover:text-pine hover:border-pine transition-all active:scale-95 rotate-[-4deg] group shadow-sm hover:shadow-lg"
            title="Bagikan Dossier"
        >
            <Share2 className="w-6 h-6 group-hover:rotate-12 transition-transform" />
        </button>
    );
}
