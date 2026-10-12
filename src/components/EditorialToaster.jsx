"use client";

import React, { useState, useEffect, useRef } from "react";
import { useToast } from "@/context/ToastContext";
import {
  X,
  Radio,
  BookOpen,
  Bookmark,
  Bell,
  Check,
  Info,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react";

function ToastItem({ toastItem, onDismiss, onOpenStory }) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (isPaused || toastItem.duration <= 0) return;

    const intervalMs = 50;
    const totalMs = toastItem.duration;

    const timer = setInterval(() => {
      elapsedRef.current += intervalMs;
      const remaining = Math.max(0, 100 - (elapsedRef.current / totalMs) * 100);
      setProgress(remaining);

      if (elapsedRef.current >= totalMs) {
        clearInterval(timer);
        onDismiss(toastItem.id);
      }
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isPaused, toastItem.duration, toastItem.id, onDismiss]);

  const getTypeStyles = () => {
    switch (toastItem.type) {
      case "breaking":
        return {
          borderAccent: "border-l-[3px] sm:border-l-4 border-l-[#9F3028]",
          badgeBg: "bg-[#9F3028] text-[#E8DFC8]",
          icon: <Radio className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#9F3028] animate-pulse shrink-0" />,
          progressBg: "bg-[#9F3028]",
          titleColor: "text-[#9F3028]",
        };
      case "history":
        return {
          borderAccent: "border-l-[3px] sm:border-l-4 border-l-[#B45309]",
          badgeBg: "bg-[#78350F] text-[#FDE68A]",
          icon: <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#B45309] shrink-0" />,
          progressBg: "bg-[#B45309]",
          titleColor: "text-[#92400E]",
        };
      case "clipping":
        return {
          borderAccent: "border-l-[3px] sm:border-l-4 border-l-[#047857]",
          badgeBg: "bg-[#065F46] text-[#D1FAE5]",
          icon: <Bookmark className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#047857] shrink-0" />,
          progressBg: "bg-[#047857]",
          titleColor: "text-[#065F46]",
        };
      case "notification":
        return {
          borderAccent: "border-l-[3px] sm:border-l-4 border-l-[#1E40AF]",
          badgeBg: "bg-[#1E3A8A] text-[#DBEAFE]",
          icon: <Bell className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#1E40AF] shrink-0" />,
          progressBg: "bg-[#1E40AF]",
          titleColor: "text-[#1E3A8A]",
        };
      case "success":
        return {
          borderAccent: "border-l-[3px] sm:border-l-4 border-l-[#059669]",
          badgeBg: "bg-[#065F46] text-[#D1FAE5]",
          icon: <Check className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#059669] shrink-0" />,
          progressBg: "bg-[#059669]",
          titleColor: "text-[#065F46]",
        };
      default:
        return {
          borderAccent: "border-l-[3px] sm:border-l-4 border-l-[#766E5F]",
          badgeBg: "bg-[#201E19] text-[#E8DFC8]",
          icon: <Info className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#201E19] shrink-0" />,
          progressBg: "bg-[#201E19]",
          titleColor: "text-[#201E19]",
        };
    }
  };

  const styles = getTypeStyles();

  const handleCardClick = (e) => {
    if (toastItem.onAction) {
      toastItem.onAction(toastItem.story);
      onDismiss(toastItem.id);
    } else if (toastItem.story && onOpenStory) {
      onOpenStory(toastItem.story);
      onDismiss(toastItem.id);
    }
  };

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onClick={handleCardClick}
      className={`group w-[250px] sm:w-[340px] md:w-[360px] max-w-[calc(100vw-24px)] bg-[#EFE8D5] text-[#201E19] border border-[#766E5F] shadow-xl sm:shadow-2xl transition-all duration-300 ease-out select-none hover:shadow-2xl hover:border-[#766E5F] relative overflow-hidden cursor-pointer ${styles.borderAccent}`}
    >
      {/* Top Header Strip */}
      <div className="flex items-center justify-between px-2 sm:px-3 py-1 sm:py-1.5 bg-[#DFD5BC]/80 border-b border-[#766E5F]/15 text-[9px] sm:text-[10px] font-mono">
        <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
          {styles.icon}
          <span className={`px-1 sm:px-1.5 py-0.5 font-bold uppercase tracking-wider text-[7.5px] sm:text-[9px] rounded-none shrink-0 ${styles.badgeBg}`}>
            {toastItem.desk}
          </span>
          <span className="text-[#666666] truncate text-[8px] sm:text-[9px]">
            {toastItem.time}
          </span>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onDismiss(toastItem.id);
          }}
          className="p-0.5 text-[#666666] hover:text-[#201E19] hover:bg-[#766E5F]/10 transition-colors shrink-0"
          title="Dismiss notification"
        >
          <X className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>

      {/* Main Toast Body */}
      <div className="p-2 sm:p-3">
        <h4 className="font-serif font-bold text-[11px] sm:text-[13px] leading-snug text-[#201E19] group-hover:text-[#9F3028] transition-colors mb-0.5 sm:mb-1 line-clamp-2">
          {toastItem.title}
        </h4>

        {toastItem.description && (
          <p className="font-serif text-[9.5px] sm:text-[11px] text-[#39352D] line-clamp-1 sm:line-clamp-2 leading-tight sm:leading-relaxed">
            {toastItem.description}
          </p>
        )}

        {/* Action Link Footer */}
        {(toastItem.story || toastItem.action) && (
          <div className="mt-1.5 sm:mt-2 pt-1 sm:pt-1.5 border-t border-[#766E5F]/10 flex items-center justify-between text-[8.5px] sm:text-[10px] font-mono">
            <span className="font-bold text-[#9F3028] uppercase tracking-wider flex items-center gap-1 group-hover:underline">
              <span>{toastItem.action || "OPEN ARTICLE"}</span>
              <ArrowRight className="w-2.5 h-2.5 sm:w-3 sm:h-3 transition-transform group-hover:translate-x-1" />
            </span>
            <span className="text-[7.5px] sm:text-[9px] text-[#888888] hidden sm:inline">CLICK TO EXPAND</span>
          </div>
        )}
      </div>

      {/* Dynamic Animated Progress Bar */}
      {toastItem.duration > 0 && (
        <div className="h-[2px] w-full bg-[#766E5F]/10 overflow-hidden absolute bottom-0 left-0">
          <div
            className={`h-full transition-all ease-linear ${styles.progressBg}`}
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function EditorialToaster({ onOpenStory }) {
  const { toasts, dismiss, onOpenStory: contextOpenStory } = useToast();
  const effectiveOpenStory = onOpenStory || contextOpenStory;

  if (!toasts || toasts.length === 0) return null;

  return (
    <aside
      aria-label="Editorial Notifications & Reading Updates"
      className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-50 flex flex-col gap-1.5 sm:gap-2.5 pointer-events-auto max-w-[calc(100vw-24px)]"
    >
      {toasts.map((toastItem) => (
        <ToastItem
          key={toastItem.id}
          toastItem={toastItem}
          onDismiss={dismiss}
          onOpenStory={effectiveOpenStory}
        />
      ))}
    </aside>
  );
}
