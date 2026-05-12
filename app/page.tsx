"use client";
import { useState, useMemo, use, useEffect } from "react";
import { useRouter } from "next/navigation";
import FeedCard from "@/components/feed/FeedCard";
import { Search, LayoutGrid, Flame, Star } from "lucide-react";
import SkeletonReader from "@/components/ui/SkeletonReader";
// Mengambil konstanta dari file yang baru kamu buat
import { RECOMMENDED_FEEDS, DEFAULT_FEED } from "@/constants/feeds";

// 1. Fungsi Fetch Satuan (Sudah ada, tetap dipertahankan)
async function getArticles(feedUrl: string) {
  try {
    const controller = new AbortController();
    const timeoutid = setTimeout(() => controller.abort(), 10000);
    
    let cleanUrl = feedUrl;
    if (feedUrl.includes("url=")) {
      cleanUrl = decodeURIComponent(feedUrl.split("?url=").pop() || "");
    }
    cleanUrl = cleanUrl.replace(/^[?&]+/, "");

    const res = await fetch(`/api/fetch-rss?url=${encodeURIComponent(cleanUrl)}`, {
      next: { revalidate: 3600 },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutid);
    if (!res.ok) throw new Error("Gagal fetch data");

    const data = await res.json();
    return (data.items || []).map((item: any) => ({
      ...item,
      feedUrl: cleanUrl
    }));
  } catch (err: any) {
    console.error("Fetch error:", err);
    return null;
  }
}

// 2. FUNGSI BARU: Fetch Campuran untuk Beranda
async function getMixedArticles(urls: string[]) {
  try {
    // Menjalankan semua fetch secara paralel (lebih cepat)
    const promises = urls.map(url => getArticles(url));
    const results = await Promise.all(promises);
    // Gabungkan semua hasil, filter yang null, dan ratakan (flatten) menjadi satu array
    return results.filter(Boolean).flat();
  } catch (err) {
    console.error("Mixed fetch error:", err);
    return [];
  }
}

function TrendingSection({ articles, feedUrl }: { articles: any[], feedUrl: string }) {
  const router = useRouter();
  const [clickedTitle, setClickedTitle] = useState<string | null>(null);

  const trendingArticles = useMemo(() => {
    return [...articles]
      .filter(a => a.title && a.title.length < 100) 
      .sort(() => 0.5 - Math.random()) 
      .slice(0, 4);
  }, [articles]);

  const handleCardClick = (title: string, itemSpesificUrl: string) => {
    setClickedTitle(title);
    const finalUrl = itemSpesificUrl || feedUrl;

    // Cek apakah saat ini browser sedang menampilkan kategori (ada ?url= di search)
    const isCategoryPage = typeof window !== "undefined" && window.location.search.includes("url=");


    // Jika di kategori, biarkan kosong agar ReaderPage balik ke URL kategori tersebut
    // Jika tidak di kategori, baru beri &from=home

    const fromParam = isCategoryPage ? "" : "&from=home";

    router.push(`/reader/${encodeURIComponent(title)}?url=${encodeURIComponent(finalUrl)}${fromParam}`);
  };

  if (trendingArticles.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-2 mb-6">
        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
        <h2 className="text-sm font-black uppercase tracking-widest text-text-primary">Trending Now</h2>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {trendingArticles.map((item, i) => {
          const isRedirecting = clickedTitle === item.title;
          return (
            <div
              key={i}
              onClick={() => !isRedirecting && handleCardClick(item.title, item.feedUrl)}
              className={`group relative p-5 bg-bg-secondary border border-slate-200 dark:border-white/10 rounded-2xl shadow-sm transition-all duration-300 active:scale-95 hover:border-blue-500/50 hover:shadow-lg ${isRedirecting ? "cursor-wait opacity-80" : "cursor-pointer"}`}
            >
              {isRedirecting && (
                <div className="absolute inset-0 bg-white/40 dark:bg-black/20 backdrop-blur-[1px] z-10 flex items-center justify-center rounded-2xl">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                </div>
              )}
              <span className="text-[10px] font-black text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400 px-2 py-0.5 rounded-full uppercase">
                #{i + 1} Trending
              </span>
              <h3 className="mt-2 font-bold text-sm leading-snug line-clamp-2 group-hover:text-blue-500 transition-colors text-text-primary">
                {item.title}
              </h3>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function Home({ searchParams }: { searchParams: Promise<{ url?: string }> }) {
  const param = use(searchParams);
  const selectedFeed = param.url;

  const [isMounted, setIsMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [articles, setArticles] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [allBookmarks, setAllBookmarks] = useState<any[]>([]);

  useEffect(() => {
    setIsMounted(true);
    const syncBookmarks = () => {
      const saved = JSON.parse(localStorage.getItem("bookmarks") || "[]");
      setAllBookmarks(saved);
    };
    syncBookmarks();
    window.addEventListener("storage", syncBookmarks);
    const interval = setInterval(syncBookmarks, 1000); // Polling lebih santai (1 detik)
    return () => {
      window.removeEventListener("storage", syncBookmarks);
      clearInterval(interval);
    };
  }, []);

  // 3. LOGIKA FETCH YANG DIPERBARUI
  useEffect(() => {
    setIsLoading(true);
    setSearchTerm(""); 

    if (selectedFeed) {
      // Jika di kategori spesifik (misal: Smashing Magazine saja)
      getArticles(selectedFeed).then((data) => {
        if (data) setArticles(data);
        setIsLoading(false);
      });
    } else {
      // JIKA DI BERANDA: Ambil semua dari RECOMMENDED_FEEDS
      getMixedArticles(RECOMMENDED_FEEDS).then((data) => {
        if (data && data.length > 0) {
          // Acak agar urutannya tidak selalu sama sumbernya
          setArticles(data.sort(() => 0.5 - Math.random()));
        }
        setIsLoading(false);
      });
    }
  }, [selectedFeed]);

  const sortedAndFilteredArticles = useMemo(() => {
    let result = [...articles];
    if (searchTerm) {
      result = result.filter((article) =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    // Sort standar profesional: Berdasarkan tanggal terbaru
    return result.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
  }, [searchTerm, articles]);

  const getHostname = (url: string) => {
    try { return new URL(url).hostname.replace("www.", ""); } 
    catch (e) { return 'Discovery'; }
  };

  const selectedFeedName = selectedFeed ? getHostname(selectedFeed) : "Discovery";

  if (!isMounted) return <div className="min-h-screen bg-bg-primary" />;

  return (
    <div className="min-h-screen bg-bg-primary">
      {/* Header Tetap Sama */}
      <header className="bg-bg-secondary border-b border-border-base/60 sticky top-0 z-20 backdrop-blur-md">
        <div className="max-w-5xl mx-auto pt-20 pb-12 px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
            <div className="space-y-4 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full border border-blue-500/20">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                </span>
                <span className="text-[10px] font-bold uppercase tracking-widest">
                  {selectedFeed ? "Live Feed" : "Personalized Feed"}
                </span>
              </div>
              <h1 className="text-text-primary text-5xl md:text-6xl font-black tracking-tight leading-[0.9]">
                {selectedFeed ? "Latest Updates." : "Your Frontpage."}
              </h1>
              <p className="text-text-secondary text-lg md:text-xl font-semibold opacity-90">
                {selectedFeed ? `Insights terbaru dari ${selectedFeedName}.` : "Ringkasan konten favorit dari berbagai sumber."}
              </p>
            </div>

            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary group-focus-within:text-blue-500" size={16} />
              <input
                type="text"
                placeholder="Cari artikel..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-5 py-3 bg-bg-primary text-text-primary border-2 border-border-base/30 rounded-2xl text-sm font-bold outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto py-12 px-8">
        {/* Tampilkan Trending Section hanya jika tidak sedang mencari */}
        {searchTerm === "" && (
          <TrendingSection articles={articles} feedUrl={selectedFeed || DEFAULT_FEED} />
        )}

        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-base/50">
          <h2 className="text-xs font-bold uppercase tracking-widest text-text-primary">
            {isLoading ? "Fetching Articles..." : `${sortedAndFilteredArticles.length} Articles Found`}
          </h2>
          <LayoutGrid size={18} className="text-text-secondary opacity-40" />
        </div>

        <section className="flex flex-col gap-8 max-w-4xl">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => <SkeletonReader key={i} />)
          ) : (
            sortedAndFilteredArticles.map((item, index) => (
              <FeedCard
                key={`${item.title}-${index}`}
                source={getHostname(item.feedUrl || selectedFeed || DEFAULT_FEED)}
                title={item.title}
                author={item.creator || item.author || "Tech Writer"}
                date={item.pubDate}
                excerpt={item.contentSnippet}
                feedUrl={item.feedUrl || selectedFeed || DEFAULT_FEED}
              />
            ))
          )}
        </section>

        {/* Lanjut Membaca Section (Hanya muncul di Beranda tanpa search) */}
        {!selectedFeed && searchTerm === "" && (
          <section className="mt-20">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border-base/50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                  <Star size={16} fill="white" />
                </div>
                <h2 className="text-xl font-black text-text-primary">Lanjut Membaca</h2>
              </div>
            </div>

            {allBookmarks.length > 0 ? (
              <div className="flex flex-col gap-6">
                {allBookmarks.slice(0, 3).map((item, index) => (
                  <FeedCard
                    key={`bookmark-${index}`}
                    source={getHostname(item.feedUrl || "Saved")}
                    title={item.title}
                    author={item.author || "Reader"}
                    date={item.date || item.pubDate}
                    excerpt={item.excerpt || item.contentSnippet}
                    feedUrl={item.feedUrl || ""}
                  />
                ))}
              </div>
            ) : (
              <div className="py-12 px-8 bg-bg-secondary border-2 border-dashed border-border-base rounded-[2rem] text-center">
                <p className="text-text-secondary font-medium">Belum ada artikel yang kamu simpan.</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}