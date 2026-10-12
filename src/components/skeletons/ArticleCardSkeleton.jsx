"use client";

import React from "react";
import SkeletonBlock from "./SkeletonBlock";

export default function ArticleCardSkeleton({ count = 1, className = "" }) {
  const cards = Array.from({ length: Math.max(1, count) });

  const renderSingleCard = (key) => (
    <div
      key={key}
      className="bg-[#EFE8D5] border-2 border-[#766E5F]/20 rounded-xl overflow-hidden flex flex-col relative shadow-2xs select-none pointer-events-none"
      role="status"
      aria-label="Loading dispatch..."
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#DFD5BC] border-b border-[#766E5F]/15 flex items-center justify-center">
        <SkeletonBlock className="w-full h-full rounded-none" />

        <div className="absolute top-2.5 left-2.5 z-10">
          <SkeletonBlock className="h-4.5 w-20 rounded-xs shadow-xs" />
        </div>
        <div className="absolute top-2.5 right-2.5 z-10">
          <SkeletonBlock circle className="w-6.5 h-6.5 rounded-full shadow-xs" />
        </div>
      </div>

      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div>
          <div className="flex items-start gap-3">
            <SkeletonBlock circle className="w-8 h-8 shrink-0 rounded-full mt-0.5 border border-[#766E5F]/20" />

            <div className="flex-1 space-y-2">
              <SkeletonBlock className="h-5 w-[92%] rounded-xs" />
              <SkeletonBlock className="h-4.5 w-[65%] rounded-xs" />
            </div>
          </div>

          <div className="mt-3 pl-11 space-y-1.5">
            <SkeletonBlock className="h-3 w-[96%] rounded-xs opacity-75" />
            <SkeletonBlock className="h-3 w-[72%] rounded-xs opacity-75" />
          </div>
        </div>

        <div className="pt-3 border-t border-[#766E5F]/15 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <SkeletonBlock className="h-3 w-16 rounded-xs" />
            <span className="text-[#766E5F]/30 text-xs">•</span>
            <SkeletonBlock className="h-3 w-20 rounded-xs" />
          </div>
          <SkeletonBlock className="h-3 w-14 rounded-xs" />
        </div>
      </div>
    </div>
  );

  if (count === 1) {
    return renderSingleCard(0);
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 ${className}`}
      aria-busy="true"
    >
      {cards.map((_, i) => renderSingleCard(i))}
    </div>
  );
}
