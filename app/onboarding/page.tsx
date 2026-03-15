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
            setTimeout(() => setPhase(1), 400),   // gray -> brown
            setTimeout(() => setPhase(2), 1100),  // logo grows in center
            setTimeout(() => setPhase(3), 1800),  // logo moves left
            setTimeout(() => setPhase(4), 2500),  // brand text appears
            setTimeout(() => setPhase(5), 3400),  // brand text disappears
            setTimeout(() => setPhase(6), 3900),  // cream circle enters
            setTimeout(() => setPhase(7), 4600),  // books enter
            setTimeout(() => setPhase(8), 5300),  // final onboarding content appears
            setTimeout(() => onFinish(), 6200),   // remove intro overlay
        ];

        return () => timers.forEach(clearTimeout);
    }, [show, onFinish]);

    if (!show) return null;

    return (
        
        <div className="hidden lg:block fixed inset-0 z-[9999] overflow-hidden">
            {/* no animations for tablets and under :) */}
            {/* background */}
            <div
                className={`absolute inset-0 transition-colors duration-700 ${
                    phase === 0 ? "bg-[#efefef]" : "bg-[#8a6342]"
                }`}
            />

            {/* phase 0: small center logo with circle */}
            <div
                className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-700 ${
                    phase >= 1 ? "opacity-0 scale-125" : "opacity-100 scale-100"
                }`}
            >
                <div className="relative flex items-center justify-center w-[220px] h-[220px]">
                    <div className="absolute w-[140px] h-[140px] rounded-full bg-[#8a6342]" />
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
                className={`absolute top-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out ${
                    phase < 2
                        ? "left-1/2 -translate-x-1/2 opacity-0 scale-75"
                        : phase === 2
                        ? "left-1/2 -translate-x-1/2 opacity-100 scale-100"
                        : "left-[13%] xl:left-[18%] -translate-x-0 opacity-100 scale-100"
                }`}
            >
                <Image
                    src="/logoRuangAksara.webp"
                    alt="Ruang Aksara"
                    width={420}
                    height={280}
                    className="object-contain"
                    priority
                />
            </div>

            {/* phase 4: title */}
            <div
                className={`absolute top-1/2 -translate-y-1/2 left-[50%] xl:left-[45%] transition-all duration-700 ease-in-out ${
                    phase === 4
                        ? "opacity-100 translate-x-0"
                        : phase >= 5
                        ? "opacity-0 translate-x-10"
                        : "opacity-0 translate-x-16"
                }`}
            >
                <h1 className="text-white text-[70px] xl:text-[108px] leading-none font-semibold italic">
                    RuangAksara
                </h1>
            </div>

            {/* phase 6: white circle */}
            <div
                className={`absolute top-1/2 -translate-y-1/2 rounded-full bg-[#f2ead7] transition-all duration-1000 ease-in-out z-10 ${
                    phase >= 6
                        ? "-left-[45%] lg:-left-[35%] xl:-left-[20%] w-[110vw] lg:w-[90vw] xl:w-[75vw] aspect-square opacity-100"
                        : "-left-[70%] w-[110vw] aspect-square opacity-0"
                }`}
            />

            {/* phase 7: books on right */}
            <div
                className={`absolute right-0 top-0 w-full h-full transition-all duration-1000 ease-in-out z-0 ${
                    phase >= 7 ? "opacity-100 translate-x-0" : "opacity-0 translate-x-24"
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
                className={`absolute inset-0 z-20 hidden lg:flex items-center transition-all duration-700 ${
                    phase >= 8 ? "opacity-100" : "opacity-0"
                }`}
            >
                <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-center p-8 text-center">
                    <div>
                        <Image
                            src="/logoRuangAksara.webp"
                            alt="Ruang Aksara"
                            width={250}
                            height={150}
                            priority
                        />
                    </div>

                    <div className="text-center space-y-2 mb-10">
                        <h2 className="text-2xl lg:text-4xl font-medium text-text-main">
                            Selamat Datang <br />
                            di
                        </h2>
                        <h1 className="text-4xl lg:text-6xl font-black text-text-main">
                            Ruang Aksara
                        </h1>
                    </div>

                    <div className="flex gap-2 mb-10">
                        <div className="w-10 h-10 rounded-full bg-tan-primary"></div>
                        <div className="w-10 h-10 rounded-full border-4 border-tan-primary"></div>
                    </div>

                    <button onClick={onFinish} className="bg-brown-dark text-text-accent px-12 py-3 rounded-full text-xl font-black shadow-xl shadow-brown-dark/20 hover:bg-tan-primary transition-all active:scale-95">
                        selanjutnya
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

    return (
        <>
            {step === 1 && (
                <DesktopIntroAnimation
                    show={showIntro}
                    onFinish={() => setShowIntro(false)}
                />
            )}

            <div
                className={`flex flex-col min-h-screen transition-colors duration-500 selection:bg-pine/30 ${
                    step === 3 ? "bg-[#f2ead7]" : step === 2 ? "bg-[#3b2a22]" : "bg-[#8a6342]"
                }`}
            >
                <div className="flex-1 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                    {step === 1 && (
                        <>
                            {/* MOBILE LAYOUT */}
                            <div className="relative min-h-screen w-full overflow-hidden bg-[#f2ead7] md:hidden">
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
                                <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
                                    
                                    {/* logo container */}
                                    <div className="absolute top-[24%] h-36 w-36 rounded-full bg-[#8a6342]" />

                                    <div className="relative mb-6">
                                        <Image
                                            src="/logoRuangAksara.webp"
                                            alt="Ruang Aksara"
                                            width={170}
                                            height={120}
                                            className="object-contain"
                                        />
                                    </div>

                                    {/* Text */}
                                    <div className="mb-6 space-y-1">
                                        <h2 className="text-3xl font-medium text-text-main">
                                            Selamat Datang <br />
                                            di
                                        </h2>
                                        <h1 className="text-5xl font-black text-text-main">
                                            Ruang Aksara
                                        </h1>
                                    </div>

                                    {/* Pagination Dots */}
                                    <div className="flex gap-2 mb-8">
                                        <div className="w-4 h-4 rounded-full bg-tan-primary"></div>
                                        <div className="w-4 h-4 rounded-full border-2 border-tan-primary"></div>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        className="bg-brown-dark text-text-accent px-10 py-3 rounded-full text-2xl font-black hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brown-dark/20"
                                    >
                                        Selanjutnya
                                    </button>
                                </div>
                            </div>

                            {/* TABLET/DESKTOP LAYOUT */}
                            <div className="relative hidden w-full h-screen overflow-hidden md:flex items-center">
                                {/*lg = tablet xl = laptop/above */}
                                <div
                                    className="
                                        absolute top-1/2 -translate-y-1/2 
                                        -left-[45%] lg:-left-[35%] xl:-left-[20%] 
                                        w-[110vw] lg:w-[90vw] xl:w-[75vw] 
                                        aspect-square bg-[#f2ead7] rounded-full z-10 shadow-2xl
                                    "
                                ></div>

                                <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-center p-8 text-center">
                                    <div>
                                        <Image
                                            src="/logoRuangAksara.webp"
                                            alt="Ruang Aksara"
                                            width={250}
                                            height={150}
                                        />
                                    </div>

                                    {/* Text */}
                                    <div className="text-center space-y-2 mb-10">
                                        <h2 className="text-2xl lg:text-4xl font-medium text-text-main">
                                            Selamat Datang <br />
                                            di
                                        </h2>
                                        <h1 className="text-4xl lg:text-6xl font-black text-text-main">
                                            Ruang Aksara
                                        </h1>
                                    </div>

                                    {/* Pagination dots */}
                                    <div className="flex gap-2 mb-10">
                                        <div className="w-10 h-10 rounded-full bg-tan-primary"></div>
                                        <div className="w-10 h-10 rounded-full border-4 border-tan-primary"></div>
                                    </div>

                                    <button
                                        onClick={handleNext}
                                        className="bg-brown-dark text-text-accent px-12 py-3 rounded-full text-xl font-black hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brown-dark/20"
                                    >
                                        selanjutnya
                                    </button>
                                </div>

                                {/* background book */}
                                <div className="absolute right-0 top-0 w-full h-full z-0">
                                    <Image
                                        src="/bookPicture.webp"
                                        alt="Books"
                                        fill
                                        className="object-cover object"
                                    />
                                </div>
                            </div>
                        </>
                    )}

                    {step === 2 && (
                        <div className="w-full max-w-2xl mt-16 px-6">
                            {/* white box */}
                            <div className="relative lg:scale-150 bg-bg-cream dark:bg-brown-dark rounded-xl pt-16 pb-12 px-4 md:px-8 shadow-xl flex flex-col items-center border border-tan-light/10">
                                
                                {/* logo container */}
                                <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                    <div className="w-24 h-24 md:scale-125 bg-[#B58E6B] rounded-full flex items-center justify-center overflow-hidden">
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
                                <h2 className="text-text-main text-lg md:text-3xl [font-family:'Open_Sans-Regular',Helvetica] font-bold mb-4">
                                    Temukan Ribuan
                                    <br />
                                    Dunia Baru
                                </h2>
                                <p className="text-text-main/80 text-sm md:text-xl [font-family:'Open_Sans-Regular',Helvetica] leading-relaxed mb-16">
                                    Nikmati karya sastra digital terbaik dari tangan-tangan
                                    berbakat di mana pun Anda berada.
                                </p>

                                <button
                                    onClick={handleNext}
                                    className="bg-brown-dark text-text-accent px-10 py-3 rounded-full text-md md:text-2xl font-black hover:bg-tan-primary hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-brown-dark/20"
                                >
                                    selanjutnya
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="relative flex flex-col items-center space-y-10 w-full max-w-md px-3">
                            <Image
                                src="/logoRuangAksara.webp"
                                alt="Ruang Aksara"
                                width={200}
                                height={100}
                            />

                            <div className="space-y-6 w-full px-1 z-10">
                                <button
                                    onClick={() => router.push("/auth/login?type=admin")}
                                    className="w-full py-5 rounded-3xl border-4 border-solid border-[#3b2a22] bg-[#EFE5D6] flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    <span className="text-xl md:text-3xl text-[#3b2a22] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold tracking-[0] leading-[normal]">
                                        Masuk Sebagai Penulis
                                    </span>
                                </button>

                                <button
                                    onClick={() => router.push("/auth/login?type=reader")}
                                    className="w-full py-5 rounded-3xl border-4 border-solid border-[#4A2F24] bg-[#3b2a22] flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95"
                                >
                                    <span className="text-xl md:text-3xl text-[#f2ead7] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold tracking-[0] leading-[normal]">
                                        Masuk Sebagai Pembaca
                                    </span>
                                </button>
                            </div>

                            <div className="absolute w-full left-0 z-0 md:hidden">
                                <Image
                                    src="/book2.webp"
                                    alt="Pattern Background"
                                    width={600}
                                    height={300}
                                    className="w-full bottom-0 h-auto"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}