'use client';

import { useTransition } from "react";
import { togglePinReview } from "@/app/actions/admin";
import { Pin, PinOff } from "lucide-react";

interface PinReviewButtonProps {
    reviewId: string;
    karyaId: string;
    initialIsPinned: boolean;
}

export default function PinReviewButton({ reviewId, karyaId, initialIsPinned }: PinReviewButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handlePin = () => {
        startTransition(async () => {
            const res = await togglePinReview(reviewId, karyaId);
            if (res.error) {
                alert(res.error);
            }
        });
    };

    return (
        <button
            onClick={handlePin}
            disabled={isPending}
            title={initialIsPinned ? "Lepas Sematan" : "Sematkan Ulasan"}
            className={`p-2 rounded-xl transition-all border ${initialIsPinned
                    ? 'bg-amber-500/10 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-500/20'
                    : 'text-tan-primary/40 border-tan-primary/5 hover:bg-tan-primary/5 hover:text-tan-primary'
                }`}
        >
            {isPending ? (
                <span className="animate-pulse">...</span>
            ) : initialIsPinned ? (
                <PinOff className="w-4 h-4 fill-amber-500" />
            ) : (
                <Pin className="w-4 h-4" />
            )}
        </button>
    );
}
