/**
 * @file page.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Platform Infrastructure architecture.
 * @author Ruang Aksara Engineering Team
 */

"use client";

import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, Suspense } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";

function LoginForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const type = searchParams.get("type") || "reader";

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const isReader = type === "reader";
    const title = isReader ? "Pembaca" : "Penulis";

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
                <h1 className="text-5xl md:text-7xl text-center font-black [font-family:'Open_Sans-SemiBold',Helvetica] text-text-main dark:text-text-accent mb-10 tracking-tight italic uppercase">
                    Get Started
                </h1>

                <h2 className="text-4xl md:text-6xl text-center font-black [font-family:'Open_Sans-SemiBold',Helvetica] text-tan-primary mb-12 tracking-tight italic uppercase">
                    {title}
                </h2>

                <p className="mb-8 font-medium text-text-main/60 dark:text-text-accent/60 text-xl md:text-2xl italic text-center">
                    Please fill your details to login.
                </p>

                <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">
                    {error && (
                        <div className="p-4 bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 rounded-2xl text-center font-black text-sm animate-in fade-in slide-in-from-top-2 uppercase tracking-widest">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                id="username"
                                name="username"
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                autoComplete="username"
                                className="w-full py-5 px-7 rounded-2xl border-[3px] border-brown-dark/20 dark:border-brown-mid/30 bg-white/50 dark:bg-brown-mid/10 text-text-main dark:text-text-accent placeholder:text-brown-mid/40 focus:outline-none focus:border-tan-primary transition-all text-xl font-bold"
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                autoComplete="current-password"
                                className="w-full py-5 px-7 pr-16 rounded-2xl bg-white/50 dark:bg-brown-mid/10 text-text-main dark:text-text-accent placeholder:text-brown-mid/40 focus:outline-none focus:ring-2 focus:ring-tan-primary/20 transition-all text-xl font-bold border-0"
                                required
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
                        disabled={isLoading}
                        className="w-full py-5 bg-brown-dark dark:bg-tan-primary text-text-accent dark:text-brown-dark rounded-2xl font-black text-2xl uppercase tracking-widest hover:opacity-95 transition-all hover:scale-[1.01] active:scale-95 disabled:opacity-50 block shadow-xl shadow-brown-dark/10 dark:shadow-tan-primary/10"
                    >
                        {isLoading ? "Memproses..." : "Get Started"}
                    </button>

                    {isReader && (
                        <div className="mt-10 text-center">
                            <p className="text-text-main/60 dark:text-text-accent/60 text-xl font-bold italic">
                                New member?{" "}
                                <Link
                                    href="/auth/register"
                                    prefetch={false}
                                    className="text-tan-primary hover:text-brown-dark dark:hover:text-text-accent font-black underline underline-offset-4 transition-colors"
                                >
                                    Register
                                </Link>
                            </p>
                        </div>
                    )}
                </form>
            </div>
        </div>
    );
}

/**
 * LoginPage: Primary Next.js Server Component route entry point orchestrating asynchronous data-fetching lifecycles.
 */
export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
            <LoginForm />
        </Suspense>
    );
}