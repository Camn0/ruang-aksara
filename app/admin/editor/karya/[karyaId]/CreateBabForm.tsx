'use client';

import { useState, useEffect } from 'react';
import { createBab } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

export default function CreateBabForm({ karyaId }: { karyaId: string }) {
    const [isPending, setIsPending] = useState(false);
    const [content, setContent] = useState('');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const router = useRouter();
    const draftKey = `draft-bab-${karyaId}`;

    useEffect(() => {
        const savedDraft = localStorage.getItem(draftKey);
        if (savedDraft) {
            setContent(savedDraft);
            setLastSaved(new Date());
        }
    }, [draftKey]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setContent(val);
        localStorage.setItem(draftKey, val);
        setLastSaved(new Date());
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        setMessage(null);

        const formData = new FormData(event.currentTarget);
        formData.append('karya_id', karyaId);

        try {
            const result = await createBab(formData);
            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'Berhasil mengunggah bab baru!' });
                localStorage.removeItem(draftKey);
                setContent('');
                setLastSaved(null);
                (event.target as HTMLFormElement).reset(); // Kosongkan form setelah sukses
                router.refresh(); // Segarkan route untuk mengambil list bab terbaru dari database
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menghubungi server.' });
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-8 wobbly-border paper-shadow mt-12 transition-all rotate-1 hover:rotate-0">
            <h3 className="font-journal-title text-2xl text-ink-deep italic mb-6">Ukir Lembaran Baru</h3>

            {message && (
                <div className={`p-5 mb-6 wobbly-border-sm font-journal-body text-sm italic ${message.type === 'error' ? 'bg-dried-red/5 text-dried-red' : 'bg-pine/5 text-pine'}`}>
                    {message.text}
                </div>
            )}

            <div className="mb-6">
                <label htmlFor="title" className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">
                    Judul Lembaran <span className="opacity-50">(Opsional)</span>
                </label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-6 py-4 font-journal-body text-xl text-ink-deep italic transition-all"
                    placeholder="e.g. Awal Mula Kejadian"
                />
            </div>

            <div className="mb-8">
                <div className="flex justify-between items-end mb-2 px-2">
                    <label htmlFor="content" className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em]">
                        Isi Cerita
                    </label>
                    {lastSaved && (
                        <div className="flex items-center gap-2 font-special text-[9px] text-pine uppercase tracking-widest">
                            <Save className="w-3.5 h-3.5" />
                            <span>Draf Tersimpan {lastSaved.toLocaleTimeString('id-ID')}</span>
                        </div>
                    )}
                </div>
                <textarea
                    id="content"
                    name="content"
                    required
                    value={content}
                    onChange={handleContentChange}
                    rows={15}
                    className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-6 py-4 font-journal-body text-lg text-ink-deep italic transition-all mb-4"
                    placeholder="Mulailah menggoreskan tinta di sini..."
                ></textarea>
                <p className="font-journal-body text-xs text-ink/30 italic ml-2">
                    * Urutan lembaran akan tercatat secara otomatis mengikuti jejak sebelumnya.
                </p>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full py-5 bg-pine text-parchment wobbly-border-sm font-journal-title text-2xl italic hover:bg-pine-light transition-all active:scale-95 shadow-xl disabled:opacity-50"
            >
                {isPending ? 'Mengarsipkan...' : 'Abadikan Lembaran Ini'}
            </button>
        </form>
    );
}
