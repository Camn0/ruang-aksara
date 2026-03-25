/**
 * @file PostLikeButton.tsx
 * @description Client or Server Document rendering scoped UI boundaries specific to the Platform Infrastructure architecture.
 * @author Ruang Aksara Engineering Team
 */

'use client';

import { useState } from 'react';
import { togglePostLike } from '@/app/actions/post';
import { Heart } from 'lucide-react';
import { toast } from 'sonner';

/**
 * PostLikeButton: Encapsulates the explicit React DOM lifecycle and state-management for the post like button interactive workflow.
 */
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
                setIsLiked(!newLiked);
                setLikes(prev => !newLiked ? prev + 1 : prev - 1);
                toast.error(res.error);
            }
        } catch (error) {
            setIsLiked(!newLiked);
            setLikes(prev => !newLiked ? prev + 1 : prev - 1);
            toast.error("Terjadi kesalahan.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <button onClick={handleLike} className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${isLiked ? 'text-tan-primary' : 'text-text-main/30 dark:text-gray-500 hover:text-tan-primary'}`}>
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} /> {likes}
        </button>
    );
}
