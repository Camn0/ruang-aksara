"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { toggleFollow } from "./actions";

export default function FollowButton({ targetUserId, initialIsFollowing }: { targetUserId: string, initialIsFollowing: boolean }) {
    const [isPending, startTransition] = useTransition();
    const [isFollowing, setIsFollowing] = useState(initialIsFollowing);

    const handleFollow = () => {
        const prev = isFollowing;
        setIsFollowing(!isFollowing);

        startTransition(async () => {
            try {
                await toggleFollow(targetUserId);
                toast.success(!prev ? 'Berhasil mengikuti' : 'Berhenti mengikuti');
            } catch (error: any) {
                setIsFollowing(prev);
                toast.error(error.message || "Gagal memproses");
            }
        });
    };

    return (
        <button
            onClick={handleFollow}
            disabled={isPending}
            className={`w-[135px] h-[39px] flex items-center justify-center rounded-[65px] font-black text-[11px] uppercase tracking-[0.15em] transition-all focus:outline-none disabled:opacity-50 active:scale-95 ${isFollowing
                ? 'bg-tan-light/10 dark:bg-brown-mid text-tan-primary hover:bg-tan-light/20 border border-tan-primary/20'
                : 'bg-brown-dark text-text-accent hover:opacity-90 shadow-lg shadow-brown-dark/10'
                }`}
        >
            {isPending ? '...' : (isFollowing ? '✓ Mengikuti' : '+ Ikuti')}
        </button>
    );
}