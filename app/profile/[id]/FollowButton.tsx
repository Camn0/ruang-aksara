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
            className={`w-full py-2.5 rounded-full font-bold text-sm transition-all focus:outline-none focus:ring-4 disabled:opacity-50 ${initialIsFollowing
                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200 focus:ring-indigo-100'
                }`}
        >
            {isPending ? 'Memproses...' : (initialIsFollowing ? 'Mengikuti' : 'Ikuti')}
        </button>
    );
}
