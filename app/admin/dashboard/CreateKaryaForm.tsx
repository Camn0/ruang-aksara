'use client';

import { useState } from 'react';
import { createKarya } from '@/app/actions/admin';
import { useRouter } from 'next/navigation';

interface Genre {
    id: string;
    name: string;
}

export default function CreateKaryaForm({ genres }: { genres: Genre[] }) {
    // Mengapa: Mengelola state loading pada tombol agar user tidak melakukan double-submit
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    // Mengapa: Fungsi pembungkus untuk memanggil Next.js Server Action
    async function handeSubmitAction(formData: FormData) {
        setIsPending(true);
        try {
            // Mengapa: Memanggil fungsi mutasi backend secara langsung (tanpa perlu fetch API manual).
            // Data otentikasi (cookie/session) dikirim otomatis oleh Next.js HTTP request background.
            const result = await createKarya(formData);

            if (result.error) {
                alert(result.error);
            } else {
                alert("Berhasil membuat karya baru!");
                // Mengapa: Menginstruksikan router klien untuk membuang cache halaman ini dan menarik ulang data dari Server
                // sehingga tabel/list Daftar Karya di Server Component akan langsung ter-update.
                router.refresh();
            }
        } catch (err) {
            console.error(err);
            alert("Terjadi kesalahan sistem saat menghubungi server.");
        } finally {
            setIsPending(false);
        }
    }

    return (
        <form action={handeSubmitAction} className="p-6 mb-8 border border-gray-200 rounded-lg bg-gray-50 flex flex-col gap-4 shadow-sm">
            <h2 className="font-semibold text-lg text-gray-800 border-b pb-2 mb-2">Tambah Karya Baru</h2>

            <label className="flex flex-col">
                <span className="mb-1 text-sm font-medium text-gray-700">Judul Karya</span>
                {/* Mengapa: Atribut 'name' WAJIB ada dan presisi karena Server Action memanfaatkan objek FormData */}
                <input
                    name="title"
                    type="text"
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    placeholder="Contoh: Sang Pemimpi"
                />
            </label>

            <label className="flex flex-col">
                <span className="mb-1 text-sm font-medium text-gray-700">Nama Alias Penulis (Nama Pena)</span>
                <input
                    name="penulis_alias"
                    type="text"
                    className="border p-2 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                    required
                    placeholder="Contoh: Andrea Hirata"
                />
            </label>

            <div className="flex flex-col mb-2">
                <span className="mb-2 text-sm font-medium text-gray-700">Pilih Genre (Opsional)</span>
                {genres.length === 0 ? (
                    <p className="text-xs text-red-500 italic">Belum ada genre di database. Hubungi admin.</p>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {genres.map(g => (
                            <label key={g.id} className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                                <input type="checkbox" name="genres" value={g.id} className="rounded text-blue-600 focus:ring-blue-500" />
                                <span>{g.name}</span>
                            </label>
                        ))}
                    </div>
                )}
            </div>

            <button
                type="submit"
                disabled={isPending}
                className="mt-4 bg-blue-600 text-white font-medium py-2 px-4 rounded hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isPending ? 'Menyimpan...' : 'Buat Karya'}
            </button>
        </form>
    );
}
