'use client';

import { useState } from 'react';
import { registerUser } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const router = useRouter();

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        setMessage(null);

        const formData = new FormData(event.currentTarget);

        try {
            const result = await registerUser(formData);
            if (result.error) {
                setMessage({ type: 'error', text: result.error });
            } else {
                setMessage({ type: 'success', text: 'Pendaftaran sukses! Silakan login.' });
                setTimeout(() => {
                    router.push('/api/auth/signin');
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat mendaftar.' });
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Daftar Akun Baru
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Atau{' '}
                    <Link href="/api/auth/signin" className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                        masuk ke akun yang sudah ada
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-100">

                    {message && (
                        <div className={`p-4 mb-6 text-sm rounded-lg ${message.type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' : 'bg-green-50 text-green-800 border border-green-200'}`}>
                            {message.text}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="display_name" className="block text-sm font-medium text-gray-700">
                                Nama Penampilan
                            </label>
                            <div className="mt-1">
                                <input id="display_name" name="display_name" type="text" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <div className="mt-1">
                                <input id="username" name="username" type="text" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input id="password" name="password" type="password" required className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                            </div>
                        </div>

                        <div>
                            <button type="submit" disabled={isPending} className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isPending ? 'opacity-70 cursor-not-allowed' : 'hover:bg-indigo-700'}`}>
                                {isPending ? 'Mendaftar...' : 'Daftar Sekarang'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
