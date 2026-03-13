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
            className={`w-[135px] h-[39px] flex items-center justify-center rounded-[65px] font-black text-[11px] uppercase tracking-[0.15em] transition-all focus:outline-none disabled:opacity-50 active:scale-95 ${initialIsFollowing
                ? 'bg-tan-light/10 dark:bg-brown-mid text-tan-primary hover:bg-tan-light/20 border border-tan-primary/20'
                : 'bg-brown-dark text-text-accent hover:opacity-90 shadow-lg shadow-brown-dark/10'
                }`}
        >
            {isPending ? '...' : (initialIsFollowing ? '✓ Mengikuti' : '+ Ikuti')}
        </button>
    );
}