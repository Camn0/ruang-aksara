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
        <div className="flex flex-col min-h-screen bg-white">
            <div className="p-6 relative z-10">
                <Link href="/onboarding" className="inline-flex items-center text-gray-500 hover:text-gray-900 transition-colors">
                    <ArrowLeft className="w-6 h-6 mr-2" />
                    <span>Kembali</span>
                </Link>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-8 -mt-20">
                <h1 className="text-4xl font-black text-gray-900 mb-12 tracking-wide font-serif">
                    {title}
                </h1>

                <form onSubmit={handleSubmit} className="w-full space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-center font-medium text-sm animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div className="relative">
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Username"
                                className="w-full py-4 px-6 rounded-full border-2 border-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-lg"
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full py-4 px-6 rounded-full border-2 border-gray-900 focus:outline-none focus:ring-4 focus:ring-indigo-100 transition-all text-lg"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full mt-8 py-4 bg-transparent border-2 border-gray-900 text-gray-900 rounded-full font-bold text-lg hover:bg-gray-900 hover:text-white transition-all active:scale-95 disabled:opacity-50"
                    >
                        {isLoading ? "Memproses..." : `Login ${title}`}
                    </button>

                    {isReader && (
                        <div className="mt-8 text-center pt-8 border-t border-gray-100">
                            <p className="text-gray-500 mb-4">Pengguna Baru?</p>
                            <Link
                                href="/auth/register"
                                className="text-indigo-600 font-bold hover:underline"
                            >
                                Daftar Akun Pembaca
                            </Link>
                        </div>
                    )}
                </form>
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
