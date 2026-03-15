import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

interface ChapterListWrapperProps {
    karyaId: string;
}

export default async function ChapterListWrapper({ karyaId }: ChapterListWrapperProps) {
    const chapters = await prisma.bab.findMany({
        where: { karya_id: karyaId },
        orderBy: { chapter_no: 'asc' },
        select: { id: true, chapter_no: true, title: true }
    });

    return (
        <div className="divide-y divide-tan-primary/5">
            {chapters.length === 0 ? (
                <div className="p-10 text-center text-brown-dark/20 dark:text-tan-light/20 text-xs font-bold uppercase tracking-widest italic">
                    Belum ada bab yang dirilis...
                </div>
            ) : (
                chapters.map((chapter: any) => (
                    <Link
                        key={chapter.id}
                        href={`/novel/${karyaId}/${chapter.chapter_no}`}
                        prefetch={false}
                        className="flex items-center justify-between p-5 hover:bg-tan-primary/[0.03] dark:hover:bg-brown-mid/10 active:scale-[0.99] transition-all group"
                    >
                        <div className="flex flex-col pr-4">
                            <span className="font-black text-brown-dark dark:text-text-accent text-[13px] uppercase tracking-wide group-hover:text-tan-primary transition-colors italic">
                                Bab {chapter.chapter_no}{chapter.title ? `: ${chapter.title}` : ''}
                            </span>
                            <span className="text-[10px] text-brown-dark/30 dark:text-tan-light/30 mt-1 uppercase tracking-widest font-black">
                                Selami lebih dalam perjalanan ini
                            </span>
                        </div>
                        <div className="w-8 h-8 rounded-xl bg-tan-primary/5 dark:bg-brown-mid/20 border border-tan-primary/10 flex items-center justify-center shrink-0 group-hover:bg-tan-primary group-hover:text-white transition-all">
                            <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
                        </div>
                    </Link>
                ))
            )}
        </div>
    );
}
