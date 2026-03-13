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
                <span className="mb-2 text-sm font-black text-brown-dark dark:text-gray-200 uppercase tracking-tight italic">Judul Karya</span>
                <input
                    name="title"
                    type="text"
                    placeholder="Masukkan judul cerita Anda..."
                    className="w-full py-3 px-4 bg-brown-dark/5 dark:bg-slate-800 border border-tan-primary/20 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tan-primary focus:bg-white dark:focus:bg-slate-900 dark:text-gray-100 transition-all text-sm font-bold placeholder:text-brown-dark/30"
                />
            </label>

            <label className="flex flex-col">
                <span className="mb-2 text-sm font-black text-brown-dark dark:text-gray-200 uppercase tracking-tight italic">Nama Pena / Alias Penulis <span className="text-[10px] text-brown-dark/40 font-normal lowercase">(Opsional)</span></span>
                <p className="text-[11px] text-brown-dark/50 dark:text-gray-400 mb-3 font-bold leading-relaxed">Jika dipakai, username Anda akan otomatis ditambahkan (Contoh: Kaguya Hime (admin)). Jika dikosongkan, akan menggunakan username Anda secara default.</p>
                <input
                    name="penulis_alias"
                    type="text"
                    className="w-full py-3 px-4 bg-brown-dark/5 dark:bg-slate-800 border border-tan-primary/20 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tan-primary focus:bg-white dark:focus:bg-slate-900 dark:text-gray-100 transition-all text-sm font-bold placeholder:text-brown-dark/30"
                    placeholder="Contoh: Kaguya Hime"
                />
            </label>


            <label className="flex flex-col">
                <span className="mb-2 text-sm font-black text-brown-dark dark:text-gray-200 flex justify-between items-center uppercase tracking-tight italic">
                    <span>URL Gambar Cover <span className="text-[10px] text-brown-dark/40 dark:text-gray-500 font-normal lowercase">(Opsional)</span></span>
                    <ImageIcon className="w-4 h-4 text-tan-primary" />
                </span>
                <input
                    name="cover_url"
                    type="url"
                    className="w-full py-3 px-4 bg-brown-dark/5 dark:bg-slate-800 border border-tan-primary/20 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tan-primary focus:bg-white dark:focus:bg-slate-900 dark:text-gray-100 transition-all text-sm font-bold placeholder:text-brown-dark/30"
                    placeholder="https://example.com/cover.jpg"
                />
            </label>

            <label className="flex flex-col">
                <span className="mb-2 text-sm font-black text-brown-dark dark:text-gray-200 uppercase tracking-tight italic">Deskripsi / Sinopsis <span className="text-[10px] text-brown-dark/40 dark:text-gray-500 font-normal lowercase">(Opsional)</span></span>
                <textarea
                    name="deskripsi"
                    rows={4}
                    className="w-full py-3 px-4 bg-brown-dark/5 dark:bg-slate-800 border border-tan-primary/20 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-tan-primary focus:bg-white dark:focus:bg-slate-900 dark:text-gray-100 transition-all text-sm font-bold placeholder:text-brown-dark/30 resize-none h-32"
                    placeholder="Tuliskan gambaran singkat cerita ini..."
                />
            </label>

            <div className="flex flex-col">
                <span className="mb-3 text-sm font-black text-brown-dark dark:text-gray-200 uppercase tracking-tight italic">Label Genre <span className="text-[10px] text-brown-dark/40 dark:text-gray-500 font-normal lowercase">(Opsional)</span></span>
                {genres.length === 0 ? (
                    <p className="text-xs text-red-500 dark:text-red-400 italic bg-red-50/50 dark:bg-red-900/30 p-3 rounded-lg border border-red-100">Belum ada genre di database.</p>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {genres.map(g => (
                            <label key={g.id} className="relative flex items-center justify-center py-2 px-3 border border-tan-primary/10 dark:border-slate-700 rounded-xl cursor-pointer hover:bg-brown-dark/5 dark:hover:bg-slate-800 has-[:checked]:bg-tan-primary/10 dark:has-[:checked]:bg-tan-primary/30 has-[:checked]:border-tan-primary/50 dark:has-[:checked]:border-tan-primary/50 has-[:checked]:text-brown-dark dark:has-[:checked]:text-tan-primary transition-all text-[11px] text-brown-dark/60 dark:text-gray-400 font-black uppercase tracking-tight">
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
                className="w-full mt-4 py-4 bg-brown-dark dark:bg-slate-100 text-white dark:text-gray-900 rounded-full font-black text-[12px] uppercase tracking-[0.2em] hover:bg-black dark:hover:bg-white transition-all active:scale-95 shadow-xl shadow-brown-dark/20 dark:shadow-none disabled:opacity-50"
            >
                {isPending ? 'Menyiapkan Kanvas...' : 'Buat Karya & Lanjut ke Editor'}
            </button>
        </form>
    );
}
