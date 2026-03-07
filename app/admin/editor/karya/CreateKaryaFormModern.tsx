'use client';

import { useState } from 'react';
import { createKarya } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { ImageIcon } from 'lucide-react';

interface Genre {
    id: string;
    name: string;
}

export default function CreateKaryaFormModern({ genres }: { genres: Genre[] }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    async function handeSubmitAction(formData: FormData) {
        setIsPending(true);
        try {
            const result = await createKarya(formData);

            if (result.error) {
                alert(result.error);
                setIsPending(false);
            } else {
                // Jangan setIsPending(false) agar tombol tetap disable selama navigasi / refresh
                // Arahkan langsung ke halaman kelola / edit spesifik karya baru
                router.push(`/admin/editor/karya/${result.data?.id}`);
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan sistem.");
            setIsPending(false);
        }
    }

    return (
        <form action={handeSubmitAction} className="flex flex-col gap-6">

            <label className="flex flex-col">
                <span className="mb-2 text-sm font-bold text-gray-900">Judul Karya</span>
                <input
                    name="title"
                    type="text"
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-sm"
                    required
                    placeholder="Contoh: Bumi Manusia"
                />
            </label>

            <label className="flex flex-col">
                <span className="mb-2 text-sm font-bold text-gray-900">Nama Pena / Alias Penulis</span>
                <input
                    name="penulis_alias"
                    type="text"
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-sm"
                    required
                    placeholder="Contoh: Pramoedya Ananta Toer"
                />
            </label>

            <label className="flex flex-col">
                <span className="mb-2 text-sm font-bold text-gray-900 flex justify-between items-center">
                    <span>URL Gambar Cover <span className="text-xs text-gray-400 font-normal">(Opsional)</span></span>
                    <ImageIcon className="w-4 h-4 text-gray-400" />
                </span>
                <input
                    name="cover_url"
                    type="url"
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-sm"
                    placeholder="https://example.com/cover.jpg"
                />
            </label>

            <label className="flex flex-col">
                <span className="mb-2 text-sm font-bold text-gray-900">Deskripsi / Sinopsis <span className="text-xs text-gray-400 font-normal">(Opsional)</span></span>
                <textarea
                    name="deskripsi"
                    rows={4}
                    className="w-full py-3 px-4 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all text-sm resize-none"
                    placeholder="Tuliskan gambaran singkat cerita ini..."
                />
            </label>

            <div className="flex flex-col">
                <span className="mb-3 text-sm font-bold text-gray-900">Label Genre <span className="text-xs text-gray-400 font-normal">(Opsional)</span></span>
                {genres.length === 0 ? (
                    <p className="text-xs text-red-500 italic bg-red-50 p-3 rounded-lg">Belum ada genre di database.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {genres.map(g => (
                            <label key={g.id} className="relative flex items-center justify-center py-2 px-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-600 has-[:checked]:text-indigo-700 transition-all text-sm text-gray-600 font-medium">
                                <input type="checkbox" name="genres" value={g.id} className="absolute opacity-0 w-0 h-0" />
                                <span>{g.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full mt-4 py-4 bg-gray-900 text-white rounded-full font-bold text-sm hover:bg-black transition-all active:scale-95 shadow-xl shadow-gray-200 disabled:opacity-50"
            >
                {isPending ? 'Menyiapkan Kanvas...' : 'Buat Karya & Lanjut ke Editor'}
            </button>
        </form>
    );
}
