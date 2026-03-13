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
        <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-8">
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
                    <label className="text-[10px] text-tan-primary uppercase font-black tracking-[0.2em] mb-3 flex items-center gap-2">
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

            {message && (
                <div className={`p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest animate-in fade-in slide-in-from-top-1 border transition-all ${message.type === 'success'
                    ? 'bg-green-500/5 text-green-600 border-green-500/10'
                    : 'bg-red-500/5 text-red-600 border-red-500/10'
                    }`}>
                    <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${message.type === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                        {message.text}
                    </div>
                </div>
            )}

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
