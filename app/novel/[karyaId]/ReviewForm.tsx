'use client';

import { useState } from 'react';
import { submitReview } from '@/app/actions/user';
import { useRouter } from 'next/navigation';

export default function ReviewForm({ karyaId, existingReview }: { karyaId: string, existingReview?: any }) {
    const [isPending, setIsPending] = useState(false);
    const [score, setScore] = useState(existingReview?.rating || 5);
    const [content, setContent] = useState(existingReview?.content || "");
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);

        const formData = new FormData(event.currentTarget);

        try {
            const result = await submitReview(formData);
            if (result.error) {
                alert(result.error);
            } else {
                alert("Terima kasih, ulasan Anda berhasil dipublikasikan!");
                router.refresh();
            }
        } catch (error) {
            alert("Kesalahan jaringan.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="mt-8 bg-gray-50 border border-gray-200 p-6 rounded-xl">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                ✎ Tulis Ulasan Resmi
            </h3>

            <input type="hidden" name="karya_id" value={karyaId} />
            <input type="hidden" name="rating" value={score} />

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Penilaian Anda (1-5 Bintang)</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setScore(star)}
                            className={`text-2xl transition-transform hover:scale-110 ${star <= score ? 'text-yellow-400' : 'text-gray-300'}`}
                        >
                            ★
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Isi Ulasan Mendalam</label>
                <textarea
                    name="content"
                    required
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Bagaimana pendapat Anda tentang pengembangan karakter, alur cerita, atau gaya bahasa novel ini? (Minimal 50 kata sangat disarankan)"
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 outline-none min-h-[120px]"
                ></textarea>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="bg-indigo-600 text-white font-medium py-2 px-6 rounded hover:bg-indigo-700 disabled:opacity-50 transition"
            >
                {isPending ? 'Menyimpan...' : (existingReview ? 'Update Ulasan' : 'Publikasi Ulasan')}
            </button>
        </form>
    );
}
