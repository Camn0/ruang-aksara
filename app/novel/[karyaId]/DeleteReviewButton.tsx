/**
 * @file DeleteReviewButton.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Reader Exploration architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useState } from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import { deleteReview } from '@/app/actions/review';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface DeleteReviewButtonProps {
    reviewId: string;
    path: string;
    isSmall?: boolean;
}

/**
 * DeleteReviewButton: Triggers the secure, optimistic-UI deletion sequence for a designated user review.
 */
export default function DeleteReviewButton({ reviewId, path, isSmall = false }: DeleteReviewButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm('Apakah Anda yakin ingin menghapus ulasan ini?')) return;

        setIsDeleting(true);
        try {
            const res = await deleteReview(reviewId, path);
            if (res.error) {
                toast.error(res.error);
            } else {
                toast.success('Ulasan berhasil dihapus.');
                router.refresh();
            }
        } catch (error) {
            toast.error('Gagal menghapus ulasan. Silakan coba lagi.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className={`flex items-center gap-1.5 font-black transition-colors ${isSmall
                    ? 'text-[9px] text-red-900/40 hover:text-red-900/70 uppercase tracking-widest italic'
                    : 'p-2 text-red-900/40 hover:text-red-900/70 hover:bg-red-900/5 dark:hover:bg-red-950/20 rounded-xl'
                }`}
            title="Hapus Ulasan"
        >
            {isDeleting ? (
                <Loader2 className={`${isSmall ? 'w-3 h-3' : 'w-4 h-4'} animate-spin`} />
            ) : (
                <Trash2 className={isSmall ? 'w-3 h-3' : 'w-4 h-4'} />
            )}
            {isSmall && (isDeleting ? 'Menghapus...' : 'Hapus')}
        </button>
    );
}
