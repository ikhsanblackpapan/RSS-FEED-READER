'use client';

export default function Error({ reset }: { reset: () => void}) {
    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center gap-4 p-6">
            <h2 className="text-2xl font-bold">Aduh! Gagal memuat artikel</h2>
            <p className="text-text-secondary text-center max-w-sm">
                Terjadi kesalahan saat mengambil konten. pastikan koneksi internet kamu stabil.
            </p>
            <button
            onClick={() => reset()}
            className="px-6 py-2 bg-accent text-white rounded-full hover:scale-105 transition-transform"
            >
                Coba Lagi
            </button>
        </div>
    );
}