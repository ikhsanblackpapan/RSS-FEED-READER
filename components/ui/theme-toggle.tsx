"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mencegah hydration error
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="p-2 w-9 h-9" />;

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-lg cursor-pointer transition-all duration-300 
        /* Mode Light: Background abu terang, icon slate gelap */
        bg-slate-100 text-slate-600 hover:bg-slate-200 
        /* Mode Dark: Background biru gelap transparan, icon kuning matahari */
        dark:bg-slate-800 dark:text-yellow-400 dark:hover:bg-slate-700"
      aria-label="Toggle Theme"
    >
      {theme === "dark" ? (
        <Sun size={18} strokeWidth={2.5} />
      ) : (
        <Moon size={18} strokeWidth={2.5} />
      )}
    </button>
  );
}