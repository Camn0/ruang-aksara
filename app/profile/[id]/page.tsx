import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCircle2, Settings, TrendingUp, BookMarked, Star, MessageSquare, Heart } from "lucide-react";
import FollowButton from "./FollowButton";
import ThemeToggle from "@/app/components/ThemeToggle";
import CreatePostForm from "./CreatePostForm";
import PostLikeButton from "./PostLikeButton";

export default async function ProfilePage({ params, searchParams }: { params: { id: string }, searchParams: { tab?: string } }) {
    const session = await getServerSession(authOptions);

    // Ambil user berdasarkan ID (bisa juga di-extend cari berdasarkan username)
    // Untuk purwarupa kita asumsikan params.id adalah user_id
    const userProfileRaw = await prisma.user.findFirst({
        where: {
            OR: [
                { id: params.id },
                { username: params.id }
            ]
        },
        include: {
            _count: {
                select: { followers: true, following: true }
            }
        }
    });

    if (!userProfileRaw) {
        if (session?.user?.id === params.id || session?.user?.role === 'admin') {
            return (
                <div className="min-h-screen bg-gray-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center transition-colors duration-300">
                    <UserCircle2 className="w-20 h-20 text-gray-300 dark:text-gray-600 mb-4" />
                    <h1 className="text-xl font-black text-gray-900 dark:text-gray-100 mb-2">Sesi Tidak Valid</h1>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">
                        Profil Anda sudah tidak ditemukan di database (Kemungkinan database telah di-reset).
                        Silakan logout dan login kembali.
                    </p>
                    <Link href="/api/auth/signout?callbackUrl=/auth/login" className="bg-red-600 hover:bg-red-700 transition-colors text-white px-8 py-3 rounded-full font-bold text-sm shadow-md">
                        Logout Sekarang
                    </Link>
                </div>
            );
        }
        return notFound();
    }

    // Cast as per other pages to avoid stale type issues
    const userProfile = userProfileRaw as (typeof userProfileRaw & {
        avatar_url: string | null;
        _count: { followers: number; following: number; };
    });

    const isOwnProfile = session?.user?.id === userProfile.id;

    // Cek apakah user as-logged-in mengikuti profil ini
    let isFollowing = false;
    if (session?.user && !isOwnProfile) {
        // Use any cast if Follow model is missing from types
        const followRecord = await (prisma as any).follow.findUnique({
            where: {
                follower_id_following_id: {
                    follower_id: session.user.id,
                    following_id: userProfile.id
                }
            }
        });
        isFollowing = !!followRecord;
    }

    // Ambil konten profil berdasarkan role
    const isAuthor = ['admin', 'author'].includes(userProfile.role);

    let userWorks: any[] = [];
    let recentComments: any[] = [];
    let authorPosts: any[] = [];

    const activeTab = searchParams.tab || 'karya';

    if (isAuthor) {
        const worksRaw = await prisma.karya.findMany({
            where: { uploader_id: userProfile.id },
            orderBy: { total_views: 'desc' },
            take: 10,
            include: {
                _count: {
                    select: { bookmarks: true, ratings: true }
                }
            }
        });
        userWorks = worksRaw as (typeof worksRaw[0] & {
            cover_url: string | null;
            deskripsi: string | null;
        })[];

        if (activeTab === 'postingan') {
            authorPosts = await (prisma as any).authorPost.findMany({
                where: { author_id: userProfile.id },
                orderBy: { created_at: 'desc' },
                include: {
                    _count: { select: { likes: true, comments: true } },
                    ...(session?.user ? { likes: { where: { user_id: session.user.id } } } : {})
                }
            });
        }
    } else {
        recentComments = await prisma.comment.findMany({
            where: { user_id: userProfile.id },
            include: {
                bab: { include: { karya: true } }
            },
            orderBy: { created_at: 'desc' },
            take: 10
        });
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-slate-950 pb-24 transition-colors duration-300">
            {/* Navigasi Atas - Mirip header Instagram */}
            <header className="px-4 h-14 bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between sticky top-0 z-20 transition-colors duration-300">
                <Link href="/" className="p-2 -ml-2 text-gray-900 dark:text-gray-100 active:bg-gray-100 dark:active:bg-slate-800 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <div className="absolute left-1/2 -translate-x-1/2 text-center">
                    <h1 className="font-bold text-lg text-gray-900 dark:text-gray-100">{userProfile.display_name}</h1>
                    <p className="text-[10px] text-gray-500 font-medium">@{userProfile.username}</p>
                </div>

                <div className="flex items-center gap-1">
                    <ThemeToggle />
                    {isOwnProfile && (
                        <Link href="/profile/settings" className="p-2 -mr-2 text-gray-900 dark:text-gray-100 active:bg-gray-100 dark:active:bg-slate-800 rounded-full transition-colors block">
                            <Settings className="w-6 h-6" />
                        </Link>
                    )}
                </div>
            </header>

            {/* Info Profil Utama */}
            {/* Info Profil Utama dengan Banner */}
            <div className="bg-white dark:bg-slate-900 border-b border-gray-100 dark:border-slate-800 relative transition-colors duration-300">
                {/* Banner Area */}
                <div className="h-40 bg-gradient-to-r from-gray-200 dark:from-slate-800 to-indigo-100 dark:to-indigo-900/40 w-full relative">
                    {/* Opsional: Jika user punya cover profil bisa dirender di sini, untuk sekarang placeholder warna gradien */}
                </div>

                <div className="px-6 pb-6 pt-4 relative">
                    {/* Avatar overlap */}
                    <div className="absolute -top-16 w-32 h-32 overflow-hidden bg-white dark:bg-slate-900 rounded-full flex items-center justify-center shrink-0 border-4 border-white dark:border-slate-900 shadow-xl shadow-indigo-100/50 dark:shadow-none">
                        {userProfile.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle2 className="w-24 h-24 text-indigo-300 dark:text-indigo-400" strokeWidth={1} />
                        )}
                    </div>

                    {/* Right-aligned Action Button - Closer to top section */}
                    <div className="flex justify-end mb-4">
                        {isOwnProfile ? (
                            <Link href="/profile/edit" className="px-6 py-2 rounded-full border border-gray-200 dark:border-slate-700 font-bold text-xs text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors shadow-sm bg-white dark:bg-slate-900">
                                Edit Profil
                            </Link>
                        ) : session ? (
                            <FollowButton targetUserId={userProfile.id} initialIsFollowing={isFollowing} />
                        ) : (
                            <Link href="/onboarding" className="px-6 py-2 rounded-full bg-indigo-600 text-white font-bold text-xs hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200">
                                Ikuti
                            </Link>
                        )}
                    </div>

                    {/* Stats & Info */}
                    <div className="mt-4">
                        <h2 className="text-2xl font-black text-gray-900 dark:text-gray-100 leading-tight mb-1">{userProfile.display_name}</h2>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-bold uppercase tracking-wider mb-4">
                            {userProfile.role === 'admin' ? 'Author & Admin' : userProfile.role}
                        </span>

                        {/* Stats Row */}
                        <div className="flex gap-8 mb-2">
                            <div>
                                <p className="text-xl font-black text-gray-900 dark:text-gray-100 leading-none">{userProfile._count.followers}</p>
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Pengikut</p>
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-900 dark:text-gray-100 leading-none">{userProfile._count.following}</p>
                                <p className="text-[10px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest mt-1">Mengikuti</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Konten */}
                <div className="mt-2 bg-white dark:bg-slate-900 min-h-[50vh] transition-colors duration-300">
                    <div className="flex border-b border-gray-200 dark:border-slate-800">
                        {isAuthor ? (
                            <>
                                <Link href={`/profile/${userProfile.username}?tab=karya`} className={`flex-1 text-center py-4 font-bold text-sm transition-colors ${activeTab === 'karya' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                    Karya
                                </Link>
                                <Link href={`/profile/${userProfile.username}?tab=postingan`} className={`flex-1 text-center py-4 font-bold text-sm transition-colors ${activeTab === 'postingan' ? 'text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                                    Postingan Fan
                                </Link>
                            </>
                        ) : (
                            <div className="flex-1 text-center py-4 font-bold text-sm text-indigo-600 dark:text-indigo-400 border-b-2 border-indigo-600 dark:border-indigo-400">
                                Aktivitas
                            </div>
                        )}
                    </div>

                    <div className="p-1">
                        {/* Render Karya & Postingan Jika Penulis */}
                        {isAuthor ? (
                            activeTab === 'karya' ? (
                                <div className="flex flex-col gap-3 p-3">
                                    {userWorks.length === 0 ? (
                                        <div className="text-center py-20 px-8 border border-dashed border-gray-200 dark:border-slate-800 rounded-3xl bg-gray-50 dark:bg-slate-900/50 transition-colors duration-300">
                                            <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto shadow-sm">
                                                <BookMarked className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                            </div>
                                            <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Belum Menerbitkan Karya</h2>
                                            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                                Penulis ini masih meracik mahakaryanya dalam diam.
                                            </p>
                                        </div>
                                    ) : (
                                        userWorks.map(karya => (
                                            <Link key={karya.id} href={`/novel/${karya.id}`} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-3 shadow-sm hover:border-indigo-200 dark:hover:border-indigo-500/50 transition-all flex gap-4 h-full">
                                                {karya.cover_url ? (
                                                    <img src={karya.cover_url} alt={karya.title} className="w-20 h-28 object-cover rounded-lg shrink-0 shadow-sm" />
                                                ) : (
                                                    <div className="w-20 h-28 bg-gray-100 dark:bg-slate-800 rounded-lg flex items-center justify-center p-2 text-center text-[8px] text-gray-500 dark:text-gray-400 shadow-sm shrink-0">
                                                        {karya.title}
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0 py-1 flex flex-col">
                                                    <h3 className="font-bold text-gray-900 dark:text-gray-100 text-sm leading-tight line-clamp-2 mb-1">{karya.title}</h3>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2">{karya.deskripsi || "Tidak ada sinopsis."}</p>
                                                    <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-auto">
                                                        <span className="flex items-center gap-1" title="Views"><TrendingUp className="w-3 h-3 text-indigo-500" /> {karya.total_views}</span>
                                                        <span className="flex items-center gap-1" title="Bookmarks"><BookMarked className="w-3 h-3 text-orange-500" /> {karya._count.bookmarks}</span>
                                                        <span className="flex items-center gap-1" title="Likes/Ratings"><Star className="w-3 h-3 text-yellow-500" /> {karya._count.ratings}</span>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 flex flex-col gap-4">
                                    {/* Jika isOwnProfile, render form Create Post */}
                                    {isOwnProfile && <CreatePostForm userProfile={userProfile} />}

                                    {authorPosts.length === 0 ? (
                                        <p className="text-center py-12 text-sm text-gray-500 dark:text-gray-400 italic">Belum ada pengumuman untuk fans.</p>
                                    ) : (
                                        authorPosts.map(post => (
                                            <div key={post.id} className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 bg-gray-100 dark:bg-slate-800">
                                                            {userProfile.avatar_url ? (
                                                                <img src={userProfile.avatar_url} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <UserCircle2 className="w-full h-full text-gray-400" />
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{userProfile.display_name}</p>
                                                            <p className="text-[10px] text-gray-500 dark:text-gray-400">{post.created_at.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <p className="text-sm text-gray-800 dark:text-gray-200 mb-4 whitespace-pre-wrap">{post.content}</p>

                                                <div className="flex items-center gap-4 pt-3 border-t border-gray-50 dark:border-slate-800 text-gray-500 dark:text-gray-400">
                                                    <PostLikeButton
                                                        postId={post.id}
                                                        initialLikes={post._count.likes}
                                                        initialLikedByUser={session ? post.likes && post.likes.length > 0 : false}
                                                    />
                                                    <button className="flex items-center gap-1.5 text-xs font-semibold hover:text-indigo-600 dark:hover:text-indigo-400 transition">
                                                        <MessageSquare className="w-4 h-4" /> {post._count.comments}
                                                    </button>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )
                        ) : (
                            /* Render Aktivitas Jika Pembaca */
                            <div className="divide-y divide-gray-100 dark:divide-slate-800">
                                {recentComments.length === 0 ? (
                                    <div className="text-center py-20 px-8 border border-dashed border-gray-200 dark:border-slate-800 rounded-3xl bg-gray-50 dark:bg-slate-900/50 mt-4 transition-colors duration-300">
                                        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 mx-auto shadow-sm">
                                            <MessageSquare className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                        </div>
                                        <h2 className="font-bold text-gray-900 dark:text-gray-100 mb-2">Belum Ada Aktivitas</h2>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                                            Pembaca ini belum meninggalkan jejak atau komentar apapun.
                                        </p>
                                    </div>
                                ) : (
                                    recentComments.map(comment => (
                                        <div key={comment.id} className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <Link href={`/novel/${comment.bab.karya.id}/${comment.bab.chapter_no}`} className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
                                                    # {comment.bab.karya.title} - Bab {comment.bab.chapter_no}
                                                </Link>
                                                <span className="text-[10px] text-gray-400 dark:text-gray-500">{comment.created_at.toLocaleDateString('id-ID')}</span>
                                            </div>
                                            <p className="text-gray-800 dark:text-gray-200 text-sm bg-gray-50 dark:bg-slate-800/50 p-4 rounded-xl rounded-tl-none border border-gray-100 dark:border-slate-800 whitespace-pre-wrap">
                                                "{comment.content}"
                                            </p>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
