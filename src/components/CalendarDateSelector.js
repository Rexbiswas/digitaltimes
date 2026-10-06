"use client";

import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronLeft, ChevronRight, ChevronDown, Check, X, Sparkles } from "lucide-react";

const MONTH_NAMES = [
  "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
  "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
];

const DAYS_HEADER = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

export default function CalendarDateSelector({
  selectedDate = "2026-10-05",
  onSelectDate,
  availableDates = [
    "2026-10-05",
    "2026-10-04",
    "2026-10-03",
    "2026-10-02",
    "2026-10-01",
    "2026-09-30",
    "2026-09-29"
  ],
  className = ""
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // Parse currently selected date or default to Oct 2026
  const getInitialYearMonth = () => {
    if (selectedDate && typeof selectedDate === "string") {
      const parts = selectedDate.split("-");
      if (parts && parts.length === 3) {
        return { year: parseInt(parts[0], 10), month: parseInt(parts[1], 10) - 1 };
      }
    }
    return { year: 2026, month: 9 }; // Oct is 9 (0-indexed)
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

  // Format label for button
  const dateInfo = (() => {
    if (!selectedDate || typeof selectedDate !== "string") {
      return { isToday: false, label: "ALL EDITIONS" };
    }
    const parts = selectedDate.split("-");
    if (parts && parts.length === 3) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const mShort = MONTH_NAMES[m]?.slice(0, 3) || "OCT";
      const isToday = selectedDate === "2026-10-05";
      return { isToday, label: `${mShort} ${d}, ${y}` };
    }
    return { isToday: false, label: selectedDate };
  })();

  return (
    <div className={`relative inline-block text-left select-none ${className}`} ref={containerRef}>
      {/* Trigger Button: Shows selected date with Calendar icon */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1 sm:gap-2 bg-[#FAF7F0] hover:bg-[#EFEAE0] border border-[#1A1A1A]/20 hover:border-[#1A1A1A] text-[#111111] px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-mono font-bold transition-all shadow-xs cursor-pointer active:scale-98 whitespace-nowrap"
        title={`Selected Date: ${dateInfo.label} (Click to change)`}
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <Calendar className="w-3.5 h-3.5 text-[#A71919] shrink-0" />
        <span className="hidden md:inline uppercase tracking-wider">
          {dateInfo.isToday && <span>TODAY • </span>}
          {dateInfo.label}
        </span>
        <ChevronDown
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#666666] transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Interactive Calendar Popover */}
      {isOpen && (
        <div className="absolute -left-12 sm:left-0 mt-2 z-50 w-72 sm:w-80 max-w-[calc(100vw-2rem)] bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-2xl shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-150">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-[#1A1A1A]/15 pb-2.5 mb-3">
            <div>
              <span className="block text-[9px] font-mono uppercase tracking-widest text-[#777777] font-bold">
                BROADSHEET ARCHIVES
              </span>
              <h4 className="font-serif font-bold text-sm sm:text-base text-[#111111] leading-tight">
                {MONTH_NAMES[month]} {year}
              </h4>
            </div>

            {/* Month Navigation */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={prevMonth}
                className="p-1 hover:bg-[#1A1A1A]/10 rounded-lg text-[#111111] transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={nextMonth}
                className="p-1 hover:bg-[#1A1A1A]/10 rounded-lg text-[#111111] transition-colors cursor-pointer"
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
                      ? "bg-[#111111] text-[#F2EEE5] font-bold shadow-sm"
                      : isToday
                      ? "border border-[#A71919] font-bold text-[#A71919] hover:bg-[#A71919]/10"
                      : hasNews
                      ? "font-bold text-[#111111] hover:bg-[#1A1A1A]/10"
                      : "text-[#888888] hover:bg-[#1A1A1A]/5 hover:text-[#111111]"
                  }`}
                  title={`${MONTH_NAMES[month]} ${dayNum}, ${year}${
                    hasNews ? " (Stories Published)" : ""
                  }`}
                >
                  <span className="leading-none">{dayNum}</span>
                  {/* Indicator dot if stories exist on this date */}
                  {hasNews && !isSelected && (
                    <span className="w-1 h-1 rounded-full bg-[#A71919] mt-0.5" />
                  )}
                  {isSelected && (
                    <span className="w-1 h-1 rounded-full bg-emerald-400 mt-0.5" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Edition Presets */}
          <div className="mt-3.5 pt-2.5 border-t border-[#1A1A1A]/15 flex flex-col gap-1.5">
            <span className="text-[9px] font-mono uppercase tracking-wider text-[#777777] font-semibold">
              QUICK DISPATCH EDITIONS:
            </span>
            <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono">
              <button
                type="button"
                onClick={() => {
                  onSelectDate?.("2026-10-05");
                  setViewingMonth({ year: 2026, month: 9 });
                  setIsOpen(false);
                }}
                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  selectedDate === "2026-10-05"
                    ? "bg-[#111111] text-[#F2EEE5] border-[#111111]"
                    : "bg-[#EFEAE0] hover:bg-[#E4DDD0] border-[#1A1A1A]/20 text-[#222222]"
                }`}
              >
                Today (Oct 5)
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectDate?.("2026-10-01");
                  setViewingMonth({ year: 2026, month: 9 });
                  setIsOpen(false);
                }}
                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  selectedDate === "2026-10-01"
                    ? "bg-[#111111] text-[#F2EEE5] border-[#111111]"
                    : "bg-[#EFEAE0] hover:bg-[#E4DDD0] border-[#1A1A1A]/20 text-[#222222]"
                }`}
              >
                Oct 1 Edition
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectDate?.("2026-09-30");
                  setViewingMonth({ year: 2026, month: 8 });
                  setIsOpen(false);
                }}
                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  selectedDate === "2026-09-30"
                    ? "bg-[#111111] text-[#F2EEE5] border-[#111111]"
                    : "bg-[#EFEAE0] hover:bg-[#E4DDD0] border-[#1A1A1A]/20 text-[#222222]"
                }`}
              >
                Sep 30 Broadsheet
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectDate?.(null);
                  setIsOpen(false);
                }}
                className={`px-2 py-0.5 rounded border transition-colors cursor-pointer ${
                  !selectedDate
                    ? "bg-[#111111] text-[#F2EEE5] border-[#111111]"
                    : "bg-[#EFEAE0] hover:bg-[#E4DDD0] border-[#1A1A1A]/20 text-[#555555]"
                }`}
              >
                All Dates
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
