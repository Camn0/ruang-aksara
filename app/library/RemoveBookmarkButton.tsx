'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

// Mengapa: Tombol ✕ kecil di kartu bookmark library.
// Menggunakan API route yang sudah ada (toggle bookmark).
export default function RemoveBookmarkButton({ karyaId, onRemoved }: { karyaId: string, onRemoved?: () => void }) {
    const [removing, setRemoving] = useState(false);

    async function handleRemove(e: React.MouseEvent) {
        e.preventDefault(); // Jangan navigate ke link parent
        e.stopPropagation();

        if (!confirm('Hapus dari perpustakaan?')) return;

        setRemoving(true);
        try {
            const res = await fetch('/api/bookmark', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ karyaId })
            });
            if (res.ok) {
                // Force reload to reflect changes
                window.location.reload();
            }
        } catch {
            alert('Gagal menghapus bookmark.');
        } finally {
            setRemoving(false);
        }
    }

    return (
        <button
            onClick={handleRemove}
            disabled={removing}
            className="absolute top-1.5 right-1.5 z-20 w-6 h-6 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500 active:scale-90"
            title="Hapus dari perpustakaan"
        >
            <X className="w-3.5 h-3.5" />
        </button>
    );
}
