"use client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { Bookmark, Clock, User } from "lucide-react";
import toast from 'react-hot-toast';

export default function FeedCard({ title, date, excerpt, author, source, feedUrl }: any) {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    const checkBookmark = () => {
      const saved = JSON.parse(localStorage.getItem("bookmarks") || "[]");
      const exist = saved.some((item: any) => item.title === title);
      setIsBookmarked(exist);
    };
    checkBookmark();
    window.addEventListener("storage", checkBookmark);
    return () => window.removeEventListener("storage", checkBookmark);
  }, [title]);

  const toggleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (!feedUrl) {
      alert("Waduh, artikel ini tidak punya URL sumber (feedUrl), tidak bisa disimpan dengan benar.");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    if (isBookmarked) {
      const filtered = saved.filter((item: any) => item.title !== title);
      localStorage.setItem("bookmarks", JSON.stringify(filtered));
      setIsBookmarked(false);

      toast.success("Dihapus dari favorit", {
        icon: '🗑️',
        style: { border: '1px solid #ef444', color: '#ef444'}
      });
    } else {
      // Simpan ke bookmark (PASTIKAN feedUrl ikut disimpan)
      const newBookmark = {
        title,
        date,
        excerpt,
        author,
        source,
        feedUrl
      };
      localStorage.setItem("bookmarks", JSON.stringify([...saved, newBookmark]));
      setIsBookmarked(true);

      // Feedback Simpan
      toast.success("Tersimpan ke favorit", {
        icon: '🔖',
      });
    }

    // Trigger update untuk Sidebar count (jika menggunakan custom event seperti saran sebelumnya)
    window.dispatchEvent(new Event("bookmark-updated"));
  }

  const handleCardClick = (e: React.MouseEvent) => {
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;

    


    setIsRedirecting(true);


    const cleanTitle = title.replace(/\?/g, "");
    // Bersihkan judul dari karakter yang sering merusak URL query (opsional tapi disarankan)
    const safeTitle = encodeURIComponent(cleanTitle);
    const safeUrl = encodeURIComponent(feedUrl);

    // LOGIKA BARU: Cek apakah saat ini kita sedang di halaman "/" murni (Home)
  // atau sedang di kategori (/?url=...)

  // 1. Cek apakah kita di halaman Saved
  const isSavedPage = window.location.pathname === "/saved";

  // 2. Cek apakah kita di halaman Kategori (ada query ?url=)
  const isCategoryPage = window.location.search.includes("url=");

  // 3. Tentukan arah balik (fromParam)
  let fromParam = "";

  if (isSavedPage) {
    fromParam = "&from=saved";

  } else if (!isCategoryPage) {
    fromParam = "&from=home";
  }



    router.push(`/reader/${safeTitle}?url=${safeUrl}${fromParam}`);
  };

  return (
  <article
    onClick={handleCardClick}
    className={`
      group relative flex flex-col gap-6 p-8 cursor-pointer
      /* Background: Gunakan putih bersih di mode terang */
      bg-white dark:bg-[var(--bg-secondary)] mb-8 rounded-[2.5rem] 
      
      /* Border: Pertegas di mode terang (slate-200), buat sangat halus di mode gelap (border-base/50) */
      border border-slate-200/80 dark:border-white/5
      
      /* Shadow: Gunakan layered shadow agar kartu terlihat 'melayang' secara natural */
      shadow-[0_10px_30px_-10px_rgba(0,0,0,0.04),0_20px_40px_-15px_rgba(0,0,0,0.03)]
      
      /* Animasi: Gunakan cubic-bezier agar gerakan hover terasa lebih premium */
      transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]
      
      ${isBookmarked 
        ? "border-blue-500/40 shadow-[0_20px_50px_rgba(59,130,246,0.1)]" 
        : "hover:border-blue-500/40 dark:hover:border-blue-400/20 hover:shadow-[0_30px_60px_-12px_rgba(0,0,0,0.12)]"}
      
      /* Transform: Gerakan angkat yang sedikit lebih halus */
      hover:-translate-y-1.5
      ${isRedirecting ? "opacity-75 cursor-wait" : "opacity-100"}
    `}
  >
    {/* Loading Overlay: Pastikan rounded-nya sinkron dengan kartu utama */}
    {isRedirecting && (
      <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-[2.5rem]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )}

    {/* 1. Top Bar: Source & Date */}
    <div className="flex items-center justify-between relative z-10">
      <div className="flex items-center gap-3">
        {/* Source Badge: Ditambah ring-4 agar terlihat lebih 'deep' di mode terang */}
        <span className="px-4 py-1.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-blue-100 dark:border-blue-500/20 ring-4 ring-white dark:ring-transparent">
          {source || "Source"}
        </span>
        <div className="flex items-center gap-1.5 text-slate-400 dark:text-[var(--text-secondary)]">
          <Clock size={12} />
          <span className="text-[11px] font-bold">
            {new Date(date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
          </span>
        </div>
      </div>

      {isBookmarked && (
      <button 
      onClick={toggleBookmark} // Fungsi hapus satuan langsung di card
      className="group/btn flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-red-500 rounded-full text-white shadow-lg shadow-blue-500/20 transition-all duration-300 animate-in zoom-in cursor-pointer"
    >
      <Bookmark size={10} fill="currentColor" className="group-hover/btn:hidden" />
      <span className="text-[9px] font-black uppercase tracking-tighter group-hover/btn:hidden">Favorit</span>
      
      {/* Tampilan saat Hover: Berubah jadi Hapus */}
      <span className="hidden group-hover/btn:inline text-[9px] font-black uppercase tracking-tighter">Hapus</span>
    </button>

       
      )}
    </div>

    {/* 2. Main Content */}
    <div className="space-y-4 relative z-10 flex-grow">
      <h3 className="text-2xl font-black text-slate-900 dark:text-[var(--text-primary)] leading-[1.25] tracking-tight group-hover:text-blue-600 transition-colors">
<span className="hover:underline decoration-blue-500/30 underline-offset-4 cursor-pointer">
          {title}
        </span>
      </h3>
      
      {/* Excerpt: Ganti opacity dengan warna slate solid agar teks lebih tajam */}
      <p className="text-slate-500 dark:text-[var(--text-secondary)] text-[15px] leading-relaxed font-medium line-clamp-3 cursor-text">
        {excerpt}
      </p>
    </div>

    {/* 3. Footer: Author & Action Hint */}
    <div className="flex items-center justify-between pt-7 border-t border-slate-100 dark:border-white/5 relative z-10">
      <div className="flex items-center gap-3">
        {/* Avatar: Diberi background subtle agar tidak menyatu dengan card putih */}
        <div className="w-10 h-10 rounded-full bg-slate-50 dark:bg-[var(--bg-primary)] flex items-center justify-center text-blue-600 dark:text-[var(--text-secondary)] border border-slate-100 dark:border-transparent dark:bg-gradient-to-b dark:from-white/5 dark:to-transparent shadow-inner">
          <User size={16} strokeWidth={3} />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-black text-slate-800 dark:text-[var(--text-primary)] uppercase tracking-tight">
            {author || 'Anonymous'}
          </span>
          <span className="text-[10px] font-bold text-slate-400 uppercase">Kontributor</span>
        </div>
      </div>

      {/* Action Hint: Memberikan visual feedback bahwa card bisa dieksplorasi */}
      <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600/40 dark:text-white/20 uppercase tracking-[0.2em] group-hover:text-blue-600 group-hover:translate-x-1 transition-all">
        Explore <span className="text-lg leading-none">→</span>
      </div>
    </div>
  </article>
);
}