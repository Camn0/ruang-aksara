'use client';

import { useTransition } from "react";
import { toggleFollow } from "@/app/actions/user";
import { UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
    karyaId: string;
}

export default function FollowButton({ targetUserId, initialIsFollowing, karyaId }: FollowButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handleFollow = () => {
        startTransition(async () => {
            try {
                await toggleFollow(targetUserId, `karya-${karyaId}`);
            } catch (err) {
                console.error("Follow failed:", err);
            }
        });
    };

    return (
        <button
            onClick={handleFollow}
            disabled={isPending}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 ${initialIsFollowing
                    ? 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-700'
                    : 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800'
                }`}
        >
            {isPending ? (
                '...'
            ) : initialIsFollowing ? (
                <>
                    <UserMinus className="w-3.5 h-3.5" />
                    <span>Diikuti</span>
                </>
            ) : (
                <>
                    <UserPlus className="w-3.5 h-3.5" />
                    <span>Ikuti Penulis</span>
                </>
            )}
        </button>
    );
}
