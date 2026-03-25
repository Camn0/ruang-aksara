/**
 * @file PinReviewButton.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Reader Exploration architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useTransition } from "react";
import { togglePinReview } from "@/app/actions/admin";
import { Pin, PinOff } from "lucide-react";
import { toast } from "sonner";

interface PinReviewButtonProps {
    reviewId: string;
    karyaId: string;
    initialIsPinned: boolean;
}

/**
 * PinReviewButton: Dispatches server actions strictly authorized for Authors to pin profound critiques globally.
 */
export default function PinReviewButton({ reviewId, karyaId, initialIsPinned }: PinReviewButtonProps) {
    const [isPending, startTransition] = useTransition();

    const handlePin = () => {
        startTransition(async () => {
            const res = await togglePinReview(reviewId, karyaId);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success(initialIsPinned ? "Sematan dilepas" : "Ulasan disematkan");
            }
        });
    };

    return (
        <button
            onClick={handlePin}
            disabled={isPending}
            title={initialIsPinned ? "Lepas Sematan" : "Sematkan Ulasan"}
            className={`p-2 rounded-xl transition-all border ${initialIsPinned
                    ? 'bg-tan-primary/10 dark:bg-brown-mid text-brown-dark dark:text-text-accent border-tan-primary/10'
                    : 'text-tan-primary/40 border-tan-primary/5 hover:bg-tan-primary/5 hover:text-tan-primary'
                }`}
        >
            {isPending ? (
                <span className="animate-pulse">...</span>
            ) : initialIsPinned ? (
                <PinOff className="w-4 h-4" />
            ) : (
                <Pin className="w-4 h-4" />
            )}
        </button>
    );
}
