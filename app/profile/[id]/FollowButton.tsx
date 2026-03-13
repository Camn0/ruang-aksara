"use client";

import { useTransition } from "react";
import { toggleFollow } from "./actions";

export default function FollowButton({ targetUserId, initialIsFollowing }: { targetUserId: string, initialIsFollowing: boolean }) {
    const [isPending, startTransition] = useTransition();

    const handleFollow = () => {
        startTransition(() => {
            toggleFollow(targetUserId);
        });
    };

    return (
        <button
            onClick={handleFollow}
            disabled={isPending}
            className={`w-max px-8 py-2 rounded-full font-black text-[10px] uppercase tracking-[0.15em] transition-all focus:outline-none disabled:opacity-50 active:scale-95 ${initialIsFollowing
                ? 'bg-tan-light/10 dark:bg-slate-800 text-tan-primary hover:bg-tan-light/20 border border-tan-primary/20'
                : 'bg-brown-dark text-text-accent hover:opacity-90 shadow-lg shadow-brown-dark/10'
                }`}
        >
            {isPending ? 'Memproses...' : (initialIsFollowing ? 'Mengikuti' : 'Ikuti')}
        </button>
    );
}
