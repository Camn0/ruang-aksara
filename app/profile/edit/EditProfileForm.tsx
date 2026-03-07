'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from './actions'
import { Save } from 'lucide-react'

export default function EditProfileForm({ initialData }: { initialData: { display_name: string; avatar_url: string | null } }) {
    const [name, setName] = useState(initialData.display_name);
    const [avatarUrl, setAvatarUrl] = useState(initialData.avatar_url || '');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await updateProfile({ display_name: name, avatar_url: avatarUrl });
            router.back();
            router.refresh();
        } catch (err: any) {
            setError(err.message || 'Terjadi kesalahan');
        } finally {
            setLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">Nama Tampilan</label>
                <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                    required
                />
                <p className="text-[10px] text-gray-500 mt-2">Nama ini akan dlihat oleh publik di halaman Anda dan pada tiap komentar yang Anda buat.</p>
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">URL Foto Profil (Opsional)</label>
                <input
                    type="url"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-shadow"
                />
                <p className="text-[10px] text-gray-500 mt-2">Masukkan tautan gambar. Kosongkan untuk menggunakan avatar bawaan.</p>
            </div>

            {error && <p className="text-red-500 text-xs font-medium">{error}</p>}

            <button
                type="submit"
                disabled={loading || !name.trim()}
                className="w-full py-3.5 bg-indigo-600 text-white rounded-full font-bold text-sm shadow-xl shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
                <Save className="w-4 h-4" />
                {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
            </button>
        </form>
    );
}
