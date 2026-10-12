"use client";

import { breakingHeadlines } from "@/data/newspaperData";
import { Radio } from "lucide-react";

export default function BreakingTicker({ onSelectStory, headlines }) {
  const activeList =
    Array.isArray(headlines) && headlines.length > 0
      ? headlines
      : breakingHeadlines;
  // Double array for seamless loop
  const tickerItems = [...activeList, ...activeList];

  return (
    <div className="w-full bg-[#DFD5BC] border-b border-[#766E5F] py-1.5 select-none overflow-hidden relative">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center">
        {/* Left Breaking Badge */}
        <div className="flex items-center gap-2 pr-4 border-r border-[#766E5F] z-10 shrink-0 bg-[#DFD5BC]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9F3028] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9F3028]"></span>
          </span>
          <span className="font-mono text-[11px] font-black tracking-widest text-[#9F3028] uppercase">
            BREAKING
          </span>
          <span className="text-[10px] text-[#39352D] font-mono hidden md:inline">
            [PRESS TELETYPE]
          </span>
        </div>

        {/* Scrolling Ticker Line */}
        <div className="overflow-hidden whitespace-nowrap pl-4 flex-1">
          <div className="animate-ticker flex items-center gap-8 text-[11px] sm:text-[12px] font-mono text-[#201E19] tracking-wide">
            {tickerItems.map((headline, idx) => (
              <span
                key={idx}
                onClick={() => onSelectStory(headline)}
                className="hover:underline hover:text-[#9F3028] cursor-pointer inline-flex items-center gap-2.5 transition-colors"
                data-cursor="DISPATCH"
              >
                <span className="text-[#9F3028] text-xs">●</span>
                <span className="font-semibold">{headline}</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
