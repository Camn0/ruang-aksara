'use client';

import { useState, useRef } from 'react';
import { editKarya } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react'; 

interface Genre { id: string; name: string; }
interface Karya {
    id: string; title: string; penulis_alias: string; deskripsi: string | null;
    cover_url: string | null; is_completed: boolean; genres: Genre[];
}

const FiRrPlus = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center ${className || ""}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="#f2ead7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
    </div>
);

export default function EditKaryaForm({ karya, allGenres, children }: { karya: Karya, allGenres: Genre[], children: React.ReactNode }) {
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    // --- LOGIKA UPLOAD & CONVERT KE BASE64 DENGAN KOMPRESI ---
    const [coverPreview, setCoverPreview] = useState<string | null>(karya.cover_url);
    const [coverBase64, setCoverBase64] = useState<string | null>(karya.cover_url);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
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
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    resolve(dataUrl);
                };
            };
        });
    };

    const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Tampilkan Preview Mentah (Instan)
            setCoverPreview(URL.createObjectURL(file));

            // Kompresi & Convert ke Base64 (Hemat Bandwidth Vercel)
            const compressedBase64 = await compressImage(file);
            setCoverBase64(compressedBase64);
        }
    };

    const handleRemoveImage = () => {
        setCoverPreview(null);
        setCoverBase64(""); // Kosongkan string jika dihapus
        if (fileInputRef.current) {
            fileInputRef.current.value = ""; 
        }
    };

    async function handleSubmit(formData: FormData) {
        setIsPending(true);
        try {
            const result = await editKarya(formData);
            if (result.error) alert(result.error);
            else {
                alert("Berhasil menyimpan perubahan!");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan sistem.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="w-full max-w-[1200px] mx-auto pt-14 px-6 sm:px-12 animate-in fade-in duration-300 font-sans pb-24">
            
            <div className="flex justify-between items-center mb-16">
                <button type="button" onClick={() => router.back()} className="hover:scale-105 transition-transform">
                    <ArrowLeft className="w-12 h-12 text-[#121212]" strokeWidth={2.5} />
                </button>
                <button type="button" className="font-semibold text-[#121212] text-3xl sm:text-[45px] lowercase hover:opacity-70 transition-opacity">
                    skip
                </button>
            </div>

            <form id="edit-karya-form" action={handleSubmit} className="flex flex-col lg:flex-row gap-12 sm:gap-20 mb-8">
                
                <input type="hidden" name="id" value={karya.id} />
                
                {/* Input tersembunyi ini yang akan dibaca oleh Backend Anda */}
                <input type="hidden" name="cover_url" value={coverBase64 || ""} />

                <div className="flex flex-col gap-4 shrink-0">
                    <label className="font-semibold text-black text-xl sm:text-[25.7px]">Cover</label>
                    <div className="w-[183px] h-[239px] bg-[#886750] rounded-[24.75px] flex items-center justify-center relative hover:bg-[#7a5c48] transition-colors overflow-hidden group">
                        
                        {/* Input File (TIDAK DIBERI NAME agar tidak membingungkan backend) */}
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageChange} 
                            className={`absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 ${coverPreview ? 'hidden' : 'block'}`} 
                            accept="image/*" 
                        />
                        
                        {coverPreview ? (
                            <>
                                <img src={coverPreview} alt="Cover" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3 z-20 backdrop-blur-sm">
                                    <button type="button" onClick={() => fileInputRef.current?.click()} className="bg-white/20 border border-white/50 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-white/40 transition-colors text-sm w-20 cursor-pointer">
                                        Ganti
                                    </button>
                                    <button type="button" onClick={handleRemoveImage} className="bg-red-500/80 text-white font-semibold px-4 py-1.5 rounded-lg hover:bg-red-500 transition-colors text-sm w-20 cursor-pointer">
                                        Hapus
                                    </button>
                                </div>
                            </>
                        ) : (
                            <FiRrPlus className="w-12 h-12" />
                        )}
                    </div>
                </div>

                {/* Kolom Kanan: Inputs Metadata */}
                <div className="flex-1 flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <label className="font-semibold text-black text-xl sm:text-[25.7px]">Judul</label>
                        <input name="title" type="text" required defaultValue={karya.title} placeholder="masukkan judul" className="w-full h-[60px] bg-[#886750] rounded-[16.5px] px-5 font-normal text-[#f2ead7] text-xl sm:text-[25.7px] placeholder-[#f2ead7]/70 outline-none" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="font-semibold text-black text-xl sm:text-[25.7px]">Nama Alias Penulis</label>
                        <input name="penulis_alias" type="text" defaultValue={karya.penulis_alias.replace(/\s\([^)]+\)$/, '')} placeholder="contoh: Andrea Hirata" className="w-full h-[60px] bg-[#886750] rounded-[16.5px] px-5 font-normal text-[#f2ead7] text-xl sm:text-[25.7px] placeholder-[#f2ead7]/70 outline-none" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="font-semibold text-black text-xl sm:text-[25.7px]">Deskripsi</label>
                        <textarea name="deskripsi" rows={6} defaultValue={karya.deskripsi || ""} placeholder="masukkan deskripsi" className="w-full bg-[#886750] rounded-[16.5px] p-5 font-normal text-[#f2ead7] text-xl sm:text-[25.7px] placeholder-[#f2ead7]/70 outline-none resize-none" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="font-semibold text-black text-xl sm:text-[25.7px]">Pilih Genre</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 bg-[#886750] p-6 rounded-[16.5px]">
                            {allGenres.map(g => (
                                <label key={g.id} className="flex items-center space-x-3 text-[#f2ead7] cursor-pointer text-lg">
                                    <input type="checkbox" name="genres" value={g.id} defaultChecked={karya.genres.some(existing => existing.id === g.id)} className="w-5 h-5 rounded border-none bg-white/20 text-[#3b2a22] focus:ring-0 cursor-pointer" />
                                    <span>{g.name}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                </div>
            </form>

            {/* AREA BAWAH (List Bab + Submit) */}
            <div className="flex flex-col lg:flex-row gap-12 sm:gap-20">
                <div className="hidden lg:block w-[183px] shrink-0"></div>
                <div className="flex-1 flex flex-col gap-4">
                    
                    {children}
                    
                    <label className="flex items-center gap-4 cursor-pointer mt-6 w-fit">
                        <input form="edit-karya-form" type="checkbox" name="is_completed" value="true" defaultChecked={karya.is_completed} className="w-6 h-6 text-[#1a130f] border-[#3b2a22] rounded focus:ring-0 bg-transparent cursor-pointer" />
                        <span className="font-semibold text-black text-xl sm:text-[22px]">Tandai Cerita Selesai (Tamat)</span>
                    </label>

                    <button form="edit-karya-form" type="submit" disabled={isPending} className="w-full sm:w-[284px] h-[56px] bg-[#1a130f] rounded-[13.66px] flex items-center justify-center text-[#f2ead7] text-[25px] font-normal hover:bg-black transition-colors mt-4 disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
                        {isPending ? 'Menyimpan...' : 'Selesaikan Cerita'}
                    </button>
                </div>
            </div>
        </div>
    );
}