'use client';

import { useState } from 'react';
import { createKarya } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

interface Genre {
    id: string;
    name: string;
}

export default function CreateKaryaForm({ genres }: { genres: Genre[] }) {
    // Mengapa: Mengelola state loading pada tombol agar user tidak melakukan double-submit
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    // Mengapa: Fungsi pembungkus untuk memanggil Next.js Server Action
    async function handeSubmitAction(formData: FormData) {
        setIsPending(true);
        try {
            // Mengapa: Memanggil fungsi mutasi backend secara langsung (tanpa perlu fetch API manual).
            // Data otentikasi (cookie/session) dikirim otomatis oleh Next.js HTTP request background.
            const result = await createKarya(formData);

            if (result.error) {
                alert(result.error);
            } else {
                alert("Berhasil membuat karya baru!");
                // Mengapa: Menginstruksikan router klien untuk membuang cache halaman ini dan menarik ulang data dari Server
                // sehingga tabel/list Daftar Karya di Server Component akan langsung ter-update.
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan sistem saat menghubungi server.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form action={handeSubmitAction} className="bg-parchment-light p-8 wobbly-border-sm border-2 border-ink/5 mb-10 w-full transition-all -rotate-1">
            <h3 className="font-journal-title text-2xl text-ink-deep mb-3 italic leading-none">Menorehkan Karya Baru</h3>
            <p className="font-journal-body text-base text-ink/40 mb-8 italic">Berikan judul dan genre unik agar ceritamu mudah ditemukan di antara tumpukan arsip.</p>

            <div className="space-y-6">
                <div>
                    <label className="block font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 px-2">Judul Dokumen Karya</label>
                    <input
                        name="title"
                        type="text"
                        required
                        placeholder="Contoh: Sang Pemimpi"
                        className="w-full py-4 px-6 bg-paper wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:outline-none font-journal-body text-lg text-ink-deep transition-all placeholder:text-ink/10 shadow-inner"
                    />
                </div>

                <div>
                    <label className="block font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 px-2">Nama Alias Penulis (Nama Pena)</label>
                    <input
                        name="penulis_alias"
                        type="text"
                        required
                        placeholder="Contoh: Andrea Hirata"
                        className="w-full py-4 px-6 bg-paper wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:outline-none font-journal-body text-lg text-ink-deep transition-all placeholder:text-ink/10 shadow-inner"
                    />
                </div>

                <div>
                    <span className="block font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-4 px-2">Kategorisasi (Genre)</span>
                    {genres.length === 0 ? (
                        <p className="font-journal-body text-dried-red/50 italic text-sm">Belum ada genre di database. Hubungi admin.</p>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-paper/50 p-6 wobbly-border-sm">
                            {genres.map(g => (
                                <label key={g.id} className="flex items-center space-x-3 text-sm text-ink/70 cursor-pointer group">
                                    <input type="checkbox" name="genres" value={g.id} className="w-4 h-4 rounded-sm border-2 border-ink/20 text-pine focus:ring-pine/20 focus:ring-offset-0 bg-paper" />
                                    <span className="font-journal-body text-base italic group-hover:text-pine transition-colors">{g.name}</span>
                                </label>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-4 bg-gold text-ink-deep font-journal-title text-xl py-4 sm:py-5 wobbly-border-sm shadow-xl transition-all hover:rotate-1 active:scale-[0.98] disabled:opacity-50 italic"
                >
                    {isPending ? 'Menyegel...' : 'Torehkan Karya Baru ✨'}
                </button>
            </div>
        </form>
    );
}
