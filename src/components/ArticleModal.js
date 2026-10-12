"use client";

import { useEffect, useState } from "react";
import { X, Bookmark, Volume2, Pause, Play, Share2, ArrowRight, CornerDownRight, Check } from "lucide-react";

export default function ArticleModal({ article, onClose, onSaveClipping, isSaved }) {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioProgress, setAudioProgress] = useState(12);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  if (!article) return null;

  const toggleAudio = () => {
    setIsPlayingAudio(!isPlayingAudio);
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#201E19]/85 backdrop-blur-xs flex items-center justify-center p-2 sm:p-6 overflow-y-auto animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-5xl bg-[#E8DFC8] text-[#201E19] border-2 border-[#766E5F] shadow-2xl my-auto max-h-[92vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Newspaper Header Bar */}
        <div className="bg-[#DFD5BC] border-b-2 border-[#766E5F] px-4 py-2.5 flex items-center justify-between select-none">
          <div className="flex items-center gap-2 text-xs font-mono text-[#39352D]">
            <span className="bg-[#201E19] text-[#E8DFC8] text-sm font-normal font-masthead px-2.5 py-0.5">
              The Digital Times
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="font-bold text-[#201E19] uppercase tracking-wider">
              {article.desk || "EDITORIAL DESK"}
            </span>
            <span className="hidden md:inline">• {article.page || "PAGE 01"}</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSaveClipping(article)}
              className="hover:text-[#9F3028] p-1.5 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
              title="Save to Clippings"
              data-cursor="CLIP"
            >
              <Bookmark className={`w-4 h-4 ${isSaved(article.id) ? "fill-[#9F3028] text-[#9F3028]" : ""}`} />
              <span className="hidden sm:inline">
                {isSaved(article.id) ? "Saved" : "Clip"}
              </span>
            </button>

            <button
              onClick={handleShare}
              className="hover:text-[#9F3028] p-1.5 transition-colors cursor-pointer flex items-center gap-1 text-xs font-mono"
              title="Copy Citation Link"
              data-cursor="SHARE"
            >
              {copiedLink ? <Check className="w-4 h-4 text-[#1d6b2c]" /> : <Share2 className="w-4 h-4" />}
              <span className="hidden sm:inline">{copiedLink ? "Copied" : "Share"}</span>
            </button>


            <button
              onClick={onClose}
              className="bg-[#201E19] text-[#E8DFC8] hover:bg-[#9F3028] p-1.5 transition-colors cursor-pointer"
              title="Close Article"
              data-cursor="CLOSE"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Broadsheet Article Body */}
        <div className="overflow-y-auto px-4 sm:px-10 py-6 sm:py-10 space-y-8 select-text">
          {/* Article Header */}
          <div className="text-center max-w-4xl mx-auto border-b border-[#766E5F] pb-6">
            <div className="font-mono text-xs text-[#9F3028] uppercase tracking-[0.25em] font-bold mb-2">
              {article.desk || "SPECIAL DISPATCH"} / {article.page || "PAGE 01"}
            </div>

            <h1 className="font-serif font-black text-3xl sm:text-5xl md:text-6xl text-[#201E19] uppercase tracking-tight leading-[0.98] mb-4">
              {article.headline}
            </h1>

            <p className="font-serif text-lg sm:text-xl text-[#39352D] leading-relaxed max-w-2xl mx-auto mb-4">
              {article.deck}
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono text-[#39352D] uppercase tracking-wider pt-2 border-t border-[#766E5F]/30">
              <span className="font-bold text-[#201E19]">{article.author || "By The Editorial Board"}</span>
              <span>•</span>
              <span>{article.date || "September 30, 2026"}</span>
              <span>•</span>
              <span>{article.readTime || "6 MIN READ"}</span>
            </div>
          </div>

          {/* Interactive Audio Player Bar */}
          <div className="max-w-3xl mx-auto bg-[#DFD5BC] border border-[#766E5F] p-3 flex items-center justify-between gap-4 select-none">
            <div className="flex items-center gap-3">
              <button
                onClick={toggleAudio}
                className="w-8 h-8 rounded-full bg-[#201E19] text-[#E8DFC8] flex items-center justify-center hover:bg-[#9F3028] transition-colors cursor-pointer"
                data-cursor="AUDIO"
              >
                {isPlayingAudio ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
              </button>
              <div>
                <div className="font-mono text-xs font-bold text-[#201E19] uppercase flex items-center gap-1.5">
                  <Volume2 className="w-3.5 h-3.5 text-[#9F3028]" />
                  BROADSHEET AUDIO DISPATCH
                </div>
                <div className="text-[10px] font-mono text-[#666666]">
                  {isPlayingAudio ? "Synthesized voice readout in progress..." : "Narrated by Times Synthetic Telegraph Service • 4:18 min"}
                </div>
              </div>
            </div>

            <div className="w-36 hidden sm:block">
              <div className="w-full bg-[#D4CDBC] h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-[#9F3028] h-full transition-all duration-300"
                  style={{ width: isPlayingAudio ? "46%" : "15%" }}
                />
              </div>
            </div>
          </div>

          {/* Telegraphic Video Broadcast Section if Available */}
          {article.video && (
            <div className="max-w-4xl mx-auto border-2 border-[#766E5F] bg-[#201E19] overflow-hidden shadow-md">
              <div className="bg-[#766E5F] text-[#E8DFC8] px-3.5 py-2 flex items-center justify-between text-xs font-mono border-b border-[#333333]">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#9F3028] animate-pulse" />
                  <span className="font-bold tracking-wider uppercase text-[#E0DACB]">
                    TELEGRAPHIC VIDEO DISPATCH
                  </span>
                </div>
                <span className="text-[10px] text-[#A8A295] uppercase font-bold tracking-widest hidden sm:inline">
                  BROADSHEET REEL • 1080P
                </span>
              </div>
              <div className="relative aspect-video w-full bg-black">
                <iframe
                  src={article.video}
                  title={article.headline}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="p-2.5 bg-[#141414] text-[#DFD5BC] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-1 border-t border-[#262626]">
                <span className="text-[#C5A059] font-medium">
                  {article.videoCaption || `Documentary briefing: ${article.headline}`}
                </span>
                <span className="text-[10px] text-[#888888] shrink-0 uppercase font-semibold">
                  THE DIGITAL TIMES BROADCAST
                </span>
              </div>
            </div>
          )}

          {/* Featured Editorial Photo */}
          {(article.image || true) && (
            <div className="max-w-4xl mx-auto border-2 border-[#766E5F] p-1 bg-[#766E5F]">
              <img
                src={article.urlToImage || article.image || "/window.svg"}
                alt={article.headline}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/window.svg";
                }}
                className="w-full h-auto max-h-[500px] object-cover object-center filter contrast-[1.08] saturate-[0.88]"
              />
              <div className="p-2 bg-[#201E19] text-[#DFD5BC] flex flex-col sm:flex-row items-start sm:items-center justify-between text-xs font-mono gap-1">
                <span>{article.imageCaption || `WIRE DISPATCH PHOTO: ${article.headline}`}</span>
                <span className="uppercase text-[10px] text-[#A8A295] shrink-0">
                  {article.imageCredit || article.sourceName || "Times Dispatch Wire"}
                </span>
              </div>
            </div>
          )}

          {/* Multi-column Broadsheet Editorial Article Body */}
          <div className="max-w-4xl mx-auto">
            <div className="newspaper-columns-2 text-[15px] sm:text-[16px] font-serif leading-[1.75] text-[#222222]">
              <p className="drop-cap mb-6">
                {article.leadParagraph || article.body || article.deck || "In the rapid evolution of digital architecture, the boundaries between the physical document and the reactive computation fabric have converged into a singular medium of expression."}
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

            {/* Section 24: Grand Pull Quote */}
            {article.pullQuote && (
              <div className="my-10 py-8 px-6 border-y-4 border-[#766E5F] bg-[#DFD5BC] text-center">
                <span className="font-serif text-5xl text-[#9F3028] font-black leading-none block mb-2">
                  “
                </span>
                <p className="font-serif text-xl sm:text-2xl md:text-3xl font-light italic leading-snug text-[#201E19] max-w-2xl mx-auto">
                  {article.pullQuote.replace(/^[“"]|[”"]$/g, "")}
                </p>
                <div className="mt-4 font-mono text-xs uppercase tracking-widest text-[#39352D]">
                  — THE DIGITAL TIMES EDITORIAL COGNITION DESK
                </div>
              </div>
            )}

            {/* Footnote & Archive Seal */}
            <div className="pt-6 border-t-2 border-[#766E5F] flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#39352D] gap-2">
              <div>FILED UNDER: {article.desk || "NEWS WIRE"} • ARCHIVE REGISTRY № 2026-9A</div>
              <div className="text-[#9F3028] font-bold">END OF TELEGRAPHIC DISPATCH</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
