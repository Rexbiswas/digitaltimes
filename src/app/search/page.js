"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  X, 
  ArrowLeft, 
  Bookmark, 
  Share2, 
  SlidersHorizontal,
  Clock,
  Sparkles,
  ChevronRight
} from "lucide-react";
import { allArticles, mastheadData } from "@/data/newspaperData";
import ArticleModal from "@/components/ArticleModal";
import ArticleListSkeleton from "@/components/skeletons/ArticleListSkeleton";

function SearchContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState("ALL"); // ALL, ARTICLES, SOURCES, TOPICS
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [articlesPool, setArticlesPool] = useState(allArticles);
  const [searchError, setSearchError] = useState(null);
  const [currentDateTime, setCurrentDateTime] = useState({
    time: "",
    dateFull: "",
    dateShort: "",
  });

  useEffect(() => {
    const daysShort = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const monthsShort = [
      "JAN", "FEB", "MAR", "APR", "MAY", "JUN",
      "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"
    ];

    const updateTime = () => {
      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const ss = String(now.getSeconds()).padStart(2, "0");

      const dayShort = daysShort[now.getDay()];
      const monthShort = monthsShort[now.getMonth()];
      const dateNum = now.getDate();
      const year = now.getFullYear();

      setCurrentDateTime({
        time: `${hh}:${mm}:${ss}`,
        dateFull: `${dayShort}, ${monthShort} ${dateNum}, ${year}`,
        dateShort: `${monthShort} ${dateNum}`,
      });
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);
  const [clippings, setClippings] = useState([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("times_clippings");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setClippings(parsed);
      }
    } catch (e) {}
  }, []);

  const saveClipping = (article) => {
    if (!article) return;
    setClippings((prev) => {
      const exists = prev.some((item) => item.id === article.id);
      let updated;
      if (exists) {
        updated = prev.filter((item) => item.id !== article.id);
      } else {
        updated = [article, ...prev];
      }
      try {
        localStorage.setItem("times_clippings", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const isSaved = (id) => clippings.some((item) => item.id === id);

  const filterTabs = [
    { id: "ALL", label: "ALL" },
    { id: "ARTICLES", label: "ARTICLES" },
    { id: "SOURCES", label: "SOURCES" },
    { id: "TOPICS", label: "TOPICS" },
  ];

  const quickPills = [
    "artificial intelligence",
    "autonomous agents",
    "quantum computing",
    "browser features",
    "photonic silicon",
    "cybersecurity",
    "cryptography"
  ];

  // Fetch fresh articles from API on mount
  useEffect(() => {
    let isMounted = true;
    const fetchArticles = async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const res = await fetch("/api/articles?limit=60", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.articles && json.articles.length > 0) {
            setArticlesPool(json.articles);
          }
        }
      } catch (err) {
        // Keep articlesPool default
      } finally {
        if (isMounted) setIsSearching(false);
      }
    };
    fetchArticles();
    return () => {
      isMounted = false;
    };
  }, []);

  // Debounced search transition when query or tab changes
  useEffect(() => {
    setIsSearching(true);
    const timer = setTimeout(() => {
      setIsSearching(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [query, activeTab]);

  // Filter stories based on query and activeTab
  const filteredStories = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sourceList = Array.isArray(articlesPool) && articlesPool.length > 0 ? articlesPool : allArticles;

    return sourceList.filter((art) => {
      // Tab filter
      if (activeTab === "ARTICLES") {
        if (art.topic === "Topic" || art.desk === "SOURCES") return false;
      } else if (activeTab === "SOURCES") {
        const hasBureau = art.location || art.author?.toLowerCase().includes("team") || art.desk === "SECURITY" || art.desk === "BUSINESS & MARKETS";
        if (!hasBureau && q === "") return false;
      } else if (activeTab === "TOPICS") {
        if (!art.topic && !art.desk) return false;
      }

      // Query filter
      if (!q) return true;

      const inHeadline = (art.headline || art.title)?.toLowerCase().includes(q);
      const inDeck = (art.deck || art.description)?.toLowerCase().includes(q);
      const inDesk = (art.desk || art.category)?.toLowerCase().includes(q);
      const inAuthor = art.author?.toLowerCase().includes(q);
      const inTopic = art.topic?.toLowerCase().includes(q);
      const inBody = art.leadParagraph?.toLowerCase().includes(q);

      return inHeadline || inDeck || inDesk || inAuthor || inTopic || inBody;
    });
  }, [query, activeTab, articlesPool]);

  return (
    <div className="h-screen w-full flex flex-col bg-[#F7F4EE] text-[#201E19] antialiased overflow-hidden selection:bg-[#201E19] selection:text-[#F7F4EE]">
      {/* 1. FIXED TOP UTILITY NAVIGATION STRIP */}
      <nav className="w-full bg-[#EFEAE0] border-b border-[#766E5F]/30 shrink-0 z-40 shadow-2xs select-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between text-xs font-mono">
          <Link
            href="/"
            className="flex items-center gap-1.5 font-bold text-[#201E19] hover:text-[#9F3028] transition-colors uppercase tracking-wider group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            <span>RETURN TO BROADSHEET</span>
          </Link>

          <div className="flex items-center gap-3 sm:gap-5 text-[#39352D]">
            <span className="hidden sm:inline font-bold text-[#201E19]">
              THE DIGITAL TIMES ARCHIVES
            </span>
            <span className="hidden sm:inline">•</span>
            <div className="flex items-center gap-1 sm:gap-1.5 text-[#201E19] bg-[#201E19]/5 px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-bold whitespace-nowrap shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span suppressHydrationWarning className="flex items-center gap-1">
                {currentDateTime.time ? (
                  <>
                    <span className="hidden sm:inline">{currentDateTime.dateFull}</span>
                    <span className="sm:hidden">{currentDateTime.dateShort}</span>
                    <span className="opacity-40">•</span>
                    <span>{currentDateTime.time}</span>
                  </>
                ) : (
                  <span>{mastheadData.date}</span>
                )}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. FIXED SEARCH HEADER, INPUT, TABS & COUNTER ZONE */}
      <header className="w-full bg-[#F7F4EE] border-b border-[#D5CFC2] shrink-0 z-30 pt-3 sm:pt-5 pb-2 shadow-xs">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Editorial Search Header Title */}
          <div className="mb-3">
            <div className="flex items-center gap-2 text-[10px] sm:text-xs font-mono tracking-widest text-[#777777] uppercase font-bold mb-0.5">
              <span>EDITORIAL DISPATCH ARCHIVES</span>
              <span>•</span>
              <span className="text-[#9F3028]">INDEXED REPOSITORY</span>
            </div>
            <h1 className="font-serif font-black text-3xl sm:text-4xl md:text-5xl tracking-tight text-[#201E19] uppercase leading-none">
              SEARCH
            </h1>
          </div>

          {/* The Vintage Editorial Search Input Container */}
          <div className="relative mb-3">
            <div className="flex items-center bg-[#FDFBF7] border-2 border-[#766E5F]/20 hover:border-[#766E5F]/60 focus-within:border-[#766E5F] rounded-2xl shadow-xs p-1 sm:p-1.5 transition-all">
              {/* Left Magnifying Glass Icon */}
              <div className="pl-2 sm:pl-3 pr-2 text-[#777777]">
                <Search className="w-5 h-5 text-[#666666]" />
              </div>

              {/* Input Element */}
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles, headlines, topics, dispatches..."
                className="w-full bg-transparent font-serif text-sm sm:text-base md:text-lg text-[#201E19] placeholder:text-[#999999] placeholder:font-serif outline-none py-1"
                autoFocus
              />

              {/* Clear Button if query exists */}
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="p-1 text-[#888888] hover:text-[#201E19] hover:bg-[#DFD5BC] rounded-full transition-colors mr-1 cursor-pointer"
                  title="Clear query"
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Right Dark Search Button */}
              <button
                type="button"
                className="bg-[#201E19] hover:bg-[#252525] active:scale-95 text-white p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 shadow-sm"
                aria-label="Execute search"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              </button>
            </div>
          </div>

          {/* Filter Tabs (ALL, ARTICLES, SOURCES, TOPICS - Matches Screenshot) */}
          <div className="flex items-center gap-6 sm:gap-8 border-b border-[#D5CFC2] mb-3 pt-0.5">
            {filterTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`pb-2 text-xs sm:text-sm font-bold tracking-wider uppercase transition-all relative cursor-pointer ${
                    isActive
                      ? "text-[#201E19] font-black"
                      : "text-[#777777] hover:text-[#201E19]"
                  }`}
                >
                  {tab.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#201E19]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick Suggestion Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 mb-2 text-xs font-mono no-scrollbar">
            <span className="text-[#888888] shrink-0 uppercase tracking-wider text-[10px] sm:text-[11px] font-semibold mr-1">
              TRENDING:
            </span>
            {quickPills.map((pill) => (
              <button
                key={pill}
                onClick={() => setQuery(pill)}
                className={`px-2.5 py-0.5 sm:py-1 rounded-full border text-[10px] sm:text-[11px] uppercase tracking-wide transition-colors whitespace-nowrap cursor-pointer ${
                  query.toLowerCase() === pill.toLowerCase()
                    ? "bg-[#201E19] text-[#F7F4EE] border-[#766E5F]"
                    : "bg-[#EFEAE0]/80 text-[#39352D] border-[#D5CFC2] hover:border-[#766E5F] hover:text-[#201E19]"
                }`}
              >
                {pill}
              </button>
            ))}
          </div>

          {/* Stories Found Count Bar */}
          <div className="flex items-center justify-between text-xs font-serif font-bold text-[#3B3A36] tracking-wider uppercase pt-1">
            <span>
              {filteredStories.length} {filteredStories.length === 1 ? "STORY" : "STORIES"} FOUND
            </span>
            {query && (
              <span className="font-mono text-[11px] text-[#777777]">
                FOR &ldquo;<span className="text-[#201E19] font-semibold">{query}</span>&rdquo;
              </span>
            )}
          </div>
        </div>
      </header>

      {/* 3. SCROLLABLE STORIES RESULTS LIST CONTAINER */}
      <div className="flex-1 overflow-y-auto overscroll-contain">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4">
          {isSearching ? (
            <ArticleListSkeleton count={4} />
          ) : searchError ? (
            <div className="py-16 text-center border-2 border-dashed border-[#9F3028]/30 rounded-xl p-8 bg-[#FAF8F3]">
              <Search className="w-8 h-8 text-[#9F3028] mx-auto mb-3 opacity-60" />
              <p className="font-serif font-bold text-lg text-[#201E19] mb-1">
                Archives Search Disconnected
              </p>
              <p className="font-mono text-xs text-[#777777] max-w-md mx-auto mb-4">
                Unable to query telegraph archives. Please retry your request.
              </p>
              <button
                onClick={() => setQuery("")}
                className="px-4 py-2 bg-[#201E19] text-[#F7F4EE] text-xs font-mono font-bold uppercase rounded hover:bg-[#333333] transition-colors cursor-pointer"
              >
                Reset Search
              </button>
            </div>
          ) : filteredStories.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-[#D5CFC2] rounded-xl p-8 bg-[#FAF8F3]">
              <Search className="w-8 h-8 text-[#9F3028] mx-auto mb-3 opacity-60" />
              <p className="font-serif font-bold text-lg text-[#201E19] mb-1">
                No matching dispatches found
              </p>
              <p className="font-mono text-xs text-[#777777] max-w-md mx-auto mb-4">
                We couldn&apos;t find any stories matching &ldquo;{query}&rdquo;. Try another keyword, desk name, or select a trending topic.
              </p>
              <button
                onClick={() => setQuery("")}
                className="px-4 py-2 bg-[#201E19] text-[#F7F4EE] text-xs font-mono font-bold uppercase rounded hover:bg-[#333333] transition-colors cursor-pointer"
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredStories.map((story) => (
              <article
                key={story.id}
                onClick={() => setSelectedArticle(story)}
                className="flex items-start gap-3.5 sm:gap-5 p-2.5 sm:p-3 -mx-2 rounded-xl hover:bg-[#DFD5BC]/60 transition-all cursor-pointer group border-b border-[#766E5F]/10 last:border-b-0"
              >
                {/* Thumbnail Image on Left with Rounded Corners */}
                <div className="relative w-24 sm:w-36 md:w-44 h-18 sm:h-24 md:h-26 rounded-lg overflow-hidden flex-shrink-0 bg-[#E0D9CB] border border-[#766E5F]/15 shadow-2xs">
                  {story.urlToImage || story.image ? (
                    <img
                      src={story.urlToImage || story.image}
                      alt={story.headline}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.src = "/window.svg";
                      }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#201E19] text-[#F7F4EE] font-masthead text-lg">
                      DT
                    </div>
                  )}
                </div>

                {/* Article Info on Right */}
                <div className="flex-1 min-w-0">
                  {/* Headline */}
                  <h3 className="font-serif font-bold text-base sm:text-lg md:text-xl text-[#201E19] group-hover:text-[#9F3028] transition-colors leading-snug line-clamp-2">
                    {story.headline}
                  </h3>

                  {/* Kicker / Metadata Line (e.g. "AI • 2 MIN AGO") */}
                  <div className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-[#777777] font-semibold flex items-center gap-1.5 my-1">
                    <span className="text-[#9F3028] font-bold">
                      {story.desk || "EDITORIAL"}
                    </span>
                    <span>•</span>
                    <span>
                      {story.timeAgo ||
                        (story.minutesAgo
                          ? `${story.minutesAgo} MIN AGO`
                          : story.readTime || "TODAY")}
                    </span>
                    {story.author && (
                      <>
                        <span className="hidden md:inline">•</span>
                        <span className="hidden md:inline text-[#39352D]">
                          {story.author}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Excerpt / Snippet (Italic Editorial Body) */}
                  <p className="font-serif italic text-xs sm:text-sm text-[#39352D] line-clamp-2 leading-relaxed">
                    {story.deck || story.leadParagraph}
                  </p>
                </div>
              </article>
            ))
          )}
        </main>
      </div>

      {/* Reader Modal when a story is clicked */}
      {selectedArticle && (
        <ArticleModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSaveClipping={saveClipping}
          isSaved={isSaved}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#F7F4EE] flex items-center justify-center p-6">
          <div className="font-serif text-lg text-[#201E19] animate-pulse">
            Loading Digital Times Archive Search...
          </div>
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
}
