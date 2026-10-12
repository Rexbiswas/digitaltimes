"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { allArticles } from "@/data/newspaperData";
import { Search, X, Maximize2, ExternalLink } from "lucide-react";

export default function SearchModal({ isOpen, onClose, onOpenStory }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, ARTICLES, SOURCES, TOPICS

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allArticles.filter((art) => {
      if (activeTab === "ARTICLES") {
        if (art.topic === "Topic" || art.desk === "SOURCES") return false;
      } else if (activeTab === "SOURCES") {
        const hasBureau = art.location || art.author?.toLowerCase().includes("team");
        if (!hasBureau && q === "") return false;
      } else if (activeTab === "TOPICS") {
        if (!art.topic && !art.desk) return false;
      }

      if (!q) return true;
      return (
        art.headline?.toLowerCase().includes(q) ||
        art.deck?.toLowerCase().includes(q) ||
        art.desk?.toLowerCase().includes(q) ||
        art.author?.toLowerCase().includes(q) ||
        art.topic?.toLowerCase().includes(q)
      );
    });
  }, [query, activeTab]);

  if (!isOpen) return null;

  const handleOpenFullPage = () => {
    onClose();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-[#201E19]/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-[#F7F4EE] text-[#201E19] border-2 border-[#766E5F] shadow-2xl flex flex-col rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="px-5 sm:px-6 pt-5 pb-3 border-b border-[#D5CFC2] bg-[#EFEAE0]/80 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-mono tracking-widest text-[#777777] uppercase font-bold">
              THE DIGITAL TIMES ARCHIVES
            </div>
            <h2 className="font-serif font-black text-2xl sm:text-3xl tracking-tight text-[#201E19] uppercase leading-tight">
              SEARCH
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenFullPage}
              className="p-2 text-[#39352D] hover:text-[#201E19] hover:bg-[#DFD5BC] rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-mono font-bold"
              title="Open full search page"
            >
              <Maximize2 className="w-4 h-4" />
              <span className="hidden sm:inline">FULL PAGE</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-[#39352D] hover:text-[#201E19] hover:bg-[#DFD5BC] rounded-lg transition-colors cursor-pointer"
              title="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Search Bar Container */}
        <div className="px-5 sm:px-6 pt-4 pb-2">
          <div className="flex items-center bg-[#FDFBF7] border-2 border-[#766E5F]/20 focus-within:border-[#766E5F] rounded-2xl shadow-xs p-1.5 sm:p-2 transition-all">
            <div className="pl-2 sm:pl-3 pr-2 text-[#777777]">
              <Search className="w-5 h-5 text-[#666666]" />
            </div>

            <input
              type="text"
              placeholder="Search articles, headlines, topics, dispatches..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent font-serif text-sm sm:text-base md:text-lg text-[#201E19] placeholder:text-[#999999] outline-none py-1"
              autoFocus
            />

            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="p-1 text-[#888888] hover:text-[#201E19] hover:bg-[#DFD5BC] rounded-full transition-colors mr-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={handleOpenFullPage}
              className="bg-[#201E19] hover:bg-[#252525] text-white p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
              aria-label="Execute search"
            >
              <Search className="w-4 h-4 text-white" />
            </button>
          </div>

          {/* Filter Tabs (ALL, ARTICLES, SOURCES, TOPICS) */}
          <div className="flex items-center gap-6 border-b border-[#D5CFC2] mt-3">
            {["ALL", "ARTICLES", "SOURCES", "TOPICS"].map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-2 text-xs font-bold tracking-wider uppercase transition-all relative cursor-pointer ${
                    isActive
                      ? "text-[#201E19] font-black"
                      : "text-[#777777] hover:text-[#201E19]"
                  }`}
                >
                  {tab}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#201E19]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Stories Count */}
          <div className="flex items-center justify-between text-[11px] font-serif font-bold text-[#39352D] tracking-wider uppercase pt-3 pb-1">
            <span>{filtered.length} {filtered.length === 1 ? "STORY" : "STORIES"} FOUND</span>
            {query && <span className="font-mono text-[#777777]">QUERY: &ldquo;{query}&rdquo;</span>}
          </div>
        </div>

        {/* Stories Results List */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-2 space-y-3 pr-2">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[#777777] italic">
              No matching dispatches found in today&apos;s broadsheet archive.
            </div>
          ) : (
            filtered.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onOpenStory(item);
                  onClose();
                }}
                className="flex items-start gap-3 p-2.5 rounded-lg border border-[#766E5F]/10 bg-[#FAF8F3] hover:bg-[#EFEAE0] cursor-pointer transition-colors group"
                data-cursor="READ"
              >
                {/* Thumbnail Image on Left */}
                <div className="w-20 sm:w-28 h-16 sm:h-20 rounded-md overflow-hidden flex-shrink-0 bg-[#E0D9CB] border border-[#766E5F]/10">
                  {item.urlToImage || item.image ? (
                    <img
                      src={item.urlToImage || item.image}
                      alt={item.headline}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/window.svg";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#201E19] text-[#F7F4EE] font-masthead text-xs">
                      DT
                    </div>
                  )}
                </div>

                {/* Right Text */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#201E19] group-hover:text-[#9F3028] leading-snug line-clamp-2">
                    {item.headline}
                  </h4>
                  <div className="text-[10px] font-mono text-[#777777] uppercase font-semibold my-1 flex items-center gap-1.5">
                    <span className="text-[#9F3028] font-bold">{item.desk || "DISPATCH"}</span>
                    <span>•</span>
                    <span>
                      {item.timeAgo ||
                        (item.minutesAgo
                          ? `${item.minutesAgo} MIN AGO`
                          : "TODAY")}
                    </span>
                  </div>
                  <p className="font-serif italic text-xs text-[#39352D] line-clamp-2 leading-relaxed">
                    {item.deck || item.leadParagraph}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 sm:px-6 py-2.5 border-t border-[#D5CFC2] bg-[#EFEAE0]/60 flex items-center justify-between text-[11px] font-mono text-[#666666]">
          <button
            onClick={handleOpenFullPage}
            className="hover:text-[#201E19] flex items-center gap-1 font-bold cursor-pointer"
          >
            <span>VIEW AS FULL BROADCAST SEARCH PAGE</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
          <span>ESC TO CLOSE</span>
        </div>
      </div>
    </div>
  );
}
