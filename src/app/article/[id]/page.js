"use client";

import { use, useState } from "react";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import NavigationStrip from "@/components/NavigationStrip";
import NewspaperFooter from "@/components/NewspaperFooter";
import { allArticles, leadStory } from "@/data/newspaperData";
import { ArrowLeft, Volume2, Bookmark, Share2, Play, Pause, Check } from "lucide-react";

export default function ArticlePage({ params }) {
  const resolvedParams = use(params);
  const articleId = resolvedParams?.id;
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  const article =
    allArticles.find((a) => a.id === articleId) ||
    (articleId === "lead-new-era" ? leadStory : allArticles[0]);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard?.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen paper-texture-bg bg-[#E8DFC8] text-[#201E19]">
      <Masthead />
      <NavigationStrip />

      {/* Return to Front Page Bar */}
      <div className="w-full bg-[#DFD5BC] border-b border-[#766E5F] py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-mono">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-[#9F3028] hover:underline uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO FULL FRONT PAGE BROADSHEET</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="hover:text-[#9F3028] flex items-center gap-1 cursor-pointer font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#1d6b2c]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "COPIED" : "SHARE CITATION"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Broadsheet Article Article View */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-8 select-text">
        {/* Article Masthead & Deck */}
        <div className="text-center border-b-2 border-[#766E5F] pb-8">
          <div className="font-mono text-xs text-[#9F3028] uppercase tracking-[0.25em] font-bold mb-2">
            {article.desk || "SPECIAL DISPATCH"} {"//"} {article.page || "PAGE 01"}
          </div>

          <h1 className="font-serif font-black text-4xl sm:text-6xl text-[#201E19] uppercase tracking-tight leading-[0.98] mb-4">
            {article.headline}
          </h1>

          <p className="font-serif text-lg sm:text-2xl text-[#39352D] leading-relaxed max-w-3xl mx-auto mb-6">
            {article.deck}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#39352D] uppercase tracking-wider pt-3 border-t border-[#766E5F]/30">
            <span className="font-bold text-[#201E19]">{article.author || "By The Editorial Board"}</span>
            <span>•</span>
            <span>{article.date || "September 30, 2026"}</span>
            <span>•</span>
            <span>{article.readTime || "7 MIN READ"}</span>
          </div>
        </div>

        {/* Audio Dispatch Player */}
        <div className="bg-[#DFD5BC] border border-[#766E5F] p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-10 h-10 rounded-full bg-[#201E19] text-[#E8DFC8] flex items-center justify-center hover:bg-[#9F3028] transition-colors cursor-pointer"
            >
              {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div>
              <div className="font-mono text-xs font-bold text-[#201E19] uppercase flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#9F3028]" />
                BROADSHEET SYNTHESIZER DISPATCH
              </div>
              <div className="text-xs font-mono text-[#666666]">
                {isPlayingAudio ? "Synthesized voice readout playing..." : "Narrated by Times Synthetic Telegraph • 4:18 min"}
              </div>
            </div>
          </div>

          <div className="w-48 hidden sm:block">
            <div className="w-full bg-[#D4CDBC] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#9F3028] h-full transition-all duration-300"
                style={{ width: isPlayingAudio ? "52%" : "12%" }}
              />
            </div>
          </div>
        </div>

        {/* Photograph */}
        {(article.urlToImage || article.image) && (
          <div className="border-2 border-[#766E5F] p-1 bg-[#766E5F]">
            <img
              src={article.urlToImage || article.image || "/window.svg"}
              alt={article.headline}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/window.svg";
              }}
              className="w-full h-auto max-h-[540px] object-cover object-center filter contrast-[1.08] saturate-[0.88]"
            />
            <div className="p-2.5 bg-[#201E19] text-[#DFD5BC] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-1">
              <span>{article.imageCaption || "Archival documentation recorded for publication."}</span>
              <span className="uppercase text-[10px] text-[#A8A295] shrink-0">{article.imageCredit}</span>
            </div>
          </div>
        )}

        {/* Multi-column Body Text */}
        <div className="newspaper-columns-2 text-[16px] font-serif leading-[1.8] text-[#222222]">
          <p className="drop-cap mb-6">
            {article.leadParagraph || article.body || article.deck}
          </p>

          {article.bodyParagraphs ? (
            article.bodyParagraphs.map((para, i) => (
              <p key={i} className="mb-6">
                {para}
              </p>
            ))
          ) : (
            <>
              <p className="mb-6">
                Across engineering departments and independent research workshops, the consensus has solidified: deterministic software pipelines can no longer capture the dynamic complexity of distributed network ecologies.
              </p>
              <p className="mb-6">
                By relying on autonomous compilation primitives and sovereign memory fabrics, developers are rediscovering the craftsmanship and deliberate elegance that characterized the dawn of personal computing.
              </p>
            </>
          )}
        </div>

        {/* Pull Quote */}
        {article.pullQuote && (
          <div className="my-10 py-8 px-6 border-y-4 border-[#766E5F] bg-[#DFD5BC] text-center">
            <span className="font-serif text-5xl text-[#9F3028] font-black leading-none block mb-2">
              “
            </span>
            <p className="font-serif text-2xl md:text-3xl font-light italic leading-snug text-[#201E19] max-w-2xl mx-auto">
              {article.pullQuote.replace(/^[“"]|[”"]$/g, "")}
            </p>
            <div className="mt-4 font-mono text-xs uppercase tracking-widest text-[#39352D]">
              — THE DIGITAL TIMES EDITORIAL COGNITION DESK
            </div>
          </div>
        )}

        {/* Footnote */}
        <div className="pt-6 border-t-2 border-[#766E5F] flex items-center justify-between text-xs font-mono text-[#39352D]">
          <div>FILED UNDER: {article.desk || "NEWS WIRE"} • ARCHIVE REGISTRY № 2026-9A</div>
          <div className="text-[#9F3028] font-bold">END OF TELEGRAPHIC DISPATCH</div>
        </div>
      </main>

      <NewspaperFooter onSelectDesk={() => {}} />
    </div>
  );
}
