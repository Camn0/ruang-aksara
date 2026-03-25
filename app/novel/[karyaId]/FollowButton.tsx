/**
 * @file FollowButton.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Reader Exploration architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useTransition } from "react";
import { toggleFollow } from "@/app/actions/user";

interface FollowButtonProps {
    targetUserId: string;
    initialIsFollowing: boolean;
    karyaId: string;
}

/**
 * FollowButton: Social engagement toggle allowing readers to subscribe to Author or User activity feeds.
 */
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
            className={`
                inline-flex items-center justify-center gap-1.5
                px-5 py-2 rounded-full
                font-semibold text-sm
                transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                ${initialIsFollowing
                    ? 'bg-[#3d2314] text-[#e8d5c0] hover:bg-[#4a2c1a] dark:bg-[#e8d5c0] dark:text-[#2d2118] dark:hover:bg-[#d4c0a8]'
                    : 'bg-[#3d2314] text-[#e8d5c0] hover:bg-[#4a2c1a] active:scale-95 dark:bg-[#e8d5c0] dark:text-[#2d2118] dark:hover:bg-[#d4c0a8]'
                }
            `}
        >
            {isPending ? (
                <span className="tracking-wide">...</span>
            ) : initialIsFollowing ? (
                <span className="tracking-wide">✓ Diikuti</span>
            ) : (
                <span className="tracking-wide">+ Ikuti</span>
            )}
        </button>
    );
}