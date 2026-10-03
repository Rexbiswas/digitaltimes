"use client";

import { useState, useEffect } from "react";
import { mastheadData, marketTickers } from "@/data/newspaperData";
import { Printer, Bookmark, Search, Volume2, Sparkles, Sliders } from "lucide-react";

export default function Masthead({
  onOpenDashboard,
  onOpenSearch,
  onOpenClippings,
  clippingCount,
  onToggleTheme,
  currentTheme,
  typeScale,
  onCycleTypeScale,
  onPrintBroadsheet,
  onAudioEdition,
}) {
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");
      setCurrentTime(`${hh}:${mm}:${ss}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <div className="sticky top-0 z-40 w-full bg-[#F2EEE5]/98 backdrop-blur-md border-b border-[#1A1A1A] select-none shadow-xs">
        <div className="max-w-[1400px] mx-auto px-3 sm:px-6 py-1.5 sm:py-2">
          <div className="flex items-center justify-between text-[10px] sm:text-[11px] font-mono tracking-wider text-[#555555] gap-2">
            {/* Left Ear: Weather & Edition (Responsive) */}
            <div className="flex items-center space-x-1.5 sm:space-x-3 shrink-0 sm:shrink min-w-0">
              <span className="font-bold text-[#111111] shrink-0">
                <span className="sm:hidden">ED. № 001</span>
                <span className="hidden sm:inline">EDITION № 001</span>
              </span>
              <span>•</span>
              <span className="truncate max-w-[120px] xs:max-w-[190px] sm:max-w-[280px] lg:max-w-none text-[#444444]">
                {mastheadData.weather}
              </span>
            </div>

            {/* Right Ear: Live Clock, Clippings, Print */}
            <div className="flex items-center space-x-2 sm:space-x-4 shrink-0 text-[10px] sm:text-[11px]">
              {onOpenDashboard && (
                <>
                  <button
                    onClick={onOpenDashboard}
                    className="hover:text-[#A71919] font-bold flex items-center gap-1 sm:gap-1.5 cursor-pointer transition-colors text-[#111111] bg-[#111111]/5 px-1.5 sm:px-2 py-0.5 rounded shadow-2xs"
                    title="Switch to Your Times Personal Dashboard"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span suppressHydrationWarning className="font-mono text-[10px] sm:text-xs">
                      {currentTime || "12:00:00"}
                    </span>
                  </button>
                  <span className="text-[#1A1A1A]/30">|</span>
                </>
              )}

              <button
                onClick={onOpenClippings}
                className="hover:text-[#111111] flex items-center gap-1 cursor-pointer transition-colors relative"
                title="View Saved Newspaper Clippings"
                data-cursor="CLIPPINGS"
              >
                <Bookmark className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clippings</span>
                {clippingCount > 0 && (
                  <span className="bg-[#A71919] text-[#F2EEE5] text-[9px] font-bold px-1 rounded-full">
                    {clippingCount}
                  </span>
                )}
              </button>

              <span className="text-[#1A1A1A]/30 hidden sm:inline">|</span>

              <button
                onClick={onPrintBroadsheet}
                className="hover:text-[#111111] hidden sm:flex items-center gap-1 cursor-pointer transition-colors no-print"
                title="Print Physical Broadsheet Replica"
                data-cursor="PRINT"
              >
                <Printer className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Broadsheet Masthead Header */}
      <header className="w-full pt-2 sm:pt-4 pb-2 border-b border-[#1A1A1A] select-none">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
          {/* The Grand Masthead (Responsive for Mobile) */}
          <div className="py-2 sm:py-4 md:py-6 text-center relative">
            {/* Subtle Vintage Floral / Heraldic Motif */}
            <div className="flex items-center justify-center gap-2 sm:gap-3 mb-1 sm:mb-2 opacity-85">
              <span className="h-[1px] w-6 sm:w-16 md:w-24 bg-[#1A1A1A]" />
              <span className="text-[8px] sm:text-[10px] tracking-[0.15em] sm:tracking-[0.25em] font-mono uppercase text-[#444444]">
                {mastheadData.established}
              </span>
              <span className="h-[1px] w-6 sm:w-16 md:w-24 bg-[#1A1A1A]" />
            </div>

            <h1
              className="font-masthead font-normal tracking-normal text-[#111111] text-3xl sm:text-5xl md:text-7xl lg:text-8xl xl:text-[7.2rem] leading-none sm:leading-[0.92] select-text hover:opacity-95 transition-opacity"
              data-cursor="MASTHEAD"
            >
              The Digital Times
            </h1>

            <p className="mt-1.5 sm:mt-3 text-[9px] sm:text-xs md:text-sm lg:text-base tracking-[0.2em] sm:tracking-[0.35em] uppercase font-serif text-[#333333] font-semibold">
              {mastheadData.subname}
            </p>
          </div>

          {/* Oxford Rule Lower */}
          <div className="rule-oxford my-1.5 sm:my-2" />

          {/* Dateline, Volume, City Bureau Bar (Responsive) */}
          <div className="flex flex-col sm:flex-row items-center justify-between text-[10px] sm:text-xs font-mono font-semibold tracking-wider text-[#111111] py-1 border-b border-[#1A1A1A] gap-1 sm:gap-0">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <span>{mastheadData.date}</span>
              <span>•</span>
              <span className="text-[#A71919] font-bold">{mastheadData.vol}</span>
            </div>

            <div className="hidden lg:block text-[11px] text-[#555555] italic font-serif">
              “The truth is not merely reported; it is investigated, verified, and etched into memory.”
            </div>

            <div className="flex items-center space-x-2 sm:space-x-3">
              <span className="tracking-widest font-bold">{mastheadData.cityEdition}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-[10px] text-[#555555] hidden sm:inline">{mastheadData.price}</span>
            </div>
          </div>

        {/* Financial Wire Market Ticker (Enhanced Wall Street Broadsheet Press Tape) */}
        <div className="hidden md:flex items-center justify-between py-1.5 px-2 border-b border-[#1A1A1A]/30 text-[10px] font-mono text-[#333333] overflow-hidden whitespace-nowrap gap-4 bg-[#ECE6D8]/60 no-scrollbar select-none">
          {/* Market Badge & Status */}
          <div className="flex items-center gap-2 pr-3 border-r border-[#1A1A1A]/30 shrink-0">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#1d6b2c] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#1d6b2c]"></span>
            </span>
            <span className="font-bold text-[#111111] tracking-widest text-[9px] uppercase bg-[#111111] text-[#F2EEE5] px-1.5 py-0.5">
              COMPUTE WIRE
            </span>
            <span className="text-[9px] text-[#555555] font-bold tracking-wider hidden lg:inline">
              MARKETS ACTIVE
            </span>
          </div>

          {/* Scrolling / Flex Tickers with Clean Formatting */}
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between gap-6 overflow-x-auto no-scrollbar scrollbar-none py-0.5">
              {marketTickers.map((ticker) => (
                <a
                  key={ticker.symbol}
                  href="#business"
                  className="flex items-center gap-1.5 px-2 py-0.5 rounded hover:bg-[#111111]/10 transition-colors cursor-pointer shrink-0"
                  title={`View ${ticker.symbol} analytics in Business Desk`}
                  data-cursor="MARKETS"
                >
                  <span className="font-bold text-[#111111]">{ticker.symbol}</span>
                  <span className="text-[#333333] font-semibold">{ticker.value}</span>
                  <span
                    className={`text-[9px] font-bold px-1 py-0.2 ${
                      ticker.up
                        ? "text-[#1d6b2c] bg-[#1d6b2c]/10"
                        : "text-[#A71919] bg-[#A71919]/10"
                    }`}
                  >
                    {ticker.change}
                  </span>
                </a>
              ))}
            </div>
          </div>

          {/* Sync Timestamp */}
          <div className="pl-3 border-l border-[#1A1A1A]/30 text-[#666666] text-[9px] font-mono shrink-0 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1A1A1A]/40"></span>
            <span>22:42 IST SYNC</span>
          </div>
        </div>
      </div>
    </header>
  </>
);
}
