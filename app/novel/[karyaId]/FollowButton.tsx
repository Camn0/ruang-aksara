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
            className={`flex items-center gap-2 px-4 py-1.5 wobbly-border-sm font-marker text-sm uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 rotate-[-1deg] ${initialIsFollowing
                ? 'bg-pine text-parchment border-pine shadow-md'
                : 'bg-white/60 text-ink/40 border-ink/5 hover:bg-gold hover:text-ink-deep hover:border-gold hover:rotate-2'
                }`}
        >
            {isPending ? (
                '...'
            ) : initialIsFollowing ? (
                <>
                    <UserMinus className="w-4 h-4" />
                    <span>Diikuti</span>
                </>
            ) : (
                <>
                    <UserPlus className="w-4 h-4" />
                    <span>Ikuti Penulis</span>
                </>
            )}
        </button>
    );
}
