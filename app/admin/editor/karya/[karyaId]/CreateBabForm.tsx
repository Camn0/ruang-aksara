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
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-900/50 p-6 rounded-xl border border-gray-200 dark:border-slate-800 mt-8 transition-colors duration-300">
            <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Tulis Bab Baru</h3>

            {message && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${message.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-400' : 'bg-green-50 dark:bg-green-900/30 text-green-800 dark:text-green-400'}`}>
                    {message.text}
                </div>
            )}

            <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Judul Bab <span className="text-gray-400 dark:text-gray-500 font-normal">(opsional)</span>
                </label>
                <input
                    id="title"
                    name="title"
                    type="text"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                    placeholder="contoh: Perkenalan Sang Tokoh"
                />
            </div>

            <div className="mb-4">
                <div className="flex justify-between items-end mb-1">
                    <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Konten Bab
                    </label>
                    {lastSaved && (
                        <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-500 font-medium">
                            <Save className="w-3 h-3" />
                            <span>Draft tersimpan {lastSaved.toLocaleTimeString('id-ID')}</span>
                        </div>
                    )}
                </div>
                <textarea
                    id="content"
                    name="content"
                    required
                    value={content}
                    onChange={handleContentChange}
                    rows={12}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-slate-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 transition-colors"
                    placeholder="Pada suatu hari di sudut Fakultas Sastra..."
                ></textarea>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Nomor Bab akan dibuatkan secara otomatis (Auto-increment).
                </p>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className={`w-full bg-indigo-600 dark:bg-indigo-500 text-white font-semibold py-2.5 px-4 rounded-md shadow-sm transition-colors ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700 dark:hover:bg-indigo-400'
                    }`}
            >
                {isPending ? 'Mengunggah...' : 'Publikasikan Bab'}
            </button>
        </form>
    );
}
