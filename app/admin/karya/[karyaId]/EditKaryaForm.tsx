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
                className="px-4 py-2 border border-blue-200 text-blue-600 rounded bg-blue-50 hover:bg-blue-100 font-medium transition"
            >
                Edit Meta Karya
            </button>
        );
    }

    return (
        <form action={handleSubmit} className="p-6 mt-4 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-4 shadow-sm w-full text-left">
            <h2 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-2">Edit Karya</h2>
            <input type="hidden" name="id" value={karya.id} />

            <label className="flex flex-col">
                <span className="mb-1 text-sm font-medium text-gray-700">Judul Karya</span>
                <input
                    name="title"
                    type="text"
                    defaultValue={karya.title}
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
            </label>

            <label className="flex flex-col">
                <span className="mb-1 text-sm font-medium text-gray-700">Nama Alias Penulis</span>
                <input
                    name="penulis_alias"
                    type="text"
                    defaultValue={karya.penulis_alias}
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                />
            </label>

            <div className="flex flex-col mb-2">
                <span className="mb-2 text-sm font-medium text-gray-700">Ubah Genre</span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {allGenres.map(g => (
                        <label key={g.id} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                            <input
                                type="checkbox"
                                name="genres"
                                value={g.id}
                                defaultChecked={karya.genres.some(existing => existing.id === g.id)}
                                className="rounded text-blue-600 focus:ring-blue-500"
                            />
                            <span>{g.name}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex gap-2 mt-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50"
                >
                    {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="bg-gray-200 text-gray-700 font-medium py-2 px-4 rounded hover:bg-gray-300 transition"
                >
                    Batal
                </button>
            </div>
        </form>
    );
}
