"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const type = searchParams.get("type") || "reader"; // Default reader

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const isReader = type === "reader";
    const title = isReader ? "Pembaca" : "Admin";

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        try {
            const res = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Kombinasi User dan Password salah.");
                setIsLoading(false);
            } else {
                router.push("/");
                router.refresh();
            }
        } catch (error) {
            setError("Gagal masuk. Coba lagi.");
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-parchment-light transition-all duration-300">
            <div className="p-8 relative z-10">
                <Link href="/onboarding" className="p-3 -ml-3 text-ink-deep hover:bg-white wobbly-border-sm transition-all rotate-3 active:-rotate-3 inline-flex items-center">
                    <ArrowLeft className="w-6 h-6 mr-2" />
                    <span className="font-journal-title italic text-lg">Kembali</span>
                </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 -mt-20">
                <div className="bg-white wobbly-border paper-shadow p-10 max-w-md w-full -rotate-1 transition-all hover:rotate-0">
                    <h1 className="text-4xl font-journal-title text-ink-deep mb-10 text-center italic tracking-tight">
                        {title} Ruang Aksara
                    </h1>

                    <form onSubmit={handleSubmit} className="w-full space-y-8">
                        {error && (
                            <div className="p-6 bg-dried-red/5 text-dried-red wobbly-border-sm text-center font-journal-title text-lg italic animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <div className="space-y-6">
                            <div className="relative">
                                <label className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">Username</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="e.g. pujangga_malam"
                                    className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-6 py-4 font-journal-body text-lg text-ink-deep italic transition-all placeholder:text-ink/10"
                                    required
                                />
                            </div>

                            <div className="relative">
                                <label className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-2 block ml-2">Kata Sandi (Password)</label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="********"
                                    className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-6 py-4 font-journal-body text-lg text-ink-deep italic transition-all placeholder:text-ink/10"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-4 py-5 bg-pine text-parchment font-journal-title text-2xl wobbly-border paper-shadow shadow-xl italic hover:rotate-1 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {isLoading ? "Menyingkap Pintu..." : `Masuk ke ${title}`}
                        </button>

                        {isReader && (
                            <div className="mt-10 text-center pt-8 border-t wobbly-border-t border-ink/5">
                                <p className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-4">Pengembara Baru?</p>
                                <Link
                                    href="/auth/register"
                                    className="font-journal-title text-xl text-pine hover:text-pine-light hover:underline underline-offset-8 italic"
                                >
                                    Daftar Akun Pembaca
                                </Link>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
            <LoginForm />
        </Suspense>
    );
}
