'use client';

import { useState, useRef } from 'react';
import { createAuthorPost } from '@/app/actions/post';
import { UserCircle2, ImagePlus, X } from 'lucide-react';

export default function CreatePostForm({ userProfile }: { userProfile: any }) {
    const [isPending, setIsPending] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [content, setContent] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [showImageInput, setShowImageInput] = useState(false);

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        if (isPending) return;
        setIsPending(true);

        const formData = new FormData(event.currentTarget);
        try {
            const res = await createAuthorPost(formData);
            if (res.error) alert(res.error);
            else {
                setContent('');
                setImageUrl('');
                setIsFocused(false);
                setShowImageInput(false);
            }
        } catch (error) {
            alert("Terjadi kesalahan.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl p-4 shadow-sm mb-4 transition-all duration-300">
            <div className="flex items-start gap-3 mb-3">
                <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-slate-800">
                    {userProfile.avatar_url ? (
                        <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <UserCircle2 className="w-full h-full text-gray-400" />
                    )}
                </div>
                <textarea
                    name="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="Bagikan pembaruan ke penggemarmu..."
                    className="w-full bg-transparent text-sm text-gray-900 dark:text-gray-100 border-none outline-none focus:ring-0 min-h-10 resize-none"
                    rows={isFocused || content ? 3 : 1}
                    required
                    disabled={isPending}
                />
            </div>

            {/* Image URL Preview */}
            {imageUrl && (
                <div className="mb-3 relative">
                    <img src={imageUrl} alt="Preview" className="w-full max-h-64 object-cover rounded-xl border border-gray-100 dark:border-slate-800" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <button type="button" onClick={() => { setImageUrl(''); setShowImageInput(false); }} className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Image URL Input */}
            {showImageInput && !imageUrl && (
                <div className="mb-3">
                    <input
                        type="url"
                        name="image_url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Tempel URL gambar di sini..."
                        className="w-full text-xs border border-gray-200 dark:border-slate-700 dark:bg-slate-800 dark:text-gray-100 p-2.5 rounded-lg outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                </div>
            )}
            {imageUrl && <input type="hidden" name="image_url" value={imageUrl} />}

            {(isFocused || content) && (
                <div className="flex items-center justify-between border-t border-gray-100 dark:border-slate-800 pt-3">
                    <button
                        type="button"
                        onClick={() => setShowImageInput(!showImageInput)}
                        className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${showImageInput || imageUrl ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400'}`}
                    >
                        <ImagePlus className="w-4 h-4" /> Tambah Gambar
                    </button>
                    <div className="flex gap-2">
                        <button type="button" onClick={() => { setIsFocused(false); setContent(''); setImageUrl(''); setShowImageInput(false); }} className="text-gray-500 hover:text-gray-700 text-xs font-bold px-4 py-1.5 transition">Batal</button>
                        <button type="submit" disabled={isPending || !content.trim()} className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-indigo-700 transition disabled:opacity-50">
                            {isPending ? 'Mengeposkan...' : 'Buat Postingan'}
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}
