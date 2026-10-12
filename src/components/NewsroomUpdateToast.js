"use client";

import { useEffect, useState, useRef } from "react";
import {
  ArrowRight,
  X,
  Radio,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  BookOpen,
  Sparkles,
  RefreshCw,
  Clock
} from "lucide-react";

export default function NewsroomUpdateToast({
  onRefreshEdition,
  onOpenArticle,
  enabled = true
}) {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [dispatches, setDispatches] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(100);

  const initialScrollY = useRef(null);
  const cycleIntervalRef = useRef(null);

  // 1. Fetch real-time dynamic dispatches from /api/newsroom
  useEffect(() => {
    if (!enabled) return;

    let isMounted = true;
    const fetchNewsroom = async () => {
      try {
        const res = await fetch("/api/newsroom");
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && data.hasNewDispatches && data.dispatches?.length > 0) {
          setDispatches(data.dispatches);
          setCurrentIndex(0);
          setIsVisible(true);
          setIsDismissed(false);
          setIsExpanded(false); // Default to single line
          if (typeof window !== "undefined") {
            initialScrollY.current = window.scrollY;
          }
        }
      } catch (err) {
        // Network fallback
      }
    };

    // Trigger after initial delay to simulate live breaking wire arriving
    const timer = setTimeout(fetchNewsroom, 5000);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [enabled]);

  // 2. Dynamic carousel cycling through dispatches every 7 seconds
  useEffect(() => {
    if (!isVisible || isDismissed || isPaused || dispatches.length <= 1) return;

    const intervalTime = 7000;
    const stepTime = 100;
    let elapsed = 0;

    const interval = setInterval(() => {
      elapsed += stepTime;
      const remainingPercent = Math.max(0, 100 - (elapsed / intervalTime) * 100);
      setProgress(remainingPercent);

      if (elapsed >= intervalTime) {
        elapsed = 0;
        setProgress(100);
        setCurrentIndex((prev) => (prev + 1) % dispatches.length);
      }
    }, stepTime);

    cycleIntervalRef.current = interval;
    return () => clearInterval(interval);
  }, [isVisible, isDismissed, isPaused, dispatches.length, currentIndex]);

  // 3. Dismiss on significant scroll (responsive UX)
  useEffect(() => {
    if (!isVisible || isDismissed) return;

    const handleScroll = () => {
      if (initialScrollY.current === null) {
        initialScrollY.current = window.scrollY;
        return;
      }
      if (Math.abs(window.scrollY - initialScrollY.current) > 200) {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isVisible, isDismissed]);

  if (!enabled || !isVisible || isDismissed || dispatches.length === 0) {
    return null;
  }

  const currentDispatch = dispatches[currentIndex] || dispatches[0];

  const handleNext = (e) => {
    e.stopPropagation();
    setProgress(100);
    setCurrentIndex((prev) => (prev + 1) % dispatches.length);
  };

  const handlePrev = (e) => {
    e.stopPropagation();
    setProgress(100);
    setCurrentIndex((prev) => (prev - 1 + dispatches.length) % dispatches.length);
  };

  const handleOpenCurrentDispatch = (e) => {
    e.stopPropagation();
    if (onOpenArticle && currentDispatch) {
      onOpenArticle(currentDispatch);
      setIsVisible(false);
    } else if (onRefreshEdition) {
      onRefreshEdition();
      setIsVisible(false);
    }
  };

  return (
    <aside
      aria-label="Live Newsroom Update"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 left-auto z-40 select-none animate-in slide-in-from-right-4 fade-in duration-300"
    >
      <div className="w-[calc(100vw-1.5rem)] sm:w-[350px] bg-[#EFE8D5] text-[#201E19] border border-[#766E5F] shadow-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] overflow-hidden hover:border-[#9F3028]">
        {/* Top Header Row (Cross-fades smoothly between compact wire ticker and newsroom control bar) */}
        <div className="relative overflow-hidden bg-[#DFD5BC] border-b border-[#766E5F]/20 transition-all duration-300 min-h-[38px] flex items-center">
          {/* 1. Collapsed Header State */}
          <div
            onClick={() => setIsExpanded(true)}
            className={`w-full flex items-center gap-2 sm:gap-2.5 px-3 py-1.5 cursor-pointer transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isExpanded
                ? "opacity-0 -translate-y-4 pointer-events-none absolute inset-0"
                : "opacity-100 translate-y-0"
            }`}
            title="Click to extend live newsroom dispatch"
          >
            {/* Live pulsing red indicator */}
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9F3028] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9F3028]"></span>
            </span>

            {/* Desk Badge */}
            <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-[#201E19] text-[#E8DFC8] px-1.5 py-0.5 shrink-0">
              {currentDispatch.desk || "WIRE"}
            </span>

            {/* Single line headline snippet */}
            <span className="font-serif font-bold text-xs text-[#201E19] truncate flex-1 hover:text-[#9F3028] transition-colors leading-tight">
              {currentDispatch.headline}
            </span>

            {/* Extend button */}
            <div className="flex items-center gap-1 text-[10px] font-mono text-[#9F3028] shrink-0 font-bold ml-1 hover:underline">
              <span className="hidden sm:inline">EXTEND</span>
              <ChevronUp className="w-3.5 h-3.5" />
            </div>

            {/* Dismiss button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
                setIsDismissed(true);
              }}
              className="p-1 text-[#666666] hover:text-[#201E19] hover:bg-[#766E5F]/10 transition-colors shrink-0 cursor-pointer"
              title="Dismiss notification"
            >
              <X className="w-3 h-3" />
            </button>
          </div>

          {/* 2. Expanded Header State */}
          <div
            className={`w-full px-3 py-1.5 flex items-center justify-between text-[10px] font-mono transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              isExpanded
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-4 pointer-events-none absolute inset-0"
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="relative flex h-1.5 w-1.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9F3028] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-[#9F3028]"></span>
              </span>
              <span className="font-bold tracking-wider uppercase text-[#9F3028] text-[9.5px] truncate">
                NEWSROOM UPDATE
              </span>
              <span className="text-[8.5px] bg-[#201E19] text-[#E8DFC8] px-1 py-0.2 font-bold uppercase shrink-0">
                {currentDispatch.desk || "WIRE"}
              </span>
            </div>

            {/* Carousel & Controls */}
            <div className="flex items-center gap-1 shrink-0 ml-1.5">
              {dispatches.length > 1 && (
                <div className="flex items-center gap-0.5 text-[9px] font-mono text-[#39352D]">
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-0.5 hover:bg-[#766E5F]/10 text-[#39352D] cursor-pointer"
                    title="Previous dispatch"
                  >
                    <ChevronLeft className="w-2.5 h-2.5" />
                  </button>
                  <span className="font-bold text-[#201E19]">
                    {currentIndex + 1}/{dispatches.length}
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-0.5 hover:bg-[#766E5F]/10 text-[#39352D] cursor-pointer"
                    title="Next dispatch"
                  >
                    <ChevronRight className="w-2.5 h-2.5" />
                  </button>
                </div>
              )}

              {/* Collapse button */}
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="p-1 text-[#666666] hover:text-[#201E19] hover:bg-[#766E5F]/10 cursor-pointer transition-colors"
                title="Collapse dispatch"
              >
                <ChevronDown className="w-3.5 h-3.5" />
              </button>

              {/* Dismiss */}
              <button
                type="button"
                onClick={() => {
                  setIsVisible(false);
                  setIsDismissed(true);
                }}
                className="p-1 text-[#666666] hover:text-[#201E19] hover:bg-[#766E5F]/10 cursor-pointer transition-colors"
                title="Dismiss notification"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Smooth Expandable Body (CSS Grid 0fr -> 1fr with opacity transition) */}
        <div
          className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
            isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0 pointer-events-none"
          }`}
        >
          <div className="overflow-hidden">
            {/* Body Content */}
            <div
              onClick={handleOpenCurrentDispatch}
              className="p-3 cursor-pointer hover:bg-[#F4EFE5] transition-colors group"
            >
              <div className="flex items-center justify-between text-[9px] font-mono text-[#666666] mb-1">
                <span className="flex items-center gap-1 font-semibold text-[#9F3028]">
                  <Radio className="w-2.5 h-2.5 animate-pulse" />
                  <span>{currentDispatch.time || "JUST NOW"}</span>
                </span>
                <span className="truncate max-w-[130px] text-[#777777]">
                  {currentDispatch.bureau || "PRESS WIRE"}
                </span>
              </div>

              <h4 className="font-serif font-bold text-xs text-[#201E19] leading-snug mb-1 hover:text-[#9F3028] transition-colors line-clamp-2">
                {currentDispatch.headline}
              </h4>

              <p className="font-serif text-[10.5px] text-[#39352D] line-clamp-2 leading-relaxed">
                {currentDispatch.deck ||
                  "Updated dispatch just received from editorial bureau."}
              </p>

              {/* Action Button Strip */}
              <div className="mt-2 pt-1.5 border-t border-[#766E5F]/15 flex items-center justify-between text-[10px] font-mono">
                <div className="inline-flex items-center gap-1 font-bold text-[#9F3028] group-hover:underline uppercase tracking-wider text-[10px]">
                  <span>READ DISPATCH</span>
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                </div>

                <span className="text-[9px] text-[#777777]">
                  {currentDispatch.readTime || "3 MIN"}
                </span>
              </div>
            </div>

            {/* Dynamic Animated Progress Bar */}
            <div className="h-[2px] w-full bg-[#766E5F]/10 overflow-hidden">
              <div
                className="h-full bg-[#9F3028] transition-all ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
