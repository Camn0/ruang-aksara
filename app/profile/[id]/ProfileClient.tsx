'use client';

import { useState, useTransition } from 'react';
import Link from 'next/link';
import {
    ArrowLeft, UserCircle2, Settings, TrendingUp, BookMarked,
    Star, MessageSquare, Heart, Instagram, Twitter, Globe,
    Sparkles, Calendar, BookOpen, MessageCircle
} from 'lucide-react';
import FollowButton from './FollowButton';
import ThemeToggle from '@/app/components/ThemeToggle';
import CreatePostForm from './CreatePostForm';
import PostLikeButton from './PostLikeButton';
import PostCommentSection from './PostCommentSection';

interface ProfileClientProps {
    userProfile: any;
    isOwnProfile: boolean;
    isFollowing: boolean;
    followers: any[];
    following: any[];
    works: any[];
    posts: any[];
    comments: any[];
    reviews: any[];
    stats: {
        bookmarks: number;
        reviews: number;
        comments: number;
    };
    session: any;
}

export default function ProfileClient({
    userProfile,
    isOwnProfile,
    isFollowing,
    followers,
    following,
    works,
    posts,
    comments,
    reviews,
    stats,
    session
}: ProfileClientProps) {
    const isAuthor = ['admin', 'author'].includes(userProfile.role);
    const [activeTab, setActiveTab] = useState(isAuthor ? 'karya' : 'aktivitas');
    const [isPending, startTransition] = useTransition();

    const handleTabChange = (tab: string) => {
        startTransition(() => {
            setActiveTab(tab);
        });
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'karya':
                return (
                    <div className="grid gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {works.length === 0 ? (
                            <div className="py-20 text-center bg-brown-dark/5 rounded-[3rem] border border-dashed border-brown-dark/10">
                                <BookOpen className="w-12 h-12 text-brown-dark/10 mx-auto mb-4" />
                                <p className="text-brown-dark/30 font-black uppercase tracking-widest text-[10px]">Belum ada karya</p>
                            </div>
                        ) : works.map(karya => (
                            <Link key={karya.id} href={`/novel/${karya.id}`} className="group flex flex-col sm:flex-row gap-8 p-1 transition-all duration-500">
                                {/* Cover Section */}
                                <div className="w-32 h-48 sm:w-40 sm:h-56 shrink-0 relative">
                                    <div className="absolute inset-0 bg-brown-dark/20 rounded-[1.5rem] blur-xl group-hover:blur-2xl transition-all opacity-50 -z-10 translate-y-2"></div>
                                    <div className="w-full h-full rounded-[1.5rem] overflow-hidden bg-tan-light/10 border border-brown-dark/10 shadow-lg relative z-10">
                                        {karya.cover_url ? (
                                            <img src={karya.cover_url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={karya.title} />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center p-4 text-center bg-tan-light/5">
                                                <span className="text-[10px] font-black text-brown-mid/30 uppercase tracking-tighter">{karya.title}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Content Section */}
                                <div className="flex-1 flex flex-col gap-3 py-2">
                                    <h3 className="text-2xl sm:text-3xl font-open-sans font-black text-brown-dark dark:text-gray-100 italic leading-tight group-hover:text-tan-primary transition-colors">
                                        {karya.title}
                                    </h3>

                                    {/* Stats Pills */}
                                    <div className="flex flex-wrap gap-2 mb-2">
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-brown-dark/5 rounded-full border border-brown-dark/5">
                                            <TrendingUp className="w-3 h-3 text-brown-dark/40" />
                                            <span className="text-[9px] font-black text-brown-dark/60 uppercase tracking-widest">{karya.total_views.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1 bg-brown-dark/5 px-2.5 py-1 rounded-full border border-brown-dark/5">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <Star key={s} className={`w-2.5 h-2.5 ${s <= Math.round(karya.avg_rating || 0) ? 'fill-yellow-500 text-yellow-500' : 'text-brown-dark/10'}`} />
                                            ))}
                                        </div>
                                        <div className="flex items-center gap-1.5 px-3 py-1 bg-brown-dark/5 rounded-full border border-brown-dark/5">
                                            <span className="text-[9px] font-black text-brown-dark/60 uppercase tracking-widest">
                                                {karya.count_chapters || karya._count?.bab || 0} Bab
                                            </span>
                                        </div>
                                    </div>

                                    {/* Description Box */}
                                    <div className="bg-brown-dark/[0.02] dark:bg-slate-900/50 border border-brown-dark/10 p-5 rounded-[1.8rem] relative">
                                        <span className="text-[9px] font-black uppercase text-brown-dark/30 tracking-widest block mb-1">Deskripsi:</span>
                                        <p className="text-sm text-text-main/70 dark:text-gray-400 line-clamp-3 leading-relaxed font-medium italic">
                                            {karya.deskripsi || "Penulis belum menambahkan sinopsis untuk karya indah ini."}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                );
            case 'postingan':
                return (
                    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {isOwnProfile && (
                            <div className="bg-brown-mid/10 dark:bg-brown-mid/5 p-1 rounded-[2.5rem] border border-brown-dark/5">
                                <CreatePostForm userProfile={userProfile} />
                            </div>
                        )}
                        {posts.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-brown-dark/10 shadow-inner">
                                <Sparkles className="w-12 h-12 text-brown-dark/10 mx-auto" strokeWidth={1.5} />
                                <div>
                                    <h3 className="font-bold text-text-main dark:text-white italic">Papan Pena Masih Kosong</h3>
                                    <p className="text-[10px] text-tan-primary font-black uppercase tracking-widest mt-1 px-8">Biarkan imajinasimu mengalir!</p>
                                </div>
                            </div>
                        ) : (
                            posts.map(post => (
                                <div key={post.id} className="group bg-brown-dark/[0.02] dark:bg-slate-900/40 rounded-[2.5rem] p-6 sm:p-8 border border-brown-dark/5 transition-all duration-500">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-2xl overflow-hidden bg-tan-light/10 border border-brown-dark/10 shadow-sm relative">
                                            {userProfile.avatar_url ? (
                                                <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-brown-dark/5">
                                                    <UserCircle2 className="w-6 h-6 text-brown-dark/20" />
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-black text-[13px] text-text-main dark:text-white uppercase tracking-tight">{userProfile.display_name}</p>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-3 h-3 text-tan-primary" />
                                                <p className="text-[9px] text-tan-primary font-black uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Post Content with Quote Style */}
                                    <div className="mb-8 relative">
                                        <div className="absolute -left-2 top-0 text-4xl text-brown-dark/5 font-serif inline-block">&quot;</div>
                                        <p className="text-text-main/80 dark:text-gray-300 whitespace-pre-wrap leading-relaxed font-medium text-[15px] italic">
                                            {post.content}
                                        </p>
                                    </div>

                                    <div className="flex gap-6 pt-5 border-t border-brown-dark/5">
                                        <PostLikeButton postId={post.id} initialLikes={post._count.likes} initialLikedByUser={session ? post.likes && post.likes.length > 0 : false} />
                                        <div className="flex items-center gap-2 text-tan-primary hover:text-brown-dark transition-colors cursor-pointer group/msg">
                                            <MessageSquare className="w-4 h-4" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">{post._count.comments}</span>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-brown-dark/5">
                                        <PostCommentSection postId={post.id} initialComments={post.comments || []} commentCount={post._count.comments} currentUserId={session?.user?.id} currentUserRole={session?.user?.role} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );
            case 'aktivitas':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
                        {/* Summary Stats Grid - Overhauled */}
                        <div className="grid grid-cols-3 gap-3">
                            <div className="bg-brown-dark/[0.03] dark:bg-slate-900/40 p-6 rounded-[2rem] border border-brown-dark/5 text-center group transition-all">
                                <div className="w-10 h-10 bg-brown-dark/5 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-brown-dark group-hover:text-text-accent transition-all shadow-sm">
                                    <BookMarked className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-black text-text-main dark:text-white leading-none">{stats.bookmarks}</p>
                                <p className="text-[8px] font-black uppercase text-tan-primary tracking-[0.2em] mt-2 italic">Simpan</p>
                            </div>
                            <div className="bg-brown-dark/[0.03] dark:bg-slate-900/40 p-6 rounded-[2rem] border border-brown-dark/5 text-center group transition-all">
                                <div className="w-10 h-10 bg-brown-dark/5 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-brown-dark group-hover:text-text-accent transition-all shadow-sm">
                                    <Star className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-black text-text-main dark:text-white leading-none">{stats.reviews}</p>
                                <p className="text-[8px] font-black uppercase text-tan-primary tracking-[0.2em] mt-2 italic">Ulasan</p>
                            </div>
                            <div className="bg-brown-dark/[0.03] dark:bg-slate-900/40 p-6 rounded-[2rem] border border-brown-dark/5 text-center group transition-all">
                                <div className="w-10 h-10 bg-brown-dark/5 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-brown-dark group-hover:text-text-accent transition-all shadow-sm">
                                    <MessageCircle className="w-5 h-5" />
                                </div>
                                <p className="text-2xl font-black text-text-main dark:text-white leading-none">{stats.comments}</p>
                                <p className="text-[8px] font-black uppercase text-tan-primary tracking-[0.2em] mt-2 italic">Komentar</p>
                            </div>
                        </div>

                        {/* Recent Reviews Segment */}
                        <div className="bg-brown-dark/[0.015] dark:bg-slate-900/20 p-5 rounded-[2.5rem] border border-brown-dark/5">
                            <h4 className="text-[10px] font-black text-tan-primary uppercase tracking-[0.2em] mb-6 px-4 flex items-center gap-3">
                                <span className="w-4 h-[1px] bg-tan-primary/30"></span>
                                Ulasan Terbaru
                            </h4>
                            {reviews.length === 0 ? (
                                <p className="text-center py-12 text-[10px] text-tan-primary/40 font-black uppercase tracking-widest italic rounded-[2rem] border border-dashed border-brown-dark/10">Belum ada ulasan</p>
                            ) : (
                                <div className="grid gap-4">
                                    {reviews.map(review => (
                                        <div key={review.id} className="bg-brown-dark/[0.04] dark:bg-slate-900/40 p-6 rounded-[2rem] flex items-start gap-5 border border-brown-dark/5 transition-all duration-500 group">
                                            <div className="shrink-0">
                                                <div className="flex bg-tan-primary text-text-accent px-3 py-1 rounded-full items-center gap-1.5 shadow-sm shadow-tan-primary/20">
                                                    <Star className="w-2.5 h-2.5 fill-current" />
                                                    <span className="text-[9px] font-black">{review.rating}</span>
                                                </div>
                                            </div>
                                            <div>
                                                <Link href={`/novel/${review.karya.id}`} className="text-[11px] font-black text-tan-primary hover:text-brown-dark transition-colors mb-2 block uppercase tracking-tight">
                                                    {review.karya.title}
                                                </Link>
                                                <div className="relative">
                                                    <div className="absolute -left-2 top-0 opacity-10 text-2xl font-serif">&quot;</div>
                                                    <p className="text-sm text-text-main/80 dark:text-gray-300 italic font-medium leading-relaxed">&quot;{review.content}&quot;</p>
                                                </div>
                                                <p className="text-[8px] text-tan-primary/40 font-black uppercase mt-4 tracking-widest">{new Date(review.created_at).toLocaleDateString('id-ID')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Comments Segment */}
                        <div className="bg-brown-dark/[0.015] dark:bg-slate-900/20 p-5 rounded-[2.5rem] border border-brown-dark/5">
                            <h4 className="text-[10px] font-black text-tan-primary uppercase tracking-[0.2em] mb-6 px-4 flex items-center gap-3">
                                <span className="w-4 h-[1px] bg-tan-primary/30"></span>
                                Komentar
                            </h4>
                            {comments.length === 0 ? (
                                <p className="text-center py-12 text-[10px] text-tan-primary/40 font-black uppercase tracking-widest italic rounded-[2rem] border border-dashed border-brown-dark/10">Belum ada komentar</p>
                            ) : (
                                <div className="space-y-6">
                                    {comments.map(comment => (
                                        <div key={comment.id} className="group flex flex-col gap-3">
                                            <Link href={`/novel/${comment.bab.karya.id}/${comment.bab.chapter_no}`} className="text-[9px] font-black text-tan-primary/60 uppercase tracking-widest hover:text-brown-dark transition-all flex items-center gap-2 px-4 italic">
                                                <BookOpen className="w-3 h-3 opacity-30" />
                                                {comment.bab.karya.title} <span className="text-tan-primary/20">—</span> <span className="text-text-main dark:text-white group-hover:underline">Bab {comment.bab.chapter_no}</span>
                                            </Link>
                                            <div className="bg-brown-dark/[0.04] dark:bg-slate-900/40 p-6 rounded-[2.5rem] border border-brown-dark/5 transition-all duration-500 relative overflow-hidden">
                                                <p className="text-[14px] text-text-main/80 dark:text-gray-400 leading-relaxed font-medium italic">&quot;{comment.content}&quot;</p>
                                                <div className="absolute top-4 right-6">
                                                   <span className="text-[7px] font-black text-tan-primary/20 uppercase tracking-tighter">{new Date(comment.created_at).toLocaleDateString('id-ID')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                );
            case 'pengikut':
                return (
                    <div className="divide-y divide-brown-dark/5 animate-in fade-in duration-500">
                        {followers.length === 0 ? <div className="py-20 text-center text-[10px] text-tan-primary font-black uppercase tracking-widest italic">Belum ada pengikut</div> :
                            followers.map(f => (
                                <Link key={f.id} href={`/profile/${f.username}`} className="flex items-center gap-5 p-6 hover:bg-brown-dark/[0.04] transition-all group rounded-[2.5rem]">
                                    <div className="w-16 h-16 rounded-[1.2rem] overflow-hidden bg-tan-light/10 border border-brown-dark/10 group-hover:border-tan-primary transition-all relative">
                                        {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover" alt="" /> : <UserCircle2 className="w-full h-full text-brown-dark/10 p-2" />}
                                    </div>
                                    <div>
                                        <p className="font-open-sans font-black text-sm text-text-main dark:text-gray-100 group-hover:text-tan-primary transition-colors uppercase tracking-tight italic">{f.display_name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[10px] text-tan-primary font-black uppercase tracking-widest">@{f.username}</p>
                                            <span className="w-1 h-1 bg-tan-primary/20 rounded-full"></span>
                                            <span className="text-[9px] font-black uppercase text-brown-dark/30 tracking-widest">{f.role}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                );
            case 'mengikuti':
                return (
                    <div className="divide-y divide-brown-dark/5 animate-in fade-in duration-500">
                        {following.length === 0 ? <div className="py-20 text-center text-[10px] text-tan-primary font-black uppercase tracking-widest italic">Belum mengikuti siapapun</div> :
                            following.map(f => (
                                <Link key={f.id} href={`/profile/${f.username}`} className="flex items-center gap-5 p-6 hover:bg-brown-dark/[0.04] transition-all group rounded-[2.5rem]">
                                    <div className="w-16 h-16 rounded-[1.2rem] overflow-hidden bg-tan-light/10 border border-brown-dark/10 group-hover:border-tan-primary transition-all relative">
                                        {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover" alt="" /> : <UserCircle2 className="w-full h-full text-brown-dark/10 p-2" />}
                                    </div>
                                    <div>
                                        <p className="font-open-sans font-black text-sm text-text-main dark:text-gray-100 group-hover:text-tan-primary transition-colors uppercase tracking-tight italic">{f.display_name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-[10px] text-tan-primary font-black uppercase tracking-widest">@{f.username}</p>
                                            <span className="w-1 h-1 bg-tan-primary/20 rounded-full"></span>
                                            <span className="text-[9px] font-black uppercase text-brown-dark/30 tracking-widest">{f.role}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-bg-cream dark:bg-slate-950 transition-colors duration-500 pb-20">
            {/* Header / Nav - Simplified for Premium Feel */}
            <header className="px-4 h-16 flex items-center justify-between absolute top-0 w-full z-50 text-white">
                <Link href="/" className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-all active:scale-95">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {isOwnProfile && (
                        <Link href="/profile/settings" className="p-2 -mr-2 text-white/70 hover:text-white transition-colors">
                            <Settings className="w-6 h-6" />
                        </Link>
                    )}
                </div>
            </header>

            {/* Profile Banner Segment */}
            <div className="h-64 sm:h-80 bg-olive-banner relative overflow-hidden">
                {/* Subtle Decorative Elements for "Journal" feel */}
                <div className="absolute inset-0 opacity-10 pointer-events-none">
                    <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/20 via-transparent to-transparent"></div>
                    <div className="absolute bottom-0 right-10 w-48 h-48 bg-white/5 rounded-full blur-3xl"></div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto px-6 relative">
                {/* Avatar Overlap Section */}
                <div className="relative -mt-24 sm:-mt-32 mb-6">
                    <div className="w-32 h-32 sm:w-44 sm:h-44 rounded-[3rem] overflow-hidden bg-brown-dark border-[6px] border-bg-cream dark:border-slate-950 shadow-2xl shadow-brown-dark/20 transition-all duration-500 relative z-10">
                        {userProfile.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-brown-mid">
                                <UserCircle2 className="w-20 h-20 text-text-accent/20" strokeWidth={1} />
                            </div>
                        )}
                    </div>
                    {isAuthor && (
                        <div className="absolute bottom-2 right-2 bg-tan-primary text-text-accent p-2 rounded-xl shadow-lg border-2 border-bg-cream dark:border-slate-950 z-20 transition-transform hover:scale-110">
                            <Sparkles className="w-4 h-4" />
                        </div>
                    )}
                </div>

                {/* User Identity, Bio & Actions */}
                <div className="mb-10 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-6">
                        <div className="shrink-0">
                            <div className="flex items-center gap-2 mb-1">
                                <h2 className="text-3xl font-open-sans font-black text-text-main dark:text-white leading-tight italic">{userProfile.display_name}</h2>
                                {userProfile.role === 'admin' && <span className="text-[10px] bg-brown-dark/5 text-brown-dark px-2 py-0.5 rounded-md font-black uppercase tracking-tighter">Admin</span>}
                            </div>
                            <p className="text-sm text-tan-primary font-black uppercase tracking-widest">@{userProfile.username}</p>
                        </div>

                        <div className="shrink-0 mb-1">
                            {isOwnProfile ? (
                                <Link href="/profile/edit" className="bg-brown-dark text-text-accent w-[135px] h-[39px] flex items-center justify-center rounded-[65px] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-95">
                                    Edit
                                </Link>
                            ) : session ? (
                                <FollowButton targetUserId={userProfile.id} initialIsFollowing={isFollowing} />
                            ) : (
                                <Link href="/onboarding" className="bg-brown-dark text-text-accent w-[135px] h-[39px] flex items-center justify-center rounded-[65px] font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg active:scale-95">
                                    + Ikuti
                                </Link>
                            )}
                        </div>
                    </div>
                    
                    {userProfile.bio && (
                        <p className="text-sm text-text-main/70 dark:text-gray-400 leading-relaxed max-w-2xl font-medium mb-6 italic">
                            &quot;{userProfile.bio}&quot;
                        </p>
                    )}

                    {/* Compact Stats Row */}
                    <div className="flex gap-6 items-center flex-wrap">
                        <button onClick={() => handleTabChange('pengikut')} className="flex items-center gap-1.5 group">
                            <span className="font-black text-text-main dark:text-white text-lg group-hover:text-tan-primary transition-colors">{userProfile._count.followers}</span>
                            <span className="text-[10px] font-black text-text-main/40 dark:text-gray-500 uppercase tracking-widest">Pengikut</span>
                        </button>
                        <button onClick={() => handleTabChange('mengikuti')} className="flex items-center gap-1.5 group">
                            <span className="font-black text-text-main dark:text-white text-lg group-hover:text-tan-primary transition-colors">{userProfile._count.following}</span>
                            <span className="text-[10px] font-black text-text-main/40 dark:text-gray-500 uppercase tracking-widest">Mengikuti</span>
                        </button>
                        <div className="flex items-center gap-4 ml-auto sm:ml-4 border-l border-brown-dark/10 pl-4 py-1">
                            {userProfile.social_links?.twitter && (
                                <a href={userProfile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-text-main/40 hover:text-brown-dark transition-colors">
                                    <Twitter className="w-4 h-4" />
                                </a>
                            )}
                            {userProfile.social_links?.instagram && (
                                <a href={userProfile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-text-main/40 hover:text-brown-dark transition-colors">
                                    <Instagram className="w-4 h-4" />
                                </a>
                            )}
                            {userProfile.social_links?.website && (
                                <a href={userProfile.social_links.website} target="_blank" rel="noopener noreferrer" className="text-text-main/40 hover:text-brown-dark transition-colors">
                                    <Globe className="w-4 h-4" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tab Navigation - Journal Style with Indicator */}
                <div className="sticky top-0 bg-bg-cream/90 dark:bg-slate-950/90 backdrop-blur-md z-40 -mx-6 px-6 border-b border-brown-dark/10 flex gap-8 mb-8 overflow-x-auto hide-scrollbar">
                    {isAuthor && [
                        { id: 'karya', label: 'CERITA' },
                        { id: 'postingan', label: 'POST' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={`py-4 relative text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${activeTab === tab.id ? 'text-text-main dark:text-white' : 'text-text-main/40 dark:text-gray-500 hover:text-text-main'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-brown-dark rounded-full transition-all animate-in slide-in-from-left duration-300"></div>
                            )}
                        </button>
                    ))}
                    <button
                        onClick={() => handleTabChange('aktivitas')}
                        className={`py-4 relative text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap ${['aktivitas', 'pengikut', 'mengikuti'].includes(activeTab) ? 'text-text-main dark:text-white' : 'text-text-main/40 dark:text-gray-500 hover:text-text-main'}`}
                    >
                        {isAuthor ? 'FEED' : 'AKTIVITAS'}
                        {['aktivitas', 'pengikut', 'mengikuti'].includes(activeTab) && (
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-brown-dark rounded-full transition-all animate-in slide-in-from-left duration-300"></div>
                        )}
                    </button>
                </div>

                {/* Content Area */}
                <div className="min-h-[400px] relative">
                    {isPending && (
                        <div className="absolute inset-0 bg-bg-cream/50 dark:bg-slate-950/50 backdrop-blur-[1px] z-20 flex pt-20 justify-center">
                            <div className="w-8 h-8 border-3 border-brown-dark border-t-transparent rounded-full animate-spin"></div>
                        </div>
                    )}
                    {renderTabContent()}
                </div>
            </main>
        </div>
    );
}
