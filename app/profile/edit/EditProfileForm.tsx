'use client';

import { useState, useRef } from 'react';
import { updateUserProfile } from '@/app/actions/user';
import { Save, Instagram, Twitter, Globe, Link2, UserCircle2, Camera, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import NextImage from 'next/image';

interface SocialLinks {
    instagram?: string;
    twitter?: string;
    website?: string;
}

interface EditProfileFormProps {
    initialDisplayName: string;
    initialBio: string | null;
    initialSocialLinks: SocialLinks | null;
    initialAvatarUrl: string | null;
    initialBannerUrl: string | null;
}

export default function EditProfileForm({ initialDisplayName, initialBio, initialSocialLinks, initialAvatarUrl, initialBannerUrl }: EditProfileFormProps) {
    const [displayName, setDisplayName] = useState(initialDisplayName);
    const [bio, setBio] = useState(initialBio || '');
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '');
    const [bannerUrl, setBannerUrl] = useState(initialBannerUrl || '');
    const [socials, setSocials] = useState<SocialLinks>(initialSocialLinks || {});

    const [isPending, setIsPending] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const bannerInputRef = useRef<HTMLInputElement>(null);

    const compressImage = (file: File): Promise<string> => {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = document.createElement('img');
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement('canvas');

                    // Cap resolution to 1920px for banners/avatars to save bandwidth
                    const MAX_WIDTH = 1920;
                    let width = img.width;
                    let height = img.height;

                    if (width > MAX_WIDTH) {
                        height = Math.round((height * MAX_WIDTH) / width);
                        width = MAX_WIDTH;
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    ctx?.drawImage(img, 0, 0, width, height);

                    // Dropping to 0.7 quality for a sharper size-to-visual ratio
                    const compressedBase64 = canvas.toDataURL('image/webp', 0.7);
                    resolve(compressedBase64);
                };
            };
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'banner') => {
        const file = e.target.files?.[0];
        if (file) {
            // Check file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error("Ukuran file terlalu besar! Maksimal 5MB.");
                e.target.value = ''; // Reset input
                return;
            }

            toast.loading(`Memproses ${type === 'avatar' ? 'foto' : 'banner'}...`, { id: 'file-upload' });
            try {
                const compressed = await compressImage(file);
                if (type === 'avatar') setAvatarUrl(compressed);
                else setBannerUrl(compressed);
                toast.success(`${type === 'avatar' ? 'Foto' : 'Banner'} siap diunggah!`, { id: 'file-upload' });
            } catch (err) {
                toast.error(`Gagal memproses ${type}.`, { id: 'file-upload' });
            }
        }
    };

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData();
        formData.append('displayName', displayName);
        formData.append('bio', bio);
        formData.append('avatarUrl', avatarUrl);
        formData.append('bannerUrl', bannerUrl);
        formData.append('socialLinks', JSON.stringify(socials));

        const res = await updateUserProfile(formData);

        if (res.error) {
            toast.error(res.error);
        } else {
            toast.success('Profil berhasil diperbarui!');
        }
        setIsPending(false);
    }

    const updateSocial = (key: keyof SocialLinks, value: string) => {
        setSocials(prev => ({ ...prev, [key]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-12">
            <div className="space-y-10">
                {/* Banner Section */}
                <div className="relative group">
                    <label className="text-[10px] text-tan-primary uppercase font-black tracking-[0.2em] mb-4 block ml-1">Sampul Profil</label>
                    <div className="w-full h-40 sm:h-48 bg-olive-banner rounded-[2.5rem] border border-brown-dark/10 overflow-hidden relative shadow-inner">
                        {bannerUrl ? (
                            <NextImage
                                src={bannerUrl}
                                fill
                                sizes="(max-width: 768px) 100vw, 850px"
                                className="w-full h-full object-cover"
                                alt="Banner"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center opacity-10">
                                <Globe className="w-12 h-12 text-brown-dark" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                            <button
                                type="button"
                                onClick={() => bannerInputRef.current?.click()}
                                className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all border border-white/20"
                            >
                                <Camera className="w-5 h-5" />
                            </button>
                            {bannerUrl && (
                                <button
                                    type="button"
                                    onClick={() => setBannerUrl('')}
                                    className="w-12 h-12 bg-red-500/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:scale-110 active:scale-95 transition-all border border-red-500/20"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    </div>
                    <input
                        type="file"
                        ref={bannerInputRef}
                        onChange={(e) => handleFileChange(e, 'banner')}
                        className="hidden"
                        accept="image/*"
                    />
                </div>

                {/* Avatar Section */}
                <div>
                    <label className="text-[10px] text-tan-primary uppercase font-black tracking-[0.2em] mb-3 flex items-center gap-2">
                        <UserCircle2 className="w-3.5 h-3.5" /> Foto Profil
                    </label>
                    <div className="flex gap-6 items-center">
                        <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden bg-brown-dark/5 border border-brown-dark/10 shrink-0 shadow-sm relative group">
                            {avatarUrl ? (
                                <NextImage src={avatarUrl} width={80} height={80} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <UserCircle2 className="w-8 h-8 text-brown-dark/10" strokeWidth={1.5} />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={(e) => handleFileChange(e, 'avatar')}
                                className="hidden"
                                accept="image/jpeg,image/png,image/webp"
                            />
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-4 py-2 bg-tan-primary text-text-accent rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-brown-mid transition-all shadow-md active:scale-95"
                                    disabled={isPending}
                                >
                                    <Camera className="w-3.5 h-3.5" /> Unggah Foto
                                </button>
                                {avatarUrl && (
                                    <button
                                        type="button"
                                        onClick={() => setAvatarUrl('')}
                                        className="px-4 py-2 bg-red-50 text-red-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-red-100 transition-all active:scale-95"
                                        disabled={isPending}
                                    >
                                        <Trash2 className="w-3.5 h-3.5" /> Hapus
                                    </button>
                                )}
                            </div>
                            <p className="text-[9px] text-brown-dark/40 font-bold italic">Max 5MB. Akan dikompresi otomatis.</p>
                        </div>
                    </div>
                </div>

                {/* Display Name */}
                <div>
                    <label className="text-[10px] text-tan-primary uppercase font-black tracking-[0.2em] mb-3 block ml-1">
                        Nama Tampilan
                    </label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-brown-dark/[0.03] dark:bg-brown-dark border border-brown-dark/10 rounded-2xl px-5 py-4 text-sm font-black text-text-main dark:text-text-accent focus:outline-none focus:ring-2 focus:ring-tan-primary/30 transition-all placeholder:text-brown-dark/20 italic"
                        placeholder="Nama yang muncul di profil..."
                        required
                        disabled={isPending}
                    />
                </div>

                {/* Bio */}
                <div>
                    <label className="text-[10px] text-tan-primary uppercase font-black tracking-[0.2em] mb-3 block ml-1">
                        Bio / Deskripsi Diri
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full bg-brown-dark/[0.03] dark:bg-brown-dark border border-brown-dark/10 rounded-2xl px-5 py-4 text-sm text-text-main/80 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-tan-primary/30 transition-all resize-none font-medium italic leading-relaxed placeholder:text-brown-dark/20"
                        placeholder="Ceritakan sedikit tentang dirimu..."
                        disabled={isPending}
                    />
                </div>

                {/* Social Links Section */}
                <div className="pt-8 border-t border-brown-dark/5">
                    <label className="text-[10px] text-tan-primary uppercase font-black tracking-[0.2em] mb-6 flex items-center gap-2">
                        <Link2 className="w-3.5 h-3.5" /> Tautan Sosial
                    </label>

                    <div className="space-y-4">
                        {/* Instagram */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brown-dark/[0.04] flex items-center justify-center text-brown-dark shrink-0 border border-brown-dark/5 shadow-sm">
                                <Instagram className="w-5 h-5" />
                            </div>
                            <input
                                type="url"
                                value={socials.instagram || ''}
                                onChange={(e) => updateSocial('instagram', e.target.value)}
                                className="flex-1 bg-brown-dark/[0.03] dark:bg-brown-dark border border-brown-dark/10 rounded-2xl px-5 py-3.5 text-xs font-black text-text-main/70 focus:outline-none focus:ring-2 focus:ring-tan-primary/30 transition-all placeholder:text-brown-dark/20"
                                placeholder="https://instagram.com/username"
                                disabled={isPending}
                            />
                        </div>

                        {/* Twitter/X */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brown-dark/[0.04] flex items-center justify-center text-brown-dark shrink-0 border border-brown-dark/5 shadow-sm">
                                <Twitter className="w-5 h-5" />
                            </div>
                            <input
                                type="url"
                                value={socials.twitter || ''}
                                onChange={(e) => updateSocial('twitter', e.target.value)}
                                className="flex-1 bg-brown-dark/[0.03] dark:bg-brown-dark border border-brown-dark/10 rounded-2xl px-5 py-3.5 text-xs font-black text-text-main/70 focus:outline-none focus:ring-2 focus:ring-tan-primary/30 transition-all placeholder:text-brown-dark/20"
                                placeholder="https://x.com/username"
                                disabled={isPending}
                            />
                        </div>

                        {/* Website */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-brown-dark/[0.04] flex items-center justify-center text-brown-dark shrink-0 border border-brown-dark/5 shadow-sm">
                                <Globe className="w-5 h-5" />
                            </div>
                            <input
                                type="url"
                                value={socials.website || ''}
                                onChange={(e) => updateSocial('website', e.target.value)}
                                className="flex-1 bg-brown-dark/[0.03] dark:bg-brown-dark border border-brown-dark/10 rounded-2xl px-5 py-3.5 text-xs font-black text-text-main/70 focus:outline-none focus:ring-2 focus:ring-tan-primary/30 transition-all placeholder:text-brown-dark/20"
                                placeholder="https://yourwebsite.com"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-brown-dark hover:bg-brown-dark/90 disabled:bg-brown-dark/50 text-text-accent font-open-sans font-black py-4 rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-brown-dark/10 transition-all active:scale-[0.98] mt-10"
            >
                <Save className="w-5 h-5" />
                <span className="uppercase tracking-[0.2em] text-xs">{isPending ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
            </button>
        </form>
    );
}
