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
                    <div className="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-300 px-4 sm:px-0">
                        {works.length === 0 ? (
                            <div className="py-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-gray-200 dark:border-slate-800">
                                <BookOpen className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Belum ada karya</p>
                            </div>
                        ) : works.map(karya => (
                            <Link key={karya.id} href={`/novel/${karya.id}`} className="group bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-4 shadow-sm hover:shadow-md hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all flex gap-5">
                                <div className="relative shrink-0">
                                    {karya.cover_url ? (
                                        <img src={karya.cover_url} className="w-24 h-36 object-cover rounded-2xl shadow-sm group-hover:scale-105 transition-transform duration-500" alt="" />
                                    ) : (
                                        <div className="w-24 h-36 bg-gray-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center p-4 text-center">
                                            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{karya.title}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 py-1 min-w-0">
                                    <h3 className="font-black text-gray-900 dark:text-gray-100 text-lg mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{karya.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3 mb-4 leading-relaxed">{karya.deskripsi || "Penulis belum menambahkan sinopsis untuk karya ini."}</p>
                                    <div className="flex gap-5">
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
                                                <TrendingUp className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                            </div>
                                            <span className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{karya.total_views.toLocaleString()}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-6 h-6 rounded-lg bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center">
                                                <BookMarked className="w-3.5 h-3.5 text-orange-600 dark:text-orange-400" />
                                            </div>
                                            <span className="text-[11px] font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">{karya._count.bookmarks}</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                );
            case 'postingan':
                return (
                    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-300 px-4 sm:px-0">
                        {isOwnProfile && <CreatePostForm userProfile={userProfile} />}
                        {posts.length === 0 ? (
                            <div className="py-20 text-center flex flex-col items-center gap-4 bg-white dark:bg-slate-900 rounded-[3rem] border border-dashed border-gray-200 dark:border-slate-800">
                                <Sparkles className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto" strokeWidth={1.5} />
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 italic">Papan Pena Masih Kosong</h3>
                                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1 px-8">Biarkan imajinasimu mengalir dan sapa pembaca di sini!</p>
                                </div>
                            </div>
                        ) : (
                            posts.map(post => (
                                <div key={post.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-[2.5rem] p-6 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800">
                                            {userProfile.avatar_url ? <img src={userProfile.avatar_url} className="w-full h-full object-cover" alt="" /> : <UserCircle2 className="w-full h-full text-gray-300" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm dark:text-white">{userProfile.display_name}</p>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{new Date(post.created_at).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <p className="text-gray-800 dark:text-gray-300 whitespace-pre-wrap leading-relaxed mb-6">{post.content}</p>
                                    <div className="flex gap-4 pt-4 border-t border-gray-50 dark:border-slate-800">
                                        <PostLikeButton postId={post.id} initialLikes={post._count.likes} initialLikedByUser={session ? post.likes && post.likes.length > 0 : false} />
                                        <div className="flex items-center gap-1.5 text-gray-400">
                                            <MessageSquare className="w-4 h-4" />
                                            <span className="text-xs font-bold">{post._count.comments}</span>
                                        </div>
                                    </div>
                                    <div className="mt-4">
                                        <PostCommentSection postId={post.id} initialComments={post.comments || []} commentCount={post._count.comments} currentUserId={session?.user?.id} currentUserRole={session?.user?.role} />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                );
            case 'aktivitas':
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-300 space-y-8 px-4 sm:px-0">
                        {/* Summary Stats Grid */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 text-center shadow-sm group hover:border-indigo-100 transition-all">
                                <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <BookMarked className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                                </div>
                                <p className="text-xl font-black dark:text-white">{stats.bookmarks}</p>
                                <p className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em] mt-1">Karya Disimpan</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 text-center shadow-sm group hover:border-orange-100 transition-all">
                                <div className="w-10 h-10 bg-orange-50 dark:bg-orange-950/30 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <Star className="w-5 h-5 text-orange-500 dark:text-orange-400" />
                                </div>
                                <p className="text-xl font-black dark:text-white">{stats.reviews}</p>
                                <p className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em] mt-1">Ulasan Dibuat</p>
                            </div>
                            <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 text-center shadow-sm group hover:border-emerald-100 transition-all">
                                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                                    <MessageCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <p className="text-xl font-black dark:text-white">{stats.comments}</p>
                                <p className="text-[8px] font-black uppercase text-gray-400 tracking-[0.2em] mt-1">Komentar</p>
                            </div>
                        </div>

                        {/* Recent Reviews Segment */}
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Ulasan Terbaru</h4>
                            {reviews.length === 0 ? (
                                <p className="text-center py-10 text-xs text-gray-400 font-bold uppercase border border-dashed border-gray-100 rounded-3xl">Belum ada ulasan</p>
                            ) : (
                                <div className="grid gap-3">
                                    {reviews.map(review => (
                                        <div key={review.id} className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex items-start gap-4">
                                            <div className="shrink-0 pt-1">
                                                <div className="flex bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-full items-center gap-1">
                                                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                                                    <span className="text-[10px] font-black text-amber-700 dark:text-amber-400">{review.rating}/5</span>
                                                </div>
                                            </div>
                                            <div>
                                                <Link href={`/novel/${review.karya.id}`} className="text-xs font-black text-indigo-600 dark:text-indigo-400 hover:underline mb-1 block">
                                                    {review.karya.title}
                                                </Link>
                                                <p className="text-sm dark:text-gray-300 italic line-clamp-2">&quot;{review.content}&quot;</p>
                                                <p className="text-[8px] text-gray-400 font-bold uppercase mt-2">{new Date(review.created_at).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Recent Comments Segment */}
                        <div>
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 px-2">Komentar Terbaru</h4>
                            {comments.length === 0 ? (
                                <p className="text-center py-10 text-xs text-gray-400 font-bold uppercase border border-dashed border-gray-100 rounded-3xl">Belum ada komentar</p>
                            ) : (
                                <div className="space-y-4">
                                    {comments.map(comment => (
                                        <div key={comment.id} className="group flex flex-col gap-2">
                                            <Link href={`/novel/${comment.bab.karya.id}/${comment.bab.chapter_no}`} className="text-[9px] font-black text-gray-400 uppercase tracking-widest hover:text-indigo-600 transition-colors">
                                                # {comment.bab.karya.title} — <span className="text-gray-300 dark:text-gray-700">Bab {comment.bab.chapter_no}</span>
                                            </Link>
                                            <div className="bg-white dark:bg-slate-900 p-5 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm group-hover:border-indigo-100 transition-all relative">
                                                <p className="text-[13px] text-gray-700 dark:text-gray-400 leading-relaxed font-medium">&quot;{comment.content}&quot;</p>
                                                <span className="absolute -bottom-1 -right-1 text-[7px] font-black bg-gray-50 dark:bg-slate-800 px-2 py-0.5 rounded-full text-gray-400 uppercase tracking-tighter shadow-sm">{new Date(comment.created_at).toLocaleDateString()}</span>
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
                    <div className="divide-y divide-gray-50 dark:divide-slate-800 animate-in fade-in zoom-in-95 duration-300">
                        {followers.length === 0 ? <div className="py-20 text-center text-xs text-gray-400 font-bold uppercase tracking-widest italic">Belum ada pengikut</div> :
                            followers.map(f => (
                                <Link key={f.id} href={`/profile/${f.username}`} className="flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 group-hover:border-indigo-400 transition-all shadow-sm">
                                        {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover" alt="" /> : <UserCircle2 className="w-full h-full text-gray-300" />}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{f.display_name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-gray-500 font-medium">@{f.username}</p>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="text-[8px] font-black uppercase text-indigo-500/70 tracking-tighter">{f.role}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                    </div>
                );
            case 'mengikuti':
                return (
                    <div className="divide-y divide-gray-50 dark:divide-slate-800 animate-in fade-in zoom-in-95 duration-300">
                        {following.length === 0 ? <div className="py-20 text-center text-xs text-gray-400 font-bold uppercase tracking-widest italic">Belum mengikuti siapapun</div> :
                            following.map(f => (
                                <Link key={f.id} href={`/profile/${f.username}`} className="flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group">
                                    <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 dark:bg-slate-800 border-2 border-white dark:border-slate-800 group-hover:border-indigo-400 transition-all shadow-sm">
                                        {f.avatar_url ? <img src={f.avatar_url} className="w-full h-full object-cover" alt="" /> : <UserCircle2 className="w-full h-full text-gray-300" />}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{f.display_name}</p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <p className="text-xs text-gray-500 font-medium">@{f.username}</p>
                                            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                                            <span className="text-[8px] font-black uppercase text-indigo-500/70 tracking-tighter">{f.role}</span>
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
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Header / Nav */}
            <header className="px-4 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 -ml-2 text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-800 rounded-full transition-all active:scale-95">
                        <ArrowLeft className="w-6 h-6" />
                    </Link>
                    <div className="hidden sm:block">
                        <h1 className="font-black text-sm text-gray-900 dark:text-gray-100 uppercase tracking-tight">{userProfile.display_name}</h1>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">@{userProfile.username}</p>
                    </div>
                </div>

                <div className="absolute left-1/2 -translate-x-1/2 sm:hidden text-center">
                    <h1 className="font-black text-sm text-gray-900 dark:text-gray-100 uppercase tracking-tight truncate max-w-[140px]">{userProfile.display_name}</h1>
                    <p className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">@{userProfile.username}</p>
                </div>

                <div className="flex items-center gap-2">
                    <ThemeToggle />
                    {isOwnProfile && (
                        <Link href="/profile/settings" className="p-2 -mr-2 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                            <Settings className="w-6 h-6" />
                        </Link>
                    )}
                </div>
            </header>

            <main className="max-w-[1280px] mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Sidebar: Left (Mobile Header-like on small screens, Sidebar on Large) */}
                    <aside className="lg:col-span-4 lg:sticky lg:top-24 flex flex-col gap-6">
                        <div className="bg-white dark:bg-slate-900 rounded-[3rem] p-8 border border-gray-100 dark:border-slate-800 shadow-xl relative overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 dark:from-indigo-900/20 dark:to-purple-900/20 -z-10" />

                            {/* Avatar Section */}
                            <div className="relative mb-6">
                                <div className="w-32 h-32 rounded-[2.5rem] overflow-hidden bg-white dark:bg-slate-800 border-4 border-white dark:border-slate-800 shadow-2xl mx-auto">
                                    {userProfile.avatar_url ? (
                                        <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserCircle2 className="w-full h-full text-indigo-100 dark:text-slate-700" strokeWidth={1} />
                                    )}
                                </div>
                                {isAuthor && (
                                    <div className="absolute -bottom-2 right-1/2 translate-x-12 bg-indigo-600 text-white p-1.5 rounded-xl shadow-lg border-2 border-white dark:border-slate-800 animate-bounce">
                                        <Sparkles className="w-4 h-4" />
                                    </div>
                                )}
                            </div>

                            {/* Info Section */}
                            <div className="text-center mb-6">
                                <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-1 leading-tight">{userProfile.display_name}</h2>
                                <p className="text-xs text-gray-400 dark:text-gray-500 font-bold uppercase tracking-widest mb-3">@{userProfile.username}</p>
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 text-[9px] font-black uppercase tracking-[0.15em] border border-indigo-100 dark:border-indigo-800">
                                    {userProfile.role === 'admin' ? 'Author & Admin' : userProfile.role}
                                </span>
                            </div>

                            {/* Action Row */}
                            <div className="flex justify-center mb-8">
                                {isOwnProfile ? (
                                    <Link href="/profile/edit" className="w-full bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 text-gray-900 dark:text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm text-center">
                                        Ubah Profil
                                    </Link>
                                ) : session ? (
                                    <FollowButton targetUserId={userProfile.id} initialIsFollowing={isFollowing} />
                                ) : (
                                    <Link href="/onboarding" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 dark:shadow-none text-center">
                                        Ikuti
                                    </Link>
                                )}
                            </div>

                            {/* Bio */}
                            {userProfile.bio && (
                                <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-6 italic font-medium px-2">
                                    &ldquo;{userProfile.bio}&rdquo;
                                </p>
                            )}

                            {/* Social Links */}
                            <div className="flex justify-center gap-4 pt-6 border-t border-gray-50 dark:border-slate-800/50">
                                {userProfile.social_links?.twitter && (
                                    <a href={userProfile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-400 hover:text-indigo-500 hover:bg-white transition-all shadow-sm border border-transparent hover:border-indigo-100" title="Twitter/X">
                                        <Twitter className="w-5 h-5" />
                                    </a>
                                )}
                                {userProfile.social_links?.instagram && (
                                    <a href={userProfile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-400 hover:text-pink-500 hover:bg-white transition-all shadow-sm border border-transparent hover:border-pink-100" title="Instagram">
                                        <Instagram className="w-5 h-5" />
                                    </a>
                                )}
                                {userProfile.social_links?.website && (
                                    <a href={userProfile.social_links.website} target="_blank" rel="noopener noreferrer" className="p-3 bg-gray-50 dark:bg-slate-800 rounded-2xl text-gray-400 hover:text-emerald-500 hover:bg-white transition-all shadow-sm border border-transparent hover:border-emerald-100" title="Situs Web">
                                        <Globe className="w-5 h-5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        {/* Quick Connection Stats */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-6 border border-gray-100 dark:border-slate-800 shadow-lg grid grid-cols-2 gap-3 bg-gray-50 dark:bg-slate-800/50 overflow-hidden">
                            <button onClick={() => handleTabChange('pengikut')} className="bg-white dark:bg-slate-900 py-5 px-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-indigo-100 dark:hover:border-slate-700 flex flex-col items-center justify-center text-center">
                                <p className="text-2xl font-black text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition-colors uppercase">{userProfile._count.followers}</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Pengikut</p>
                            </button>
                            <button onClick={() => handleTabChange('mengikuti')} className="bg-white dark:bg-slate-900 py-5 px-2 rounded-2xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all group border border-transparent hover:border-indigo-100 dark:hover:border-slate-700 flex flex-col items-center justify-center text-center">
                                <p className="text-2xl font-black text-gray-900 dark:text-gray-100 group-hover:text-indigo-600 transition-colors uppercase">{userProfile._count.following}</p>
                                <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1">Mengikuti</p>
                            </button>
                        </div>
                    </aside>

                    {/* Main Content: Right (Tabs & Feed) */}
                    <div className="lg:col-span-8">
                        {/* Tab Bar */}
                        <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] p-2 border border-gray-100 dark:border-slate-800 shadow-lg mb-8 flex gap-1 sticky top-[5.5rem] z-30 overflow-x-auto hide-scrollbar">
                            {isAuthor && (
                                <>
                                    <button
                                        onClick={() => handleTabChange('karya')}
                                        className={`flex-1 min-w-[100px] py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'karya' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                    >
                                        Karya
                                    </button>
                                    <button
                                        onClick={() => handleTabChange('postingan')}
                                        className={`flex-1 min-w-[100px] py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'postingan' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                                    >
                                        Postingan
                                    </button>
                                </>
                            )}
                            <button
                                onClick={() => handleTabChange('aktivitas')}
                                className={`flex-1 min-w-[100px] py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'aktivitas' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100 dark:shadow-none' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-50 dark:hover:bg-slate-800'}`}
                            >
                                {isAuthor ? 'Feed' : 'Aktivitas'}
                            </button>
                            {(activeTab === 'pengikut' || activeTab === 'mengikuti') && (
                                <button className="flex-1 min-w-[100px] py-4 rounded-[2rem] text-[10px] font-black uppercase tracking-widest bg-gray-50 dark:bg-slate-800 text-indigo-600 border border-indigo-100 dark:border-indigo-900/30">
                                    {activeTab === 'pengikut' ? 'Daftar Pengikut' : 'Daftar Mengikuti'}
                                </button>
                            )}
                        </div>

                        {/* Content Area */}
                        <div className="min-h-[600px] relative">
                            {isPending && (
                                <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-[2px] z-20 flex items-center justify-center rounded-[3rem]">
                                    <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
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
