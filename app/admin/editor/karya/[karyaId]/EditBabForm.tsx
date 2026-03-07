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
                className="px-4 py-2 border border-gray-200 dark:border-slate-700 text-gray-700 dark:text-gray-300 rounded bg-white dark:bg-slate-900 hover:bg-gray-50 dark:hover:bg-slate-800 font-medium transition"
            >
                Edit Konten
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full mt-4 bg-white dark:bg-slate-900 p-4 rounded border border-gray-200 dark:border-slate-800 shadow-sm relative z-10 transition-colors duration-300">
            <div className="flex justify-between items-center mb-2">
                <h4 className="font-bold text-gray-800 dark:text-gray-100">Edit Bab</h4>
                {lastSaved && (
                    <div className="flex items-center gap-1 text-[10px] text-green-600 dark:text-green-500 font-medium">
                        <Save className="w-3 h-3" />
                        <span>Draft tersimpan {lastSaved.toLocaleTimeString('id-ID')}</span>
                    </div>
                )}
            </div>

            <textarea
                name="content"
                required
                value={content}
                onChange={handleContentChange}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400 mb-2 transition-colors"
            ></textarea>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-indigo-600 dark:bg-indigo-500 text-white font-medium py-1.5 px-4 rounded hover:bg-indigo-700 dark:hover:bg-indigo-400 transition disabled:opacity-50"
                >
                    {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="bg-gray-200 dark:bg-slate-800 text-gray-700 dark:text-gray-300 font-medium py-1.5 px-4 rounded hover:bg-gray-300 dark:hover:bg-slate-700 transition"
                >
                    Batal
                </button>
            </div>
        </form>
    );
}
