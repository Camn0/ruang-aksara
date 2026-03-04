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
        <form onSubmit={handleSubmit} className="bg-purple-50 p-6 rounded-xl border border-purple-200 mb-8 max-w-lg">
            <h3 className="text-xl font-bold text-purple-900 mb-2">Manajemen Penulis (God Mode)</h3>
            <p className="text-sm text-purple-700 mb-4">Buatkan akun akses untuk ke-15 anggota tim. Mereka hanya akan bisa mengedit karyanya sendiri.</p>

            {message && (
                <div className={`p-4 mb-4 text-sm rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-800' : 'bg-green-50 text-green-800'}`}>
                    {message.text}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Display Name</label>
                    <input name="display_name" type="text" required placeholder="Nama Pena / Panggilan" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 text-sm" />
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Username Login</label>
                        <input name="username" type="text" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 text-sm" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700">Password Sementara</label>
                        <input name="password" type="password" required className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 text-sm" />
                    </div>
                </div>
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full bg-purple-600 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition-colors hover:bg-purple-700"
                >
                    {isPending ? 'Mendaftarkan...' : 'Daftarkan Penulis Baru'}
                </button>
            </div>
        </form>
    );
}
