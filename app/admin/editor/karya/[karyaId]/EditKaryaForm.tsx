'use client';

import { useState, useRef } from 'react';
import { editKarya } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react'; 
import { toast } from 'sonner';
import NextImage from 'next/image';
import DeleteKaryaButton from './DeleteKaryaButton';

interface Genre { id: string; name: string; }
interface Karya {
    id: string; title: string; penulis_alias: string; deskripsi: string | null;
    cover_url: string | null; is_completed: boolean; genres: Genre[];
}

const FiRrPlus = ({ className }: { className?: string }) => (
    <div className={`flex items-center justify-center ${className || ""}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
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
                    const dataUrl = canvas.toDataURL('image/webp', 0.7);
                    resolve(dataUrl);
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
                // Kompresi & Convert ke Base64 (Hemat Bandwidth Vercel)
                const compressedBase64 = await compressImage(file);
                setCoverBase64(compressedBase64);
                toast.success('Gambar siap!', { id: loadingToast });
            } catch (error) {
                toast.error('Gagal memproses gambar.', { id: loadingToast });
            }
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
            if (result.error) toast.error(result.error);
            else {
                toast.success("Berhasil menyimpan perubahan!");
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            toast.error("Terjadi kesalahan sistem.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <div className="w-full max-w-[1200px] mx-auto pt-14 px-6 sm:px-12 animate-in fade-in duration-300 pb-24">
            
            <div className="flex justify-between items-center mb-16">
                <button type="button" onClick={() => router.back()} className="hover:scale-105 transition-transform text-brown-dark dark:text-tan-primary">
                    <ArrowLeft className="w-12 h-12" strokeWidth={2.5} />
                </button>
                <button type="button" className="font-lobster text-brown-dark dark:text-tan-primary text-3xl sm:text-[45px] lowercase hover:opacity-70 transition-opacity">
                    Sunting Karya
                </button>
            </div>

            <form id="edit-karya-form" action={handleSubmit} className="flex flex-col lg:flex-row gap-12 sm:gap-20 mb-8">
                
                <input type="hidden" name="id" value={karya.id} />
                
                {/* Input tersembunyi ini yang akan dibaca oleh Backend Anda */}
                <input type="hidden" name="cover_url" value={coverBase64 || ""} />

                <div className="flex flex-col gap-4 shrink-0">
                    <label className="font-black text-brown-dark dark:text-text-accent text-xl sm:text-[25.7px] italic uppercase tracking-tighter">Sampul</label>
                    <div className="w-[183px] h-[239px] bg-white/40 dark:bg-brown-dark/40 border-2 border-dashed border-tan-primary/20 rounded-[24.75px] flex items-center justify-center relative hover:bg-tan-primary/5 transition-colors overflow-hidden group">
                        
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
                                <NextImage src={coverPreview} width={183} height={239} alt="Cover" className="w-full h-full object-cover" />
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
                            <div className="text-brown-dark/40 dark:text-tan-primary/40 group-hover:text-brown-dark dark:group-hover:text-tan-primary transition-colors">
                                <FiRrPlus className="w-12 h-12" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Kolom Kanan: Inputs Metadata */}
                <div className="flex-1 flex flex-col gap-8">
                    <div className="flex flex-col gap-3">
                        <label className="font-black text-brown-dark dark:text-text-accent text-xl sm:text-[25.7px] italic uppercase tracking-tighter">Judul Karya</label>
                        <input name="title" type="text" required defaultValue={karya.title} placeholder="Tuliskan judul mahakaryamu..." className="w-full h-[60px] bg-white/40 dark:bg-brown-dark/40 border-2 border-tan-primary/10 dark:border-brown-mid rounded-[1.5rem] px-8 font-bold italic text-brown-dark dark:text-text-accent text-xl sm:text-[22px] placeholder-brown-dark/40 dark:placeholder-tan-light/50 focus:ring-4 focus:ring-tan-primary/5 outline-none transition-all" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="font-black text-brown-dark dark:text-text-accent text-xl sm:text-[25.7px] italic uppercase tracking-tighter">Alias Penulis</label>
                        <input name="penulis_alias" type="text" defaultValue={karya.penulis_alias.replace(/\s\([^)]+\)$/, '')} placeholder="Nama yang akan terukir di sampul..." className="w-full h-[60px] bg-white/40 dark:bg-brown-dark/40 border-2 border-tan-primary/10 dark:border-brown-mid rounded-[1.5rem] px-8 font-bold italic text-brown-dark dark:text-text-accent text-xl sm:text-[22px] placeholder-brown-dark/40 dark:placeholder-tan-light/50 focus:ring-4 focus:ring-tan-primary/5 outline-none transition-all" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="font-black text-brown-dark dark:text-text-accent text-xl sm:text-[25.7px] italic uppercase tracking-tighter">Sinopsis / Deskripsi</label>
                        <textarea name="deskripsi" rows={6} defaultValue={karya.deskripsi || ""} placeholder="Gambarkan garis besar ceritamu..." className="w-full bg-white/40 dark:bg-brown-dark/40 border-2 border-tan-primary/10 dark:border-brown-mid rounded-[1.5rem] p-8 font-bold italic text-brown-dark dark:text-text-accent text-xl placeholder-brown-dark/40 dark:placeholder-tan-light/50 focus:ring-4 focus:ring-tan-primary/5 outline-none transition-all resize-none leading-relaxed" />
                    </div>

                    <div className="flex flex-col gap-3">
                        <label className="font-black text-brown-dark dark:text-text-accent text-xl sm:text-[25.7px] italic uppercase tracking-tighter">Aliran Cerita (Genre)</label>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/20 dark:bg-brown-dark/20 p-6 rounded-[1.5rem] border border-tan-primary/5">
                            {allGenres.map(g => (
                                <label key={g.id} className="flex items-center space-x-3 text-brown-dark/60 dark:text-tan-light/60 cursor-pointer text-sm font-bold group transition-all hover:text-brown-dark dark:hover:text-text-accent italic">
                                    <input type="checkbox" name="genres" value={g.id} defaultChecked={karya.genres.some(existing => existing.id === g.id)} className="w-5 h-5 rounded-lg border-2 border-tan-primary/20 bg-white/40 dark:bg-brown-dark/40 text-brown-dark focus:ring-0 cursor-pointer transition-all checked:bg-brown-dark" />
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
                    
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8 mt-12 border-t border-tan-primary/10 pt-12">
                        <div className="flex flex-col gap-4">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <input form="edit-karya-form" type="checkbox" name="is_completed" value="true" defaultChecked={karya.is_completed} className="w-6 h-6 rounded-lg border-2 border-tan-primary/20 bg-white/40 dark:bg-brown-dark/40 text-brown-dark focus:ring-0 cursor-pointer transition-all checked:bg-brown-dark" />
                                <span className="font-black text-brown-dark/70 dark:text-tan-light text-lg sm:text-xl italic uppercase tracking-tighter group-hover:opacity-100 transition-opacity">Tandai Cerita Telah Selesai (Tamat)</span>
                            </label>

                            <button form="edit-karya-form" type="submit" disabled={isPending} className="w-full sm:w-fit px-12 h-[65px] bg-brown-dark text-text-accent rounded-full flex items-center justify-center font-black text-xl uppercase tracking-[0.2em] italic cursor-pointer hover:scale-105 active:scale-95 transition-all shadow-xl shadow-brown-dark/20 disabled:opacity-50">
                                {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                            </button>
                        </div>

                        <DeleteKaryaButton karyaId={karya.id} />
                    </div>
                </div>
            </div>
        </div>
    );
}