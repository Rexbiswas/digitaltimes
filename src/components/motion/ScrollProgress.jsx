"use client";

import { useEffect, useState } from "react";
import { navigationDesks } from "@/data/newspaperData";

export default function ScrollProgress({ activeDesk }) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const current = (window.scrollY / totalHeight) * 100;
        setScrollProgress(Math.min(100, Math.max(0, current)));
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const currentDesk = navigationDesks.find((d) => d.id === activeDesk) || navigationDesks[0];
  const pageIndex = navigationDesks.findIndex((d) => d.id === activeDesk) + 1;

  return (
    <aside
      aria-label="Newspaper reading progress"
      className="fixed bottom-4 left-4 z-40 bg-[#ECE6D8]/95 backdrop-blur-xs border border-[#1A1A1A] px-3 py-1.5 shadow-md select-none hidden sm:flex items-center gap-3 font-mono text-[10px] text-[#111111]"
    >
      {/* Newspaper Page Folio */}
      <div className="flex items-center gap-1.5 font-bold uppercase tracking-wider">
        <span className="text-[#A71919]">PAGE {currentDesk.page}</span>
        <span className="text-[#888888]">/ 10</span>
      </div>

      <span className="text-[#1A1A1A]/30">|</span>

      {/* Desk Folio Name */}
      <span className="font-semibold uppercase tracking-widest text-[#333333] max-w-[130px] truncate">
        {currentDesk.label}
      </span>

      <span className="text-[#1A1A1A]/30">|</span>

      {/* Broadsheet Rule Progress with Ink Pip */}
      <div className="flex items-center gap-2">
        <div className="w-20 h-[3px] bg-[#D4CDBC] relative overflow-hidden">
          <div
            className="h-full bg-[#111111] transition-all duration-75"
            style={{ width: `${scrollProgress}%` }}
          />
        </div>
        <span className="text-[9px] text-[#666666] w-7 text-right">
          {Math.round(scrollProgress)}%
        </span>
      </div>
    </aside>
  );
}
