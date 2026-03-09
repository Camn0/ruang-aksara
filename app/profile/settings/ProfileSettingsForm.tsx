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
        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-6">
                {/* Display Name */}
                <div>
                    <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-2 block ml-1">
                        Nama Tampilan
                    </label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                        placeholder="Nama yang muncul di profil..."
                        required
                        disabled={isPending}
                    />
                </div>

                {/* Bio */}
                <div>
                    <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-2 block ml-1">
                        Bio / Deskripsi Diri
                    </label>
                    <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        rows={3}
                        className="w-full bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all resize-none"
                        placeholder="Ceritakan sedikit tentang dirimu..."
                        disabled={isPending}
                    />
                </div>

                {/* Social Links Section */}
                <div className="pt-4 border-t border-gray-50 dark:border-slate-800">
                    <label className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest mb-4 block ml-1 flex items-center gap-2">
                        <Link2 className="w-3 h-3" /> Tautan Sosial
                    </label>

                    <div className="space-y-3">
                        {/* Instagram */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-pink-50 dark:bg-pink-900/20 flex items-center justify-center text-pink-600 shrink-0">
                                <Instagram className="w-5 h-5" />
                            </div>
                            <input
                                type="url"
                                value={socials.instagram || ''}
                                onChange={(e) => updateSocial('instagram', e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-pink-500 transition-all"
                                placeholder="https://instagram.com/username"
                                disabled={isPending}
                            />
                        </div>

                        {/* Twitter/X */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-900/10 dark:bg-slate-800 flex items-center justify-center text-gray-900 dark:text-gray-100 shrink-0">
                                <Twitter className="w-5 h-5" />
                            </div>
                            <input
                                type="url"
                                value={socials.twitter || ''}
                                onChange={(e) => updateSocial('twitter', e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900 transition-all"
                                placeholder="https://x.com/username"
                                disabled={isPending}
                            />
                        </div>

                        {/* Website */}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center text-indigo-600 shrink-0">
                                <Globe className="w-5 h-5" />
                            </div>
                            <input
                                type="url"
                                value={socials.website || ''}
                                onChange={(e) => updateSocial('website', e.target.value)}
                                className="flex-1 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                                placeholder="https://yourwebsite.com"
                                disabled={isPending}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {message && (
                <div className={`p-3 rounded-xl text-xs font-bold animate-in fade-in slide-in-from-top-1 ${message.type === 'success'
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-100 dark:border-green-900/30'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30'
                    }`}>
                    {message.text}
                </div>
            )}

            <button
                type="submit"
                disabled={isPending}
                className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-indigo-100 dark:shadow-none transition-all active:scale-[0.98]"
            >
                <Save className="w-5 h-5" />
                {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
        </form>
    );
}
