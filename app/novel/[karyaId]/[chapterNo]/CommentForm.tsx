'use client';

import { useState } from 'react';
import { submitComment } from '@/app/actions/user';
import { useRouter } from 'next/navigation';

export default function CommentForm({ babId, parentId, isReply = false }: { babId: string, parentId?: string, isReply?: boolean }) {
    const [isPending, setIsPending] = useState(false);
    const [isOpen, setIsOpen] = useState(!isReply);
    const router = useRouter();

    async function handleCommentSubmit(formData: FormData) {
        setIsPending(true);
        formData.append('bab_id', babId);
        if (parentId) {
            formData.append('parent_id', parentId);
        }

        try {
            const result = await submitComment(formData);

            if (result.error) {
                alert(result.error);
            } else {
                router.refresh();
                const formId = parentId ? `comment-form-${parentId}` : "comment-form";
                const formElement = document.getElementById(formId) as HTMLFormElement;
                if (formElement) formElement.reset();

                // Tutup form jika ini adalah balasan
                if (isReply) setIsOpen(false);
            }
        } catch (err) {
            console.error(err);
            alert('Terjadi kesalahan. Silakan coba lagi.');
        } finally {
            setIsPending(false);
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 transition shadow-sm bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded"
            >
                Balas Komentar
            </button>
        );
    }

    return (
        <form id={parentId ? `comment-form-${parentId}` : "comment-form"} action={handleCommentSubmit} className={`${isReply ? 'mt-3 border-l-2 border-indigo-300 pl-4 py-2' : 'mt-8 bg-gray-50 p-6 rounded-lg border border-gray-200'}`}>
            {!isReply && <h3 className="font-semibold text-lg mb-4 text-gray-800">Tinggalkan Komentar</h3>}

            <textarea
                name="content"
                className={`w-full border p-3 rounded-md outline-none focus:ring-2 focus:ring-indigo-500 ${isReply ? 'min-h-[60px] text-sm' : 'min-h-[100px]'}`}
                placeholder={isReply ? "Tulis balasan Anda..." : "Tuliskan analisis atau apresiasi Anda di sini..."}
                required
            />

            <div className="flex gap-2 mt-3">
                <button
                    type="submit"
                    disabled={isPending}
                    className={`bg-indigo-600 text-white font-medium px-6 rounded hover:bg-indigo-700 transition disabled:opacity-50 ${isReply ? 'py-1.5 text-xs' : 'py-2'}`}
                >
                    {isPending ? 'Mengirim...' : (isReply ? 'Kirim Balasan' : 'Kirim Komentar')}
                </button>

                {isReply && (
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="bg-gray-200 text-gray-700 font-medium py-1.5 px-4 rounded text-xs hover:bg-gray-300 transition"
                    >
                        Batal
                    </button>
                )}
            </div>
        </form>
    );
}
