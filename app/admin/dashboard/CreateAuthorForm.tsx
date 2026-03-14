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
        <form onSubmit={handleSubmit} className="bg-text-main/5 dark:bg-brown-mid/50 p-6 rounded-2xl border border-text-main/10 dark:border-white/5 mb-8 w-full transition-colors duration-300">
            <h3 className="text-lg font-bold text-text-main dark:text-text-accent mb-2">Tambah Akun Penulis</h3>
            <p className="text-sm text-text-main/50 dark:text-tan-light mb-6 font-bold leading-relaxed">Buatkan akun akses untuk anggota tim. Mereka akan login dengan username dan password ini.</p>

            {message && (
                <div className={`p-4 mb-6 text-sm rounded-xl font-medium border ${message?.type === 'error' ? 'bg-red-50/50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800/50' : 'bg-green-50/50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800/50'}`}>
                    {message?.text}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-text-main/80 dark:text-bg-cream/80 mb-1.5 uppercase tracking-tighter">Display Name <span className="text-[10px] text-text-main/40 dark:text-white/40 font-normal italic lowercase">(Opsional)</span></label>
                    <input name="display_name" type="text" placeholder="Nama Pena / Panggilan" className="w-full py-2.5 px-4 bg-white/50 dark:bg-brown-dark border border-text-main/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-tan-primary dark:focus:ring-tan-primary text-sm text-text-main dark:text-text-accent transition-all placeholder:text-text-main/30 dark:placeholder:text-white/30 font-bold" />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-text-main/80 dark:text-bg-cream/80 mb-1.5 uppercase tracking-tighter">Username Login</label>
                        <input name="username" type="text" required placeholder="Contoh: author123" className="w-full py-2.5 px-4 bg-white/50 dark:bg-brown-dark border border-text-main/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-tan-primary dark:focus:ring-tan-primary text-sm text-text-main dark:text-text-accent transition-all placeholder:text-text-main/30 dark:placeholder:text-white/30 font-bold" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-text-main/80 dark:text-bg-cream/80 mb-1.5 uppercase tracking-tighter">Password Sementara</label>
                        <input name="password" type="password" required placeholder="Minimal 6 karakter" className="w-full py-2.5 px-4 bg-white/50 dark:bg-brown-dark border border-text-main/20 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-tan-primary dark:focus:ring-tan-primary text-sm text-text-main dark:text-text-accent transition-all placeholder:text-text-main/30 dark:placeholder:text-white/30 font-bold" />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-2 bg-text-main dark:bg-brown-mid text-bg-cream font-black py-3.5 px-4 rounded-xl shadow-lg shadow-text-main/10 dark:shadow-none transition-all hover:bg-brown-dark dark:hover:bg-tan-primary active:scale-[0.98] disabled:opacity-50 text-[10px] uppercase tracking-widest border border-white/5"
                >
                    {isPending ? 'Mendaftarkan Penulis...' : 'Daftarkan Penulis Baru'}
                </button>
            </div>
        </form>
    );
}
