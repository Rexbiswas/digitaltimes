"use client";

import { use, useState } from "react";
import Link from "next/link";
import Masthead from "@/components/Masthead";
import NavigationStrip from "@/components/NavigationStrip";
import NewspaperFooter from "@/components/NewspaperFooter";
import { allArticles, leadStory } from "@/data/newspaperData";
import { ArrowLeft, Volume2, Bookmark, Printer, Share2, Play, Pause, Check } from "lucide-react";

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
    <div className="min-h-screen paper-texture-bg bg-[#F2EEE5] text-[#111111]">
      <Masthead />
      <NavigationStrip />

      {/* Return to Front Page Bar */}
      <div className="w-full bg-[#ECE6D8] border-b border-[#1A1A1A] py-3">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 flex items-center justify-between text-xs font-mono">
          <Link
            href="/"
            className="flex items-center gap-2 font-bold text-[#A71919] hover:underline uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>RETURN TO FULL FRONT PAGE BROADSHEET</span>
          </Link>

          <div className="flex items-center gap-4">
            <button
              onClick={handleShare}
              className="hover:text-[#A71919] flex items-center gap-1 cursor-pointer font-bold"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#1d6b2c]" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copied ? "COPIED" : "SHARE CITATION"}</span>
            </button>
            <span>•</span>
            <button
              onClick={() => window.print()}
              className="hover:text-[#A71919] flex items-center gap-1 cursor-pointer font-bold no-print"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>PRINT ARTICLE</span>
            </button>
          </div>
        </div>
      </div>

      {/* Full Broadsheet Article Article View */}
      <main className="max-w-4xl mx-auto px-4 sm:px-8 py-12 space-y-8 select-text">
        {/* Article Masthead & Deck */}
        <div className="text-center border-b-2 border-[#1A1A1A] pb-8">
          <div className="font-mono text-xs text-[#A71919] uppercase tracking-[0.25em] font-bold mb-2">
            {article.desk || "SPECIAL DISPATCH"} {"//"} {article.page || "PAGE 01"}
          </div>

          <h1 className="font-serif font-black text-4xl sm:text-6xl text-[#111111] uppercase tracking-tight leading-[0.98] mb-4">
            {article.headline}
          </h1>

          <p className="font-serif text-lg sm:text-2xl text-[#333333] leading-relaxed max-w-3xl mx-auto mb-6">
            {article.deck}
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-mono text-[#555555] uppercase tracking-wider pt-3 border-t border-[#1A1A1A]/30">
            <span className="font-bold text-[#111111]">{article.author || "By The Editorial Board"}</span>
            <span>•</span>
            <span>{article.date || "September 30, 2026"}</span>
            <span>•</span>
            <span>{article.readTime || "7 MIN READ"}</span>
          </div>
        </div>

        {/* Audio Dispatch Player */}
        <div className="bg-[#ECE6D8] border border-[#1A1A1A] p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlayingAudio(!isPlayingAudio)}
              className="w-10 h-10 rounded-full bg-[#111111] text-[#F2EEE5] flex items-center justify-center hover:bg-[#A71919] transition-colors cursor-pointer"
            >
              {isPlayingAudio ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <div>
              <div className="font-mono text-xs font-bold text-[#111111] uppercase flex items-center gap-1.5">
                <Volume2 className="w-4 h-4 text-[#A71919]" />
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
                className="bg-[#A71919] h-full transition-all duration-300"
                style={{ width: isPlayingAudio ? "52%" : "12%" }}
              />
            </div>
          </div>
        </div>

        {/* Photograph */}
        {article.image && (
          <div className="border-2 border-[#1A1A1A] p-1 bg-[#1A1A1A]">
            <img
              src={article.image}
              alt={article.headline}
              className="w-full h-auto max-h-[540px] object-cover object-center filter contrast-[1.08] saturate-[0.88]"
            />
            <div className="p-2.5 bg-[#111111] text-[#ECE6D8] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-1">
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
          <div className="my-10 py-8 px-6 border-y-4 border-[#1A1A1A] bg-[#ECE6D8] text-center">
            <span className="font-serif text-5xl text-[#A71919] font-black leading-none block mb-2">
              “
            </span>
            <p className="font-serif text-2xl md:text-3xl font-light italic leading-snug text-[#111111] max-w-2xl mx-auto">
              {article.pullQuote.replace(/^[“"]|[”"]$/g, "")}
            </p>
            <div className="mt-4 font-mono text-xs uppercase tracking-widest text-[#555555]">
              — THE DIGITAL TIMES EDITORIAL COGNITION DESK
            </div>
          </div>
        )}

        {/* Footnote */}
        <div className="pt-6 border-t-2 border-[#1A1A1A] flex items-center justify-between text-xs font-mono text-[#555555]">
          <div>FILED UNDER: {article.desk || "NEWS WIRE"} • ARCHIVE REGISTRY № 2026-9A</div>
          <div className="text-[#A71919] font-bold">END OF TELEGRAPHIC DISPATCH</div>
        </div>
      </main>

      <NewspaperFooter onSelectDesk={() => {}} />
    </div>
  );
}
