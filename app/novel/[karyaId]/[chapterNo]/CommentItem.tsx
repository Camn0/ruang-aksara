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
    isLast?: boolean;
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
    isInitiallyCollapsed = false,
    path,
    isLast = false
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

    // Cap visual depth at 2 for "Double Tree" look
    const visualDepth = Math.min(depth, 2);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
        <div id={`comment-${comment.id}`} className={`relative ${visualDepth > 0 ? 'ml-4 sm:ml-6 mt-4' : 'mb-8'}`}>
            {/* Thread Navigation & Rail Logic */}
            {visualDepth > 0 && (
                <div className="absolute -left-4 sm:-left-6 top-0 bottom-0 w-4 sm:w-6 pointer-events-none">
                    {/* Vertical line: Top to Branch Point */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 h-6 w-[2px] bg-gray-100 dark:bg-slate-800" />

                    {/* Horizontal Branch Line (L-shape) */}
                    <div className="absolute left-1/2 -translate-x-[1px] top-6 h-[2px] w-[calc(50%+2px)] bg-gray-100 dark:bg-slate-800 rounded-bl-xl origin-left" />

                    {/* Vertical line continuation: Branch Point to Bottom (Only if NOT last) */}
                    {!isLast && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-6 bottom-0 w-[2px] bg-gray-100 dark:bg-slate-800" />
                    )}
                </div>
            )}

            {/* Clickable Vertical Thread Line (Overlay for collapse toggle) */}
            {visualDepth > 0 && (
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -left-4 sm:-left-6 top-6 bottom-0 w-4 sm:w-6 group z-20 focus:outline-none cursor-pointer"
                    title={isCollapsed ? "Buka percakapan" : "Sembunyikan percakapan"}
                >
                    <div className={`h-full w-[2.5px] mx-auto transition-all rounded-full ${isCollapsed
                        ? 'bg-indigo-500 shadow-sm shadow-indigo-200'
                        : 'bg-transparent group-hover:bg-indigo-300/30'
                        }`} />
                </button>
            )}

            {/* Bridge line from parent to its first child */}
            {hasReplies && !isCollapsed && (
                <div className="absolute left-4 sm:left-5 top-28 bottom-0 w-[2px] bg-gray-100 dark:bg-slate-800 pointer-events-none" />
            )}

            <div className="flex gap-2.5 sm:gap-4 items-start relative bg-white dark:bg-slate-900 z-10">
                {/* Voting Tray - Reddit Style Sidebar */}
                <div className="flex flex-col items-center gap-0.5 min-w-[28px] pt-1.5 sticky top-24">
                    <button
                        onClick={() => handleVote(1)}
                        className={`p-0.5 rounded-md transition-all active:scale-125 ${comment.userVote === 1 ? 'text-orange-500 bg-orange-50 dark:bg-orange-950/30 ring-1 ring-orange-200 shadow-sm' : 'text-gray-400 hover:text-orange-500 hover:bg-orange-50'}`}
                    >
                        <ChevronUp className={`w-5 h-5 ${comment.userVote === 1 ? 'fill-current stroke-[3]' : ''}`} />
                    </button>
                    <span className={`text-[10px] font-black ${comment.userVote === 1 ? 'text-orange-600' : comment.userVote === -1 ? 'text-indigo-600' : 'text-gray-500 dark:text-gray-400'}`}>
                        {comment.score}
                    </span>
                    <button
                        onClick={() => handleVote(-1)}
                        className={`p-0.5 rounded-md transition-all active:scale-125 ${comment.userVote === -1 ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 ring-1 ring-indigo-200 shadow-sm' : 'text-gray-400 hover:text-indigo-500 hover:bg-indigo-50'}`}
                    >
                        <ChevronDown className={`w-5 h-5 ${comment.userVote === -1 ? 'fill-current stroke-[3]' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 min-w-0 flex gap-3 items-start">
                    {/* Avatar */}
                    <Link href={`/profile/${comment.user.username}`} className="shrink-0 relative z-10 pt-1">
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
                        <div className="flex items-center gap-2 mb-1 flex-wrap pt-1">
                            <Link href={`/profile/${comment.user.username}`} className="text-xs font-black text-gray-900 dark:text-gray-100 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors uppercase tracking-tight">
                                {comment.user.display_name}
                            </Link>
                            {isAuthor && (
                                <span className="text-[7px] font-black bg-indigo-600 text-white px-1.5 py-0.5 rounded-sm uppercase tracking-tighter shadow-sm">Penulis</span>
                            )}
                            <span className="text-[10px] text-gray-400 dark:text-gray-500 font-bold truncate">
                                {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                            {comment.is_pinned && (
                                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-[8px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-tighter border border-amber-100 dark:border-amber-800">
                                    <Pin className="w-2 h-2" />
                                    Semat
                                </div>
                            )}

                            {hasReplies && (
                                <button
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className={`ml-auto flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all ${isCollapsed
                                        ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400'
                                        : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-800'
                                        }`}
                                >
                                    {isCollapsed ? (
                                        <><ChevronDown className="w-3.5 h-3.5" /> {comment.replies!.length} Balasan</>
                                    ) : (
                                        <><ChevronUp className="w-3.5 h-3.5" /> Sembunyikan</>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Content - ALWAYS VISIBLE */}
                        <p className="text-[13px] text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap mb-3 pr-2">
                            {comment.content}
                        </p>

                        {/* Actions - ALWAYS VISIBLE */}
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className={`flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${isReplying ? 'text-indigo-600' : 'text-gray-400 hover:text-indigo-600'}`}
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

                        {/* Replies - COLLAPSIBLE AREA */}
                        {!isCollapsed && (
                            <div className="mt-4">
                                {/* Reply Form */}
                                {isReplying && (
                                    <div className="mb-4 animate-in slide-in-from-top-2 fade-in duration-200">
                                        <CommentForm
                                            babId={babId}
                                            parentId={comment.id}
                                            onSuccess={() => {
                                                setIsReplying(false);
                                                setIsCollapsed(false);
                                            }}
                                            autoFocus
                                            isReply
                                            replyToUsername={comment.user.username}
                                        />
                                    </div>
                                )}

                                {/* Nested Replies */}
                                {hasReplies && (
                                    <div className="space-y-0">
                                        {comment.replies!.map((reply, index) => (
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
                                                isInitiallyCollapsed={false}
                                                path={path}
                                                isLast={index === comment.replies!.length - 1}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
