"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

function DesktopIntroAnimation({
    show,
    onFinish,
}: {
    show: boolean;
    onFinish: () => void;
}) {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        if (!show) return;

        const timers = [
            setTimeout(() => setPhase(1), 500),   // gray -> brown (slightly slower start)
            setTimeout(() => setPhase(2), 1500),  // logo grows in center
            setTimeout(() => setPhase(3), 2500),  // logo moves left (more deliberate)
            setTimeout(() => setPhase(4), 3200),  // brand text appears
            setTimeout(() => setPhase(5), 4500),  // brand text disappears
            setTimeout(() => setPhase(6), 5200),  // cream circle enters
            setTimeout(() => setPhase(7), 6200),  // books enter
            setTimeout(() => setPhase(8), 7000),  // final onboarding content appears
        ];

        return () => timers.forEach(clearTimeout);
    }, [show]);

    if (!show) return null;

    return (
        <div className="hidden lg:block fixed inset-0 z-[9999] overflow-hidden">
            {/* no animations for tablets and under :) */}
            {/* background */}
            <div
                className={`absolute inset-0 transition-colors duration-1000 ease-in-out ${phase === 0 ? "bg-[#efefef]" : "bg-[#8a6342]"
                    }`}
            />

            {/* phase 0: small center logo with circle */}
            <div
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-out ${phase >= 1 ? "opacity-0 scale-125 blur-sm" : "opacity-100 scale-100"
                    }`}
            >
                <div className="relative flex items-center justify-center w-[220px] h-[220px]">
                    <div className="absolute w-[140px] h-[140px] rounded-full bg-[#8a6342] shadow-2xl" />
                    <Image
                        src="/logoRuangAksara.webp"
                        alt="Ruang Aksara"
                        width={170}
                        height={120}
                        className="relative z-10 object-contain"
                        priority
                    />
                </div>
            </div>

            {/* phase 2-5: large centered logo, then move left */}
            <div
                className={`absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out ${phase < 2
                    ? "left-1/2 -translate-x-1/2 opacity-0 scale-75"
                    : phase === 2
                        ? "left-1/2 -translate-x-1/2 opacity-100 scale-60"
                        : "left-[8%] xl:left-[12%] -translate-x-0 opacity-100 scale-100"
                    }`}
            >
                <div className={`${phase === 2 ? "animate-pulse" : ""}`}>
                    <Image
                        src="/logoRuangAksara.webp"
                        alt="Ruang Aksara"
                        width={420}
                        height={280}
                        className="object-contain"
                        priority
                    />
                </div>
            </div>

            {/* phase 4: title */}
            <div
                className={`absolute top-1/2 -translate-y-1/2 left-[51%] xl:left-[44%] transition-all duration-1000 ease-in-out font-lobster ${phase === 4
                    ? "opacity-100 translate-x-0"
                    : phase >= 5
                        ? "opacity-0 translate-x-10"
                        : "opacity-0 translate-x-16"
                    }`}
            >
                <h1 className="text-white text-[72px] xl:text-[110px] leading-none font-semibold italic">
                    Ruang Aksara
                </h1>
            </div>

            {/* phase 6: white circle */}
            <div
                className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-[#f2ead7] transition-all duration-1000 ease-in-out z-10 ${phase >= 6
                    ? "-left-[45%] lg:-left-[35%] xl:-left-[20%] w-[110vw] lg:w-[90vw] xl:w-[75vw] aspect-square opacity-100"
                    : "-left-[70%] w-[110vw] aspect-square opacity-0"
                    }`}
            />

            {/* phase 7: books on right */}
            <div
                className={`absolute right-0 top-0 w-full h-full transition-all duration-1000 ease-in-out z-0 ${phase >= 7 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-24"
                    }`}
            >
                <Image
                    src="/bookPicture.webp"
                    alt="Books"
                    fill
                    className="object-cover"
                    priority
                />
            </div>

            {/* phase 8: final look, same as step1 */}
            <div
                className={`absolute inset-0 z-20 hidden lg:flex items-center transition-all duration-1000 ${phase >= 8 ? "opacity-100" : "opacity-0"
                    }`}
            >
                <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-center p-8 text-center">
                    <div className="-mb-16">
                        <Image
                            src="/logoRuangAksara.webp"
                            alt="Ruang Aksara"
                            width={250}
                            height={150}
                            priority
                        />
                    </div>

                    <div className="text-center space-y-0 mb-10">
                        <h2 className="text-xl lg:text-3xl font-medium text-text-main font-open-sans">
                            Selamat Datang <br />
                            di
                        </h2>
                        <h1 className="text-4xl lg:text-6xl font-black text-text-main font-lobster">
                            Ruang Aksara
                        </h1>
                    </div>

                    {/* Simple pagination dots mirroring actual step dots */}
                    <div className="flex gap-2 mb-10">
                        <button onClick={onFinish} className="w-10 h-10 rounded-full bg-tan-primary transition-all"></button>
                        <button onClick={onFinish} className="w-10 h-10 rounded-full border-4 border-tan-primary hover:bg-tan-primary/20 transition-all"></button>
                        <button onClick={onFinish} className="w-10 h-10 rounded-full border-4 border-tan-primary hover:bg-tan-primary/20 transition-all"></button>
                    </div>

                    <button onClick={onFinish} className="bg-brown-dark text-text-accent px-12 py-3 rounded-full text-xl font-black shadow-xl shadow-brown-dark/20 hover:scale-105 hover:bg-tan-primary transition-all active:scale-95">
                        mulai eksplorasi
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [showIntro, setShowIntro] = useState(true);
    const router = useRouter();

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleIntroFinish = () => {
        setShowIntro(false);
        setStep(2); // One click to advance to the actual content
    };

    return (
        <div className="h-screen w-screen overflow-hidden">
            {step === 1 && (
                <DesktopIntroAnimation
                    show={showIntro}
                    onFinish={handleIntroFinish}
                />
            )}

            <div
                className={`flex flex-col min-h-screen transition-colors duration-1000 ease-in-out selection:bg-pine/30 ${step === 3 ? "bg-[#f2ead7]" : step === 2 ? "bg-[#3b2a22]" : "bg-[#8a6342]"
                    }`}
            >
                {/* Horizontal slider container */}
                <div
                    className="flex-1 flex transition-transform duration-700 ease-in-out"
                    style={{ transform: `translateX(-${(step - 1) * 100}%)` }}
                >
                    {/* STEP 1 */}
                    <div className="min-w-full h-full flex flex-col items-center justify-center relative overflow-hidden">
                        {/* MOBILE LAYOUT */}
                        <div className="relative h-screen w-full overflow-hidden bg-[#f2ead7] md:hidden flex flex-col items-center justify-center">
                            {/* Background pattern */}
                            <div className="absolute -top-[15%] left-0 w-full h-[60vh] z-0">
                                <Image
                                    src="/blockpatterns.webp"
                                    alt="Pattern Background"
                                    fill
                                    className="object-contain object-top"
                                    priority
                                />
                            </div>

                            {/* Mobile content */}
                            <div className="relative z-10 flex flex-col items-center justify-center px-6 text-center">
                                {/* logo container circle - Adjusted for better centering */}
                                <div className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 h-44 w-44 rounded-full bg-[#8a6342] -z-10" />

                                <div className="relative mb-8">
                                    <Image
                                        src="/logoRuangAksara.webp"
                                        alt="Ruang Aksara"
                                        width={170}
                                        height={120}
                                        className="object-contain"
                                        priority
                                    />
                                </div>

                                {/* Text */}
                                <div className="mb-8 space-y-1">
                                    <h2 className="text-3xl font-medium text-text-main font-open-sans">
                                        Selamat Datang <br />
                                        di
                                    </h2>
                                    <h1 className="text-5xl font-black text-text-main font-lobster">
                                        Ruang Aksara
                                    </h1>
                                </div>

                                {/* Pagination Dots */}
                                <div className="flex gap-2 mb-10">
                                    <button onClick={() => setStep(1)} className={`w-4 h-4 rounded-full transition-all ${step === 1 ? "bg-tan-primary" : "border-2 border-tan-primary hover:bg-tan-primary/20"}`}></button>
                                    <button onClick={() => setStep(2)} className={`w-4 h-4 rounded-full transition-all ${step === 2 ? "bg-tan-primary" : "border-2 border-tan-primary hover:bg-tan-primary/20"}`}></button>
                                    <button onClick={() => setStep(3)} className={`w-4 h-4 rounded-full transition-all ${step === 3 ? "bg-tan-primary" : "border-2 border-tan-primary hover:bg-tan-primary/20"}`}></button>
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="bg-brown-dark text-text-accent px-10 py-3 rounded-full text-2xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brown-dark/20"
                                >
                                    mulai eksplorasi
                                </button>
                            </div>
                        </div>

                        {/* TABLET/DESKTOP LAYOUT */}
                        <div className="relative hidden w-full h-screen overflow-hidden md:flex items-center">
                            <div
                                className="
                                    absolute top-1/2 -translate-y-1/2 
                                    -left-[45%] lg:-left-[35%] xl:-left-[20%] 
                                    w-[110vw] lg:w-[90vw] xl:w-[75vw] 
                                    aspect-square bg-[#f2ead7] rounded-full z-10 shadow-2xl
                                    transition-all duration-1000
                                "
                            ></div>

                            <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-center p-8 text-center">
                                <div className="-mb-16">
                                    <Image
                                        src="/logoRuangAksara.webp"
                                        alt="Ruang Aksara"
                                        width={250}
                                        height={150}
                                    />
                                </div>

                                {/* Text */}
                                <div className="text-center space-y-0 mb-10">
                                    <h2 className="text-xl lg:text-3xl font-medium text-text-main font-open-sans">
                                        Selamat Datang <br />
                                        di
                                    </h2>
                                    <h1 className="text-4xl lg:text-6xl font-black text-text-main font-lobster">
                                        Ruang Aksara
                                    </h1>
                                </div>

                                {/* Pagination dots */}
                                <div className="flex gap-2 mb-10">
                                    <button onClick={() => setStep(1)} className={`w-10 h-10 rounded-full transition-all ${step === 1 ? "bg-tan-primary" : "border-4 border-tan-primary hover:bg-tan-primary/20"}`}></button>
                                    <button onClick={() => setStep(2)} className={`w-10 h-10 rounded-full transition-all ${step === 2 ? "bg-tan-primary" : "border-4 border-tan-primary hover:bg-tan-primary/20"}`}></button>
                                    <button onClick={() => setStep(3)} className={`w-10 h-10 rounded-full transition-all ${step === 3 ? "bg-tan-primary" : "border-4 border-tan-primary hover:bg-tan-primary/20"}`}></button>
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="bg-brown-dark text-text-accent px-12 py-3 rounded-full text-xl font-black hover:scale-105 hover:bg-tan-primary active:scale-95 transition-all shadow-xl shadow-brown-dark/20"
                                >
                                    mulai eksplorasi
                                </button>
                            </div>

                            {/* background book */}
                            <div className="absolute right-0 top-0 w-full h-full z-0">
                                <Image
                                    src="/bookPicture.webp"
                                    alt="Books"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* STEP 2 */}
                    <div className="min-w-full h-full flex items-center justify-center p-6 pt-20">
                        <div className="w-full max-w-2xl mt-12 md:mt-24">
                            {/* Paper-styled box */}
                            <div className="relative lg:scale-110 bg-bg-cream dark:bg-brown-dark rounded-3xl pt-20 pb-12 px-8 md:px-12 shadow-2xl flex flex-col items-center border border-tan-light/20 transition-all">

                                {/* logo container - circle brand */}
                                <div className="absolute -top-16 left-1/2 -translate-x-1/2">
                                    <div className="w-32 h-32 bg-[#B58E6B] rounded-full flex items-center justify-center overflow-hidden border-8 border-bg-cream dark:border-brown-dark shadow-xl">
                                        <Image
                                            src="/logoRuangAksara.webp"
                                            alt="Logo"
                                            width={100}
                                            height={100}
                                            className="object-contain"
                                        />
                                    </div>
                                </div>

                                {/* Text */}
                                <h2 className="text-text-main text-2xl md:text-4xl font-bold mb-6 font-lobster text-center">
                                    Temukan Ribuan
                                    <br />
                                    Dunia Baru
                                </h2>
                                <p className="text-text-main/80 text-lg md:text-xl font-open-sans leading-relaxed mb-12 text-center max-w-md">
                                    Nikmati karya sastra digital terbaik dari tangan-tangan
                                    berbakat di mana pun Anda berada.
                                </p>

                                {/* Dots */}
                                <div className="flex gap-2 mb-10">
                                    <button onClick={() => setStep(1)} className={`w-4 h-4 rounded-full transition-all ${step === 1 ? "bg-tan-primary" : "border-2 border-tan-primary hover:bg-tan-primary/20"}`}></button>
                                    <button onClick={() => setStep(2)} className={`w-4 h-4 rounded-full transition-all ${step === 2 ? "bg-tan-primary" : "border-2 border-tan-primary hover:bg-tan-primary/20"}`}></button>
                                    <button onClick={() => setStep(3)} className={`w-4 h-4 rounded-full transition-all ${step === 3 ? "bg-tan-primary" : "border-2 border-tan-primary hover:bg-tan-primary/20"}`}></button>
                                </div>

                                <button
                                    onClick={handleNext}
                                    className="bg-brown-dark text-text-accent px-12 py-3 rounded-full text-xl md:text-2xl font-black hover:bg-tan-primary hover:scale-[1.05] active:scale-95 transition-all shadow-xl shadow-brown-dark/20"
                                >
                                    selanjutnya
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* STEP 3 */}
                    <div className="min-w-full h-full flex flex-col items-center justify-center p-6">
                        <div className="relative flex flex-col items-center space-y-12 w-full max-w-md">
                            <div className="animate-bounce-slow">
                                <Image
                                    src="/logoRuangAksara.webp"
                                    alt="Ruang Aksara"
                                    width={240}
                                    height={120}
                                />
                            </div>

                            <div className="space-y-6 w-full z-10">
                                <button
                                    onClick={() => router.push("/auth/login?type=admin")}
                                    className="w-full py-6 rounded-[2rem] border-4 border-solid border-[#3b2a22] bg-[#EFE5D6] flex flex-col items-center justify-center transition-all hover:scale-[1.03] active:scale-95 shadow-lg group hover:bg-[#3b2a22]"
                                >
                                    <span className="text-2xl md:text-3xl text-[#3b2a22] font-semibold font-open-sans group-hover:text-bg-cream transition-colors">
                                        Mulai Menulis
                                    </span>
                                    <span className="text-xs uppercase tracking-widest text-[#3b2a22]/60 font-bold group-hover:text-bg-cream/60">Sebagai Penulis</span>
                                </button>

                                <button
                                    onClick={() => router.push("/auth/login?type=reader")}
                                    className="w-full py-6 rounded-[2rem] border-4 border-solid border-[#4A2F24] bg-[#3b2a22] flex flex-col items-center justify-center transition-all hover:scale-[1.03] active:scale-95 shadow-lg group hover:bg-[#4A2F24]"
                                >
                                    <span className="text-2xl md:text-3xl text-[#f2ead7] font-semibold font-open-sans">
                                        Mulai Membaca
                                    </span>
                                    <span className="text-xs uppercase tracking-widest text-[#f2ead7]/60 font-bold">Sebagai Pembaca</span>
                                </button>
                            </div>

                            {/* Dots */}
                            <div className="flex gap-2">
                                <button onClick={() => setStep(1)} className={`w-4 h-4 rounded-full transition-all ${step === 1 ? "bg-tan-primary" : "border-2 border-tan-primary hover:bg-tan-primary/20"}`}></button>
                                <button onClick={() => setStep(2)} className={`w-4 h-4 rounded-full transition-all ${step === 2 ? "bg-tan-primary" : "border-2 border-tan-primary hover:bg-tan-primary/20"}`}></button>
                                <button onClick={() => setStep(3)} className={`w-4 h-4 rounded-full transition-all ${step === 3 ? "bg-tan-primary" : "border-2 border-tan-primary hover:bg-tan-primary/20"}`}></button>
                            </div>

                            <div className="absolute w-full -bottom-24 left-1/2 -translate-x-1/2 z-0 opacity-20 pointer-events-none">
                                <Image
                                    src="/book2.webp"
                                    alt="Pattern Background"
                                    width={600}
                                    height={300}
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}