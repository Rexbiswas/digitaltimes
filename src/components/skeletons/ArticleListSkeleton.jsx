"use client";

import React from "react";
import SkeletonBlock from "./SkeletonBlock";

export default function ArticleListSkeleton({ count = 3, className = "", variant = "card" }) {
  const items = Array.from({ length: Math.max(1, count) });

  return (
    <div className={`space-y-3.5 ${className}`} role="status" aria-label="Loading dispatches...">
      {items.map((_, idx) => (
        <div
          key={idx}
          className={`flex flex-col sm:flex-row items-start sm:items-center gap-4 ${
            variant === "card"
              ? "bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-3.5 sm:p-4"
              : "border-b border-[#766E5F]/25 pb-4"
          } select-none pointer-events-none`}
        >
          <div className="relative w-full sm:w-44 h-28 sm:h-26 shrink-0 rounded-lg overflow-hidden bg-[#DFD5BC] border border-[#766E5F]/15">
            <SkeletonBlock className="w-full h-full rounded-none" />
            <div className="absolute top-2 left-2">
              <SkeletonBlock className="h-4 w-14 rounded-xs" />
            </div>
          </div>

          <div className="flex-1 w-full space-y-2.5">
            <div className="flex items-start gap-2.5">
              <SkeletonBlock circle className="w-7 h-7 rounded-full shrink-0 mt-0.5 border border-[#766E5F]/20" />
              <div className="flex-1 space-y-1.5">
                <SkeletonBlock className="h-4.5 w-[94%] rounded-xs" />
                <SkeletonBlock className="h-4 w-[60%] rounded-xs" />
              </div>
            </div>

            <div className="pl-9 space-y-1">
              <SkeletonBlock className="h-3 w-[88%] rounded-xs opacity-75" />
            </div>

            <div className="pl-9 pt-1 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-3 w-16 rounded-xs" />
                <span className="text-[#766E5F]/30">•</span>
                <SkeletonBlock className="h-3 w-20 rounded-xs" />
              </div>
              <SkeletonBlock className="h-3 w-14 rounded-xs" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
