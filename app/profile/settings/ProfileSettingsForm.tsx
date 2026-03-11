'use client';

import { useState } from 'react';
import { updateUserProfile } from '@/app/actions/user';
import { Save, Instagram, Twitter, Globe, Link2 } from 'lucide-react';

interface SocialLinks {
    instagram?: string;
    twitter?: string;
    website?: string;
}

interface ProfileSettingsFormProps {
    initialDisplayName: string;
    initialBio: string | null;
    initialSocialLinks: SocialLinks | null;
}

export default function ProfileSettingsForm({ initialDisplayName, initialBio, initialSocialLinks }: ProfileSettingsFormProps) {
    const [displayName, setDisplayName] = useState(initialDisplayName);
    const [bio, setBio] = useState(initialBio || '');
    const [socials, setSocials] = useState<SocialLinks>(initialSocialLinks || {});

    const [isPending, setIsPending] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        setIsPending(true);
        setMessage(null);

        const formData = new FormData();
        formData.append('displayName', displayName);
        formData.append('bio', bio);
        formData.append('socialLinks', JSON.stringify(socials));

        const res = await updateUserProfile(formData);

        if (res.error) {
            setMessage({ type: 'error', text: res.error });
        } else {
            setMessage({ type: 'success', text: 'Profil berhasil diperbarui!' });
            setTimeout(() => setMessage(null), 3000);
        }
        setIsPending(false);
    }

    const updateSocial = (key: keyof SocialLinks, value: string) => {
        setSocials(prev => ({ ...prev, [key]: value }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            <div className="space-y-8 bg-white wobbly-border paper-shadow p-8 -rotate-1">
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
                        placeholder="e.g. Sang Pengelana"
                        required
                        disabled={isPending}
                    />
                </div>

                {/* Bio */}
                <div>
                    <label className="font-marker text-[10px] text-ink/30 uppercase tracking-[0.2em] mb-3 block ml-2">
                        Hikayat Diri (Bio)
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={4}
                        className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-white focus:outline-none px-5 py-4 font-journal-body text-lg text-ink-deep italic transition-all resize-none placeholder:text-ink/10 leading-relaxed"
                        placeholder="Ceritakan sedikit tentang petualanganmu..."
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
                                placeholder="https://instagram.com/username"
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
                                placeholder="https://x.com/username"
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
                                placeholder="https://yourwebsite.com"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-6 wobbly-border-sm font-journal-title text-xl italic animate-in fade-in slide-in-from-top-4 ${message.type === 'success'
                    ? 'bg-pine/5 text-pine border-pine/10'
                    : 'bg-dried-red/5 text-dried-red border-dried-red/10'
                    }`}>
                    {message.text}
                </div>
            )}

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
