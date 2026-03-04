'use client';

import { useState } from 'react';
import { submitRating } from '@/app/actions/user';
import { useRouter } from 'next/navigation';

export default function RatingForm({ karyaId, defaultScore = 0 }: { karyaId: string, defaultScore?: number }) {
    const [score, setScore] = useState(defaultScore);
    const [isHovering, setIsHovering] = useState(0);
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handleRatingSubmit(selectedScore: number) {
        setIsPending(true);
        setScore(selectedScore);

        const formData = new FormData();
        formData.append('karya_id', karyaId);
        formData.append('score', selectedScore.toString());

        try {
            const result = await submitRating(formData);
            if (result.error) {
                alert(result.error);
                // Kembalikan ke UI state lama jika gagal
                setScore(defaultScore);
            } else {
                alert("Terima kasih! Rating Anda berhasil disimpan.");
                router.refresh(); // Refresh Server Component untuk mengambil avg_rating terbaru
            }
        } catch (error) {
            console.error(error);
            alert("Sistem sedang sibuk. Gagal menyimpan rating.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="flex flex-col items-center bg-white p-6 rounded-2xl border border-yellow-100 shadow-sm">
            <h3 className="text-gray-900 font-semibold mb-3">Berikan Penilaian Anda</h3>
            <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        disabled={isPending}
                        onMouseEnter={() => setIsHovering(star)}
                        onMouseLeave={() => setIsHovering(0)}
                        onClick={() => handleRatingSubmit(star)}
                        className={`text-4xl transition-all duration-200 focus:outline-none ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:scale-125'} ${star <= (isHovering || score) ? 'text-yellow-400' : 'text-gray-200'
                            }`}
                        title={`Beri rating ${star} bintang`}
                    >
                        ★
                    </button>
                ))}
            </div>
            {score > 0 && (
                <p className="text-sm text-green-600 mt-3 font-medium animate-pulse">
                    Anda memberikan {score} bintang.
                </p>
            )}
        </div>
    );
}
