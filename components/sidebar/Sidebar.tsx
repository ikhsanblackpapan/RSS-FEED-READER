"use client";
import feedsData from "@/data/sample-feeds.json";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation"; 
import { useState, useMemo, useEffect, useRef } from "react";
import { Home as HomeIcon, Search, Rss, Plus, Trash2, Bookmark, Menu, X } from "lucide-react"; 
import { ThemeToggle } from "../ui/theme-toggle";
import SystemStatus from "./SystemStatus";
import toast from 'react-hot-toast';

function FaviconWithFallback({ url, title, isActive }: { url: string; title: string; isActive: boolean }) {
  const [error, setError] = useState(false);
  if (error || !url) {
    return (
      <span className={`text-[10px] font-black ${isActive ? "text-blue-500" : "text-text-secondary"}`}>
        {title.charAt(0).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={url}
      alt=""
      className="w-4 h-4 object-contain"
      onError={() => setError(true)}
    />
  );
}

export default function Sidebar() {
  const formRef = useRef<HTMLFormElement>(null);
  const searchParams = useSearchParams();
  const pathname = usePathname(); 
  const currentUrl = searchParams.get("url");
  
  const [bookmarkCount, setBookmarkCount] = useState(0);
  const [search, setSearch] = useState("");
  const [customFeeds, setCustomFeeds] = useState<{ name: string; url: string }[]>([]);
  const [newFeedName, setNewFeedName] = useState("");
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [showForm, setShowForm] = useState(false);

  // --- STATE TOGGLE MOBILE ---
  const [isOpen, setIsOpen] = useState(false);
  const closeSidebar = () => setIsOpen(false);


  

  // Sync Bookmark Count
  const updateCount = () => {
    const saved = JSON.parse(localStorage.getItem("bookmarks") || "[]");
    setBookmarkCount(saved.length);
  };

  useEffect(() => {
    updateCount();
    window.addEventListener("storage", updateCount);
    const interval = setInterval(updateCount, 1000);
    return () => {
      window.removeEventListener("storage", updateCount);
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (showForm && formRef.current && !formRef.current.contains(event.target as Node)) {
        setShowForm(false);
        setNewFeedName("");
        setNewFeedUrl("");
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showForm]);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("custom_feeds") || "[]");
    setCustomFeeds(saved);
  }, []);

  const handleAddFeed = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedName.trim() || !newFeedUrl.trim()) {
      toast.error("Nama dan URL harus diisi!")
  return;
    }
    
    // ... logika simpan ...
    toast.success(`Chanel "${newFeedName}" berhasil ditambahkan!`); // Feedback berhasil
    setShowForm(false);

    let finalUrl = newFeedUrl.trim();
    if (finalUrl.includes("?url=")) {
      finalUrl = decodeURIComponent(finalUrl.split("?url=").pop() || "");


    }

    const newEntry = { name: newFeedName.trim(), url: finalUrl };
    const updatedFeeds = [...customFeeds, newEntry];
    setCustomFeeds(updatedFeeds);
    localStorage.setItem("custom_feeds", JSON.stringify(updatedFeeds));
    setNewFeedName("");
    setNewFeedUrl("");
    setShowForm(false);
  };

  const deleteFeed = (index: number) => {
    const updated = customFeeds.filter((_, i) => i !== index);
    setCustomFeeds(updated);
    localStorage.setItem("custom_feeds", JSON.stringify(updated));
    const feedName = customFeeds[index].name

    // ... logika hapus ...
    toast.success(`Chanel "${feedName}" telah di hapus`);
  };

  // 3. Feedback saat BATAL (Opsional tapi baik untuk UX)
const handleCancel = () => {
  setShowForm(false);
  toast("Penyimpanan dibatalkan", { icon: 'ℹ️' });
};

  const filteredCategories = useMemo(() => {
    return feedsData.categories
      .map((category) => ({
        ...category,
        feeds: category.feeds.filter((feed) =>
          feed.title.toLowerCase().includes(search.toLowerCase())
        ),
      }))
      .filter((category) => category.feeds.length > 0);
  }, [search]);

  return (
    <>
      {/* 1. Tombol Hamburger (Hanya muncul di mobile) */}
      {!isOpen && (
        <button 
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-[60] p-2.5 bg-blue-600 text-white rounded-xl shadow-lg md:hidden"
        >
          <Menu size={20} strokeWidth={3} />
        </button>
      )}

      {/* 2. Overlay (Muncul saat sidebar terbuka di mobile) */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[50] md:hidden animate-in fade-in duration-300"
          onClick={closeSidebar}
        />
      )}

      {/* 3. Sidebar Container */}
      <aside className={`
        fixed md:sticky top-0 left-0 z-[55] flex flex-col h-screen bg-bg-secondary border-r border-border-base/50 transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0 w-[280px]" : "-translate-x-full w-[280px]"}
        md:translate-x-0 md:w-[280px]
      `}>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-sm font-black tracking-[0.25em] uppercase text-text-primary">
              RSS<span className="text-blue-500">READER</span>
            </h1>
            <div className="flex items-center gap-1">
              <ThemeToggle />
              {/* Tombol Close (Hanya mobile) */}
              <button onClick={closeSidebar} className="md:hidden p-2 text-text-secondary">
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-blue-500 transition-colors" size={14} />
            <input
              type="text"
              placeholder="Cari sumber berita..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-bg-primary text-text-primary border-2 border-border-base/30 rounded-2xl text-sm font-bold outline-none focus:border-blue-500/40 transition-all"
            />
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 space-y-6 custom-scrollbar">
          
          <div className="space-y-1 px-1">
            <Link
              href="/"
              onClick={closeSidebar}
              className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                pathname === "/" && !currentUrl
                  ? "bg-blue-500/10 text-blue-500 font-extrabold"
                  : "text-text-secondary hover:bg-bg-primary"
              }`}
            >
              <HomeIcon size={16} className={pathname === "/" && !currentUrl ? "text-blue-500" : "text-text-tertiary group-hover:text-text-primary"} />
              <span>Home / Frontpage</span>
            </Link>

            <Link
              href="/saved"
              onClick={closeSidebar}
              className={`group flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                pathname === "/saved"
                  ? "bg-blue-500/10 text-blue-500 font-extrabold"
                  : "text-text-secondary hover:bg-bg-primary"
              }`}
            >
              <div className="flex items-center gap-3">
                <Bookmark 
                  size={16} 
                  className={pathname === "/saved" ? "text-blue-500 fill-blue-500/20" : "text-text-tertiary group-hover:text-text-primary"} 
                />
                <span>Saved Articles</span>
              </div>
              {bookmarkCount > 0 && (
                <span className="bg-blue-500 text-white text-[10px] px-2 py-0.5 rounded-full font-black animate-in zoom-in">
                  {bookmarkCount}
                </span>
              )}
            </Link>
          </div>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between px-3">
              <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.25em] opacity-50">
                My Channels
              </h3>
              <button
                onClick={() => setShowForm(!showForm)}
                className="p-1 hover:bg-blue-500/10 text-blue-500 rounded-lg transition-colors border border-transparent hover:border-blue-500/20"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>

            {showForm && (
              <form ref={formRef} onSubmit={handleAddFeed} className="mx-2 p-4 bg-bg-primary rounded-2xl border border-border-base space-y-3 shadow-xl animate-in fade-in zoom-in-95 duration-200">
                <input
                  placeholder="Nama Channel"
                  value={newFeedName}
                  onChange={(e) => setNewFeedName(e.target.value)}
                  className="w-full text-[11px] p-2 bg-transparent border-b border-border-base outline-none focus:border-blue-500 font-bold text-text-primary"
                />
                <input
                  placeholder="URL RSS (Contoh: /feed/)"
                  value={newFeedUrl}
                  onChange={(e) => setNewFeedUrl(e.target.value)}
                  className="w-full text-[11px] p-2 bg-transparent border-b border-border-base outline-none focus:border-blue-500 font-bold text-text-primary"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 bg-bg-secondary text-text-secondary text-[10px] font-black rounded-xl uppercase border border-border-base">Batal</button>
                  <button type="submit" className="flex-1 py-2 bg-blue-500 text-white text-[10px] font-black rounded-xl uppercase">Simpan</button>
                </div>
              </form>
            )}

            <ul className="space-y-1">
              {customFeeds.map((feed, index) => {
                const isActive = currentUrl === feed.url;
                return (
                  <li key={index} className="group flex items-center justify-between pr-2">
                    <Link 
                      href={`/?url=${encodeURIComponent(feed.url)}`} 
                      onClick={closeSidebar}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all flex-1 ${isActive ? "bg-blue-500/10 text-blue-500" : "text-text-secondary hover:bg-bg-primary"}`}
                    >
                      <Rss size={14} strokeWidth={2.5} className={isActive ? "text-blue-500" : "text-text-tertiary opacity-70 group-hover:text-text-primary"} />
                      <span className="truncate">{feed.name}</span>
                    </Link>
                    <button onClick={() => deleteFeed(index)} className="opacity-0 group-hover:opacity-100 p-2 text-text-tertiary hover:text-red-500 transition-all">
                      <Trash2 size={14} />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {filteredCategories.map((category) => (
            <div key={category.name} className="space-y-4 pt-2">
              <div className="flex items-center gap-3 px-3">
                <h3 className="text-[11px] font-black text-text-primary uppercase tracking-[0.25em] opacity-50">{category.name}</h3>
                <div className="flex-1 h-[1px] bg-border-base opacity-10" />
              </div>
              <ul className="space-y-1">
                {category.feeds.map((feed) => {
                  const isActive = currentUrl === feed.feedUrl;
                  const domain = new URL(feed.feedUrl).hostname;
                  const favicon = `https://www.google.com/s2/favicons?sz=64&domain=${domain}`;
                  return (
                    <li key={feed.feedUrl}>
                      <Link 
                        href={`/?url=${encodeURIComponent(feed.feedUrl)}`} 
                        onClick={closeSidebar}
                        className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${isActive ? "bg-blue-500/10 text-blue-500 font-extrabold" : "text-text-secondary font-bold hover:bg-bg-primary"}`}
                      >
                        <div className={`w-6 h-6 rounded-lg flex items-center justify-center bg-white dark:bg-slate-800 border transition-all ${isActive ? "border-blue-500/30 shadow-sm" : "border-border-base/50 grayscale opacity-60 group-hover:grayscale-0"}`}>
                          <FaviconWithFallback url={favicon} title={feed.title} isActive={isActive} />
                        </div>
                        <span className="truncate flex-1">{feed.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        <div className="p-4 mt-auto border-t border-border-base/30">
          <SystemStatus />
        </div>
      </aside>
    </>
  );
}