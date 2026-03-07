'use client';

import { useState } from 'react';
import { createBab } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export default function CreateBabForm({ karyaId }: { karyaId: string }) {
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const router = useRouter();

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
        <form onSubmit={handleSubmit} className="bg-gray-50 p-6 rounded-xl border border-gray-200 mt-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Tulis Bab Baru</h3>

            {message && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="mb-4">
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
                    Konten Bab (Teks Polos / HTML yang akan disanitasi)
                </label>
                <textarea
                    id="content"
                    name="content"
                    required
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="Pada suatu hari di sudut Fakultas Sastra..."
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                    Nomor Bab akan dibuatkan secara otomatis (Auto-increment).
                </p>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className={`w-full bg-indigo-600 text-white font-semibold py-2.5 px-4 rounded-md shadow-sm transition-colors ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-indigo-700'
                    }`}
            >
                {isPending ? 'Mengunggah...' : 'Publikasikan Bab'}
            </button>
        </form>
    );
}
