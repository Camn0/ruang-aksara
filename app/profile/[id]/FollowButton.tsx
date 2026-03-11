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
            className={`w-max px-6 py-2 wobbly-border-sm font-journal-title text-base italic transition-all focus:outline-none disabled:opacity-50 ${initialIsFollowing
                ? 'bg-white/40 text-ink/40 border-ink/5 hover:bg-white hover:text-ink-deep -rotate-1'
                : 'bg-pine text-parchment border-pine shadow-md hover:bg-pine-light rotate-1 active:scale-95'
                }`}
        >
            {isPending ? 'Mencatat...' : (initialIsFollowing ? 'Terarsip' : 'Ikuti Jejak')}
        </button>
    );
}
