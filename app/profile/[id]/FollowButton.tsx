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
            className={`
                w-max inline-flex items-center justify-center
                px-5 py-2 rounded-full
                font-semibold text-sm tracking-wide
                transition-all duration-200
                focus:outline-none
                disabled:opacity-60 disabled:cursor-not-allowed active:scale-95
                ${initialIsFollowing
                    ? 'bg-[#2d2118] text-[#c4a882] hover:bg-[#3d2f22]'
                    : 'bg-[#2d2118] text-white hover:bg-[#3d2f22]'
                }
            `}
        >
            {isPending ? '...' : (initialIsFollowing ? '✓ Mengikuti' : '+ Ikuti')}
        </button>
    );
}