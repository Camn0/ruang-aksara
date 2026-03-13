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
        <div className="flex flex-col min-h-screen bg-[#f2ead7] transition-colors duration-300">
            <div className="p-6 relative z-10">
                <Link
                    href="/onboarding"
                    className="inline-flex items-center text-[#574239] hover:text-[#3b2a22] hover:scale-[1.02] active:scale-95 transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 mr-2" />
                    <span className="text-xl">Kembali</span>
                </Link>
            </div>

            <div className="flex-1 flex flex-col justify-center px-8 md:px-20 lg:px-24 -mt-10">
                <h1 className="text-5xl md:text-7xl text-center font-semibold [font-family:'Open_Sans-SemiBold',Helvetica] text-[#3b2a22] mb-10 tracking-wide">
                    Get Started
                </h1>

                <h1 className="text-4xl md:text-6xl text-center font-semibold [font-family:'Open_Sans-SemiBold',Helvetica] text-[#3b2a22] mb-12 tracking-wide">
                    {title}
                </h1>

                <p className="mb-8 [font-family:'Open_Sans-Regular',Helvetica] font-normal text-[#3b2a22] text-xl md:text-2xl">
                    Please fill your details to login.
                </p>

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
                                className="w-full py-5 px-7 rounded-2xl border-[3px] border-[#4a3228] bg-[#d9d9d9] text-[#3b2a22] placeholder:text-[#5a4a43] focus:outline-none transition-all text-xl"
                                required
                            />
                        </div>

                        <div className="relative">
                            <input
                                type={showPassword ? "password" : "text"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Password"
                                className="w-full py-5 px-7 pr-16 rounded-2xl bg-[#d9d9d9] text-[#3b2a22] placeholder:text-[#5a4a43] focus:outline-none transition-all text-xl border-0"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 text-[#5a4a43] hover:text-[#3b2a22] transition-colors"
                            >
                                {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full max-w-[560px] mx-auto mt-12 py-5 bg-[#4a2f24] text-[#f2ead7] rounded-[22px] font-medium text-2xl hover:opacity-95 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 block"
                    >
                        {isLoading ? "Memproses..." : "Get Started"}
                    </button>

                    {isReader && (
                        <div className="mt-10 text-center">
                            <p className="text-[#3b2a22] text-xl md:text-2xl">
                                New member?{" "}
                                <Link
                                    href="/auth/register"
                                    className="font-bold hover:underline"
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

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat...</div>}>
            <LoginForm />
        </Suspense>
    );
}