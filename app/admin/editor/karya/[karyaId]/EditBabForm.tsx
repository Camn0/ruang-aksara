'use client';

import { useState, useEffect } from 'react';
import { editBab } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { Save, Pencil, ArrowLeft, Upload } from 'lucide-react';
import { toast } from 'sonner';
import DeleteBabButton from './DeleteBabButton';

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
            if (result.error) toast.error(result.error);
            else {
                toast.success("Bab tersimpan!");
                localStorage.removeItem(draftKey);
                setLastSaved(null);
                setIsOpen(false);
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            toast.error('Terjadi kesalahan sistem.');
        } finally {
            setIsPending(false);
        }
    }

    return (
        <>
            {!isOpen && (
                <div className="w-full h-[80px] bg-white/40 dark:bg-brown-dark/40 border-2 border-tan-primary/10 dark:border-brown-mid rounded-2xl flex items-center justify-between px-8 shadow-sm group hover:border-tan-primary/30 transition-all">
                    <span className="font-bold italic text-brown-dark dark:text-text-accent text-xl truncate max-w-[50%]">{displayTitle}</span>
                    <div className="flex items-center gap-4">
                        <button type="button" onClick={() => setIsOpen(true)} className="flex items-center gap-3 text-brown-dark dark:text-tan-primary hover:text-tan-primary transition-all font-black text-sm uppercase tracking-widest italic">
                            <Pencil className="w-4 h-4" />
                            <span>Sunting</span>
                        </button>
                        <div className="h-4 w-px bg-tan-primary/20" />
                        <DeleteBabButton babId={babId} />
                    </div>
                </div>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-bg-cream dark:bg-brown-dark overflow-y-auto flex flex-col items-center pt-14 pb-24 px-6 sm:px-12 animate-in fade-in zoom-in-95 duration-200">
                    <form onSubmit={handleSubmit} className="w-full max-w-[1055px] flex flex-col min-h-full">
                        <div className="flex justify-between items-center mb-10 w-full">
                            <button type="button" onClick={() => setIsOpen(false)} className="hover:scale-105 transition-transform text-brown-dark dark:text-tan-primary">
                                <ArrowLeft className="w-12 h-12" strokeWidth={2.5} />
                            </button>
                            <button type="submit" disabled={isPending} className="h-[60px] px-10 bg-brown-dark hover:bg-brown-mid text-text-accent rounded-full flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-brown-dark/20 group">
                                <span className="font-black text-lg uppercase tracking-[0.2em] italic">{isPending ? 'Mengukir...' : 'Simpan Bab'}</span>
                                {!isPending && <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" strokeWidth={2.5} />}
                            </button>
                        </div>
                        <div className="mb-6 w-full h-[75px] bg-white/40 dark:bg-brown-dark/40 border-2 border-tan-primary/10 dark:border-brown-mid rounded-2xl overflow-hidden shrink-0 group focus-within:ring-4 focus-within:ring-tan-primary/5 transition-all">
                            {/* Input judul diset default sesuai judul bersih yang sudah difilter */}
                            <input name="title" type="text" defaultValue={title && title !== "null" ? title : ""} placeholder="Masukkan Judul Bab..." className="w-full h-full bg-transparent px-10 font-bold italic text-brown-dark dark:text-text-accent text-2xl placeholder-brown-dark/20 dark:placeholder-tan-light/20 outline-none" />
                        </div>
                        {lastSaved && (
                            <div className="flex items-center gap-2 text-[#3b2a22] font-semibold mb-2 ml-2">
                                <Save className="w-4 h-4" /> <span>Draft tersimpan otomatis {lastSaved.toLocaleTimeString('id-ID')}</span>
                            </div>
                        )}
                        <div className="w-full flex-1 bg-white/30 dark:bg-brown-dark/30 border-2 border-tan-primary/5 dark:border-brown-mid rounded-3xl overflow-hidden shadow-inner flex flex-col min-h-[500px] group focus-within:ring-4 focus-within:ring-tan-primary/5 transition-all">
                            <textarea name="content" required value={content} onChange={handleContentChange} placeholder="Mulailah menggoreskan imajinasimu di sini..." className="w-full h-full flex-1 bg-transparent px-10 py-8 font-medium italic text-brown-dark dark:text-tan-light text-xl placeholder-brown-dark/20 dark:placeholder-tan-light/20 outline-none resize-none leading-relaxed" />
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}