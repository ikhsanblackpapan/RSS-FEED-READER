"use client";
import { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";

export default function OfflineNotice() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);

    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);

    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-bounce">
      <div className="bg-red-500 text-white px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 font-bold text-sm">
        <WifiOff size={16} />
        Kamu sedang offline
      </div>
    </div>
  );
}