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
                    <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-6 duration-500 px-4 sm:px-0">
                        {works.length === 0 ? (
                            <div className="py-24 text-center bg-white/5 wobbly-border-sm border-2 border-dashed border-ink/10 rotate-1">
                                <BookOpen className="w-16 h-16 text-ink/10 mx-auto mb-6 rotate-12" />
                                <p className="font-journal-body text-xl text-ink/30 italic uppercase tracking-[0.2em]">Pena Belum Bergerak</p>
                            </div>
                        ) : works.map((karya, i) => (
                            <Link key={karya.id} href={`/novel/${karya.id}`} className={`group bg-white wobbly-border paper-shadow p-6 hover:shadow-2xl hover:-translate-y-1 transition-all flex gap-8 relative items-start ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                                <div className="relative shrink-0 rotate-[-3deg] group-hover:rotate-0 transition-transform">
                                    <div className="absolute inset-0 bg-ink-deep/10 translate-x-2 translate-y-2 wobbly-border-sm -z-10" />
                                    {karya.cover_url ? (
                                        <img src={karya.cover_url} className="w-28 h-40 object-cover wobbly-border-sm border-2 border-white shadow-xl" alt="" />
                                    ) : (
                                        <div className="w-28 h-40 bg-parchment-light wobbly-border-sm border-2 border-white flex items-center justify-center p-6 text-center shadow-xl">
                                            <span className="text-[10px] font-marker text-ink/40 uppercase tracking-tighter leading-tight">{karya.title}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 py-2 min-w-0">
                                    <h3 className="font-journal-title text-2xl text-ink-deep mb-3 group-hover:text-pine transition-colors leading-none italic">{karya.title}</h3>
                                    <p className="font-journal-body text-base text-ink/60 line-clamp-3 mb-6 leading-relaxed italic">"{karya.deskripsi || "Penulis belum menitipkan sinopsis untuk karya ini."}"</p>
                                    <div className="flex gap-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 wobbly-border-sm bg-pine/10 flex items-center justify-center -rotate-6">
                                                <TrendingUp className="w-4 h-4 text-pine" />
                                            </div>
                                            <span className="font-special text-[11px] font-black text-ink/40 uppercase tracking-widest">{karya.total_views.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 wobbly-border-sm bg-gold/20 flex items-center justify-center rotate-6">
                                                <BookMarked className="w-4 h-4 text-ink-deep" />
                                            </div>
                                            <span className="font-special text-[11px] font-black text-ink/40 uppercase tracking-widest">{karya._count.bookmarks}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                                </div>
                            </Link>
                        ))}
                    </div>
                );
            case 'postingan':
                return (
                    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-6 duration-500 px-4 sm:px-0">
                        {isOwnProfile && (
                            <div className="rotate-1">
                                <CreatePostForm userProfile={userProfile} />
                            </div>
                        )}
                        {posts.length === 0 ? (
                            <div className="py-24 text-center bg-white/5 wobbly-border-sm border-2 border-dashed border-ink/10 -rotate-1">
                                <Sparkles className="w-16 h-16 text-ink/10 mx-auto mb-6" />
                                <div>
                                    <h3 className="font-journal-title text-2xl text-ink-deep italic mb-2">Papan Pena Kosong</h3>
                                    <p className="font-marker text-xs text-ink/30 uppercase tracking-[0.2em]">Sapa pembaca dengan imajinasimu!</p>
                                </div>
                            </div>
                        ) : (
                            posts.map((post, i) => (
                                <div key={post.id} className={`bg-white wobbly-border paper-shadow p-8 hover:shadow-xl transition-all relative ${i % 2 === 0 ? '-rotate-0.5' : 'rotate-0.5'}`}>
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 wobbly-border-sm overflow-hidden bg-parchment-light border-2 border-white shadow-md -rotate-3">
                                            {userProfile.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="" /> : <UserCircle2 className="w-full h-full text-ink/10" />}
                                        </div>
                                        <div>
                                            <p className="font-journal-title text-xl text-ink-deep italic leading-none">{userProfile.display_name}</p>
                                            <p className="font-special text-[10px] text-ink/30 font-black uppercase tracking-widest mt-1">{new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <p className="font-journal-body text-lg text-ink/70 whitespace-pre-wrap leading-relaxed mb-8 italic">"{post.content}"</p>
                                    <div className="flex gap-6 pt-6 wobbly-border-t border-ink/5">
                                        <PostLikeButton postId={post.id} initialLikes={post._count.likes} initialLikedByUser={session ? post.likes && post.likes.length > 0 : false} />
                                        <div className="flex items-center gap-2.5 text-ink/30 hover:text-pine transition-colors group cursor-pointer">
                                            <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                            <span className="font-special text-xs font-black">{post._count.comments}</span>
                                        </div>
                                    </div>
                                    <div className="mt-8 bg-parchment-light/50 wobbly-border-sm p-4">
                                        <PostCommentSection postId={post.id} initialComments={post.comments || []} commentCount={post._count.comments} currentUserId={session?.user?.id} currentUserRole={session?.user?.role} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );
            case 'aktivitas':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-6 duration-500 space-y-12 px-4 sm:px-0">
                        {/* Summary Stats Grid */}
                        <div className="grid grid-cols-3 gap-6">
                            {[
                                { icon: BookMarked, val: stats.bookmarks, label: 'Karya Disimpan', color: 'bg-pine/5 text-pine', rot: '-rotate-2' },
                                { icon: Star, val: stats.reviews, label: 'Ulasan Dibuat', color: 'bg-gold/20 text-ink-deep', rot: 'rotate-3' },
                                { icon: MessageCircle, val: stats.comments, label: 'Komentar', color: 'bg-dried-red/5 text-dried-red', rot: '-rotate-1' }
                            ].map((s, i) => (
                                <div key={i} className={`bg-white p-6 wobbly-border paper-shadow text-center group hover:-translate-y-1 transition-all ${s.rot}`}>
                                    <div className={`w-12 h-12 ${s.color} wobbly-border-sm flex items-center justify-center mx-auto mb-4 group-hover:rotate-12 transition-transform`}>
                                        <s.icon className="w-6 h-6" />
                                    </div>
                                    <p className="font-journal-title text-3xl text-ink-deep italic">{s.val}</p>
                                    <p className="font-special text-[9px] font-black uppercase text-ink/30 tracking-[0.2em] mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        {/* Recent Reviews Segment */}
                        <div>
                            <h4 className="font-marker text-xs text-ink/40 uppercase tracking-[0.3em] mb-6 px-4">Arsip Ulasan</h4>
                            {reviews.length === 0 ? (
                                <p className="text-center py-16 font-journal-body text-ink/20 italic wobbly-border-sm border-2 border-dashed border-ink/5">Halaman ini masih putih polos...</p>
                            ) : (
                                <div className="grid gap-4">
                                    {reviews.map((review, i) => (
                                        <div key={review.id} className={`bg-white p-6 wobbly-border paper-shadow flex items-start gap-6 hover:shadow-lg transition-all ${i % 2 === 0 ? 'rotate-1' : '-rotate-1'}`}>
                                            <div className="shrink-0 pt-1">
                                                <div className="flex bg-gold/30 px-3 py-1.5 wobbly-border-sm items-center gap-2 -rotate-12 shadow-sm">
                                                    <Star className="w-4 h-4 text-ink-deep fill-ink-deep/20" />
                                                    <span className="font-special text-xs font-black text-ink-deep">{review.rating}/5</span>
                                                </div>
                                            </div>
                                            <div className="flex-1">
                                                <Link href={`/novel/${review.karya.id}`} className="font-journal-title text-xl text-pine hover:underline mb-2 block italic leading-none">
                                                    {review.karya.title}
                                                </Link>
                                                <p className="font-journal-body text-lg text-ink/70 italic leading-relaxed">&quot;{review.content}&quot;</p>
                                                <p className="font-special text-[9px] text-ink/30 font-black uppercase mt-4 tracking-widest">{new Date(review.created_at).toLocaleDateString('id-ID')}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Comments Segment */}
                        <div>
                            <h4 className="font-marker text-xs text-ink/40 uppercase tracking-[0.3em] mb-6 px-4">Catatan Pinggir</h4>
                            {comments.length === 0 ? (
                                <p className="text-center py-16 font-journal-body text-ink/20 italic wobbly-border-sm border-2 border-dashed border-ink/5">Belum ada tinta tertoreh...</p>
                            ) : (
                                <div className="space-y-6">
                                    {comments.map((comment, i) => (
                                        <div key={comment.id} className="group flex flex-col gap-3">
                                            <Link href={`/novel/${comment.bab.karya.id}/${comment.bab.chapter_no}`} className="font-marker text-[10px] text-ink/30 uppercase tracking-widest hover:text-pine transition-colors ml-4 flex items-center gap-2">
                                                <span># {comment.bab.karya.title}</span>
                                                <span className="w-1 h-1 bg-ink/10 rounded-full" />
                                                <span className="italic text-ink/20">Bab {comment.bab.chapter_no}</span>
                                            </Link>
                                            <div className={`bg-parchment p-6 wobbly-border paper-shadow group-hover:shadow-lg transition-all relative ${i % 2 === 0 ? '-rotate-0.5' : 'rotate-0.5'}`}>
                                                <p className="font-journal-body text-lg text-ink/70 leading-relaxed italic">&quot;{comment.content}&quot;</p>
                                                <span className="absolute -bottom-2 -right-2 font-special text-[8px] font-black bg-white px-3 py-1 wobbly-border-sm text-ink/40 uppercase tracking-tighter shadow-sm">{new Date(comment.created_at).toLocaleDateString('id-ID')}</span>
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
                    <div className="bg-white wobbly-border paper-shadow divide-y-2 divide-ink/5 animate-in fade-in zoom-in-95 duration-500 overflow-hidden -rotate-1">
                        {followers.length === 0 ? <div className="py-24 text-center font-journal-body text-ink/20 italic uppercase tracking-widest">Sepi di sini...</div> :
                            followers.map(f => (
                                <Link key={f.id} href={`/profile/${f.username}`} className="flex items-center gap-6 p-6 hover:bg-gold/5 transition-all group">
                                    <div className="w-16 h-16 wobbly-border-sm overflow-hidden bg-parchment-light border-2 border-white group-hover:rotate-6 transition-all shadow-md">
                                        {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover" alt="" /> : <UserCircle2 className="w-full h-full text-ink/10" />}
                                    </div>
                                    <div>
                                        <p className="font-journal-title text-2xl text-ink-deep group-hover:text-pine transition-colors italic leading-none mb-1">{f.display_name}</p>
                                        <div className="flex items-center gap-3">
                                            <p className="font-marker text-xs text-ink/30 uppercase tracking-widest">@{f.username}</p>
                                            <span className="w-1.5 h-1.5 bg-ink/5 wobbly-border-sm transform rotate-45"></span>
                                            <span className="font-special text-[10px] font-black uppercase text-pine/60 tracking-tighter">{f.role}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                );
            case 'mengikuti':
                return (
                    <div className="bg-white wobbly-border paper-shadow divide-y-2 divide-ink/5 animate-in fade-in zoom-in-95 duration-500 overflow-hidden rotate-1">
                        {following.length === 0 ? <div className="py-24 text-center font-journal-body text-ink/20 italic uppercase tracking-widest">Belum mengikuti siapapun</div> :
                            following.map(f => (
                                <Link key={f.id} href={`/profile/${f.username}`} className="flex items-center gap-6 p-6 hover:bg-gold/5 transition-all group">
                                    <div className="w-16 h-16 wobbly-border-sm overflow-hidden bg-parchment-light border-2 border-white group-hover:-rotate-6 transition-all shadow-md">
                                        {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover" alt="" /> : <UserCircle2 className="w-full h-full text-ink/10" />}
                                    </div>
                                    <div>
                                        <p className="font-journal-title text-2xl text-ink-deep group-hover:text-pine transition-colors italic leading-none mb-1">{f.display_name}</p>
                                        <div className="flex items-center gap-3">
                                            <p className="font-marker text-xs text-ink/30 uppercase tracking-widest">@{f.username}</p>
                                            <span className="w-1.5 h-1.5 bg-ink/5 wobbly-border-sm transform rotate-45"></span>
                                            <span className="font-special text-[10px] font-black uppercase text-pine/60 tracking-tighter">{f.role}</span>
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
        <div className="min-h-screen bg-parchment-light transition-colors duration-300 pb-32">
            {/* Header / Nav */}
            <header className="px-6 h-20 bg-parchment wobbly-border-b border-ink/5 flex items-center justify-between sticky top-0 z-[110] transition-colors">
                <div className="flex items-center gap-6">
                    <Link href="/" className="p-3 -ml-3 text-ink-deep hover:bg-gold/10 wobbly-border-sm transition-all active:scale-95">
                        <ArrowLeft className="w-7 h-7" />
                    </Link>
                    <div className="hidden sm:block">
                        <h1 className="font-journal-title text-2xl text-ink-deep italic leading-none">{userProfile.display_name}</h1>
                        <p className="font-special text-[10px] text-pine font-black uppercase tracking-widest mt-1">@{userProfile.username}</p>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 sm:hidden text-center">
                    <h1 className="font-journal-title text-xl text-ink-deep italic leading-none truncate max-w-[160px]">{userProfile.display_name}</h1>
                    <p className="font-special text-[8px] text-pine font-black uppercase tracking-widest">@{userProfile.username}</p>
                </div>

                <div className="flex items-center gap-4">
                    <ThemeToggle />
                    {isOwnProfile && (
                        <Link href="/profile/settings" className="p-3 -mr-3 text-ink/30 hover:text-ink-deep transition-colors group">
                            <Settings className="w-7 h-7 group-hover:rotate-90 transition-transform" />
                        </Link>
                    )}
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                    {/* Sidebar: Left */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-32 flex flex-col gap-8">
                        <div className="bg-white wobbly-border paper-shadow p-8 relative overflow-hidden -rotate-1">
                            {/* Decorative Background - Taped Note feel */}
                            <div className="absolute top-0 left-0 right-0 h-4 bg-gold/20 wobbly-border-sm opacity-50" />

                            {/* Avatar Section */}
                            <div className="relative mb-8 pt-4">
                                {/* Tape effect */}
                                <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-12 h-6 bg-gold/40 wobbly-border-sm rotate-12 z-10 mix-blend-multiply" />

                                <div className="w-40 h-40 wobbly-border border-4 border-white shadow-2xl mx-auto overflow-hidden bg-parchment-light rotate-[-2deg]">
                                    {userProfile.avatar_url ? (
                                        <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle2 className="w-full h-full text-ink/5" strokeWidth={1} />
                                    )}
                                </div>
                                {isAuthor && (
                                    <div className="absolute -bottom-2 right-1/2 translate-x-16 bg-pine text-parchment p-2 wobbly-border-sm shadow-lg border-2 border-white animate-bounce">
                                        <Sparkles className="w-5 h-5 text-gold" />
                                    </div>
                                )}
                            </div>

                            {/* Info Section */}
                            <div className="text-center mb-8">
                                <h2 className="font-journal-title text-3xl text-ink-deep mb-2 italic leading-none">{userProfile.display_name}</h2>
                                <p className="font-marker text-sm text-ink/40 uppercase tracking-[0.2em] mb-4">@{userProfile.username}</p>
                                <span className="inline-flex items-center gap-2 px-4 py-1.5 wobbly-border-sm bg-pine/5 text-pine text-[10px] font-black uppercase tracking-[0.2em]">
                                    {userProfile.role === 'admin' ? 'Curator & Admin' : userProfile.role}
                                </span>
                            </div>

                            {/* Action Row */}
                            <div className="flex justify-center mb-10">
                                {isOwnProfile ? (
                                    <Link href="/profile/edit" className="w-full bg-gold text-ink-deep font-journal-title text-xl py-4 wobbly-border-sm hover:rotate-1 transition-all shadow-lg text-center italic">
                                        Ubah Berkas
                                    </Link>
                                ) : session ? (
                                    <div className="w-full rotate-1">
                                        <FollowButton targetUserId={userProfile.id} initialIsFollowing={isFollowing} />
                                    </div>
                                ) : (
                                    <Link href="/onboarding" className="w-full bg-pine text-parchment font-journal-title text-xl py-4 wobbly-border-sm hover:rotate-[-1deg] transition-all shadow-lg text-center italic">
                                        Ikuti Jejak
                                    </Link>
                                )}
                            </div>

                            {/* Bio */}
                            {userProfile.bio && (
                                <div className="relative p-6 bg-parchment-light wobbly-border-sm rotate-1 mb-8">
                                    <p className="font-journal-body text-lg text-ink/60 leading-relaxed italic text-center">
                                        &ldquo;{userProfile.bio}&rdquo;
                                    </p>
                                </div>
                            )}

                            {/* Social Links */}
                            <div className="flex justify-center gap-6 pt-8 border-t-2 border-ink/5 wobbly-border-t">
                                {[
                                    { link: userProfile.social_links?.twitter, icon: Twitter, color: 'hover:text-sky-500' },
                                    { link: userProfile.social_links?.instagram, icon: Instagram, color: 'hover:text-pink-500' },
                                    { link: userProfile.social_links?.website, icon: Globe, color: 'hover:text-pine' }
                                ].filter(s => s.link).map((social, i) => (
                                    <a key={i} href={social.link} target="_blank" rel="noopener noreferrer" className={`p-4 bg-white wobbly-border-sm text-ink/20 ${social.color} transition-all shadow-sm hover:scale-110 hover:shadow-md ${i % 2 === 0 ? 'rotate-12' : '-rotate-12'}`} title="Sosial">
                                        <social.icon className="w-6 h-6" />
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Quick Connection Stats */}
                        <div className="wobbly-border paper-shadow p-3 grid grid-cols-2 gap-4 bg-white rotate-1">
                            <button onClick={() => handleTabChange('pengikut')} className="bg-parchment-light wobbly-border-sm py-6 px-3 hover:bg-gold/10 transition-all group flex flex-col items-center justify-center text-center -rotate-2">
                                <p className="font-journal-title text-3xl text-ink-deep group-hover:scale-110 transition-transform italic">{userProfile._count.followers}</p>
                                <p className="font-special text-[10px] text-ink/30 uppercase tracking-[0.2em] mt-1">Pengikut</p>
                            </button>
                            <button onClick={() => handleTabChange('mengikuti')} className="bg-parchment-light wobbly-border-sm py-6 px-3 hover:bg-gold/10 transition-all group flex flex-col items-center justify-center text-center rotate-2">
                                <p className="font-journal-title text-3xl text-ink-deep group-hover:scale-110 transition-transform italic">{userProfile._count.following}</p>
                                <p className="font-special text-[10px] text-ink/30 uppercase tracking-[0.2em] mt-1">Mengikuti</p>
                            </button>
                        </div>
                    </aside>

                    {/* Main Content: Right */}
                    <div className="lg:col-span-8">
                        {/* Tab Bar */}
                        <div className="bg-white/40 wobbly-border paper-shadow p-3 mb-10 flex gap-3 sticky top-[6.5rem] z-[100] overflow-x-auto hide-scrollbar -rotate-[0.5deg]">
                            {isAuthor && (
                                <>
                                    <button
                                        onClick={() => handleTabChange('karya')}
                                        className={`flex-1 min-w-[120px] py-4 wobbly-border-sm font-journal-title text-xl italic transition-all ${activeTab === 'karya' ? 'bg-pine text-parchment shadow-lg rotate-1' : 'text-ink/40 hover:text-ink-deep hover:bg-white/60 -rotate-1'}`}
                                    >
                                        Karya
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('postingan')}
                                        className={`flex-1 min-w-[120px] py-4 wobbly-border-sm font-journal-title text-xl italic transition-all ${activeTab === 'postingan' ? 'bg-pine text-parchment shadow-lg -rotate-1' : 'text-ink/40 hover:text-ink-deep hover:bg-white/60 rotate-1'}`}
                                    >
                                        Postingan
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => handleTabChange('aktivitas')}
                                className={`flex-1 min-w-[120px] py-4 wobbly-border-sm font-journal-title text-xl italic transition-all ${activeTab === 'aktivitas' ? 'bg-pine text-parchment shadow-lg rotate-1' : 'text-ink/40 hover:text-ink-deep hover:bg-white/60 -rotate-1'}`}
                            >
                                {isAuthor ? 'Feed' : 'Aktivitas'}
                            </button>
                        </div>

                        {/* Content Area */}
                        <div className="min-h-[600px] relative">
                            {isPending && (
                                <div className="absolute inset-0 bg-parchment/40 backdrop-blur-[2px] z-[120] flex items-center justify-center wobbly-border">
                                    <div className="w-12 h-12 border-4 border-pine border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            )}
                            {renderTabContent()}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
