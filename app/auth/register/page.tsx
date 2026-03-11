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
        <div className="min-h-screen bg-parchment-light flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-all duration-300">
            <div className="sm:mx-auto sm:w-full sm:max-w-md px-6">
                <h2 className="mt-6 text-center text-4xl font-journal-title italic text-ink-deep leading-tight">
                    Daftar Akun Pengelana
                </h2>
                <p className="mt-4 text-center">
                    <span className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em]">Atau </span>
                    <Link href="/api/auth/signin" className="font-journal-title text-xl text-pine hover:text-pine-light hover:underline underline-offset-8 transition-all italic">
                        Masuk ke akun yang sudah ada
                    </Link>
                </p>
            </div>

            <div className="mt-12 sm:mx-auto sm:w-full sm:max-w-md px-6">
                <div className="bg-white wobbly-border paper-shadow py-10 px-8 sm:px-12 -rotate-1 transition-all hover:rotate-0">

                    {message && (
                        <div className={`p-6 mb-8 font-journal-title text-lg italic wobbly-border-sm animate-in fade-in slide-in-from-top-4 ${message.type === 'error'
                            ? 'bg-dried-red/5 text-dried-red border-dried-red/10'
                            : 'bg-pine/5 text-pine border-pine/10'
                            }`}>
                            {message.text}
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="display_name" className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">
                                Nama Tampilan (Display Name)
                            </label>
                            <input
                                id="display_name"
                                name="display_name"
                                type="text"
                                required
                                className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-5 py-4 font-journal-body text-base text-ink-deep italic transition-all placeholder:text-ink/10"
                                placeholder="Sang Pujangga"
                            />
                        </div>

                        <div>
                            <label htmlFor="username" className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">
                                Nama Pengenal (Username)
                            </label>
                            <input
                                id="username"
                                name="username"
                                type="text"
                                required
                                className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-5 py-4 font-journal-body text-base text-ink-deep italic transition-all placeholder:text-ink/10"
                                placeholder="username_unik"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">
                                Kata Sandi Rahasia (Password)
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-5 py-4 font-journal-body text-base text-ink-deep italic transition-all placeholder:text-ink/10"
                                placeholder="********"
                            />
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-full bg-pine text-parchment font-journal-title text-2xl py-5 wobbly-border paper-shadow shadow-xl flex items-center justify-center gap-2 italic hover:rotate-1 active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isPending ? 'Mengukir Nama...' : 'Daftar Sekarang ✨'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
