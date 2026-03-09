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
            className={`p-1.5 rounded-lg transition-all ${initialIsPinned
                    ? 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                    : 'text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-gray-200'
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
