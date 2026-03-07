'use client';

import { useState } from 'react';
import { editKarya } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

interface Genre {
    id: string;
    name: string;
}

interface Karya {
    id: string;
    title: string;
    penulis_alias: string;
    deskripsi: string | null;
    cover_url: string | null;
    is_completed: boolean;
    genres: Genre[];
}

export default function EditKaryaForm({ karya, allGenres }: { karya: Karya, allGenres: Genre[] }) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const result = await editKarya(formData);
            if (result.error) {
                alert(result.error);
            } else {
                setIsOpen(false);
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setIsPending(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-3 bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-500 text-indigo-700 dark:text-indigo-400 rounded-xl font-bold text-sm hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors shadow-sm"
            >
                Edit Metadata Cerita
            </button>
        );
    }

    return (
        <form action={handleSubmit} className="p-6 mt-4 border border-gray-100 dark:border-slate-800 rounded-3xl bg-white dark:bg-slate-900 shadow-sm w-full text-left flex flex-col gap-6 transition-colors duration-300">
            <div className="flex justify-between items-center border-b border-gray-100 dark:border-slate-800 pb-4 mb-2">
                <h2 className="font-black text-lg text-gray-900 dark:text-gray-100">Edit Metadata</h2>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 text-sm font-bold bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full transition-colors"
                >
                    Tutup
                </button>
            </div>

            <input type="hidden" name="id" value={karya.id} />

            <label className="flex flex-col">
                <span className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-200">Judul Karya</span>
                <input
                    name="title"
                    type="text"
                    defaultValue={karya.title}
                    className="w-full py-3 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 dark:text-gray-100 transition-all text-sm"
                    required
                />
            </label>

            <label className="flex flex-col">
                <span className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-200">Nama Pena / Alias Penulis <span className="text-xs text-gray-400 font-normal">(Opsional)</span></span>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Jika dipakai, username Anda akan otomatis ditambahkan (Contoh: Kaguya Hime (admin)). Jika dikosongkan, akan menggunakan username Anda secara default.</p>
                <input
                    name="penulis_alias"
                    type="text"
                    defaultValue={karya.penulis_alias.replace(/\s\([^)]+\)$/, '')}
                    className="w-full py-3 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 dark:text-gray-100 transition-all text-sm"
                    placeholder="Contoh: Kaguya Hime"
                />
            </label>


            <label className="flex flex-col">
                <span className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-200">URL Gambar Cover</span>
                <input
                    name="cover_url"
                    type="url"
                    defaultValue={karya.cover_url || ""}
                    className="w-full py-3 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 dark:text-gray-100 transition-all text-sm"
                />
            </label>

            <label className="flex flex-col">
                <span className="mb-2 text-sm font-bold text-gray-900 dark:text-gray-200">Deskripsi / Sinopsis</span>
                <textarea
                    name="deskripsi"
                    rows={4}
                    defaultValue={karya.deskripsi || ""}
                    className="w-full py-3 px-4 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 focus:bg-white dark:focus:bg-slate-900 dark:text-gray-100 transition-all text-sm resize-none"
                />
            </label>

            <div className="flex flex-col">
                <span className="mb-3 text-sm font-bold text-gray-900 dark:text-gray-200">Label Genre</span>
                <div className="grid grid-cols-2 gap-3">
                    {allGenres.map(g => (
                        <label key={g.id} className="relative flex items-center justify-center py-2 px-3 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-800 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/30 has-[:checked]:border-indigo-600 dark:has-[:checked]:border-indigo-500 has-[:checked]:text-indigo-700 dark:has-[:checked]:text-indigo-400 transition-all text-sm text-gray-600 dark:text-gray-400 font-medium">
                            <input
                                type="checkbox"
                                name="genres"
                                value={g.id}
                                defaultChecked={karya.genres.some(existing => existing.id === g.id)}
                                className="absolute opacity-0 w-0 h-0"
                            />
                            <span>{g.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            <label className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-slate-800/50 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer transition-colors">
                <input
                    type="checkbox"
                    name="is_completed"
                    value="true"
                    defaultChecked={karya.is_completed}
                    className="w-5 h-5 text-indigo-600 dark:text-indigo-500 rounded border-gray-300 dark:border-slate-600 focus:ring-indigo-500 dark:focus:ring-indigo-400 dark:bg-slate-900"
                />
                <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900 dark:text-gray-100 line-clamp-1 truncate block">Tandai Cerita Sebagai Selesai (Tamat)</span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 block truncate">Pembaca akan tahu bahwa cerita sudah tidak akan diupdate.</span>
                </div>
            </label>

            <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-4 bg-gray-900 dark:bg-slate-100 text-white dark:text-gray-900 rounded-full font-bold text-sm hover:bg-black dark:hover:bg-white transition-all active:scale-95 shadow-xl shadow-gray-200 dark:shadow-none disabled:opacity-50"
            >
                {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
        </form>
    );
}
