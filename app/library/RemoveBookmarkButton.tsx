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
            className="absolute top-2 right-2 z-20 w-7 h-7 bg-brown-dark/60 backdrop-blur-sm text-text-accent rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-brown-dark active:scale-90 shadow-md border border-white/10"
            title="Hapus dari perpustakaan"
        >
            <X className="w-4 h-4" />
        </button>
    );
}
