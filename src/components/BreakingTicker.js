"use client";

import { breakingHeadlines } from "@/data/newspaperData";
import { Radio } from "lucide-react";

export default function BreakingTicker({ onSelectStory }) {
  // Double array for seamless loop
  const tickerItems = [...breakingHeadlines, ...breakingHeadlines];

  return (
    <div className="w-full bg-[#ECE6D8] border-b border-[#1A1A1A] py-1.5 select-none overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center">
        {/* Left Breaking Badge */}
        <div className="flex items-center gap-2 pr-4 border-r border-[#1A1A1A] z-10 shrink-0 bg-[#ECE6D8]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#A71919] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#A71919]"></span>
          </span>
          <span className="font-mono text-[11px] font-black tracking-widest text-[#A71919] uppercase">
            BREAKING
          </span>
          <span className="text-[10px] text-[#555555] font-mono hidden md:inline">
            [PRESS TELETYPE]
          </span>
        </div>

        {/* Scrolling Ticker Line */}
        <div className="overflow-hidden whitespace-nowrap pl-4 flex-1">
          <div className="animate-ticker flex items-center gap-8 text-[11px] sm:text-[12px] font-mono text-[#111111] tracking-wide">
            {tickerItems.map((headline, idx) => (
              <span
                key={idx}
                onClick={() => onSelectStory(headline)}
                className="hover:underline hover:text-[#A71919] cursor-pointer inline-flex items-center gap-2.5 transition-colors"
                data-cursor="DISPATCH"
              >
                <span className="text-[#A71919] text-xs">●</span>
                <span className="font-semibold">{headline}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
