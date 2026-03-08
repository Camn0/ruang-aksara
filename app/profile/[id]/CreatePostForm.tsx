'use client';

import { useState } from 'react';
import { createAuthorPost } from '@/app/actions/post';
import { UserCircle2 } from 'lucide-react';

export default function CreatePostForm({ userProfile }: { userProfile: any }) {
    const [isPending, setIsPending] = useState(false);
    const [isFocused, setIsFocused] = useState(false);
    const [content, setContent] = useState('');

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);

        const formData = new FormData(event.currentTarget);
        try {
            const res = await createAuthorPost(formData);
            if (res.error) alert(res.error);
            else {
                setContent('');
                setIsFocused(false);
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
                />
            </div>

            {(isFocused || content) && (
                <div className="flex justify-end gap-2 border-t border-gray-100 dark:border-slate-800 pt-3">
                    <button type="button" onClick={() => { setIsFocused(false); setContent(''); }} className="text-gray-500 hover:text-gray-700 text-xs font-bold px-4 py-1.5 transition">Batal</button>
                    <button type="submit" disabled={isPending || !content.trim()} className="bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-indigo-700 transition disabled:opacity-50">
                        {isPending ? 'Mengeposkan...' : 'Buat Postingan'}
                    </button>
                </div>
            )}
        </form>
    );
}
