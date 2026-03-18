'use client';

import { useState, useRef } from 'react';
import { createAuthorPost } from '@/app/actions/post';
import { UserCircle2, Image as ImageIcon, X, Send, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { toast } from 'sonner';

export default function CreatePostForm({ userProfile }: { userProfile: any }) {
    const [isPending, setIsPending] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [showImageInput, setShowImageInput] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new globalThis.Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800; // Posts can be a bit larger than avatars
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);

                    const compressedBase64 = canvas.toDataURL('image/webp', 0.7);
                    resolve(compressedBase64);
                };
            };
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (5MB limit for safety)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran gambar terlalu besar! Maksimal 5MB.");
                e.target.value = '';
                return;
            }

            const loadingToast = toast.loading('Memproses gambar...');
            try {
                const compressed = await compressImage(file);
                setImageUrl(compressed);
                setShowImageInput(true);
                toast.success('Gambar siap!', { id: loadingToast });
            } catch (err) {
                toast.error('Gagal memproses gambar.', { id: loadingToast });
            }
        }
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isPending) return;
        setIsPending(true);

        const formData = new FormData(event.currentTarget);
        // Force compressed image URL into formData
        formData.set('image_url', imageUrl);

        try {
            const res = await createAuthorPost(formData);
            if (res.error) toast.error(res.error);
            else {
                toast.success('Postingan berhasil diterbitkan!');
                setContent('');
                setImageUrl('');
                setIsFocused(false);
                setShowImageInput(false);
            }
        } catch (error) {
            toast.error("Terjadi kesalahan.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-brown-dark border border-white/5 rounded-[2rem] p-5 shadow-2xl mb-6 transition-all duration-500 group">
            <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 bg-tan-light/10 border border-brown-dark/10 shadow-sm relative">
                    {userProfile.avatar_url ? (
                        <Image src={userProfile.avatar_url} width={40} height={40} sizes="40px" alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-brown-dark/5">
                            <UserCircle2 className="w-6 h-6 text-brown-dark/20" />
                        </div>
                    )}
                </div>
                <textarea
                    name="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="Bagikan pembaruan, kutipan, atau pemikiran terbaru ke pembacamu..."
                    className="w-full bg-transparent text-[15px] text-text-accent border-none outline-none focus:ring-0 min-h-12 resize-none font-medium italic leading-relaxed placeholder:text-white/40"
                    rows={isFocused || content ? 4 : 1}
                    required
                    disabled={isPending}
                />
            </div>

            {/* Image Preview / Input */}
            {imageUrl && (
                <div className="mb-4 relative px-2">
                    <Image src={imageUrl} width={800} height={500} unoptimized sizes="(max-width: 768px) 100vw, 800px" alt="Preview" className="w-full max-h-72 object-cover rounded-2xl border border-brown-dark/10 shadow-md transition-transform duration-500" />
                    <button type="button" onClick={() => { setImageUrl(''); setShowImageInput(false); }} className="absolute top-4 right-6 bg-brown-dark/80 text-text-accent p-1.5 rounded-full hover:bg-brown-dark shadow-lg transition-all active:scale-90">
                        <X className="w-4 h-4" />
                    </button>
                    <input type="hidden" name="image_url" value={imageUrl} />
                </div>
            )}

            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept="image/*"
            />

            {(isFocused || content) && (
                <div className="flex items-center justify-between border-t border-tan-primary/10 dark:border-brown-mid/30 pt-4 px-2">
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 ${imageUrl ? 'text-text-accent' : 'text-tan-light hover:text-text-accent'}`}
                    >
                        <ImageIcon className="w-4 h-4" /> {imageUrl ? 'Ganti Gambar' : 'Tambah Gambar'}
                    </button>
                    <div className="flex gap-3">
                        <button type="button" onClick={() => { setIsFocused(false); setContent(''); setImageUrl(''); setShowImageInput(false); }} className="text-tan-primary/60 hover:text-brown-dark text-[10px] font-black uppercase tracking-widest px-4 py-2 transition-all">Batal</button>
                        <button type="submit" disabled={isPending || !content.trim()} className="bg-brown-dark hover:bg-brown-dark/90 text-text-accent text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2.5 rounded-full shadow-lg shadow-brown-dark/10 transition-all active:scale-95 disabled:opacity-50">
                            {isPending ? 'Mengeposkan...' : 'Terbitkan'}
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}
