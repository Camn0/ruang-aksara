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
        <form action={handeSubmitAction} className="flex flex-col gap-10">

            <label className="flex flex-col">
                <span className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">Judul Mahakarya Anda</span>
                <input
                    name="title"
                    type="text"
                    required
                    placeholder="e.g. Di Bawah Cahaya Purnama"
                    className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-6 py-4 font-journal-body text-xl text-ink-deep italic transition-all placeholder:text-ink/10"
                />
            </label>

            <label className="flex flex-col">
                <span className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">Identitas Sang Penulis <span className="opacity-50">(Nama Pena)</span></span>
                <p className="font-journal-body text-sm text-ink/40 mb-3 italic">Jika memakai alias, username Anda akan otomatis ditambahkan (Contoh: Sang Bijak (admin)).</p>
                <input
                    name="penulis_alias"
                    type="text"
                    className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-6 py-4 font-journal-body text-xl text-ink-deep italic transition-all placeholder:text-ink/10"
                    placeholder="e.g. Sang Bijak"
                />
            </label>


            <label className="flex flex-col">
                <span className="mb-2 flex justify-between items-center px-2">
                    <span className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em]">Gambaran Visual (URL Cover)</span>
                    <ImageIcon className="w-4 h-4 text-ink/20" />
                </span>
                <input
                    name="cover_url"
                    type="url"
                    className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-6 py-4 font-journal-body text-xl text-ink-deep italic transition-all placeholder:text-ink/10"
                    placeholder="https://images.unsplash.com/your-art.jpg"
                />
            </label>

            <label className="flex flex-col">
                <span className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">Kilas Balik & Sinopsis</span>
                <textarea
                    name="deskripsi"
                    rows={6}
                    className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-6 py-4 font-journal-body text-xl text-ink-deep italic transition-all placeholder:text-ink/10 resize-none"
                    placeholder="Ringkaskan takdir para tokoh dalam beberapa kalimat..."
                />
            </label>

            <div className="flex flex-col">
                <span className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-4 block ml-2">Label Aliran Cerita (Genre)</span>
                {genres.length === 0 ? (
                    <p className="font-journal-body text-sm text-dried-red italic bg-dried-red/5 p-4 wobbly-border-sm">Belum ada aliran yang tercatat di arsip.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {genres.map(g => (
                            <label key={g.id} className="relative flex items-center justify-center py-3 px-4 wobbly-border-sm cursor-pointer hover:bg-gold/10 transition-all text-sm font-marker uppercase tracking-widest text-ink/40 has-[:checked]:bg-pine has-[:checked]:text-parchment has-[:checked]:border-none shadow-sm">
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
                className="w-full mt-6 py-5 bg-pine text-parchment wobbly-border-sm font-journal-title text-2xl italic hover:bg-pine-light transition-all active:scale-95 shadow-xl disabled:opacity-50"
            >
                {isPending ? 'Mengukir Prasasti...' : 'Abadikan Kerangka & Lanjut Menulis'}
            </button>
        </form>
    );
}
