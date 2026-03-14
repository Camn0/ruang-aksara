'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { ExternalLink, MessageSquare, SortAsc, SortDesc, Zap, Clock, AlertCircle } from 'lucide-react';
import DeleteCommentButton from './DeleteCommentButton';

type SortOption = 'newest' | 'popular' | 'unpopular' | 'controversial';

export default function CommentModerationClient({ initialComments }: { initialComments: any[] }) {
    const [sortBy, setSortBy] = useState<SortOption>('newest');

    const sortedComments = useMemo(() => {
        return [...initialComments].sort((a, b) => {
            switch (sortBy) {
                case 'newest':
                    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
                case 'popular':
                    return b.score - a.score;
                case 'unpopular':
                    return a.score - b.score;
                case 'controversial':
                    // Total votes engagement
                    return (b._count?.votes || 0) - (a._count?.votes || 0);
                default:
                    return 0;
            }
        });
    }, [initialComments, sortBy]);

    const sortButtons = [
        { id: 'newest', label: 'Terbaru', icon: Clock },
        { id: 'popular', label: 'Terpopuler', icon: Zap },
        { id: 'unpopular', label: 'Butuh Perhatian', icon: AlertCircle },
        { id: 'controversial', label: 'Kontroversial', icon: MessageSquare },
    ];

    return (
        <div className="space-y-6">
            {/* Sorting Controls */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
                <span className="text-[10px] font-black text-text-main/30 dark:text-bg-cream/30 uppercase tracking-[0.2em] whitespace-nowrap mr-2">Urut Berdasarkan:</span>
                {sortButtons.map((btn) => (
                    <button
                        key={btn.id}
                        onClick={() => setSortBy(btn.id as SortOption)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                            sortBy === btn.id
                                ? 'bg-text-main dark:bg-brown-mid text-bg-cream border-text-main dark:border-brown-mid shadow-lg'
                                : 'bg-transparent text-text-main/40 dark:text-bg-cream/40 border-tan-primary/20 hover:border-tan-primary/40'
                        }`}
                    >
                        <btn.icon className="w-3 h-3" />
                        {btn.label}
                    </button>
                ))}
            </div>

            {/* Empty State */}
            {sortedComments.length === 0 ? (
                <div className="py-20 text-center bg-bg-cream/50 dark:bg-brown-dark/50 rounded-[3rem] border-2 border-dashed border-text-main/10">
                    <p className="text-text-main/30 dark:text-bg-cream/30 font-black uppercase tracking-[0.2em]">Belum Ada Komentar</p>
                </div>
            ) : (
                <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedComments.map((comment) => (
                        <div key={comment.id} className="bg-bg-cream/80 dark:bg-brown-dark p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-text-main/10 dark:border-brown-mid hover:border-tan-primary/30 dark:hover:border-tan-primary/50 transition-all shadow-sm group flex flex-col backdrop-blur-sm">
                            {/* Header Kartu: Profile Pengirim & Waktu & Delete Button */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-text-main/10 dark:bg-brown-mid flex items-center justify-center text-xs font-black text-text-main dark:text-bg-cream uppercase">
                                        {comment.user.display_name[0].toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <p className="text-[11px] font-black text-text-main dark:text-text-accent uppercase truncate">{comment.user.display_name}</p>
                                            {comment.parent && (
                                                <span className="text-[8px] font-bold text-tan-primary bg-tan-primary/5 px-1.5 py-0.5 rounded-md uppercase tracking-tighter">
                                                    Membalas @{comment.parent.user.display_name}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[8px] text-text-main/40 dark:text-bg-cream/40 font-bold uppercase tracking-widest leading-tight">
                                                {new Date(comment.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-text-main/10 dark:bg-white/10" />
                                            <p className="text-[8px] text-tan-primary font-black uppercase tracking-widest">
                                                {comment.score} Poin
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                <DeleteCommentButton commentId={comment.id} />
                            </div>

                            {/* Isi Komentar: Dibalut kontainer bergaya Gelembung (Bubble) & Link Interaktif */}
                            <Link 
                                href={`/novel/${comment.bab.karya_id}/${comment.bab.chapter_no}#comment-${comment.id}`}
                                className="bg-text-main/5 dark:bg-brown-mid/50 p-3 sm:p-4 rounded-xl sm:rounded-2xl border border-transparent hover:border-tan-primary/20 hover:bg-text-main/[0.08] transition-all mb-3 flex-1 block group/link"
                            >
                                <p className="text-[12px] text-text-main/70 dark:text-tan-light leading-relaxed italic mb-3">"{comment.content}"</p>
                                
                                <div className="flex items-center gap-1.5 text-[9px] font-black text-tan-primary uppercase tracking-widest opacity-0 group-hover/link:opacity-100 transition-opacity">
                                    <span>Buka Diskusi</span>
                                    <ExternalLink className="w-3 h-3" />
                                </div>
                            </Link>

                            {/* Metadata Footer: Menujukkan komentar masuk di bab mana */}
                            <div className="flex items-center gap-2 mt-auto pt-2 border-t border-text-main/5 dark:border-brown-mid/50">
                                <span className="text-[8px] font-black text-text-main/30 dark:text-bg-cream/30 uppercase tracking-widest">Pada:</span>
                                <div className="flex items-center gap-1 min-w-0">
                                    <span className="text-[9px] font-black text-tan-primary uppercase tracking-tight italic shrink-0">Bab {comment.bab.chapter_no} -</span>
                                    <span className="text-[9px] font-black text-tan-primary truncate uppercase tracking-tight italic">{comment.bab.karya.title}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
