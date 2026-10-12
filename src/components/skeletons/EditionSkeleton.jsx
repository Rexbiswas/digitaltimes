"use client";

import React from "react";
import SkeletonBlock from "./SkeletonBlock";
import ArticleCardSkeleton from "./ArticleCardSkeleton";

export default function EditionSkeleton() {
  return (
    <div
      className="min-h-screen w-full bg-[#E8DFC8] text-[#201E19] select-none pointer-events-none paper-texture-bg"
      role="status"
      aria-label="Loading The Digital Times edition..."
    >
      <div className="w-full border-b border-[#766E5F]/30 bg-[#DFD5BC]/60 py-2 px-4 sm:px-8">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-3.5 w-24 rounded-xs" />
            <span className="text-[#766E5F]/40">•</span>
            <SkeletonBlock className="h-3.5 w-32 rounded-xs" />
          </div>
          <div className="hidden sm:flex items-center gap-3">
            <SkeletonBlock className="h-3.5 w-28 rounded-xs" />
            <span className="text-[#766E5F]/40">•</span>
            <SkeletonBlock className="h-3.5 w-20 rounded-xs" />
          </div>
        </div>
      </div>

      <header className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-6 pb-4">
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#766E5F]/20 text-xs font-mono">
          <SkeletonBlock className="h-3 w-32 rounded-xs" />
          <SkeletonBlock className="h-3 w-40 rounded-xs" />
          <SkeletonBlock className="h-3 w-28 rounded-xs hidden md:block" />
        </div>

        <div className="py-4 text-center flex flex-col items-center justify-center gap-3">
          <SkeletonBlock className="h-14 sm:h-20 w-[80%] max-w-2xl rounded-xs" />
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-3.5 w-48 rounded-xs" />
            <span className="text-[#766E5F]/40">•</span>
            <SkeletonBlock className="h-3.5 w-36 rounded-xs" />
          </div>
        </div>

        <div className="rule-oxford my-3" />

        <div className="flex items-center justify-between py-2 overflow-x-hidden gap-3 border-b border-[#766E5F]">
          <SkeletonBlock className="h-4 w-24 rounded-xs shrink-0" />
          <div className="flex items-center gap-4 sm:gap-6">
            <SkeletonBlock className="h-3.5 w-16 rounded-xs" />
            <SkeletonBlock className="h-3.5 w-16 rounded-xs" />
            <SkeletonBlock className="h-3.5 w-20 rounded-xs" />
            <SkeletonBlock className="h-3.5 w-18 rounded-xs" />
            <SkeletonBlock className="h-3.5 w-16 rounded-xs hidden sm:block" />
          </div>
          <SkeletonBlock className="h-4 w-20 rounded-xs shrink-0" />
        </div>
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6 space-y-8">
        <div className="flex items-center justify-between border-b-2 border-[#766E5F] pb-2 text-xs font-mono">
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-5 w-64 rounded-xs" />
            <SkeletonBlock className="h-4 w-24 rounded-xs" />
          </div>
          <div className="flex items-center gap-3">
            <SkeletonBlock className="h-4 w-28 rounded-xs" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-3 lg:border-r border-[#766E5F]/30 lg:pr-6 space-y-6">
            <div className="border-b border-[#766E5F] pb-1.5 mb-3">
              <SkeletonBlock className="h-3.5 w-32 rounded-xs" />
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <SkeletonBlock circle className="w-7 h-7 rounded-full shrink-0 border border-[#766E5F]/20" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBlock className="h-4.5 w-[90%] rounded-xs" />
                  <SkeletonBlock className="h-4 w-[65%] rounded-xs" />
                </div>
              </div>
              <SkeletonBlock className="h-3 w-full rounded-xs opacity-75" />
              <SkeletonBlock className="h-3 w-[78%] rounded-xs opacity-75" />
              <div className="flex items-center gap-2 pt-1">
                <SkeletonBlock className="h-2.5 w-20 rounded-xs" />
                <SkeletonBlock className="h-2.5 w-16 rounded-xs" />
              </div>
            </div>

            <div className="border-t border-[#766E5F]/20 pt-4 space-y-3">
              <div className="border-b border-[#766E5F] pb-1.5 mb-2">
                <SkeletonBlock className="h-3.5 w-28 rounded-xs" />
              </div>
              <div className="flex items-start gap-2.5">
                <SkeletonBlock circle className="w-7 h-7 rounded-full shrink-0 border border-[#766E5F]/20" />
                <div className="flex-1 space-y-1.5">
                  <SkeletonBlock className="h-4.5 w-[92%] rounded-xs" />
                  <SkeletonBlock className="h-4 w-[60%] rounded-xs" />
                </div>
              </div>
              <SkeletonBlock className="h-3 w-[85%] rounded-xs opacity-75" />
              <div className="flex items-center gap-2 pt-1">
                <SkeletonBlock className="h-2.5 w-20 rounded-xs" />
                <SkeletonBlock className="h-2.5 w-14 rounded-xs" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-6 space-y-4 px-1 sm:px-2">
            <div className="flex items-center justify-between">
              <SkeletonBlock className="h-4 w-36 rounded-xs" />
              <SkeletonBlock className="h-3.5 w-28 rounded-xs" />
            </div>

            <div className="space-y-2.5 py-1">
              <SkeletonBlock className="h-9 sm:h-11 w-full rounded-xs" />
              <SkeletonBlock className="h-9 sm:h-11 w-[92%] rounded-xs" />
              <SkeletonBlock className="h-8 sm:h-10 w-[75%] rounded-xs" />
            </div>

            <div className="py-2 border-y border-[#766E5F]/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <SkeletonBlock circle className="w-6 h-6 rounded-full" />
                <SkeletonBlock className="h-3.5 w-32 rounded-xs" />
              </div>
              <div className="flex items-center gap-2">
                <SkeletonBlock className="h-3.5 w-16 rounded-xs" />
                <SkeletonBlock className="h-3.5 w-20 rounded-xs" />
              </div>
            </div>

            <div className="relative aspect-[16/10] w-full rounded-md overflow-hidden bg-[#DFD5BC] border border-[#766E5F]/20">
              <SkeletonBlock className="w-full h-full rounded-none" />
              <div className="absolute bottom-2 left-2">
                <SkeletonBlock className="h-3 w-48 rounded-xs" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
              <div className="space-y-2">
                <SkeletonBlock className="h-3.5 w-full rounded-xs" />
                <SkeletonBlock className="h-3.5 w-[96%] rounded-xs" />
                <SkeletonBlock className="h-3.5 w-[92%] rounded-xs" />
                <SkeletonBlock className="h-3.5 w-[98%] rounded-xs" />
                <SkeletonBlock className="h-3.5 w-[85%] rounded-xs" />
              </div>
              <div className="space-y-2">
                <div className="p-3 border-y-2 border-[#766E5F] bg-[#DFD5BC]/60 space-y-1.5 my-1">
                  <SkeletonBlock className="h-4 w-[90%] rounded-xs" />
                  <SkeletonBlock className="h-4 w-[75%] rounded-xs" />
                </div>
                <SkeletonBlock className="h-3.5 w-full rounded-xs" />
                <SkeletonBlock className="h-3.5 w-[94%] rounded-xs" />
              </div>
            </div>
          </div>

          <div className="lg:col-span-3 lg:border-l border-[#766E5F]/30 lg:pl-6 space-y-5">
            <div className="border-b border-[#766E5F] pb-1.5">
              <SkeletonBlock className="h-3.5 w-28 rounded-xs" />
            </div>

            {[0, 1, 2].map((i) => (
              <div key={i} className="border-b border-[#766E5F]/15 pb-4 space-y-2">
                <div className="flex items-start gap-2">
                  <SkeletonBlock circle className="w-6 h-6 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1">
                    <SkeletonBlock className="h-4 w-[92%] rounded-xs" />
                    <SkeletonBlock className="h-3.5 w-[65%] rounded-xs" />
                  </div>
                </div>
                <SkeletonBlock className="h-2.5 w-20 rounded-xs pl-8" />
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t-2 border-[#766E5F] space-y-5">
          <div className="flex items-center justify-between pb-1">
            <SkeletonBlock className="h-5 w-52 rounded-xs" />
            <SkeletonBlock className="h-3.5 w-24 rounded-xs" />
          </div>

          <ArticleCardSkeleton count={3} />
        </div>
      </main>
    </div>
  );
}
