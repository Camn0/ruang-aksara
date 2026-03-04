'use client';

import { useState } from 'react';
import { editBab } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

export default function EditBabForm({ babId, initialContent }: { babId: string, initialContent: string }) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();

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
                className="px-4 py-2 border border-gray-200 text-gray-700 rounded bg-white hover:bg-gray-50 font-medium transition"
            >
                Edit Konten
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="w-full mt-4 bg-white p-4 rounded border border-gray-200 shadow-sm relative z-10">
            <h4 className="font-bold text-gray-800 mb-2">Edit Bab</h4>

            <textarea
                name="content"
                required
                defaultValue={initialContent}
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2"
            ></textarea>

            <div className="flex gap-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="bg-indigo-600 text-white font-medium py-1.5 px-4 rounded hover:bg-indigo-700 transition disabled:opacity-50"
                >
                    {isPending ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    disabled={isPending}
                    className="bg-gray-200 text-gray-700 font-medium py-1.5 px-4 rounded hover:bg-gray-300 transition"
                >
                    Batal
                </button>
            </div>
        </form>
    );
}
