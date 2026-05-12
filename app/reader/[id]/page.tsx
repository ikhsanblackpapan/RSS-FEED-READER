import ReadingProgress from "@/components/ui/ReadingProgress";
import Link from "next/link";
import { Suspense } from "react";
import Loading from "./loading";
import ArticleContent from "@/components/feed/ArticleContent";
import { Metadata } from "next";
import { ArrowLeft, ExternalLink } from "lucide-react";
import BookmarkButton from "@/components/feed/BookmarkButton";
import { RECOMMENDED_FEEDS } from "@/constants/feeds";

// 1. Metadata tetap async (Next.js akan menangani ini secara terpisah)
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const decodedTitle = decodeURIComponent(id);
  return {
    title: `${decodedTitle} | RSS Reader`,
  };
}

// 2. Fungsi Fetching (Server Side)
async function getFullArticle(title: string, feedUrl: string) {
  try {

    const decodedTargetTitle = decodeURIComponent(title).trim();


    const res = await fetch(
      `http://localhost:3000/api/fetch-rss?url=${encodeURIComponent(feedUrl)}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return null;
    const data = await res.json();
    if (!data.items) return null;

    return data.items.find((item: any) => {
      // Normalisasi sederhana: kecilkan huruf dan hapus spasi berlebih
      const normalize = (str: string) =>
        str
      .toLowerCase()
         .replace(/[^a-z0-9]/g, "") // Ubah multiple spasi jadi satu spasi
           .trim();

      const titleA = normalize(item.title || "");
      const titleB = normalize(decodedTargetTitle);
      // Cek kecocokan persis atau cek apakah slug-nya mirip
      return titleA === titleB;
    });
  } catch (err) {
    console.error("Reader Fetch Error:", err);
    return null;
  }
}

/**
 * 3. KOMPONEN DATA (Dijalankan di dalam Suspense)
 * Komponen ini yang melakukan 'await' berat.
 */
async function ArticleDetails({ id, url }: { id: string; url: string }) {
  const article = await getFullArticle(id, url);

  if (!article) {
    return (
      <div className="py-20 text-center flex flex-col items-center gap-6">
        <div className="w-20 h-20 bg-bg-secondary rounded-full flex items-center justify-center text-4xl opacity-20">?</div>
        <h2 className="text-2xl font-bold">Article not found</h2>
        <Link href="/" className="px-6 py-2 bg-blue-500 text-white rounded-xl">Back to Feed</Link>
      </div>
    );
  }

  const wordCount = article.content?.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200) || 1;
  const formattedDate = new Date(article.pubDate).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="animate-in fade-in duration-700">
      <header className="mb-12 space-y-8">
        <div className="flex flex-wrap items-center gap-3 text-[11px] font-black uppercase tracking-widest">
          <span className="px-2.5 py-1 bg-blue-500/10 text-blue-500 rounded-md">
            {article.creator || article.author || "Contributor"}
          </span>
          <span className="w-1 h-1 rounded-full bg-border-base" />
          <time className="text-text-secondary opacity-70">{formattedDate}</time>
          <span className="text-text-tertiary normal-case font-bold">{readingTime} min read</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-black leading-[1.1] tracking-tight text-text-primary">
          {article.title}
        </h1>
        <div className="w-20 h-1.5 bg-blue-500 rounded-full" />
      </header>

      <section className="prose prose-lg md:prose-xl dark:prose-invert max-w-none">
        <ArticleContent article={article} />
      </section>

      <footer className="mt-20 pt-10 border-t border-border-base/50">
        <div className="bg-bg-secondary p-8 md:p-12 rounded-[2.5rem] border border-border-base flex flex-col items-center text-center gap-6">
          <h3 className="font-black text-xl">Selesai membaca?</h3>
          <a href={article.link} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-4 bg-blue-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/25">
            Read Original Article <ExternalLink size={18} />
          </a>
        </div>
      </footer>

      {/* Bookmark Button khusus Mobile yang butuh data article */}
      <div className="fixed bottom-10 right-10 z-50 md:hidden">
        <BookmarkButton article={article} />
      </div>
    </article>
  );
}

/**
 * 4. HALAMAN UTAMA (Main Frame)
 * Fungsi ini harus cepat merespon navigasi.
 */
export default async function ReaderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ url?: string; from?: string }>;
}) {
  const { id } = await params;
  const { url, from } = await searchParams;

// Tentukan href untuk tombol kembali
let backHref = "/";
if (from === "saved") {
  backHref = "/saved";
} else if ( from === "home") {
  backHref = "/";
} else if (url) {
  backHref = `/?url=${encodeURIComponent(url || "")}`;
}


  return (
    <div className="min-h-screen bg-bg-primary text-text-primary">
      <ReadingProgress />

      {/* Navigasi ini akan muncul INSTAN saat link diklik */}
      <nav className="sticky top-0 z-10 backdrop-blur-xl bg-bg-primary/70 border-b border-border-base/50 px-6 py-4">
        <div className="max-w-3xl mx-auto flex justify-between items-center">
          <Link
          // LOGIKA BARU: 
            // 1. Jika parameter 'from' adalah 'home', balik ke "/"
            // 2. Jika tidak, balik ke URL kategorinya
            href={backHref}
            className="group flex items-center gap-2 text-sm font-bold text-text-secondary hover:text-blue-500 transition-all"
          >
            <ArrowLeft size={18} /> Back to Feed
          </Link>

          {/* BOOKMARK DI SINI AGAR TIDAK HILANG */}
          <Suspense fallback={<div className="w-10 h-10 bg-bg-secondary animate-pulse rounded-xl" />}>
          <BookmarkWrapper id={id} url={url!} />
          </Suspense>


          {/* Kita bisa letakkan placeholder Bookmark di sini jika perlu, 
              tapi karena Bookmark butuh data 'article', kita taruh di dalam ArticleDetails atau buat logic terpisah */}
          <div className="hidden md:block text-[10px] font-black uppercase tracking-widest text-text-tertiary/60">
            Now Reading
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto py-16 md:py-24 px-6">
        {/* Suspense akan menangkap proses await di ArticleDetails 
            dan menampilkan loading.tsx seketika */}
        <Suspense fallback={<Loading />}>
          {url ? (
            <ArticleDetails id={id} url={url} />
          ) : (
            <div className="text-center py-20">URL RSS tidak ditemukan</div>
          )}
        </Suspense>
      </main>
    </div>
  );
}

// Komponen kecil khusus untuk handle bookmark di Navbar
async function BookmarkWrapper({ id , url }: { id: string, url: string}) {
  const article = await getFullArticle(id, url);
  if (!article) return null;
  return <BookmarkButton article={article} />;
}