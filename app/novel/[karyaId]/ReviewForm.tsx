'use client';

import { useState } from 'react';
import { submitReview, submitRating } from '@/app/actions/user';
import { toast } from 'sonner';

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
                if (content.trim().length < 10) {
                    toast.error('Ulasan terlalu pendek (min. 10 karakter).');
                    setIsPending(false);
                    return;
                }
                // Submit full review (with optional rating)
                const formData = new FormData(event.currentTarget);
                const result = await submitReview(formData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Ulasan berhasil dipublikasikan!');
                }
            } else if (score > 0) {
                // Rating-only (no review text)
                const formData = new FormData();
                formData.append('karya_id', karyaId);
                formData.append('score', String(score));
                const result = await submitRating(formData);
                if (result.error) {
                    toast.error(result.error);
                } else {
                    toast.success('Rating berhasil disimpan!');
                }
            } else {
                toast.error('Pilih rating bintang atau tulis ulasan.');
            }
        } catch (error) {
            toast.error("Kesalahan jaringan.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white/40 dark:bg-brown-dark/40 border border-tan-primary/10 p-8 rounded-[2rem] transition-colors duration-300 shadow-sm backdrop-blur-sm">
            <h3 className="text-xs font-black text-brown-dark/40 dark:text-text-accent mb-6 uppercase tracking-[0.2em] italic">
                Penilaian & Ulasan
            </h3>

            <input type="hidden" name="karya_id" value={karyaId} />
            <input type="hidden" name="rating" value={score} />

            <div className="mb-6">
                <label className="block text-[10px] font-black text-tan-primary/60 dark:text-tan-light mb-3 uppercase tracking-widest">Beri Rating</label>
                <div className="flex items-center gap-4">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setScore(star)}
                                className={`text-3xl transition-transform hover:scale-110 active:scale-90 ${star <= score ? 'text-amber-500 drop-shadow-sm' : 'text-tan-primary/20 dark:text-brown-mid/50'}`}
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

            <div className="mb-8">
                <label className="block text-[10px] font-black text-tan-primary/60 dark:text-tan-light mb-3 uppercase tracking-widest">Ulasan (Opsional)</label>
                <textarea
                    name="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Bagikan goresan pikiranmu tentang karya ini..."
                    className="w-full border border-tan-primary/10 dark:border-brown-mid/50 bg-white/50 dark:bg-brown-mid/20 text-text-main dark:text-text-accent rounded-2xl p-4 text-sm focus:ring-2 focus:ring-tan-primary/20 outline-none min-h-[120px] transition-all placeholder:text-tan-primary/20 font-medium italic"
                ></textarea>
            </div>

            {success && (
                <p className="text-xs font-bold text-green-600 dark:text-green-400 mb-3 animate-pulse">{success}</p>
            )}

            <button
                type="submit"
                disabled={isPending || (score === 0 && !content.trim())}
                className="bg-brown-dark dark:bg-tan-primary text-text-accent dark:text-brown-dark font-black py-4 px-10 rounded-full hover:bg-brown-mid dark:hover:bg-tan-light disabled:opacity-50 disabled:cursor-not-allowed transition-all text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-brown-dark/10 active:scale-95"
            >
                {isPending ? 'Menyimpan...' : (existingReview ? 'Update' : (content.trim() ? 'Publikasi Ulasan' : 'Simpan Rating'))}
            </button>
        </form>
    );
}
