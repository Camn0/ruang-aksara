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
                className="w-full py-4 bg-white wobbly-border-sm border-2 border-pine text-pine font-journal-title text-xl italic hover:bg-pine hover:text-parchment transition-all shadow-md active:scale-95"
            >
                Ubah Metadata Hikayat
            </button>
        );
    }

    return (
        <form action={handleSubmit} className="p-8 mt-6 wobbly-border paper-shadow bg-white flex flex-col gap-8 transition-all relative">
            <div className="flex justify-between items-center border-b border-ink/5 pb-4 mb-2">
                <h2 className="font-journal-title text-2xl text-ink-deep italic">Sunting Logika & Estetika</h2>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="text-ink/40 hover:text-ink-deep font-marker text-[10px] uppercase bg-ink/5 px-4 py-2 wobbly-border-sm transition-all"
                >
                    Tutup
                </button>
            </div>

            <input type="hidden" name="id" value={karya.id} />

            <label className="flex flex-col">
                <span className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">Judul Mahakarya</span>
                <input
                    name="title"
                    type="text"
                    defaultValue={karya.title}
                    className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-6 py-4 font-journal-body text-xl text-ink-deep italic transition-all"
                    required
                />
            </label>

            <label className="flex flex-col">
                <span className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">Identitas Sang Penulis <span className="opacity-50">(Nama Pena)</span></span>
                <p className="font-journal-body text-sm text-ink/40 mb-3 italic">Jika memakai alias, username Anda akan otomatis ditambahkan (Contoh: Sang Bijak (admin)).</p>
                <input
                    name="penulis_alias"
                    type="text"
                    defaultValue={karya.penulis_alias.replace(/\s\([^)]+\)$/, '')}
                    className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-6 py-4 font-journal-body text-xl text-ink-deep italic transition-all"
                />
            </label>


            <label className="flex flex-col">
                <span className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">Visual Lembaran Sampul (URL)</span>
                <input
                    name="cover_url"
                    type="url"
                    defaultValue={karya.cover_url || ""}
                    className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-6 py-4 font-journal-body text-xl text-ink-deep italic transition-all"
                />
            </label>

            <label className="flex flex-col">
                <span className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">Kilasan Sinopsis</span>
                <textarea
                    name="deskripsi"
                    rows={6}
                    defaultValue={karya.deskripsi || ""}
                    className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-6 py-4 font-journal-body text-xl text-ink-deep italic transition-all resize-none"
                />
            </label>

            <div className="flex flex-col">
                <span className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-4 block ml-2">Aliran Hikayat (Genre)</span>
                <div className="grid grid-cols-2 gap-4">
                    {allGenres.map(g => (
                        <label key={g.id} className="relative flex items-center justify-center py-3 px-4 wobbly-border-sm cursor-pointer hover:bg-gold/10 transition-all text-sm font-marker uppercase tracking-widest text-ink/40 has-[:checked]:bg-pine has-[:checked]:text-parchment has-[:checked]:border-none shadow-sm">
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

            <label className="flex items-center gap-4 p-5 bg-parchment-light wobbly-border-sm cursor-pointer transition-all hover:bg-white group">
                <input
                    type="checkbox"
                    name="is_completed"
                    value="true"
                    defaultChecked={karya.is_completed}
                    className="w-6 h-6 text-pine rounded-md border-ink/20 focus:ring-pine/30 bg-white"
                />
                <div className="flex flex-col">
                    <span className="font-journal-title text-xl text-ink-deep italic">Tamatkan Hikayat Ini</span>
                    <span className="font-journal-body text-sm text-ink/40 italic">Para pembaca akan tahu bahwa petualangan ini telah berakhir secara resmi.</span>
                </div>
            </label>

            <button
                type="submit"
                disabled={isPending}
                className="w-full mt-4 py-5 bg-pine text-parchment wobbly-border-sm font-journal-title text-2xl italic hover:bg-pine-light transition-all active:scale-95 shadow-xl disabled:opacity-50"
            >
                {isPending ? 'Mengarsipkan...' : 'Abadikan Perubahan'}
            </button>
        </form>
    );
}
