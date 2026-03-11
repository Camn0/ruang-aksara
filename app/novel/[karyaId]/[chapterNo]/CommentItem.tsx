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
        <div className={`relative ${visualDepth > 0 ? 'ml-6 sm:ml-10 mt-8' : 'mb-12'}`}>
            {/* Thread Navigation & Rail Logic: Hand-Drawn Strokes */}
            {visualDepth > 0 && (
                <div className="absolute -left-6 sm:-left-10 top-0 bottom-0 w-6 sm:w-10 pointer-events-none">
                    {/* Vertical line: Sketched stroke */}
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 h-8 w-1 bg-ink/10 wobbly-border-sm" />

                    {/* Horizontal Branch Line: Hand-drawn curve feel */}
                    <div className="absolute left-1/2 -translate-x-[2px] top-8 h-1 w-6 bg-ink/10 wobbly-border-sm rotate-[-5deg]" />

                    {/* Vertical continuation */}
                    {!isLast && (
                        <div className="absolute left-1/2 -translate-x-1/2 top-8 bottom-0 w-[1.5px] border-l-2 border-dotted border-ink/10" />
                    )}
                </div>
            )}

            <div className="flex gap-4 sm:gap-6 items-start relative z-10 selection:bg-pine/20">
                {/* Voting Tray: Sketch Style */}
                <div className="flex flex-col items-center gap-1 min-w-[32px] pt-2 sticky top-24">
                    <button
                        onClick={() => handleVote(1)}
                        className={`p-1 wobbly-border-sm border-2 transition-all active:scale-150 ${comment.userVote === 1 ? 'text-gold bg-ink-deep border-gold shadow-lg rotate-[-12deg]' : 'text-ink/20 border-transparent hover:text-gold hover:rotate-12'}`}
                    >
                        <ChevronUp className={`w-6 h-6 ${comment.userVote === 1 ? 'stroke-[3]' : ''}`} />
                    </button>
                    <span className={`font-journal-title text-lg ${comment.userVote === 1 ? 'text-gold' : comment.userVote === -1 ? 'text-pine' : 'text-ink/30'}`}>
                        {comment.score}
                    </span>
                    <button
                        onClick={() => handleVote(-1)}
                        className={`p-1 wobbly-border-sm border-2 transition-all active:scale-150 ${comment.userVote === -1 ? 'text-pine bg-ink-deep border-pine shadow-lg rotate-[12deg]' : 'text-ink/20 border-transparent hover:text-pine hover:rotate-[-12deg]'}`}
                    >
                        <ChevronDown className={`w-6 h-6 ${comment.userVote === -1 ? 'stroke-[3]' : ''}`} />
                    </button>
                </div>

                <div className="flex-1 min-w-0 flex gap-4 items-start bg-white dark:bg-parchment p-5 wobbly-border paper-shadow hover:rotate-[0.5deg] transition-all">
                    {/* Avatar: Wobbly Frame */}
                    <Link href={`/profile/${comment.user.username}`} className="shrink-0 relative z-10 pt-1 group">
                        <div className={`wobbly-border overflow-hidden bg-white dark:bg-parchment-dark p-1 group-hover:rotate-12 transition-all ${depth === 0 ? 'w-12 h-12' : 'w-10 h-10'}`}>
                            {comment.user.avatar_url ? (
                                <img src={comment.user.avatar_url} alt={comment.user.display_name} className="w-full h-full object-cover wobbly-border-sm" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center font-journal-title text-xl text-ink/20 bg-ink/5">
                                    {comment.user.display_name.charAt(0)}
                                </div>
                            )}
                        </div>
                    </Link>

                    <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex items-center gap-3 mb-2 flex-wrap pt-1">
                            <Link href={`/profile/${comment.user.username}`} className="font-journal-title text-lg text-ink-deep hover:text-pine transition-colors">
                                {comment.user.display_name}
                            </Link>
                            {isAuthor && (
                                <span className="text-[8px] font-special bg-pine text-parchment px-2 py-0.5 wobbly-border-sm rotate-[-4deg]">PENULIS</span>
                            )}
                            <span className="font-marker text-[10px] text-ink/30 uppercase tracking-widest">
                                {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                            </span>
                            {comment.is_pinned && (
                                <div className="flex items-center gap-1.5 bg-gold/20 text-ink-deep text-[9px] font-special px-2 py-0.5 wobbly-border-sm rotate-2">
                                    <Pin className="w-3 h-3 text-gold fill-gold" />
                                    DISEMATKAN
                                </div>
                            )}

                            {hasReplies && (
                                <button
                                    onClick={() => setIsCollapsed(!isCollapsed)}
                                    className={`ml-auto flex items-center gap-2 px-3 py-1.5 wobbly-border-sm text-[10px] font-marker uppercase tracking-widest transition-all ${isCollapsed
                                        ? 'bg-gold text-ink-deep shadow-md'
                                        : 'text-ink/40 hover:text-pine hover:bg-ink/5'
                                        }`}
                                >
                                    {isCollapsed ? (
                                        <><ChevronDown className="w-4 h-4" /> {comment.replies!.length} PESAN</>
                                    ) : (
                                        <><ChevronUp className="w-4 h-4" /> SEMBUNYIKAN</>
                                    )}
                                </button>
                            )}
                        </div>

                        {/* Content */}
                        <p className="font-journal-body text-[15px] text-ink-deep leading-relaxed whitespace-pre-wrap mb-4 pr-2 italic">
                            "{comment.content}"
                        </p>

                        {/* Actions */}
                        <div className="flex items-center gap-6 border-t border-ink/5 pt-4">
                            <button
                                onClick={() => setIsReplying(!isReplying)}
                                className={`flex items-center gap-2 font-special text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${isReplying ? 'text-pine' : 'text-ink/40 hover:text-pine'}`}
                            >
                                <MessageCircle className="w-4 h-4" />
                                BALAS
                            </button>

                            {canPin && (
                                <button
                                    onClick={() => handleTogglePin(comment.id)}
                                    disabled={isPinning === comment.id}
                                    className={`flex items-center gap-2 font-special text-[10px] uppercase tracking-[0.2em] transition-all active:scale-95 ${comment.is_pinned
                                        ? 'text-gold'
                                        : 'text-ink/40 hover:text-gold'
                                        }`}
                                >
                                    {comment.is_pinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                                    {comment.is_pinned ? 'lepas' : 'semat'}
                                </button>
                            )}

                            {canDelete && (
                                <div className="ml-auto flex items-center group">
                                    <DeleteCommentButton commentId={comment.id} isSmall />
                                </div>
                            )}
                        </div>

                        {/* Replies */}
                        {!isCollapsed && (
                            <div className="mt-8">
                                {/* Reply Form */}
                                {isReplying && (
                                    <div className="mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
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
                                    <div className="space-y-4">
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
