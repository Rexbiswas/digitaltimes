"use client";

import React from "react";
import SkeletonBlock from "./SkeletonBlock";

export default function VideoCardSkeleton({
  count = 1,
  className = "",
  horizontal = false,
}) {
  const cards = Array.from({ length: Math.max(1, count) });

  const renderSingleCard = (key) => (
    <div
      key={key}
      className={`group bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl overflow-hidden flex ${
        horizontal ? "flex-col sm:flex-row gap-3 p-3" : "flex-col"
      } relative shadow-2xs select-none pointer-events-none`}
      role="status"
      aria-label="Loading video dispatch..."
    >
      <div
        className={`relative ${
          horizontal ? "w-full sm:w-56 shrink-0" : "w-full"
        } aspect-video overflow-hidden bg-[#DFD5BC] border-b sm:border-b-0 border-[#766E5F]/15 flex items-center justify-center rounded-t-xl sm:rounded-lg`}
      >
        <SkeletonBlock className="w-full h-full rounded-none" />

        <div className="absolute bottom-2 right-2 z-10">
          <SkeletonBlock className="h-4.5 w-12 rounded-xs bg-[#201E19]/80 shadow-xs" />
        </div>

        <div className="absolute top-2 left-2 z-10">
          <SkeletonBlock className="h-4 w-18 rounded-xs shadow-xs" />
        </div>
      </div>

      <div className={`p-3.5 flex-1 flex flex-col justify-between ${horizontal ? "sm:p-1" : ""}`}>
        <div className="flex items-start gap-3">
          <SkeletonBlock circle className="w-9 h-9 shrink-0 rounded-full mt-0.5 border border-[#766E5F]/25" />

          <div className="flex-1 space-y-2">
            <SkeletonBlock className="h-4.5 w-[95%] rounded-xs" />
            <SkeletonBlock className="h-4 w-[68%] rounded-xs" />

            <div className="pt-1">
              <SkeletonBlock className="h-3 w-28 rounded-xs opacity-85" />
            </div>

            <div className="flex items-center gap-1.5 pt-0.5">
              <SkeletonBlock className="h-3 w-16 rounded-xs opacity-75" />
              <span className="text-[#766E5F]/40 text-[10px]">•</span>
              <SkeletonBlock className="h-3 w-20 rounded-xs opacity-75" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (count === 1) {
    return renderSingleCard(0);
  }

  return (
    <div
      className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 ${className}`}
      aria-busy="true"
    >
      {cards.map((_, idx) => renderSingleCard(idx))}
    </div>
  );
}
