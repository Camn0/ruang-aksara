'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/app/actions/user';
import { Save, Instagram, Twitter, Globe, Link2, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';

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
}

export default function EditProfileForm({ initialDisplayName, initialBio, initialSocialLinks, initialAvatarUrl }: EditProfileFormProps) {
    const [displayName, setDisplayName] = useState(initialDisplayName);
    const [bio, setBio] = useState(initialBio || '');
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl || '');
    const [socials, setSocials] = useState<SocialLinks>(initialSocialLinks || {});

    const [isPending, setIsPending] = useState(false);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsPending(true);

        const formData = new FormData();
        formData.append('displayName', displayName);
        formData.append('bio', bio);
        formData.append('avatarUrl', avatarUrl);
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
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-8">
                {/* Avatar URL */}
                <div>
                    <label className="text-[10px] text-tan-primary uppercase font-black tracking-[0.2em] mb-3 flex items-center gap-2">
                        <UserCircle2 className="w-3.5 h-3.5" /> URL Foto Profil
                    </label>
                    <div className="flex gap-6 items-center">
                        <div className="w-20 h-20 rounded-[1.5rem] overflow-hidden bg-brown-dark/5 border border-brown-dark/10 shrink-0 shadow-sm relative group">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <UserCircle2 className="w-8 h-8 text-brown-dark/10" strokeWidth={1.5} />
                                </div>
                            )}
                        </div>
                        <input
                            type="url"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="flex-1 bg-brown-dark/[0.03] dark:bg-slate-950 border border-brown-dark/10 rounded-2xl px-5 py-4 text-xs font-black text-text-main dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-tan-primary/30 transition-all placeholder:text-brown-dark/20"
                            placeholder="https://example.com/avatar.jpg"
                            disabled={isPending}
                        />
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
                        className="w-full bg-brown-dark/[0.03] dark:bg-slate-950 border border-brown-dark/10 rounded-2xl px-5 py-4 text-sm font-black text-text-main dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-tan-primary/30 transition-all placeholder:text-brown-dark/20 italic"
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
                        className="w-full bg-brown-dark/[0.03] dark:bg-slate-950 border border-brown-dark/10 rounded-2xl px-5 py-4 text-sm text-text-main/80 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-tan-primary/30 transition-all resize-none font-medium italic leading-relaxed placeholder:text-brown-dark/20"
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
                                className="flex-1 bg-brown-dark/[0.03] dark:bg-slate-950 border border-brown-dark/10 rounded-2xl px-5 py-3.5 text-xs font-black text-text-main/70 focus:outline-none focus:ring-2 focus:ring-tan-primary/30 transition-all placeholder:text-brown-dark/20"
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
                                className="flex-1 bg-brown-dark/[0.03] dark:bg-slate-950 border border-brown-dark/10 rounded-2xl px-5 py-3.5 text-xs font-black text-text-main/70 focus:outline-none focus:ring-2 focus:ring-tan-primary/30 transition-all placeholder:text-brown-dark/20"
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
                                className="flex-1 bg-brown-dark/[0.03] dark:bg-slate-950 border border-brown-dark/10 rounded-2xl px-5 py-3.5 text-xs font-black text-text-main/70 focus:outline-none focus:ring-2 focus:ring-tan-primary/30 transition-all placeholder:text-brown-dark/20"
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
