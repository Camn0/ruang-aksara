'use client';

import { useState } from 'react';
import { submitReview, submitRating } from '@/app/actions/user';

export default function ReviewForm({ karyaId, existingReview, defaultScore = 0 }: { karyaId: string, existingReview?: any, defaultScore?: number }) {
    const [isPending, setIsPending] = useState(false);
    const [score, setScore] = useState(existingReview?.rating || defaultScore || 0);
    const [content, setContent] = useState(existingReview?.content || "");
    const [success, setSuccess] = useState('');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isPending) return;
        setIsPending(true);
        setSuccess('');

        try {
            if (content.trim()) {
                // Submit full review (with optional rating)
                const formData = new FormData(event.currentTarget);
                const result = await submitReview(formData);
                if (result.error) {
                    alert(result.error);
                } else {
                    setSuccess('Ulasan berhasil dipublikasikan!');
                    setTimeout(() => setSuccess(''), 3000);
                }
            } else if (score > 0) {
                // Rating-only (no review text)
                const formData = new FormData();
                formData.append('karya_id', karyaId);
                formData.append('score', String(score));
                const result = await submitRating(formData);
                if (result.error) {
                    alert(result.error);
                } else {
                    setSuccess('Rating berhasil disimpan!');
                    setTimeout(() => setSuccess(''), 3000);
                }
            } else {
                alert('Pilih rating bintang atau tulis ulasan.');
            }
        } catch (error) {
            alert("Kesalahan jaringan.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-800 p-6 rounded-xl transition-colors duration-300">
            <h3 className="text-sm font-black text-gray-900 dark:text-gray-100 mb-4 uppercase tracking-wider">
                Penilaian & Ulasan
            </h3>

            <input type="hidden" name="karya_id" value={karyaId} />
            <input type="hidden" name="rating" value={score} />

            <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Beri Rating</label>
                <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setScore(star)}
                                className={`text-2xl transition-transform hover:scale-110 ${star <= score ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    {score > 0 && (
                        <button type="button" onClick={() => setScore(0)} className="text-xs text-gray-500 hover:text-red-500 transition-colors">
                            Hapus
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">Ulasan (Opsional)</label>
                <textarea
                    name="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Tulis pendapat Anda tentang karya ini..."
                    className="w-full border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 outline-none min-h-[80px] transition-colors"
                ></textarea>
            </div>

            {success && (
                <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-3 animate-pulse">{success}</p>
            )}

            <button
                type="submit"
                disabled={isPending || (score === 0 && !content.trim())}
                className="bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-2.5 px-6 rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-400 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm"
            >
                {isPending ? 'Menyimpan...' : (existingReview ? 'Update' : (content.trim() ? 'Publikasi Ulasan' : 'Simpan Rating'))}
            </button>
        </form>
    );
}
