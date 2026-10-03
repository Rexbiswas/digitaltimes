"use client";

import { useState } from "react";
import { allArticles } from "@/data/newspaperData";
import { Search, X, ArrowRight, BookOpen } from "lucide-react";

export default function SearchModal({ isOpen, onClose, onOpenStory }) {
  const [query, setQuery] = useState("");

  if (!isOpen) return null;

  const filtered = allArticles.filter((art) => {
    const q = query.toLowerCase();
    return (
      art.headline?.toLowerCase().includes(q) ||
      art.deck?.toLowerCase().includes(q) ||
      art.desk?.toLowerCase().includes(q) ||
      art.author?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-[#F2EEE5] text-[#111111] border-2 border-[#1A1A1A] shadow-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Search className="w-4 h-4 text-[#A71919]" />
            <h3 className="font-serif font-black text-xl uppercase tracking-tight">
              SEARCH THE ARCHIVE BROADSHEET
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#111111] hover:text-[#F2EEE5] transition-colors cursor-pointer"
            data-cursor="CLOSE"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search keywords, headlines, authors, or desks..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full p-2.5 bg-[#ECE6D8] border border-[#1A1A1A] font-mono text-xs sm:text-sm text-[#111111] placeholder:text-[#777777] outline-none focus:border-[#A71919]"
            autoFocus
          />
        </div>

        <div className="max-h-[50vh] overflow-y-auto space-y-3 pr-1">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs font-mono text-[#777777] italic">
              No matching dispatches found in today&apos;s print run.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onOpenStory(item);
                  onClose();
                }}
                className="p-3 border border-[#1A1A1A]/30 bg-[#ECE6D8]/50 hover:bg-[#ECE6D8] cursor-pointer transition-colors"
                data-cursor="READ"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#A71919] uppercase font-bold mb-1">
                  <span>{item.desk || "DISPATCH"}</span>
                  <span>{item.page || "PAGE 01"}</span>
                </div>
                <h4 className="font-serif font-bold text-base text-[#111111] hover:text-[#A71919] leading-snug">
                  {item.headline}
                </h4>
                <p className="font-serif text-xs text-[#444444] mt-1 line-clamp-2">
                  {item.deck}
                </p>
              </div>
            ))
          )}
        </div>

        <div className="mt-4 pt-3 border-t border-[#1A1A1A]/20 flex items-center justify-between text-[10px] font-mono text-[#666666]">
          <span>INDEXED: {allArticles.length} EDITORIAL DISPATCHES</span>
          <span>PRESS ESC TO CLOSE</span>
        </div>
      </div>
    </div>
  );
}
