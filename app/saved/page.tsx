"use client";
import { useState, useEffect, useMemo } from "react";
import FeedCard from "@/components/feed/FeedCard";
import { Search, Bookmark, Trash2, LayoutGrid } from "lucide-react";

export default function SavedPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [savedArticles, setSavedArticles] = useState<any[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const sync = () => {
      const saved = JSON.parse(localStorage.getItem("bookmarks") || "[]");
      setSavedArticles(saved);
    };
    sync();
    window.addEventListener("storage", sync);
    // Tambahkan interval sync kecil agar UI update jika ada perubahan di tab lain
    const interval = setInterval(sync, 1000);
    return () => {
      window.removeEventListener("storage", sync);
      clearInterval(interval);
    };
  }, []);

  const filteredBookmarks = useMemo(() => {
    return savedArticles
      .filter((item) =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => new Date(b.date || b.pubDate).getTime() - new Date(a.date || a.pubDate).getTime());
  }, [searchTerm, savedArticles]);

  const clearAll = () => {
    if (confirm("Apakah kamu yakin ingin menghapus seluruh koleksi artikel yang disimpan?")) {
      localStorage.setItem("bookmarks", "[]");
      setSavedArticles([]);
      // Trigger event manual agar komponen lain (seperti sidebar) tahu data berubah
      window.dispatchEvent(new Event("storage"));
    }
  };

  const getHostname = (url: string) => {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch (e) {
      return "Saved";
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* HEADER: Disamakan persis dengan Frontpage agar konsisten */}
      <header className="bg-bg-secondary border-b border-border-base/60 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-5xl mx-auto pt-20 pb-12 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20">
                <Bookmark size={12} fill="currentColor" />
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  Your Library
                </span>
              </div>
              <h1 className="text-text-primary text-5xl md:text-6xl font-black tracking-tight leading-[0.9]">
                Saved Articles.
              </h1>
              <p className="text-text-secondary text-lg md:text-xl font-semibold opacity-90">
                Koleksi bacaan yang telah kamu kurasi untuk dibaca nanti.
              </p>
            </div>

            {/* Search Bar: Posisi sama dengan di Home */}
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-blue-500" size={16} />
              <input
                type="text"
                placeholder="Cari di library..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-3 bg-bg-primary text-text-primary border-2 border-border-base/30 rounded-2xl text-sm font-bold outline-none focus:border-blue-500 transition-all"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-8">
        {/* Sub-header untuk Info & Aksi */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-base/50">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-primary">
            {filteredBookmarks.length} Articles Saved
          </h2>
          <div className="flex items-center gap-6">
            {savedArticles.length > 0 && (
              <button
                onClick={clearAll}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 px-4 py-2 rounded-xl transition-all border border-transparent hover:border-red-100 cursor-pointer"
              >
                <Trash2 size={14} /> Clear Library
              </button>
            )}
            <LayoutGrid size={18} className="text-text-secondary opacity-40" />
          </div>
        </div>

        <section className="flex flex-col gap-8 max-w-4xl">
          {filteredBookmarks.length > 0 ? (
            filteredBookmarks.map((item, index) => (
              <FeedCard
                key={`${item.title}-${index}`}
                source={getHostname(item.feedUrl)}
                title={item.title}
                author={item.author || "Reader"}
                date={item.date || item.pubDate}
                excerpt={item.excerpt || item.contentSnippet}
                feedUrl={item.feedUrl}
              />
            ))
          ) : (
            <div className="py-20 text-center bg-bg-secondary rounded-[2.5rem] border-2 border-dashed border-border-base/40">
              <Bookmark className="mx-auto mb-4 opacity-10" size={48} />
              <p className="text-text-secondary font-bold text-lg">
                {searchTerm ? "Artikel tidak ditemukan." : "Library masih kosong."}
              </p>
              <p className="text-text-tertiary text-sm mt-1">
                {searchTerm ? "Coba gunakan kata kunci lain." : "Artikel yang kamu simpan akan muncul di sini."}
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}