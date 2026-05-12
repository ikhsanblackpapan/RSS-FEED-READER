"use client";
import { Bookmark } from "lucide-react";
import { useEffect, useState } from "react";
import toast from 'react-hot-toast'; // Import di bagian atas

export default function BookmarkButton({ article }: { article: any }) {
  const [isBookmarked, setIsBookmarked] = useState(false);

  // 1. cek status saat pertama kali load
  useEffect(() => {
    const savedBookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    // CEK berdasarkan link unik artikel
    const exists = savedBookmarks.some((b: any) => b.link === article.link);
    setIsBookmarked(exists);
  }, [article.link]);

  const handleBookmark = () => {
    const savedBookmarks = JSON.parse(localStorage.getItem("bookmarks") || "[]");

    if (isBookmarked) {
      // Hapus bookmark jika sudah ada
      const newList = savedBookmarks.filter((b: any) => b.link !== article.link);
      localStorage.setItem("bookmarks", JSON.stringify(newList));
      setIsBookmarked(false);
      toast.success("Dihapus dari daftar simpan" , {
        icon: '🗑️',
      style: { border: '1px solid #ef4444', color: '#ef4444' }
      });
    } else {
      // Tambahkan bookmark baru jika belum ada
      const newList = [...savedBookmarks, article];
      localStorage.setItem("bookmarks", JSON.stringify(newList));
      setIsBookmarked(true);
      // Logika tambah bookmark
    toast.success("Berhasil disimpan ke Saved Articles!", {
      icon: '🔖',
    });
  }
  };


  return (
    <button onClick={handleBookmark} className={`
    flex items-center justify-center p-2.5 rounded-xl transition-all duration-200
    cursor-pointer
    hover:bg-blue-500/10 hover:scale-110
    active:scale-90
    ${isBookmarked ? "text-blue-500" : "text-text-secondary"}
    `}
    title={isBookmarked ? "Hapus Bookmark" : "Simpan Booknark"}

    >

      <Bookmark size={20}
      strokeWidth={2.5}
      fill={isBookmarked ? "currentColor" : "none"}
      className="transition-all duration-300"
       />
    </button>
  );
}