'use client';

import { useState, useEffect } from 'react';
import { createBab } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { Save, Plus, ArrowLeft, Upload } from 'lucide-react';

export default function CreateBabForm({ karyaId }: { karyaId: string }) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState('');
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [message, setMessage] = useState<{ type: 'error' | 'success', text: string } | null>(null);
    const router = useRouter();
    const draftKey = `draft-bab-${karyaId}`;

    useEffect(() => {
        if (isOpen) {
            const savedDraft = localStorage.getItem(draftKey);
            if (savedDraft) {
                setContent(savedDraft);
                setLastSaved(new Date());
            }
        }
    }, [isOpen, draftKey]);

    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setContent(val);
        localStorage.setItem(draftKey, val);
        setLastSaved(new Date());
    };

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault();
        setIsPending(true);
        setMessage(null);

        const formData = new FormData(event.currentTarget);
        formData.append('karya_id', karyaId);

        try {
            const result = await createBab(formData);
            if (result.error) setMessage({ type: 'error', text: result.error });
            else {
                setMessage({ type: 'success', text: 'Berhasil mengunggah bab baru!' });
                localStorage.removeItem(draftKey);
                setContent('');
                setLastSaved(null);
                (event.target as HTMLFormElement).reset();
                setIsOpen(false); 
                router.refresh();
            }
        } catch (error) {
            console.error(error);
            setMessage({ type: 'error', text: 'Terjadi kesalahan sistem saat menghubungi server.' });
        } finally {
            setIsPending(false);
        }
    }

    return (
        <>
            {!isOpen && (
                <button type="button" onClick={() => setIsOpen(true)} className="w-full h-[80px] bg-tan-primary/10 border-2 border-dashed border-tan-primary/20 rounded-2xl flex items-center justify-center gap-4 hover:bg-tan-primary/20 transition-all shadow-sm group">
                    <Plus className="w-6 h-6 text-brown-dark group-hover:scale-110 transition-transform" strokeWidth={3} />
                    <span className="font-black text-brown-dark text-xl uppercase tracking-widest italic">Tambah Bab Baru</span>
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-bg-cream dark:bg-brown-dark overflow-y-auto flex flex-col items-center pt-14 pb-24 px-6 sm:px-12 animate-in fade-in zoom-in-95 duration-200">
                    <form onSubmit={handleSubmit} className="w-full max-w-[1055px] flex flex-col min-h-full">
                        <div className="flex justify-between items-center mb-10 w-full">
                            <button type="button" onClick={() => setIsOpen(false)} className="hover:scale-105 transition-transform text-brown-dark dark:text-tan-primary">
                                <ArrowLeft className="w-12 h-12" strokeWidth={2.5} />
                            </button>
                            <button type="submit" disabled={isPending} className="h-[60px] px-10 bg-brown-dark hover:bg-brown-mid text-text-accent rounded-full flex items-center justify-center gap-4 transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-brown-dark/20 group">
                                <span className="font-black text-lg uppercase tracking-[0.2em] italic">{isPending ? 'Mengukir...' : 'Unggah Bab'}</span>
                                {!isPending && <Upload className="w-5 h-5 group-hover:-translate-y-1 transition-transform" strokeWidth={2.5} />}
                            </button>
                        </div>
                        
                        {message && (
                            <div className={`w-full p-6 mb-8 text-sm font-black uppercase tracking-widest italic rounded-2xl shadow-lg animate-in slide-in-from-top-4 duration-300 ${message.type === 'error' ? 'bg-red-900/10 text-red-900/80 border border-red-900/20' : 'bg-emerald-900/10 text-emerald-900/80 border border-emerald-900/20'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="mb-6 w-full h-[75px] bg-white/40 dark:bg-brown-dark/40 border-2 border-tan-primary/10 dark:border-brown-mid rounded-2xl overflow-hidden shrink-0 group focus-within:ring-4 focus-within:ring-tan-primary/5 transition-all">
                            <input name="title" type="text" placeholder="Masukkan Judul Bab..." className="w-full h-full bg-transparent px-10 font-bold italic text-brown-dark dark:text-text-accent text-2xl placeholder-brown-dark/20 dark:placeholder-tan-light/20 outline-none" />
                        </div>
                        {lastSaved && (
                            <div className="flex items-center gap-2 text-[#3b2a22] font-semibold mb-2 ml-2">
                                <Save className="w-4 h-4" /> <span>Draft tersimpan otomatis {lastSaved.toLocaleTimeString('id-ID')}</span>
                            </div>
                        )}
                        <div className="w-full flex-1 bg-white/30 dark:bg-brown-dark/30 border-2 border-tan-primary/5 dark:border-brown-mid rounded-3xl overflow-hidden shadow-inner flex flex-col min-h-[500px] group focus-within:ring-4 focus-within:ring-tan-primary/5 transition-all">
                            <textarea name="content" required value={content} onChange={handleContentChange} placeholder="Tuliskan bab pertamamu di sini..." className="w-full h-full flex-1 bg-transparent px-10 py-8 font-medium italic text-brown-dark dark:text-tan-light text-xl placeholder-brown-dark/20 dark:placeholder-tan-light/20 outline-none resize-none leading-relaxed" />
                        </div>
                    </form>
                </div>
            )}
        </>
    );
}