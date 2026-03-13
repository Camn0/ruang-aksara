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
            className={`w-max px-6 py-1.5 rounded-full font-bold text-[11px] uppercase tracking-wider transition-all focus:outline-none focus:ring-2 disabled:opacity-50 ${initialIsFollowing
                ? 'bg-gray-100 dark:bg-slate-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-700 focus:ring-gray-200 dark:focus:ring-slate-700 border border-transparent dark:border-slate-700'
                : 'bg-indigo-600 dark:bg-indigo-500 text-white hover:bg-indigo-700 dark:hover:bg-indigo-400 shadow-sm shadow-indigo-200 dark:shadow-none focus:ring-indigo-100 dark:focus:ring-indigo-900 border border-transparent'
                }`}
        >
            {isPending ? '...' : (initialIsFollowing ? '✓ Mengikuti' : '+ Ikuti')}
        </button>
    );
}