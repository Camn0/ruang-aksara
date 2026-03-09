'use client';

import { useState } from 'react';
import Link from 'next/link';
import { UserCircle2, CornerDownRight, Trash2, Pin, PinOff, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import DeleteCommentButton from './DeleteCommentButton';
import CommentForm from './CommentForm';

interface User {
    id: string;
    username: string;
    display_name: string;
    avatar_url: string | null;
}

interface Comment {
    id: string;
    content: string;
    created_at: string | Date;
    user: User;
    score: number;
    userVote?: number; // 1, -1, or 0/undefined
    is_pinned?: boolean | null;
    replies?: Comment[];
}

interface CommentItemProps {
    comment: Comment;
    babId: string;
    currentUserId?: string;
    currentUserRole?: string;
    authorId?: string;
    depth?: number;
    handleTogglePin: (id: string) => Promise<void>;
    isPinning: string | null;
    isInitiallyCollapsed?: boolean;
    path: string;
}

export default function CommentItem({
    comment,
    babId,
    currentUserId,
    currentUserRole,
    authorId,
    depth = 0,
    handleTogglePin,
    isPinning,
    isInitiallyCollapsed = true,
    path
}: CommentItemProps) {
    const [isCollapsed, setIsCollapsed] = useState(isInitiallyCollapsed);
    const [isReplying, setIsReplying] = useState(false);
    const [isVoting, setIsVoting] = useState(false);

    const isAuthor = comment.user.id === authorId;
    const canPin = (currentUserId === authorId || currentUserRole === 'admin') && depth === 0;
    const canDelete = currentUserId === comment.user.id || currentUserRole === 'admin';

    const handleVote = async (type: 1 | -1) => {
        if (!currentUserId || isVoting) return;
        setIsVoting(true);
        const { voteComment } = await import('@/app/actions/vote');
        await voteComment(comment.id, type, path);
        setIsVoting(false);
    };

    return (
        <div className={`group ${depth > 0 ? 'ml-4 sm:ml-8 mt-4 pl-4 border-l-2 border-gray-100 dark:border-slate-800' : 'mb-8'}`}>
            <div className="flex gap-3 items-start relative">
                {/* Voting Tray - Reddit Style Sidebar */}
                <div className="flex flex-col items-center gap-1 min-w-[32px] pt-1">
                    <button
                        onClick={() => handleVote(1)}
                        className={`p-1 rounded-md transition-all active:scale-125 ${comment.userVote === 1 ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/30' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-950/20'}`}
                    >
                        <ChevronUp className="w-5 h-5" />
                    </button>
                    <span className={`text-[10px] font-black ${comment.userVote === 1 ? 'text-orange-500' : comment.userVote === -1 ? 'text-indigo-500' : 'text-gray-600 dark:text-gray-400'}`}>
                        {comment.score}
                    </span>
                    <button
                        onClick={() => handleVote(-1)}
                        className={`p-1 rounded-md transition-all active:scale-125 ${comment.userVote === -1 ? 'text-indigo-500 bg-indigo-50 dark:bg-indigo-950/30' : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20'}`}
                    >
                        <ChevronDown className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex gap-3 items-start">
                        {/* Avatar */}
                        <Link href={`/profile/${comment.user.username}`} className="shrink-0 relative z-10">
                            <div className={`rounded-xl overflow-hidden bg-white dark:bg-slate-800 border-2 border-gray-50 dark:border-slate-800 group-hover:border-indigo-500 transition-all shadow-sm ${depth === 0 ? 'w-10 h-10' : 'w-8 h-8'}`}>
                                {comment.user.avatar_url ? (
                                    <img src={comment.user.avatar_url} alt={comment.user.display_name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserCircle2 className="w-full h-full text-gray-300" />
                                )}
                            </div>
                        </Link>

                        <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                                <Link href={`/profile/${comment.user.username}`} className="text-xs font-black text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                                    {comment.user.display_name}
                                </Link>
                                {isAuthor && (
                                    <span className="text-[8px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter shadow-sm shadow-indigo-200 dark:shadow-none">Penulis</span>
                                )}
                                <span className="text-[10px] text-gray-400 dark:text-gray-500 font-medium">
                                    {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                </span>
                                {comment.is_pinned && (
                                    <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter border border-amber-100 dark:border-amber-800">
                                        <Pin className="w-2 h-2" />
                                        Semat
                                    </div>
                                )}

                                <button
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className="ml-auto p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                                >
                                    {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                                </button>
                            </div>

                            {!isCollapsed && (
                                <>
                                    {/* Content */}
                                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap mb-3 pr-2">
                                        {comment.content}
                                    </p>

                                    {/* Actions */}
                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setIsReplying(!isReplying)}
                                            className="flex items-center gap-1.5 text-[10px] font-black text-gray-400 hover:text-indigo-600 transition-all uppercase tracking-widest active:scale-95"
                                        >
                                            <MessageCircle className="w-3.5 h-3.5" />
                                            Balas
                                        </button>

                                        {canPin && (
                                            <button
                                                onClick={() => handleTogglePin(comment.id)}
                                                disabled={isPinning === comment.id}
                                                className={`flex items-center gap-1.5 text-[10px] font-black transition-all uppercase tracking-widest active:scale-95 ${comment.is_pinned
                                                    ? 'text-indigo-600'
                                                    : 'text-gray-400 hover:text-gray-600'
                                                    }`}
                                            >
                                                {comment.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                                                {comment.is_pinned ? 'Lepas' : 'Semat'}
                                            </button>
                                        )}

                                        {canDelete && (
                                            <DeleteCommentButton commentId={comment.id} isSmall />
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {!isCollapsed && (
                        <>
                            {/* Reply Form */}
                            {isReplying && (
                                <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                    <CommentForm
                                        babId={babId}
                                        parentId={comment.id}
                                        onSuccess={() => {
                                            setIsReplying(false);
                                            setIsCollapsed(false);
                                        }}
                                        autoFocus
                                    />
                                </div>
                            )}

                            {/* Nested Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-2">
                                    {comment.replies.map((reply) => (
                                        <CommentItem
                                            key={reply.id}
                                            comment={reply}
                                            babId={babId}
                                            currentUserId={currentUserId}
                                            currentUserRole={currentUserRole}
                                            authorId={authorId}
                                            depth={depth + 1}
                                            handleTogglePin={handleTogglePin}
                                            isPinning={isPinning}
                                            isInitiallyCollapsed={true}
                                            path={path}
                                        />
                                    ))}
                                </div>
                            )}
                        </>
                    )}

                    {isCollapsed && comment.replies && comment.replies.length > 0 && (
                        <button
                            onClick={() => setIsCollapsed(false)}
                            className="text-[10px] font-bold text-indigo-500 hover:underline mt-1"
                        >
                            Lihat {comment.replies.length} balasan lainnya...
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
