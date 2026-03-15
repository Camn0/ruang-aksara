"use client";

import Link from "next/link";
import Image from "next/image";
import { BookMarked, Star, Eye } from "lucide-react";
import { formatDistanceToNow } from 'date-fns';
import { id as localeId } from 'date-fns/locale';
import RemoveBookmarkButton from "./RemoveBookmarkButton";

export default function LibraryContentWrapper({ filteredBookmarks, activeTab }: { filteredBookmarks: any[], activeTab: string }) {
    if (filteredBookmarks.length === 0) {
        return (
            <div className="text-center py-24 px-8 border border-dashed border-tan-light dark:border-brown-mid/50 rounded-3xl bg-bg-cream dark:bg-brown-dark/30 transition-colors duration-300">
                <div className="w-16 h-16 bg-tan-light/40 dark:bg-brown-mid rounded-full flex items-center justify-center mb-4 mx-auto">
                    <BookMarked className="w-8 h-8 text-tan-primary dark:text-text-accent" />
                </div>
                <h2 className="font-bold text-text-main dark:text-text-accent mb-2">
                    {activeTab === 'riwayat' ? "Perpustakaan kosong" : "Belum ada cerita yang tamat"}
                </h2>
                <p className="text-sm text-brown-mid dark:text-tan-light mb-6 leading-relaxed">
                    Mulai jelajahi karya-karya hebat lainnya di Ruang Aksara.
                </p>
                <Link href="/search" prefetch={false} className="bg-brown-dark dark:bg-text-accent px-6 py-3 rounded-full text-text-accent dark:text-brown-dark font-bold text-sm hover:bg-brown-mid dark:hover:bg-tan-light shadow-lg transition-transform hover:scale-105 inline-block">
                    Cari Cerita
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-6 gap-x-4 gap-y-12">
            {filteredBookmarks.map((b, index) => {
                const isOdd = index % 2 !== 0;
                const hasNewChapters = b.karya._count.bab > b.last_chapter;
                const progressPercent = b.karya._count.bab > 0 ? Math.min((b.last_chapter / b.karya._count.bab) * 100, 100) : 0;

                return (
                    <div key={b.id} className="group relative flex flex-col gap-2">
                        <Link href={activeTab === 'riwayat' ? `/novel/${b.karya.id}/${b.last_chapter}` : `/novel/${b.karya.id}`} prefetch={false} className="group/card flex flex-col gap-2">
                            <div className={`aspect-[3/4.2] relative rounded-[2rem] overflow-hidden shadow-lg transition-all duration-500 group-hover/card:shadow-2xl group-hover/card:-translate-y-1 ${isOdd ? 'bg-brown-dark' : 'bg-brown-mid'}`}>
                                {b.karya.cover_url ? (
                                    <Image src={b.karya.cover_url} width={200} height={280} alt={b.karya.title} className={`w-full h-full object-cover transition-all duration-700 ${b.karya.is_completed ? 'grayscale-[0.4] brightness-50' : 'group-hover/card:scale-110'}`} />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center p-3 text-center text-[8px] text-text-accent font-bold leading-tight ${b.karya.is_completed ? 'bg-black/40' : ''}`}>{b.karya.title}</div>
                                )}
                                
                                {/* Hover Overlay */}
                                <div className="absolute inset-0 bg-brown-dark/90 backdrop-blur-sm opacity-0 group-hover/card:opacity-100 transition-all duration-500 flex flex-col p-4 justify-center items-center text-center">
                                    <p className="text-[10px] sm:text-xs text-text-accent font-medium line-clamp-6 leading-relaxed italic mb-3">
                                        {b.karya.deskripsi || "Tanpa deskripsi."}
                                    </p>
                                    <div className="flex items-center gap-1.5 bg-tan-primary/30 px-3 py-1 rounded-full border border-text-accent/10">
                                        <Star className="w-3 h-3 fill-tan-primary text-tan-primary" />
                                        <span className="text-[10px] sm:text-xs font-black text-text-accent">{b.karya.avg_rating.toFixed(1)}</span>
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none group-hover/card:opacity-0 transition-opacity">
                                    {hasNewChapters && (
                                        <div className="bg-red-500 text-white px-2 py-0.5 rounded-full text-[8px] font-black animate-pulse shadow-lg">
                                            {b.karya._count.bab - b.last_chapter} NEW
                                        </div>
                                    )}
                                    {b.last_chapter === b.karya._count.bab && b.karya._count.bab > 0 && (
                                        <div className="bg-green-500/90 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[8px] font-black shadow-lg border border-white/20 uppercase">
                                            SELESAI
                                        </div>
                                    )}
                                </div>

                                {/* Progress Bar */}
                                {activeTab === 'riwayat' && (
                                    <div className="absolute bottom-2 left-2 right-2 h-1 bg-black/40 rounded-full overflow-hidden backdrop-blur-sm group-hover/card:opacity-0 transition-opacity">
                                        <div 
                                            className="h-full bg-tan-primary shadow-[0_0_8px_rgba(176,137,104,0.5)] transition-all duration-1000 ease-out" 
                                            style={{ width: `${progressPercent}%` }} 
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col px-0.5 mt-1">
                                <h3 className="font-open-sans font-black text-[12px] sm:text-sm text-text-main dark:text-text-accent line-clamp-1 leading-tight mb-1 group-hover/card:text-tan-primary transition-colors uppercase tracking-tight italic">{b.karya.title}</h3>
                                <div className="flex items-center gap-2 opacity-80 mb-1.5">
                                    <p className="text-[10px] font-black text-tan-primary truncate uppercase tracking-widest">{b.karya.penulis_alias || 'Anonim'}</p>
                                    <span className="w-1 h-1 bg-tan-primary/40 rounded-full shrink-0" />
                                    <p className="text-[10px] font-black text-brown-mid dark:text-tan-light">{progressPercent.toFixed(0)}%</p>
                                </div>

                                <div className="space-y-1">
                                    <div className="flex justify-between items-center text-[8.5px] font-black uppercase tracking-widest text-brown-mid/60 dark:text-tan-light/60">
                                        <span>Bab {b.last_chapter} / {b.karya._count.bab}</span>
                                        <span>{formatDistanceToNow(new Date(b.updated_at), { addSuffix: false, locale: localeId })}</span>
                                    </div>
                                    <p className="text-[9px] font-black text-text-main dark:text-text-accent truncate bg-tan-light/30 dark:bg-brown-mid/50 px-2 py-1 rounded-md border border-tan-light/20 dark:border-brown-mid">
                                        {b.karya.bab?.find((bc: any) => bc.chapter_no === b.last_chapter)?.title || `Bab ${b.last_chapter}`}
                                    </p>
                                </div>
                            </div>
                        </Link>
                        <div className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-all z-10 scale-[0.6] origin-top-right">
                            <div className="bg-text-accent/90 dark:bg-brown-dark/90 p-1.5 rounded-full shadow-xl border border-tan-light/20 backdrop-blur-sm">
                                <RemoveBookmarkButton karyaId={b.karya.id} />
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
