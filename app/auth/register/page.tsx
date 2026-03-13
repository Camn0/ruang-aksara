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

    const inputClass = "appearance-none block w-full py-4 px-5 rounded-2xl border border-[#3B2A22]/20 bg-[#E8DDD0] dark:bg-slate-900 dark:border-slate-700 dark:text-gray-100 text-[#3B2A22] placeholder:text-[#7A553A]/60 focus:outline-none focus:ring-2 focus:ring-[#7A553A]/30 transition-all text-base";

    return (
        <div className="min-h-screen bg-[#F3E9D7] dark:bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-300">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-[#3B2A22] dark:text-gray-100">
                    Daftar Akun Baru
                </h2>
                <p className="mt-2 text-center text-sm text-[#7A553A] dark:text-gray-400">
                    Atau{' '}
                    <Link href="/api/auth/signin" className="font-medium text-[#7A553A] dark:text-[#B08968] hover:text-[#3B2A22] dark:hover:text-[#D6BFA6] transition-colors underline underline-offset-2">
                        masuk ke akun yang sudah ada
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-[#F3E9D7]/80 dark:bg-slate-900 py-8 px-4 sm:rounded-2xl sm:px-10 border border-[#D6BFA6] dark:border-slate-800 transition-colors duration-300">

                    {message && (
                        <div className={`p-4 mb-6 text-sm rounded-2xl text-center font-medium animate-in fade-in slide-in-from-top-2 ${message.type === 'error'
                            ? 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                            : 'bg-[#D6BFA6]/50 text-[#3B2A22] dark:bg-green-900/30 dark:text-green-400'
                        }`}>
                            {message.text}
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="display_name" className="block text-xs font-bold text-[#7A553A] dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                Display Name
                            </label>
                            <input id="display_name" name="display_name" type="text" placeholder='Enter your display name' required className={inputClass} />
                        </div>

                        <div>
                            <label htmlFor="username" className="block text-xs font-bold text-[#7A553A] dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                Username
                            </label>
                            <input id="username" name="username" type="text" placeholder='Enter your username' required className={inputClass} />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-xs font-bold text-[#7A553A] dark:text-gray-300 mb-1.5 uppercase tracking-wider">
                                Password
                            </label>
                            <input id="password" name="password" type="password" placeholder='Enter your password' required className={inputClass} />
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isPending}
                                className={`w-full flex justify-center py-4 px-4 rounded-2xl font-semibold text-base text-[#F3E9D7] bg-[#3B2A22] dark:bg-[#F3E9D7] dark:text-[#3B2A22] transition-all active:scale-95 focus:outline-none ${isPending ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#7A553A] dark:hover:bg-[#D6BFA6]'}`}
                            >
                                {isPending ? 'Mendaftar...' : 'Daftar Sekarang'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}