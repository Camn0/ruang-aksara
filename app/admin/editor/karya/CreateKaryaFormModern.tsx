'use client';

import { useState } from 'react';
import { createKarya } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

interface Genre {
    id: string;
    name: string;
}

const ArrowBack = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center ${className || ""}`}>
        <svg viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M45.833 27.5H9.167M9.167 27.5L27.5 45.833M9.167 27.5L27.5 9.167" stroke="#121212" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

const FiRrPlus = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center ${className || ""}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#f2ead7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    </div>
);

const FiRrUpload = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center ${className || ""}`}>
        <svg viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M14.5 2.417v16.916M14.5 2.417L9.667 7.25M14.5 2.417l4.833 4.833" stroke="#f2ead7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.417 19.333v2.417a4.833 4.833 0 004.833 4.833h14.5a4.833 4.833 0 004.833-4.833v-2.417" stroke="#f2ead7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

export default function CreateKaryaForm({ genres }: { genres: Genre[] }) {
    const [isPending, setIsPending] = useState(false);
    const [step, setStep] = useState(1);
    const router = useRouter();

    async function handeSubmitAction(formData: FormData) {
        setIsPending(true);
        try {
            const result = await createKarya(formData);

            if (result.error) {
                alert(result.error);
            } else {
                alert("Berhasil membuat karya baru!");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan sistem saat menghubungi server.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="w-full min-h-[810px] relative font-sans overflow-x-hidden pt-14 pb-24">
            <form action={handeSubmitAction} className="w-full h-full">
                
                <div className={step === 1 ? "block" : "hidden"}>
                    <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-12 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-16">
                            <button type="button" onClick={() => router.back()} className="hover:scale-105 transition-transform">
                                <ArrowBack className="w-12 h-12" />
                            </button>
                            <button type="button" onClick={() => setStep(2)} className="font-semibold text-[#121212] text-3xl sm:text-[45px] lowercase hover:opacity-70 transition-opacity">
                                skip
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-12 sm:gap-20">
                            <div className="flex flex-col gap-4">
                                <label className="font-semibold text-black text-xl sm:text-[25.7px]">Cover</label>
                                <div className="w-[183px] h-[239px] bg-[#886750] rounded-[24.75px] flex items-center justify-center cursor-pointer relative hover:bg-[#7a5c48] transition-colors">
                                    <input type="file" name="cover" className="absolute inset-0 opacity-0 cursor-pointer" accept="image/*" />
                                    <FiRrPlus className="w-12 h-12" />
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col gap-10">
                                <div className="flex flex-col gap-3">
                                    <label className="font-semibold text-black text-xl sm:text-[25.7px]">Judul</label>
                                    <input
                                        name="title"
                                        type="text"
                                        required
                                        placeholder="masukkan judul"
                                        className="w-full h-[60px] bg-[#886750] rounded-[16.5px] px-5 font-normal text-[#f2ead7] text-xl sm:text-[25.7px] placeholder-[#f2ead7] outline-none"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="font-semibold text-black text-xl sm:text-[25.7px]">Nama Alias Penulis</label>
                                    <input
                                        name="penulis_alias"
                                        type="text"
                                        required
                                        placeholder="contoh: Andrea Hirata"
                                        className="w-full h-[60px] bg-[#886750] rounded-[16.5px] px-5 font-normal text-[#f2ead7] text-xl sm:text-[25.7px] placeholder-[#f2ead7] outline-none"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="font-semibold text-black text-xl sm:text-[25.7px]">Pilih Genre</label>
                                    {genres.length === 0 ? (
                                        <p className="text-[#3b2a22] text-lg font-medium">Belum ada genre di database.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#886750] p-6 rounded-[16.5px]">
                                            {genres.map(g => (
                                                <label key={g.id} className="flex items-center space-x-3 text-[#f2ead7] cursor-pointer text-lg">
                                                    <input type="checkbox" name="genres" value={g.id} className="w-5 h-5 rounded border-none bg-white/20 text-[#3b2a22] focus:ring-0 cursor-pointer" />
                                                    <span>{g.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="flex mt-6">
                                    <button
                                        type="button"
                                        onClick={() => setStep(2)}
                                        className="w-[193px] h-[65px] bg-[#3b2a22] rounded-[10px] flex items-center justify-center font-semibold text-[#f2ead7] text-[25.7px] cursor-pointer hover:bg-[#2a1e18] transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={step === 2 ? "block" : "hidden"}>
                    <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-12 flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-300">
                        <div className="flex justify-between items-center mb-16">
                            <button type="button" onClick={() => setStep(1)} className="hover:scale-105 transition-transform">
                                <ArrowBack className="w-12 h-12" />
                            </button>
                            
                            <button
                                type="submit"
                                disabled={isPending}
                                className="w-[180px] h-[54px] bg-[#3b2a22] hover:bg-[#2a1e18] rounded-[8.49px] flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50 transition-colors"
                            >
                                <span className="font-semibold text-[#f2ead7] text-[29.3px]">
                                    {isPending ? 'Proses' : 'Unggah'}
                                </span>
                                {!isPending && <FiRrUpload className="w-7 h-7" />}
                            </button>
                        </div>

                        <div className="mb-6 w-full h-[75px] bg-[#3b2a22] rounded-[10px]">
                            <input
                                type="text"
                                name="bab_title"
                                placeholder="Masukkan Judul Bab"
                                className="w-full h-full bg-transparent px-[35px] font-bold text-[#f2ead7] text-[30.1px] placeholder-[#f2ead7] outline-none"
                            />
                        </div>

                        <div className="w-full h-[409px] bg-[#dec8b2] rounded-[10px]">
                            <textarea
                                name="bab_content"
                                placeholder="Tulis Cerita"
                                className="w-full h-full bg-transparent px-[39px] pt-[26px] font-normal text-black text-[25.7px] placeholder-black outline-none resize-none"
                            />
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}