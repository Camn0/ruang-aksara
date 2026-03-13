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
                <button type="button" onClick={() => setIsOpen(true)} className="w-full h-[77px] bg-[#af8f6f] rounded flex items-center justify-center gap-4 hover:bg-[#9c7f62] transition-colors shadow-sm">
                    <Plus className="w-8 h-8 text-[#3b2a22]" strokeWidth={3} />
                    <span className="font-normal text-[#3b2a22] text-[25px]">Tambah Bab Baru</span>
                </button>
            )}

            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-[#f2ead7] overflow-y-auto font-sans flex flex-col items-center pt-14 pb-24 px-6 sm:px-12 animate-in fade-in zoom-in-95 duration-200">
                    <form onSubmit={handleSubmit} className="w-full max-w-[1055px] flex flex-col min-h-full">
                        <div className="flex justify-between items-center mb-8 w-full">
                            <button type="button" onClick={() => setIsOpen(false)} className="hover:scale-105 transition-transform text-[#3b2a22]">
                                <ArrowLeft className="w-12 h-12" strokeWidth={3} />
                            </button>
                            <button type="submit" disabled={isPending} className="w-[180px] h-[54px] bg-[#3b2a22] hover:bg-[#2a1e18] rounded-[8.49px] flex items-center justify-center gap-3 transition-colors active:scale-95 disabled:opacity-50 shadow-md">
                                <span className="font-semibold text-[#f2ead7] text-[29.3px]">{isPending ? 'Proses' : 'Unggah'}</span>
                                {!isPending && <Upload className="w-7 h-7 text-[#f2ead7]" strokeWidth={2.5} />}
                            </button>
                        </div>
                        
                        {message && (
                            <div className={`w-full p-4 mb-6 text-xl font-semibold rounded-lg ${message.type === 'error' ? 'bg-red-500 text-white' : 'bg-green-500 text-white'}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="mb-6 w-full h-[75px] bg-[#3b2a22] rounded-[10px] overflow-hidden shrink-0">
                            <input name="title" type="text" placeholder="Masukkan Judul Bab" className="w-full h-full bg-transparent px-[35px] font-bold text-[#f2ead7] text-[30.1px] placeholder-[#f2ead7]/80 outline-none" />
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