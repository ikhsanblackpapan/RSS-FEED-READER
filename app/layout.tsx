import { Suspense } from "react"; // Tambahkan ini
import Sidebar from "@/components/sidebar/Sidebar";
import "./globals.css";
import { Metadata } from "next";
import { ThemeProvider } from 'next-themes'
import OfflineNotice from "@/components/ui/OfflineNotice";
import NextTopLoader from "nextjs-toploader";
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: "Modern RSS Reader | Stay Updated",
  description: "Aplikasi RSS Reader pribadi untuk memantau berita teknologi terbaru.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="font-sans bg-white dark:bg-[#0f1115] text-slate-900 dark:text-slate-100 min-h-screen">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <div className="flex min-h-screen bg-bg-primary">
            
            {/* Sidebar dibungkus Suspense agar build Vercel tidak error */}
            <Suspense fallback={<div className="w-[280px] h-screen bg-bg-secondary border-r border-border-base/50 hidden md:block" />}>
              <Sidebar />
            </Suspense>

            <NextTopLoader
              color="#3b82f6"
              initialPosition={0.00}
              crawlSpeed={200}
              height={3}
              showSpinner={false}
              easing="ease"
              speed={200}
              shadow="0 0 10px #3b82f6,0 0 5px #3b82f6"
            />

            <main className="flex-1 overflow-y-auto">
              {children}
              <Toaster position="bottom-right"
                toastOptions={{
                  duration: 1000,
                  style: {
                    background: '#333',
                    color: '#fff',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 'bold',
                  },
                  success: {
                    iconTheme: {
                      primary: '#3b82f6',
                      secondary: '#fff',
                    },
                  },
                }}
              />
            </main>
          </div>
          <OfflineNotice />
        </ThemeProvider>
      </body>
    </html>
  );
}