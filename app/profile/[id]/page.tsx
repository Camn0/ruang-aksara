import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCircle2, Settings, TrendingUp, BookMarked, Star } from "lucide-react";
import FollowButton from "./FollowButton";

export default async function ProfilePage({ params }: { params: { id: string } }) {
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
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
                    <UserCircle2 className="w-20 h-20 text-gray-300 mb-4" />
                    <h1 className="text-xl font-black text-gray-900 mb-2">Sesi Tidak Valid</h1>
                    <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
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
        })[];
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
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Navigasi Atas - Mirip header Instagram */}
            <header className="px-4 h-14 bg-white border-b border-gray-100 flex items-center justify-between sticky top-0 z-20">
                <Link href="/" className="p-2 -ml-2 text-gray-900 active:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft className="w-6 h-6" />
                </Link>
                <h1 className="font-bold text-lg text-gray-900 absolute left-1/2 -translate-x-1/2">{userProfile.username}</h1>
                {isOwnProfile && (
                    <Link href="/profile/settings" className="p-2 -mr-2 text-gray-900 active:bg-gray-100 rounded-full transition-colors block">
                        <Settings className="w-6 h-6" />
                    </Link>
                )}
            </header>

            {/* Info Profil Utama */}
            {/* Info Profil Utama dengan Banner */}
            <div className="bg-white border-b border-gray-100 relative">
                {/* Banner Area */}
                <div className="h-40 bg-gradient-to-r from-gray-200 to-indigo-100 w-full relative">
                    {/* Opsional: Jika user punya cover profil bisa dirender di sini, untuk sekarang placeholder warna gradien */}
                </div>

                <div className="px-6 pb-6 pt-4 relative">
                    {/* Avatar overlap */}
                    <div className="absolute -top-16 w-32 h-32 overflow-hidden bg-white rounded-full flex items-center justify-center shrink-0 border-4 border-white shadow-xl shadow-indigo-100/50">
                        {userProfile.avatar_url ? (
                            <img src={userProfile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <UserCircle2 className="w-24 h-24 text-indigo-300" strokeWidth={1} />
                        )}
                    </div>

                    {/* Right-aligned Action Button - Closer to top section */}
                    <div className="flex justify-end mb-4">
                        {isOwnProfile ? (
                            <Link href="/profile/edit" className="px-6 py-2 rounded-full border border-gray-200 font-bold text-xs text-gray-900 hover:bg-gray-50 transition-colors shadow-sm bg-white">
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
                        <h2 className="text-2xl font-black text-gray-900 leading-tight mb-1">{userProfile.display_name}</h2>
                        <span className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold uppercase tracking-wider mb-4">
                            {userProfile.role === 'admin' ? 'Author & Admin' : userProfile.role}
                        </span>

                        {/* Stats Row */}
                        <div className="flex gap-8 mb-2">
                            <div>
                                <p className="text-xl font-black text-gray-900 leading-none">{userProfile._count.followers}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Pengikut</p>
                            </div>
                            <div>
                                <p className="text-xl font-black text-gray-900 leading-none">{userProfile._count.following}</p>
                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Mengikuti</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tab Konten */}
                <div className="mt-2 bg-white min-h-[50vh]">
                    <div className="flex border-b border-gray-200">
                        <button className="flex-1 py-4 font-bold text-sm text-indigo-600 border-b-2 border-indigo-600">
                            {isAuthor ? 'Karya' : 'Aktivitas'}
                        </button>
                    </div>

                    <div className="p-1">
                        {/* Render Karya Jika Penulis */}
                        {isAuthor ? (
                            <div className="grid grid-cols-3 gap-1">
                                {userWorks.length === 0 ? (
                                    <div className="col-span-3 text-center py-20 text-gray-400 text-sm">Belum ada karya.</div>
                                ) : (
                                    userWorks.map(karya => (
                                        <Link key={karya.id} href={`/novel/${karya.id}`} className="aspect-[2/3] relative group bg-gray-100 block overflow-hidden">
                                            {karya.cover_url ? (
                                                <img src={karya.cover_url} alt={karya.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center p-2 text-center text-[10px] text-gray-500">
                                                    {karya.title}
                                                </div>
                                            )}
                                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-900/90 to-transparent p-2 pt-8 text-white opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end">
                                                <p className="text-[10px] font-bold truncate mb-1">{karya.title}</p>
                                                <div className="flex items-center gap-2 text-[8px] font-medium text-gray-300">
                                                    <span className="flex items-center gap-0.5" title="Views"><TrendingUp className="w-2.5 h-2.5" /> {karya.total_views}</span>
                                                    <span className="flex items-center gap-0.5" title="Bookmarks"><BookMarked className="w-2.5 h-2.5" /> {karya._count.bookmarks}</span>
                                                    <span className="flex items-center gap-0.5" title="Likes/Ratings"><Star className="w-2.5 h-2.5" /> {karya._count.ratings}</span>
                                                </div>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        ) : (
                            /* Render Aktivitas Jika Pembaca */
                            <div className="divide-y divide-gray-100">
                                {recentComments.length === 0 ? (
                                    <div className="text-center py-20 text-gray-400 text-sm">Belum ada komentar.</div>
                                ) : (
                                    recentComments.map(comment => (
                                        <div key={comment.id} className="p-6">
                                            <div className="flex justify-between items-start mb-2">
                                                <Link href={`/novel/${comment.bab.karya.id}/${comment.bab.chapter_no}`} className="text-xs font-bold text-indigo-600 hover:underline">
                                                    # {comment.bab.karya.title} - Bab {comment.bab.chapter_no}
                                                </Link>
                                                <span className="text-[10px] text-gray-400">{comment.created_at.toLocaleDateString('id-ID')}</span>
                                            </div>
                                            <p className="text-gray-800 text-sm bg-gray-50 p-4 rounded-xl rounded-tl-none border border-gray-100">
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
