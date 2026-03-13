'use client';

import { useState, useEffect } from 'react';
import { editBab } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { Save, Pencil, ArrowLeft, Upload } from 'lucide-react';

export default function EditBabForm({ babId, initialContent, title }: { babId: string, initialContent: string, title?: string }) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState(initialContent);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const router = useRouter();
    const draftKey = `draft-edit-bab-${babId}`;

    // LOGIKA PERBAIKAN JUDUL: Mengatasi tulisan "null" dari database
    const displayTitle = (title && title !== "null" && title.trim() !== "") 
        ? title 
        : `Bab (Tanpa Judul)`;

    useEffect(() => {
        if (isOpen) {
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft && savedDraft !== initialContent) {
                setContent(savedDraft);
                setLastSaved(new Date());
            } else {
                setContent(initialContent);
                setLastSaved(null);
            }
        }
    }, [isOpen, draftKey, initialContent]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setContent(val);
        localStorage.setItem(draftKey, val);
        setLastSaved(new Date());
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);

        const formData = new FormData(event.currentTarget);
        formData.append('id', babId);

        try {
            const result = await editBab(formData);
            if (result.error) alert(result.error);
            else {
                localStorage.removeItem(draftKey);
                setLastSaved(null);
                setIsOpen(false);
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            alert('Terjadi kesalahan sistem.');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <>
            {!isOpen && (
                <div className="w-full h-[77px] bg-[#7a553a] border-[1.5px] border-[#3b2a22] rounded flex items-center justify-between px-6 shadow-sm">
                    <span className="font-normal text-[#f2ead7] text-[25px] truncate max-w-[70%]">{displayTitle}</span>
                    <button type="button" onClick={() => setIsOpen(true)} className="flex items-center gap-3 text-[#f2ead7] hover:opacity-70 transition-opacity">
                        <Pencil className="w-5 h-5" />
                        <span className="font-normal text-[25px]">Edit</span>
                    </button>
                </div>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-[#f2ead7] overflow-y-auto font-sans flex flex-col items-center pt-14 pb-24 px-6 sm:px-12 animate-in fade-in zoom-in-95 duration-200">
                    <form onSubmit={handleSubmit} className="w-full max-w-[1055px] flex flex-col min-h-full">
                        <div className="flex justify-between items-center mb-10 w-full">
                            <button type="button" onClick={() => setIsOpen(false)} className="hover:scale-105 transition-transform text-[#3b2a22]">
                                <ArrowLeft className="w-12 h-12" strokeWidth={3} />
                            </button>
                            <button type="submit" disabled={isPending} className="w-[180px] h-[54px] bg-[#3b2a22] hover:bg-[#2a1e18] rounded-[8.49px] flex items-center justify-center gap-3 transition-colors active:scale-95 disabled:opacity-50 shadow-md">
                                <span className="font-semibold text-[#f2ead7] text-[29.3px]">{isPending ? 'Proses' : 'Unggah'}</span>
                                {!isPending && <Upload className="w-7 h-7 text-[#f2ead7]" strokeWidth={2.5} />}
                            </button>
                        </div>
                        <div className="mb-6 w-full h-[75px] bg-[#3b2a22] rounded-[10px] overflow-hidden shrink-0">
                            {/* Input judul diset default sesuai judul bersih yang sudah difilter */}
                            <input name="title" type="text" defaultValue={title && title !== "null" ? title : ""} placeholder="Masukkan Judul Bab" className="w-full h-full bg-transparent px-[35px] font-bold text-[#f2ead7] text-[30.1px] placeholder-[#f2ead7]/80 outline-none" />
                        </div>
                        {lastSaved && (
                            <div className="flex items-center gap-2 text-[#3b2a22] font-semibold mb-2 ml-2">
                                <Save className="w-4 h-4" /> <span>Draft tersimpan otomatis {lastSaved.toLocaleTimeString('id-ID')}</span>
                            </div>
                        )}
                        <div className="w-full flex-1 bg-[#dec8b2] rounded-[10px] overflow-hidden shadow-sm flex flex-col min-h-[500px]">
                            <textarea name="content" required value={content} onChange={handleContentChange} placeholder="Tulis Cerita" className="w-full h-full flex-1 bg-transparent px-[39px] py-[26px] font-normal text-black text-[25.7px] placeholder-black/60 outline-none resize-none" />
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}