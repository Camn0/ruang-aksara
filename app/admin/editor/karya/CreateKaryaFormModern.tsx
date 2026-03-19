'use client';

import { useState, useRef } from 'react';
import { createKarya } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import NextImage from 'next/image';

interface Genre {
    id: string;
    name: string;
}

const ArrowBack = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center ${className || ""}`}>
        <svg viewBox="0 0 55 55" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M45.833 27.5H9.167M9.167 27.5L27.5 45.833M9.167 27.5L27.5 9.167" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

const FiRrPlus = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center ${className || ""}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    </div>
);

const FiRrUpload = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center ${className || ""}`}>
        <svg viewBox="0 0 29 29" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
            <path d="M14.5 2.417v16.916M14.5 2.417L9.667 7.25M14.5 2.417l4.833 4.833" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.417 19.333v2.417a4.833 4.833 0 004.833 4.833h14.5a4.833 4.833 0 004.833-4.833v-2.417" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

export default function CreateKaryaForm({ genres }: { genres: Genre[] }) {
    const [isPending, setIsPending] = useState(false);
    const [step, setStep] = useState(1);
    const router = useRouter();

    // --- LOGIKA UPLOAD & CONVERT KE BASE64 DENGAN KOMPRESI ---
    const [coverPreview, setCoverPreview] = useState<string | null>(null);
    const [coverBase64, setCoverBase64] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    // Target Resolution: 600x900 (High-end enough for book covers)
                    const MAX_WIDTH = 600;
                    const MAX_HEIGHT = 900;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    
                    // Compress to WebP with 0.7 quality (Optimized for bandwidth)
                    const compressedBase64 = canvas.toDataURL('image/webp', 0.7);
                    resolve(compressedBase64);
                };
            };
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran file terlalu besar! Maksimal 5MB.");
                e.target.value = ''; // Reset input
                return;
            }

            // Tampilkan Preview Mentah (Instan)
            setCoverPreview(URL.createObjectURL(file));

            const loadingToast = toast.loading('Memproses gambar...');
            try {
                // Kompresi Client-Side & Convert ke Base64 (WebP)
                const compressedBase64 = await compressImage(file);
                setCoverBase64(compressedBase64);
                toast.success('Gambar berhasil diproses!', { id: loadingToast });
            } catch (error) {
                toast.error('Gagal memproses gambar.', { id: loadingToast });
            }
        }
    };

    const handleRemoveImage = () => {
        setCoverPreview(null);
        setCoverBase64(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
        }
    };

    async function handeSubmitAction(formData: FormData) {
        setIsPending(true);
        try {
            const result = await createKarya(formData);

            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success("Berhasil membuat karya baru!");
                router.push('/admin/dashboard'); 
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan sistem saat menghubungi server.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="w-full min-h-[810px] relative overflow-x-hidden pt-14 pb-24">
            <form action={handeSubmitAction} className="w-full h-full">
                
                {/* Input tersembunyi untuk mengirim teks Base64 ke Backend */}
                <input type="hidden" name="cover_url" value={coverBase64 || ""} />

                {/* ================= STEP 1: METADATA ================= */}
                <div className={step === 1 ? "block" : "hidden"}>
                    <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-12 animate-in fade-in duration-300">
                        <div className="flex justify-between items-center mb-16">
                            <button type="button" onClick={() => router.back()} className="hover:scale-105 transition-transform text-brown-dark dark:text-tan-primary">
                                <ArrowBack className="w-12 h-12" />
                            </button>
                            <button type="button" onClick={() => setStep(2)} className="font-lobster text-brown-dark text-3xl sm:text-[45px] lowercase hover:opacity-70 transition-opacity dark:text-tan-primary">
                                skip
                            </button>
                        </div>

                        <div className="flex flex-col lg:flex-row gap-12 sm:gap-20">
                            
                            {/* Area Cover */}
                            <div className="flex flex-col gap-4">
                                <label className="font-black text-brown-dark dark:text-text-accent text-xl sm:text-[25.7px] italic uppercase tracking-tighter">Sampul (Opsional)</label>
                                <div className="w-[183px] h-[239px] bg-white/40 dark:bg-brown-dark/40 border-2 border-dashed border-tan-primary/20 rounded-[24.75px] flex items-center justify-center relative hover:bg-tan-primary/5 transition-colors overflow-hidden group">
                                    
                                    {/* Input File (TIDAK ADA NAME agar tidak tabrakan dengan hidden input) */}
                                    <input 
                                        type="file" 
                                        ref={fileInputRef}
                                        onChange={handleImageChange}
                                        className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 ${coverPreview ? 'hidden' : 'block'}`} 
                                        accept="image/*" 
                                    />

                                    {coverPreview ? (
                                        <>
                                            <NextImage src={coverPreview} width={183} height={239} alt="Preview" className="w-full h-full object-cover" />
                                            <div className="absolute inset-0 bg-brown-dark/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-20 backdrop-blur-sm">
                                                <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/10 border border-white/30 text-white font-black px-4 py-1.5 rounded-xl hover:bg-white/20 transition-colors text-[10px] uppercase tracking-widest italic w-24">
                                                    Ganti
                                                </button>
                                                <button type="button" onClick={handleRemoveImage} className="bg-red-900/40 text-white font-black px-4 py-1.5 rounded-xl hover:bg-red-900/60 transition-colors text-[10px] uppercase tracking-widest italic w-24">
                                                    Hapus
                                                </button>
                                            </div>
                                        </>
                                    ) : (
                                        <div className="text-tan-primary/40 group-hover:text-tan-primary transition-colors">
                                            <FiRrPlus className="w-12 h-12" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Area Input */}
                            <div className="flex-1 flex flex-col gap-10">
                                <div className="flex flex-col gap-3">
                                    <label className="font-black text-brown-dark dark:text-text-accent text-xl sm:text-[25.7px] italic uppercase tracking-tighter">Judul Karya (Wajib)</label>
                                    <input
                                        name="title"
                                        type="text"
                                        required
                                        placeholder="Tuliskan judul mahakaryamu..."
                                        className="w-full h-[60px] bg-white/40 dark:bg-brown-dark/40 border-2 border-tan-primary/10 dark:border-brown-mid rounded-[1.5rem] px-8 font-bold italic text-brown-dark dark:text-text-accent text-xl sm:text-[22px] placeholder-brown-dark/20 dark:placeholder-tan-light/20 focus:ring-4 focus:ring-tan-primary/5 outline-none transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="font-black text-brown-dark dark:text-text-accent text-xl sm:text-[25.7px] italic uppercase tracking-tighter">Alias Penulis (Wajib)</label>
                                    <input
                                        name="penulis_alias"
                                        type="text"
                                        required
                                        placeholder="Nama yang akan terukir di sampul..."
                                        className="w-full h-[60px] bg-white/40 dark:bg-brown-dark/40 border-2 border-tan-primary/10 dark:border-brown-mid rounded-[1.5rem] px-8 font-bold italic text-brown-dark dark:text-text-accent text-xl sm:text-[22px] placeholder-brown-dark/20 dark:placeholder-tan-light/20 focus:ring-4 focus:ring-tan-primary/5 outline-none transition-all"
                                    />
                                </div>

                                <div className="flex flex-col gap-3">
                                    <label className="font-black text-brown-dark dark:text-text-accent text-xl sm:text-[25.7px] italic uppercase tracking-tighter">Aliran Cerita (Genre) - Pilih Minimal 1</label>
                                    {genres.length === 0 ? (
                                        <p className="text-brown-dark/40 italic font-bold">Belum ada genre yang tersedia.</p>
                                    ) : (
                                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/20 dark:bg-brown-dark/20 p-6 rounded-[1.5rem] border border-tan-primary/5">
                                            {genres.map(g => (
                                                <label key={g.id} className="flex items-center space-x-3 text-brown-dark/60 dark:text-tan-light/60 cursor-pointer text-sm font-bold group transition-all hover:text-brown-dark dark:hover:text-text-accent italic">
                                                    <input type="checkbox" name="genres" value={g.id} className="w-5 h-5 rounded-lg border-2 border-tan-primary/20 bg-white/40 dark:bg-brown-dark/40 text-brown-dark focus:ring-0 cursor-pointer transition-all checked:bg-brown-dark" />
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
                                        className="group w-[193px] h-[65px] bg-brown-dark dark:bg-tan-primary text-text-accent rounded-full flex items-center justify-center font-black text-xl uppercase tracking-[0.2em] italic cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brown-dark/20"
                                    >
                                        Lanjut
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ================= STEP 2: BAB & KONTEN ================= */}
                <div className={step === 2 ? "block" : "hidden"}>
                    <div className="w-full max-w-[1200px] mx-auto px-6 sm:px-12 flex flex-col h-full animate-in fade-in slide-in-from-right-8 duration-300">
                        <div className="flex justify-between items-center mb-16">
                            <button type="button" onClick={() => setStep(1)} className="hover:scale-105 transition-transform text-brown-dark dark:text-tan-primary">
                                <ArrowBack className="w-12 h-12" />
                            </button>
                            
                            <button
                                type="submit"
                                disabled={isPending}
                                className="h-[65px] px-10 bg-brown-dark dark:bg-tan-primary hover:bg-brown-mid dark:hover:bg-tan-light text-text-accent rounded-full flex items-center justify-center gap-4 cursor-pointer disabled:opacity-50 transition-all shadow-xl shadow-brown-dark/20 group active:scale-95"
                            >
                                <span className="font-black text-xl uppercase tracking-[0.2em] italic">
                                    {isPending ? 'Mengukir...' : 'Unggah Karya'}
                                </span>
                                {!isPending && <FiRrUpload className="w-6 h-6 group-hover:-translate-y-1 transition-transform" />}
                            </button>
                        </div>

                        <div className="mb-8 w-full h-[80px] bg-white/40 dark:bg-brown-dark/40 border-2 border-tan-primary/10 dark:border-brown-mid rounded-2xl shadow-sm group focus-within:ring-4 focus-within:ring-tan-primary/5 transition-all">
                            <input
                                type="text"
                                name="bab_title"
                                required
                                placeholder="Masukkan Judul Bab Pertama (Wajib)..."
                                className="w-full h-full bg-transparent px-10 font-bold italic text-brown-dark dark:text-text-accent text-2xl sm:text-3xl placeholder-brown-dark/20 dark:placeholder-tan-light/20 outline-none"
                            />
                        </div>

                        <div className="w-full h-[500px] bg-white/30 dark:bg-brown-dark/30 border-2 border-tan-primary/5 dark:border-brown-mid rounded-3xl shadow-inner group focus-within:ring-4 focus-within:ring-tan-primary/5 transition-all overflow-hidden">
                            <textarea
                                name="bab_content"
                                required
                                placeholder="Mulailah menggoreskan imajinasimu di sini (Wajib)..."
                                className="w-full h-full bg-transparent px-10 pt-8 font-medium italic text-brown-dark dark:text-tan-light text-xl sm:text-[22px] placeholder-brown-dark/20 dark:placeholder-tan-light/20 outline-none resize-none leading-relaxed"
                            />
                        </div>
                    </div>
                </div>

            </form>
        </div>
    );
}