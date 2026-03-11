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
        <form onSubmit={handleSubmit} className="bg-parchment-light p-6 wobbly-border-sm selection:bg-pine/20">
            <h3 className="font-journal-title text-xl text-ink-deep mb-6 italic">
                Catatan Pengamatan Anda
            </h3>

            <input type="hidden" name="karya_id" value={karyaId} />
            <input type="hidden" name="rating" value={score} />

            <div className="mb-6">
                <label className="block font-special text-[10px] text-ink/40 mb-3 uppercase tracking-widest">Penilaian Bintang</label>
                <div className="flex items-center gap-6">
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(star => (
                            <button
                                key={star}
                                type="button"
                                onClick={() => setScore(star)}
                                className={`text-3xl transition-all active:scale-150 drop-shadow-sm ${star <= score ? 'text-gold rotate-6' : 'text-ink/10 -rotate-3 hover:text-gold/50'}`}
                            >
                                ★
                            </button>
                        ))}
                    </div>
                    {score > 0 && (
                        <button type="button" onClick={() => setScore(0)} className="font-marker text-sm text-ink/30 hover:text-dried-red transition-colors underline decoration-dotted">
                            Hapus Penilaian
                        </button>
                    )}
                </div>
            </div>

            <div className="mb-6">
                <label className="block font-special text-[10px] text-ink/40 mb-3 uppercase tracking-widest">Goresan Ulasan (Opsional)</label>
                <textarea
                    name="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Apa yang Anda temukan di halaman-halaman ini?"
                    className="w-full bg-white/60 border-2 border-ink/5 wobbly-border-sm p-4 font-journal-body text-lg text-ink-deep outline-none focus:bg-white focus:border-pine/20 transition-all min-h-[100px] italic leading-relaxed"
                ></textarea>
            </div>

            {success && (
                <p className="font-special text-[11px] text-pine mb-4 animate-bounce uppercase tracking-widest">✓ {success}</p>
            )}

            <button
                type="submit"
                disabled={isPending || (score === 0 && !content.trim())}
                className={`bg-pine text-parchment font-journal-title text-xl px-10 py-2.5 wobbly-border-sm hover:bg-ink-deep transition-all active:scale-95 disabled:opacity-20 disabled:grayscale rotate-[-1deg]`}
            >
                {isPending ? 'Mencatat...' : (existingReview ? 'DIPERBARUI' : (content.trim() ? 'SIMPAN OBSERVASI' : 'HANYA RATING'))}
            </button>
        </form>
    );
}
