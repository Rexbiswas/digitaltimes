"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, Check, X, Sparkles } from "lucide-react";

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const DAYS_HEADER = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export default function CalendarDateSelector({
  selectedDate = null,
  onSelectDate,
  availableDates = [],
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse currently selected date or default to latest available edition or current month
  const getInitialYearMonth = () => {
    if (selectedDate && typeof selectedDate === "string") {
      const parts = selectedDate.split("-");
      if (parts && parts.length === 3) {
        return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1 };
      }
    }
    if (availableDates && availableDates.length > 0) {
      const parts = availableDates[0].split("-");
      if (parts && parts.length === 3) {
        return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1 };
      }
    }
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  };

  const [{ year, month }, setViewingMonth] = useState(getInitialYearMonth);

  // Close popup when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  const prevMonth = (e) => {
    e.stopPropagation();
    setViewingMonth((prev) => {
      if (prev.month === 0) {
        return { year: prev.year - 1, month: 11 };
      }
      return { year: prev.year, month: prev.month - 1 };
    });
  };

  const nextMonth = (e) => {
    e.stopPropagation();
    setViewingMonth((prev) => {
      if (prev.month === 11) {
        return { year: prev.year + 1, month: 0 };
      }
      return { year: prev.year, month: prev.month + 1 };
    });
  };

  // Days calculations
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const handleDayClick = (day) => {
    const formattedMonth = String(month + 1).padStart(2, "0");
    const formattedDay = String(day).padStart(2, "0");
    const dateStr = `${year}-${formattedMonth}-${formattedDay}`;
    onSelectDate?.(dateStr);
    setIsOpen(false);
  };

  // Format label for button: indicates UPDATED NEWS by default
  const dateInfo = (() => {
    if (!selectedDate || typeof selectedDate !== "string" || selectedDate === "latest") {
      return { isLive: true, label: "UPDATED NEWS" };
    }
    const parts = selectedDate.split("-");
    if (parts && parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const mShort = MONTH_NAMES[m]?.slice(0, 3) || "OCT";
      return { isLive: false, label: `${mShort} ${d}, ${y}` };
    }
    return { isLive: false, label: selectedDate };
  })();

  return (
    <div className={`relative inline-block text-left select-none ${className}`} ref={containerRef}>
      {/* Trigger Button: Shows selected date with Calendar icon */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 sm:gap-2 bg-[#EFE8D5] hover:bg-[#EFEAE0] border border-[#766E5F]/20 hover:border-[#766E5F] text-[#201E19] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all shadow-xs cursor-pointer active:scale-98 whitespace-nowrap"
        title={`Selected Date: ${dateInfo.label} (Click to change)`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Calendar className="w-3.5 h-3.5 text-[#9F3028] shrink-0" />
        <span className="uppercase tracking-wider">
          {dateInfo.isLive ? (
            <span className="inline-flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span>UPDATED NEWS</span>
            </span>
          ) : (
            dateInfo.label
          )}
        </span>
        <ChevronDown
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#666666] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Interactive Calendar Popover */}
      {isOpen && (
        <div className="absolute -left-12 sm:left-0 mt-2 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-[#EFE8D5] border-2 border-[#766E5F] rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#766E5F]/15 pb-2.5 mb-3">
            <div>
              <span className="block text-[9px] font-mono uppercase tracking-widest text-[#777777] font-bold">
                BROADSHEET ARCHIVES
              </span>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#201E19] leading-tight">
                {MONTH_NAMES[month]} {year}
              </h4>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 hover:bg-[#766E5F]/10 rounded-lg text-[#201E19] transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 hover:bg-[#766E5F]/10 rounded-lg text-[#201E19] transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-mono font-bold text-[#888888] mb-1">
            {DAYS_HEADER.map((d) => (
              <span key={d} className="py-0.5">
                {d}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots before first day */}
            {Array.from({ length: firstDayOfWeek }).map((_, idx) => (
              <span key={`empty-${idx}`} className="h-8 w-8" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: totalDaysInMonth }).map((_, idx) => {
              const dayNum = idx + 1;
              const formattedM = String(month + 1).padStart(2, "0");
              const formattedD = String(dayNum).padStart(2, "0");
              const currentCellDate = `${year}-${formattedM}-${formattedD}`;

              const isSelected = selectedDate === currentCellDate;
              const hasNews = availableDates.includes(currentCellDate);
              const isToday = currentCellDate === "2026-10-05";

              return (
                <button
                  key={currentCellDate}
                  type="button"
                  onClick={() => handleDayClick(dayNum)}
                  className={`h-8 w-8 mx-auto flex flex-col items-center justify-center rounded-lg text-xs font-mono transition-all relative cursor-pointer ${
                    isSelected
                      ? "bg-[#201E19] text-[#E8DFC8] font-bold shadow-sm"
                      : isToday
                      ? "border border-[#9F3028] font-bold text-[#9F3028] hover:bg-[#9F3028]/10"
                      : hasNews
                      ? "font-bold text-[#201E19] hover:bg-[#766E5F]/10"
                      : "text-[#888888] hover:bg-[#766E5F]/5 hover:text-[#201E19]"
                  }`}
                  title={`${MONTH_NAMES[month]} ${dayNum}, ${year}${
                    hasNews ? " (Stories Published)" : ""
                  }`}
                >
                  <span className="leading-none">{dayNum}</span>
                  {/* Indicator dot if stories exist on this date */}
                  {hasNews && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-[#9F3028] mt-0.5" />
                  )}
                  {isSelected && (
                    <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Edition Presets */}
          <div className="mt-3.5 pt-2.5 border-t border-[#766E5F]/15 flex flex-col gap-1.5">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#777777] font-semibold">
              QUICK DISPATCH EDITIONS:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => {
                  onSelectDate?.(null);
                  setIsOpen(false);
                }}
                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer font-bold ${
                  !selectedDate || selectedDate === "latest"
                    ? "bg-[#201E19] text-[#E8DFC8] border-[#766E5F]"
                    : "bg-[#EFEAE0] hover:bg-[#D7CCB2] border-[#766E5F]/20 text-[#222222]"
                }`}
              >
                ● Live Updated News
              </button>

              {availableDates.slice(0, 4).map((d) => {
                const parts = d.split("-");
                if (parts.length !== 3) return null;
                const mIdx = parseInt(parts[1], 10) - 1;
                const dayNum = parseInt(parts[2], 10);
                const shortLabel = `${MONTH_NAMES[mIdx]?.slice(0, 3) || "ED"} ${dayNum} Archive`;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => {
                      onSelectDate?.(d);
                      setViewingMonth({ year: parseInt(parts[0], 10), month: mIdx });
                      setIsOpen(false);
                    }}
                    className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                      selectedDate === d
                        ? "bg-[#201E19] text-[#E8DFC8] border-[#766E5F] font-bold"
                        : "bg-[#EFEAE0] hover:bg-[#D7CCB2] border-[#766E5F]/20 text-[#222222]"
                    }`}
                  >
                    {shortLabel}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
