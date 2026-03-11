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
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-8">
                {/* Avatar URL */}
                <div>
                    <label className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-4 ml-2 flex items-center gap-3">
                        <UserCircle2 className="w-4 h-4" /> Lukisan Profil (URL Foto)
                    </label>
                    <div className="flex gap-6 items-center">
                        <div className="w-20 h-20 wobbly-border-sm bg-parchment-light flex items-center justify-center border-2 border-white shadow-lg rotate-3 shrink-0 overflow-hidden">
                            {avatarUrl ? (
                                <img src={avatarUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <UserCircle2 className="w-full h-full text-ink/10 p-3" />
                            )}
                        </div>
                        <input
                            type="url"
                            value={avatarUrl}
                            onChange={(e) => setAvatarUrl(e.target.value)}
                            className="flex-1 bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-5 py-4 font-journal-body text-base text-ink-deep italic transition-all placeholder:text-ink/10"
                            placeholder="https://example.com/lukisan.jpg"
                            disabled={isPending}
                        />
                    </div>
                </div>

                {/* Display Name */}
                <div>
                    <label className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-3 block ml-2">
                        Nama Tampilan Terukir
                    </label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-5 py-4 font-journal-title text-xl text-ink-deep italic transition-all placeholder:text-ink/10"
                        placeholder="Nama yang muncul di lembaran..."
                        required
                        disabled={isPending}
                    />
                </div>

                {/* Bio */}
                <div>
                    <label className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-3 block ml-2">
                        Hikayat Singkat (Bio)
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-5 py-4 font-journal-body text-lg text-ink-deep italic transition-all resize-none placeholder:text-ink/10 leading-relaxed"
                        placeholder="Bagikan sedikit kisahmu..."
                        disabled={isPending}
                    />
                </div>

                {/* Social Links Section */}
                <div className="pt-8 wobbly-border-t border-ink/5">
                    <label className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-6 ml-2 flex items-center gap-3">
                        <Link2 className="w-4 h-4" /> Tautan Jaring Sosial
                    </label>

                    <div className="space-y-5">
                        {/* Instagram */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 wobbly-border-sm bg-pink-50 flex items-center justify-center text-pink-600 border-2 border-white shadow-md rotate-3 shrink-0">
                                <Instagram className="w-6 h-6" />
                            </div>
                            <input
                                type="url"
                                value={socials.instagram || ''}
                                onChange={(e) => updateSocial('instagram', e.target.value)}
                                className="flex-1 bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pink-500/20 px-5 py-3 font-journal-body text-base text-ink-deep outline-none italic"
                                placeholder="https://instagram.com/pujangga"
                                disabled={isPending}
                            />
                        </div>

                        {/* Twitter/X */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 wobbly-border-sm bg-ink-deep text-parchment flex items-center justify-center border-2 border-white shadow-md -rotate-3 shrink-0">
                                <Twitter className="w-6 h-6" />
                            </div>
                            <input
                                type="url"
                                value={socials.twitter || ''}
                                onChange={(e) => updateSocial('twitter', e.target.value)}
                                className="flex-1 bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-ink-deep/20 px-5 py-3 font-journal-body text-base text-ink-deep outline-none italic"
                                placeholder="https://x.com/pujangga"
                                disabled={isPending}
                            />
                        </div>

                        {/* Website */}
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 wobbly-border-sm bg-pine/10 text-pine flex items-center justify-center border-2 border-white shadow-md rotate-2 shrink-0">
                                <Globe className="w-6 h-6" />
                            </div>
                            <input
                                type="url"
                                value={socials.website || ''}
                                onChange={(e) => updateSocial('website', e.target.value)}
                                className="flex-1 bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 px-5 py-3 font-journal-body text-base text-ink-deep outline-none italic"
                                placeholder="https://kedai-imajinasi.com"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                </div>
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-pine text-parchment font-journal-title text-2xl py-5 wobbly-border paper-shadow shadow-xl flex items-center justify-center gap-3 italic hover:rotate-1 active:scale-[0.98] transition-all disabled:opacity-50"
            >
                <Save className="w-6 h-6" />
                {isPending ? 'Mengukir Perubahan...' : 'Torehkan Perubahan ✨'}
            </button>
        </form>
    );
}
