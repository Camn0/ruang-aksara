"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import Image from 'next/image';

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const router = useRouter();

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    return (
        <div className={`flex flex-col min-h-screen transition-colors duration-500 selection:bg-pine/30 ${ step === 3 ? 'bg-[#f2ead7]' : 'bg-[#3b2a22]' }`}>
            <div className="flex-1 flex flex-col items-center justify-center p text-center animate-in fade-in zoom-in duration-500">
                {step === 1 && (
                <>
                    {/*MOBILE LAYOUT*/}
                    <div className="relative min-h-screen w-full overflow-hidden bg-[#f2ead7] md:hidden">
                    {/*Background pattern */}
                    <div className="absolute -top-[15%] left-0 w-full h-[60vh] z-0">
                        <Image
                            src="/blockpatterns.png" 
                            alt="Pattern Background"
                            fill
                            className="object-contain object-top"
                            priority
                        />
                    </div>

                    {/*Mobile content*/}
                    <div className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 text-center">
                        {/* logo container */}
                        <div className="absolute top-[24%] h-36 w-36 rounded-full bg-[#8a6342]" />

                        {/* logo */}
                        <div className="relative mb-6">
                        <Image
                            src="/logoRuangAksara.png"
                            alt="Ruang Aksara"
                            width={170}
                            height={120}
                            className="object-contain"
                        />
                        </div>

                        {/* Text */}
                        <div className="mb-6 space-y-1">
                        <h2 className="text-3xl font-medium text-black">
                            Selamat Datang <br />
                            di
                        </h2>
                        <h1 className="text-5xl font-black text-black">
                            Ruang Aksara
                        </h1>
                        </div>

                        {/* Pagination dots */}
                        <div className="flex gap-2 mb-8">
                        <div className="w-4 h-4 rounded-full bg-black"></div>
                        <div className="w-4 h-4 rounded-full border-2 border-black"></div>
                        </div>

                        {/* Button */}
                        <button
                        onClick={handleNext}
                        className="bg-[#7D5A44] text-[#f2ead7] px-10 py-3 rounded-full text-2xl font-medium active:scale-95 transition-all shadow-lg"
                        >
                        Selanjutnya
                        </button>
                    </div>
                    </div>

                    {/*DESKTOP LAYOUT*/}
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

                    {/* main area */}
                    <div className="relative z-10 w-full md:w-1/2 flex flex-col items-center justify-center p-8 text-center">
                        <div>
                        <Image
                            src="/logoRuangAksara.png"
                            alt="Ruang Aksara"
                            width={250}
                            height={150}
                        />
                        </div>

                        {/* Text */}
                        <div className="text-center space-y-2 mb-10">
                        <h2 className="text-2xl lg:text-4xl font-medium text-[#3b2a22]">
                            Selamat Datang <br />
                            di
                        </h2>
                        <h1 className="text-4xl lg:text-6xl font-black text-[#3b2a22]">
                            Ruang Aksara
                        </h1>
                        </div>

                        {/* Dots */}
                        <div className="flex gap-2 mb-10">
                        <div className="w-10 h-10 rounded-full bg-[#3b2a22]"></div>
                        <div className="w-10 h-10 rounded-full border-4 border-[#3b2a22]"></div>
                        </div>

                        <button
                        onClick={handleNext}
                        className="bg-[#7D5A44] text-[#f2ead7] px-12 py-3 rounded-full text-xl font-bold hover:scale-105 active:scale-95 transition-all shadow-lg"
                        >
                        selanjutnya
                        </button>
                    </div>

                    {/* background book */}
                    <div className="absolute right-0 top-0 w-full h-full z-0">
                        <Image
                        src="/bookPicture.png"
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
                        <div className="relative lg:scale-150 bg-white rounded-xl pt-16 pb-12 px-4 md:px-8 shadow-xl flex flex-col items-center">
                            
                            {/* logo container */}
                            <div className="absolute -top-12 left-1/2 -translate-x-1/2">
                                <div className="w-24 h-24 md:scale-125 bg-[#B58E6B] rounded-full flex items-center justify-center overflow-hidden">
                                <Image 
                                        src="/logoRuangAksara.png" 
                                        alt="Logo" 
                                        width={100} 
                                        height={100} 
                                        className="object-contain"
                                    />
                                </div>
                            </div>

                            {/* Text */}
                            <h2 className="text-black text-lg md:text-3xl [font-family:'Open_Sans-Regular',Helvetica] font-bold mb-4">
                                Temukan Ribuan<br />Dunia Baru
                            </h2>
                            <p className="text-black text-sm md:text-xl [font-family:'Open_Sans-Regular',Helvetica] leading-relaxed mb-16">
                                Nikmati karya sastra digital terbaik dari tangan-tangan berbakat di mana pun Anda berada.
                            </p>

                            <button 
                                onClick={handleNext}
                                className="bg-[#7D5A44] text-white px-10 py-3 rounded-full text-md md:text-2xl font-medium hover:bg-[#5D4232] transition-colors"
                            >
                                selanjutnya
                            </button>
                        </div>
                    </div>
                )}


                {step === 3 && (
                    <div className="flex flex-col items-center space-y-10 w-full max-w-md px-3">
                        <Image
                            src="/logoRuangAksara.png"
                            alt="Ruang Aksara"
                            width={200}
                            height={100}
                        />

                        <div className="space-y-6 w-full px-1">
                            <button
                                onClick={() => router.push("/auth/login?type=admin")}
                                className="w-full py-5 rounded-3xl border-4 border-solid border-[#3b2a22] bg-[#EFE5D6] flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95"
                            >
                                <span className="text-xl md:text-3xl text-[#3b2a22] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold tracking-[0] leading-[normal]">Masuk Sebagai Penulis</span>
                            </button>

                            <button
                                onClick={() => router.push("/auth/login?type=reader")}
                                className="w-full py-5 rounded-3xl border-4 border-solid border-[#4A2F24] bg-[#3b2a22]  flex items-center justify-center transition-all hover:scale-[1.02] active:scale-95 "
                            >
                                <span className="text-xl md:text-3xl text-[#f2ead7] [font-family:'Open_Sans-SemiBold',Helvetica] font-semibold tracking-[0] leading-[normal]">Masuk Sebagai Pembaca</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
