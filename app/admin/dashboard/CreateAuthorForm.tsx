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
        <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-gray-100 dark:border-slate-700 mb-8 w-full transition-colors duration-300">
            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Tambah Akun Penulis</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Buatkan akun akses untuk anggota tim. Mereka akan login dengan username dan password ini.</p>

            {message && (
                <div className={`p-4 mb-6 text-sm rounded-xl font-medium border ${message?.type === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-100 dark:border-red-800/50' : 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-100 dark:border-green-800/50'}`}>
                    {message?.text}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1.5">Display Name <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">(Opsional)</span></label>
                    <input name="display_name" type="text" placeholder="Nama Pena / Panggilan" className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 text-sm text-gray-900 dark:text-gray-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                </div>
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1.5">Username Login</label>
                        <input name="username" type="text" required placeholder="Contoh: author123" className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 text-sm text-gray-900 dark:text-gray-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-bold text-gray-900 dark:text-gray-200 mb-1.5">Password Sementara</label>
                        <input name="password" type="password" required placeholder="Minimal 6 karakter" className="w-full py-2.5 px-4 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600 dark:focus:ring-indigo-500 text-sm text-gray-900 dark:text-gray-100 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500" />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full mt-2 bg-indigo-600 dark:bg-indigo-500 text-white font-bold py-3.5 px-4 rounded-xl shadow-md shadow-indigo-200 dark:shadow-none transition-all hover:bg-indigo-700 dark:hover:bg-indigo-400 active:scale-[0.98] disabled:opacity-50 text-sm"
                >
                    {isPending ? 'Mendaftarkan Penulis...' : 'Daftarkan Penulis Baru'}
                </button>
            </div>
        </form>
    );
}
