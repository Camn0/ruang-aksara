'use client';

import { useState } from 'react';
import { registerAuthor } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export default function CreateAuthorForm() {
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        setMessage(null);

        const formData = new FormData(event.currentTarget);

        try {
            const result = await registerAuthor(formData);
            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: `Akun penulis ${result.data?.username} berhasil dibuat.` });
                (event.target as HTMLFormElement).reset();
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Kesalahan jaringan atau server.' });
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-parchment-light p-8 wobbly-border-sm border-2 border-ink/5 mb-10 w-full transition-all rotate-1">
            <h3 className="font-journal-title text-2xl text-ink-deep mb-3 italic leading-none">Pendaftaran Penulis Baru</h3>
            <p className="font-journal-body text-base text-ink/40 mb-8 italic">Berikan kunci akses untuk rekan penjelajah ceritamu. Mereka akan masuk menggunakan identitas ini.</p>

            {message && (
                <div className={`p-5 mb-8 wobbly-border-sm font-journal-body italic ${message?.type === 'error' ? 'bg-dried-red/5 text-dried-red border-dried-red/10' : 'bg-pine/5 text-pine border-pine/10'}`}>
                    {message?.text}
                </div>
            )}

            <div className="space-y-6">
                <div>
                    <label className="block font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 px-2">Nama Pena / Panggilan <span className="text-[8px] italic">(Opsional)</span></label>
                    <input name="display_name" type="text" placeholder="e.g. Sang Pengelana" className="w-full py-4 px-6 bg-paper wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:outline-none font-journal-body text-lg text-ink-deep transition-all placeholder:text-ink/10 shadow-inner" />
                </div>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <label className="block font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 px-2">Username Identitas</label>
                        <input name="username" type="text" required placeholder="author_baru" className="w-full py-4 px-6 bg-paper wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:outline-none font-journal-body text-lg text-ink-deep transition-all placeholder:text-ink/10 shadow-inner" />
                    </div>
                    <div className="flex-1">
                        <label className="block font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 px-2">Kata Sandi Rahasia</label>
                        <input name="password" type="password" required placeholder="Min. 6 Karakter" className="w-full py-4 px-6 bg-paper wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:outline-none font-journal-body text-lg text-ink-deep transition-all placeholder:text-ink/10 shadow-inner" />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-4 bg-pine text-parchment font-journal-title text-xl py-4 sm:py-5 wobbly-border-sm shadow-xl transition-all hover:rotate-1 active:scale-[0.98] disabled:opacity-50 italic"
                >
                    {isPending ? 'Mendaftarkan...' : 'Resmikan Penulis Baru ✨'}
                </button>
            </div>
        </form>
    );
}
