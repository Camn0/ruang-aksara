'use client';

import { useState, useEffect } from 'react';
import { editBab } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';

export default function EditBabForm({ babId, initialContent }: { babId: string, initialContent: string }) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState(initialContent);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const router = useRouter();
    const draftKey = `draft-edit-bab-${babId}`;

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
            if (result.error) {
                alert(result.error);
            } else {
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

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="px-5 py-3 wobbly-border-sm bg-paper text-ink/40 font-marker text-[9px] uppercase tracking-[0.2em] hover:text-ink-deep hover:rotate-2 transition-all shadow-sm"
            >
                Edit Isi Lembaran
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full mt-6 bg-paper p-6 wobbly-border paper-shadow relative z-20 transition-all rotate-1 hover:rotate-0">
            <div className="flex justify-between items-center mb-4">
                <h4 className="font-journal-title text-xl text-ink-deep italic">Gubah Barisan Kalimat</h4>
                {lastSaved && (
                    <div className="flex items-center gap-2 font-special text-[9px] text-pine uppercase tracking-widest">
                        <Save className="w-3.5 h-3.5" />
                        <span>Draf Tersimpan {lastSaved.toLocaleTimeString('id-ID')}</span>
                    </div>
                )}
            </div>

            <textarea
                name="content"
                required
                value={content}
                onChange={handleContentChange}
                rows={12}
                className="w-full bg-parchment-light wobbly-border-sm border-2 border-transparent focus:border-pine/20 focus:bg-paper focus:outline-none px-6 py-4 font-journal-body text-lg text-ink-deep italic transition-all mb-6"
            ></textarea>

            <div className="flex gap-4">
                <button
                    type="submit"
                    disabled={isPending}
                    className="flex-1 bg-pine text-parchment font-journal-title text-xl italic py-3 wobbly-border-sm hover:bg-pine-light transition-all active:scale-95 disabled:opacity-50"
                >
                    {isPending ? 'Mengukir...' : 'Abadikan Lembaran'}
                </button>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="px-6 bg-ink/5 text-ink/40 font-marker text-[10px] uppercase wobbly-border-sm hover:bg-ink/10 hover:text-ink-deep transition-all"
                >
                    Batal
                </button>
            </div>
        </form>
    );
}
