'use client';

import { useTransition } from "react";
import { toggleFollow } from "@/app/actions/user";

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
            className={`
                inline-flex items-center justify-center gap-1.5
                px-5 py-2 rounded-full
                font-semibold text-sm
                transition-all duration-200
                disabled:opacity-60 disabled:cursor-not-allowed
                ${initialIsFollowing
                    ? 'bg-[#2d2118] text-[#c4a882] hover:bg-[#3d2f22]'
                    : 'bg-[#2d2118] text-white hover:bg-[#3d2f22] active:scale-95'
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