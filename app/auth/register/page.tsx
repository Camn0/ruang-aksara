'use client';

import { useState } from 'react';
import { registerUser } from '@/app/actions/auth';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff } from "lucide-react";
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
        "w-full py-5 px-7 rounded-[24px] border-[3px] border-[#4a3228] bg-[#d9d9d9] text-[#3b2a22] placeholder:text-[#4a3228] focus:outline-none transition-all text-xl";

    const plainInputClass =
        "w-full py-5 px-7 rounded-[24px] bg-[#d9d9d9] text-[#3b2a22] placeholder:text-[#4a3228] focus:outline-none transition-all text-xl";

    return (
        <div className="flex flex-col min-h-screen bg-[#f2ead7] transition-colors duration-300">
            <div className="flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-24 -mt-10">
                <h1 className="text-5xl md:text-7xl text-center font-semibold [font-family:'Open_Sans-SemiBold',Helvetica] text-[#3b2a22] mb-14 tracking-wide">
                    Register
                </h1>

                <p className="mb-8 [font-family:'Open_Sans-Regular',Helvetica] font-normal text-[#3b2a22] text-xl md:text-2xl">
                    Please fill your details to login.
                </p>

                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    {message && (
                        <div
                            className={`p-4 rounded-2xl text-center font-medium text-sm animate-in fade-in slide-in-from-top-2 ${
                                message.type === 'error'
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-[#e2d6c3] text-[#3b2a22]'
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
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-[#4a3228] hover:text-[#3b2a22] transition-colors"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                            >
                                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isPending}
                        className="w-full max-w-[560px] mx-auto mt-12 py-5 bg-[#4a2f24] text-[#f2ead7] rounded-[22px] font-medium text-2xl hover:opacity-95 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 block"
                    >
                        {isPending ? 'Mendaftar...' : 'Get Started'}
                    </button>

                    <div className="mt-10 text-center">
                        <p className="text-[#3b2a22] text-xl md:text-2xl">
                            Already have an account?{" "}
                            <Link
                                href="/auth/login"
                                prefetch={false}
                                className="font-bold hover:underline"
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