"use client";
import { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";

export default function SystemStatus() {
    const [isOnline, setIsOnline] = useState(true);

    useEffect(() => {
        // 1. Set status awal saat komponen dimuat
        setIsOnline(navigator.onLine);

        // 2. Buat fungsi handler untuk event online/offline
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // 3. Tambahkan event listener ke browser
        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        // 4. Bersihkan listener saat komponen tidak digunakan
        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };

    }, []);

    return (
        <div className={`flex items-center justify-between p-4 rounded-2xl border transition-all duration-300 ${
            isOnline
                ? "bg-bg-primary border-border-base/50 shadow-inner"
                : "bg-red-500/10 border-red-500/20 shadow-none"
        }`}>
            <div className="flex items-center gap-3">
                <div className="relative flex h-2 w-2">
                    {isOnline ? (
                       // Indikator Hijau (Online)
                        <>
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-40"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </>
                    ) : (
                        // Indikator Merah (Offline)
                        <>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                        </>
                    )}
                </div>
                <span className={`text-[10px] font-black uppercase tracking-[0.15em] ${
                    isOnline ? "text-text-secondary" : "text-red-500"
                }`}>
                    {isOnline ? "System Online" : "System Offline"}
                </span>
            </div>

            {/* Icon Wifi yang berubah */}

            {isOnline ? (
                <Wifi size={14} className="text-text-secondary opacity-70" />
            ) : (
                <WifiOff size={14} className="text-red-500 opacity-70" />
            )}
            </div>
    );
}