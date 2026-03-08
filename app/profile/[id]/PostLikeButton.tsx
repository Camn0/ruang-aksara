'use client';

import { useState } from 'react';
import { togglePostLike } from '@/app/actions/post';
import { Heart } from 'lucide-react';

export default function PostLikeButton({ postId, initialLikes, initialLikedByUser }: { postId: string, initialLikes: number, initialLikedByUser: boolean }) {
    const [likes, setLikes] = useState(initialLikes);
    const [isLiked, setIsLiked] = useState(initialLikedByUser);
    const [isPending, setIsPending] = useState(false);

    async function handleLike() {
        if (isPending) return;
        setIsPending(true);

        const newLiked = !isLiked;
        setIsLiked(newLiked);
        setLikes(prev => newLiked ? prev + 1 : prev - 1);

        try {
            const res = await togglePostLike(postId);
            if (res.error) {
                // Revert on error
                setIsLiked(!newLiked);
                setLikes(prev => !newLiked ? prev + 1 : prev - 1);
                alert(res.error);
            }
        } catch (error) {
            // Revert on error
            setIsLiked(!newLiked);
            setLikes(prev => !newLiked ? prev + 1 : prev - 1);
            alert("Terjadi kesalahan.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <button onClick={handleLike} disabled={isPending} className={`flex items-center gap-1.5 text-xs font-semibold transition ${isLiked ? 'text-pink-600 dark:text-pink-500' : 'text-gray-500 dark:text-gray-400 hover:text-pink-600 dark:hover:text-pink-500'}`}>
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-current' : ''}`} /> {likes}
        </button>
    );
}
