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
        <form onSubmit={handleSubmit} className="bg-bg-cream/50 dark:bg-slate-900 border border-brown-dark/10 rounded-[2rem] p-5 shadow-sm mb-6 transition-all duration-500 group">
            <div className="flex items-start gap-4 mb-4">
                <div className="w-10 h-10 rounded-2xl overflow-hidden shrink-0 bg-tan-light/10 border border-brown-dark/10 shadow-sm relative">
                    {userProfile.avatar_url ? (
                        <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
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
                    placeholder="Bagikan pembaruan ke penggemarmu..."
                    className="w-full bg-transparent text-[15px] text-text-main/80 dark:text-gray-300 border-none outline-none focus:ring-0 min-h-12 resize-none font-medium italic leading-relaxed placeholder:text-brown-dark/20"
                    rows={isFocused || content ? 4 : 1}
                    required
                    disabled={isPending}
                />
            </div>

            {/* Image URL Preview */}
            {imageUrl && (
                <div className="mb-4 relative px-2">
                    <img src={imageUrl} alt="Preview" className="w-full max-h-72 object-cover rounded-2xl border border-brown-dark/10 shadow-md transition-transform duration-500" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <button type="button" onClick={() => { setImageUrl(''); setShowImageInput(false); }} className="absolute top-4 right-6 bg-brown-dark/80 text-text-accent p-1.5 rounded-full hover:bg-brown-dark shadow-lg transition-all active:scale-90">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            )}

            {/* Image URL Input */}
            {showImageInput && !imageUrl && (
                <div className="mb-4 px-2">
                    <input
                        type="url"
                        name="image_url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Tempel URL gambar di sini (Instagram/Pinterest/etc)..."
                        className="w-full text-[11px] font-black uppercase tracking-widest border border-brown-dark/10 bg-brown-dark/5 dark:bg-slate-800 text-text-main dark:text-gray-100 p-3.5 rounded-xl outline-none focus:ring-2 focus:ring-tan-primary/30 transition-all placeholder:opacity-30"
                    />
                </div>
            )}
            {imageUrl && <input type="hidden" name="image_url" value={imageUrl} />}

            {(isFocused || content) && (
                <div className="flex items-center justify-between border-t border-brown-dark/5 pt-4 px-2">
                    <button
                        type="button"
                        onClick={() => setShowImageInput(!showImageInput)}
                        className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 ${showImageInput || imageUrl ? 'text-brown-dark' : 'text-tan-primary hover:text-brown-dark'}`}
                    >
                        <ImagePlus className="w-4 h-4" /> Tambah Gambar
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
