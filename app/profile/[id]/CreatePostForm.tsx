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
        <form onSubmit={handleSubmit} className="bg-parchment wobbly-border paper-shadow p-6 mb-8 transition-all duration-300 -rotate-1">
            <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 wobbly-border-sm bg-parchment-light shrink-0 border-2 border-white shadow-md rotate-3 overflow-hidden">
                    {userProfile.avatar_url ? (
                        <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <UserCircle2 className="w-full h-full text-ink/10" />
                    )}
                </div>
                <textarea
                    name="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    placeholder="Tuliskan catatan atau sapaan untuk pembacamu..."
                    className="w-full bg-transparent font-journal-body text-lg text-ink-deep border-none outline-none focus:ring-0 min-h-12 resize-none placeholder:text-ink/20 italic"
                    rows={isFocused || content ? 4 : 1}
                    required
                    disabled={isPending}
                />
            </div>

            {/* Image URL Preview */}
            {imageUrl && (
                <div className="mb-4 relative rotate-1">
                    <div className="absolute inset-0 bg-ink-deep/5 translate-x-1 translate-y-1 wobbly-border-sm -z-10" />
                    <img src={imageUrl} alt="Preview" className="w-full max-h-72 object-cover wobbly-border-sm border-2 border-white shadow-xl" onError={(e) => (e.currentTarget.style.display = 'none')} />
                    <button type="button" onClick={() => { setImageUrl(''); setShowImageInput(false); }} className="absolute -top-3 -right-3 bg-dried-red text-parchment p-1.5 wobbly-border-sm hover:rotate-12 transition shadow-lg">
                        <X className="w-5 h-5" />
                    </button>
                    {/* Tape effect */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-6 bg-gold/40 wobbly-border-sm -rotate-6 z-10 mix-blend-multiply opacity-60" />
                </div>
            )}

            {/* Image URL Input */}
            {showImageInput && !imageUrl && (
                <div className="mb-4">
                    <input
                        type="url"
                        name="image_url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Sisipkan URL gambar di sini..."
                        className="w-full font-marker text-xs bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 p-3 outline-none text-ink-deep"
                    />
                </div>
            )}
            {imageUrl && <input type="hidden" name="image_url" value={imageUrl} />}

            {(isFocused || content) && (
                <div className="flex items-center justify-between pt-4 wobbly-border-t border-ink/5">
                    <button
                        type="button"
                        onClick={() => setShowImageInput(!showImageInput)}
                        className={`flex items-center gap-2 font-marker text-[10px] uppercase tracking-widest transition-colors ${showImageInput || imageUrl ? 'text-pine' : 'text-ink/30 hover:text-ink-deep'}`}
                    >
                        <ImagePlus className="w-5 h-5" /> Lampiran Gambar
                    </button>
                    <div className="flex gap-4">
                        <button type="button" onClick={() => { setIsFocused(false); setContent(''); setImageUrl(''); setShowImageInput(false); }} className="font-journal-title text-ink/40 hover:text-dried-red text-lg italic px-4 py-2 transition">Batal</button>
                        <button type="submit" disabled={isPending || !content.trim()} className="bg-pine text-parchment font-journal-title text-xl px-8 py-2 wobbly-border-sm hover:rotate-1 transition disabled:opacity-50 shadow-lg italic">
                            {isPending ? 'Mengirim...' : 'Torehkan ✨'}
                        </button>
                    </div>
                </div>
            )}
        </form>
    );
}
