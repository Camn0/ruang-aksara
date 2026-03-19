'use client';

import { useState } from 'react';
import { registerUser } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, ArrowLeft } from "lucide-react";
import Link from 'next/link';


export default function RegisterPage() {
    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const [showPassword, setShowPassword] = useState(false);
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
                    router.push('/auth/login');
                }, 1500);
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat mendaftar.' });
        } finally {
            setIsPending(false);
        }
    }

    const borderedInputClass =
        "w-full py-5 px-7 rounded-2xl border-[3px] border-brown-dark/20 dark:border-brown-mid/30 bg-white/50 dark:bg-brown-mid/10 text-text-main dark:text-text-accent placeholder:text-brown-mid/40 focus:outline-none focus:border-tan-primary transition-all text-xl font-bold";

    const plainInputClass =
        "w-full py-5 px-7 rounded-2xl bg-white/50 dark:bg-brown-mid/10 text-text-main dark:text-text-accent placeholder:text-brown-mid/40 focus:outline-none focus:ring-2 focus:ring-tan-primary/20 transition-all text-xl font-bold border-0";

    return (
        <div className="flex flex-col min-h-screen bg-bg-cream dark:bg-brown-dark transition-colors duration-500">
            <div className="p-6 relative z-10">
                <Link
                    href="/onboarding"
                    prefetch={false}
                    className="inline-flex items-center text-brown-mid dark:text-text-accent hover:text-brown-dark dark:hover:text-tan-light hover:scale-[1.02] active:scale-95 transition-all"
                >
                    <ArrowLeft className="w-6 h-6 mr-2" />
                    <span className="text-xl font-open-sans font-bold italic">Kembali</span>
                </Link>
            </div>

            <div className="flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-24 -mt-10">
                <h1 className="text-5xl md:text-7xl text-center font-black [font-family:'Open_Sans-SemiBold',Helvetica] text-text-main dark:text-text-accent mb-14 tracking-tight italic uppercase">
                    Register
                </h1>

                <p className="mb-8 font-medium text-text-main/60 dark:text-text-accent/60 text-xl md:text-2xl italic text-center">
                    Please fill your details to create an account.
                </p>

                <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
                    {message && (
                        <div
                            className={`p-4 rounded-2xl text-center font-black text-sm animate-in fade-in slide-in-from-top-2 uppercase tracking-widest border ${
                                message.type === 'error'
                                    ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20'
                                    : 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20'
                            }`}
                        >
                            {message.text}
                        </div>
                    )}

                    <div className="space-y-6">
                        <div className="relative">
                            <input
                                id="display_name"
                                name="display_name"
                                type="text"
                                placeholder="Display Name (e.g. Magical Pen)"
                                autoComplete="name"
                                required
                                className={borderedInputClass}
                            />
                        </div>

                        <div className="relative">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                placeholder="Create Username"
                                autoComplete="username"
                                required
                                className={borderedInputClass}
                            />
                        </div>

                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Password"
                                autoComplete="new-password"
                                required
                                className={`${plainInputClass} pr-16`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-brown-mid/40 hover:text-tan-primary transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full py-5 bg-brown-dark dark:bg-tan-primary text-text-accent dark:text-brown-dark rounded-2xl font-black text-2xl uppercase tracking-widest hover:opacity-95 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 block shadow-xl shadow-brown-dark/10 dark:shadow-tan-primary/10"
                    >
                        {isPending ? 'Mendaftar...' : 'Get Started'}
                    </button>

                    <div className="mt-10 text-center">
                        <p className="text-text-main/60 dark:text-text-accent/60 text-xl font-bold italic">
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                prefetch={false}
                                className="text-tan-primary hover:text-brown-dark dark:hover:text-text-accent font-black underline underline-offset-4 transition-colors"
                            >
                                Login
                            </Link>
                        </p>
                    </div>
                </form>
            </div>
        </div>
    );
}