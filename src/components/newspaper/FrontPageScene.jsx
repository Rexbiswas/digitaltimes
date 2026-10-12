"use client";

import { leadStory, frontPageSecondaryStories } from "@/data/newspaperData";
import { Bookmark, ArrowRight, CornerDownRight, Play } from "lucide-react";

export default function FrontPageScene({
  onOpenStory,
  onSaveClipping,
  isSaved,
  articles,
  lead,
}) {
  const currentLead = lead || leadStory;
  const list = Array.isArray(articles) && articles.length > 0 ? articles : frontPageSecondaryStories;
  const story1 = list[0] || frontPageSecondaryStories[0];
  const story2 = list[1] || frontPageSecondaryStories[1];
  const story3 = list[2] || frontPageSecondaryStories[2];

  return (
    <section
      id="frontpage"
      className="w-full bg-[#E8DFC8] py-8 border-b border-[#766E5F] select-none scroll-mt-14 sm:scroll-mt-16"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b-2 border-[#766E5F] pb-1.5 mb-6 text-xs font-mono text-[#201E19]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-lg tracking-wider uppercase">
              SECTION 1: DISPATCHES FROM THE FRONT
            </span>
            <span className="bg-[#201E19] text-[#E8DFC8] text-[10px] px-1.5 py-0.2 uppercase font-mono">
              THE BROADSHEET
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[#39352D]">
            <span>FOLIO NO. 01</span>
            <span>•</span>
            <span>PAGE 01</span>
          </div>
        </div>

        {/* Morphing 3-Column Newspaper Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (3 columns on large screens) */}
          <div
            className="lg:col-span-3 border-r border-[#766E5F]/30 pr-4 space-y-6"
          >
            <div className="border-b border-[#766E5F] pb-1 mb-2 font-mono text-[11px] text-[#9F3028] font-bold uppercase">
              DISPATCH A // THE WEB
            </div>

            {story1 && (
              <article className="group">
                <h4
                  onClick={() => onOpenStory(story1)}
                  className="font-serif font-bold text-xl leading-snug text-[#201E19] group-hover:text-[#9F3028] transition-colors cursor-pointer uppercase mb-1.5"
                  data-cursor="READ"
                >
                  {story1.headline}
                </h4>
                <p className="text-xs font-serif text-[#39352D] leading-relaxed mb-2">
                  {story1.deck}
                </p>
                <div className="text-[10px] font-mono text-[#777777] uppercase">
                  {story1.author} • {story1.readTime}
                </div>
              </article>
            )}

            <div className="border-t border-[#766E5F]/20 pt-4">
              <div className="border-b border-[#766E5F] pb-1 mb-2 font-mono text-[11px] text-[#9F3028] font-bold uppercase">
                DISPATCH B // SILICON
              </div>
              {story2 && (
                <article className="group">
                  <h4
                    onClick={() => onOpenStory(story2)}
                    className="font-serif font-bold text-lg leading-snug text-[#201E19] group-hover:text-[#9F3028] transition-colors cursor-pointer uppercase mb-1.5"
                    data-cursor="READ"
                  >
                    {story2.headline}
                  </h4>
                  <p className="text-xs font-serif text-[#39352D] leading-relaxed mb-2">
                    {story2.deck}
                  </p>
                  <div className="text-[10px] font-mono text-[#777777] uppercase">
                    {story2.author} • {story2.readTime}
                  </div>
                </article>
              )}
            </div>
          </div>

          {/* Center Column: Dominant Main Broadsheet Feature (6 columns) */}
          <div
            className="lg:col-span-6 px-2 sm:px-4 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between text-xs font-mono text-[#39352D] mb-2">
                <span className="text-[#9F3028] font-bold uppercase tracking-wider">
                  {currentLead.kicker || "SPECIAL CORRESPONDENCE"}
                </span>
                <span>{currentLead.location || "CENTRAL WIRE"} — {currentLead.date || "TODAY"}</span>
              </div>

              <h3
                onClick={() => onOpenStory(currentLead)}
                className="font-serif font-bold text-2xl sm:text-4xl leading-[1.05] text-[#201E19] tracking-tight uppercase hover:text-[#9F3028] transition-colors cursor-pointer mb-3"
                data-cursor="READ"
              >
                {currentLead.headline}
              </h3>

              {/* Action Bar */}
              <div className="flex items-center justify-between py-2 border-y border-[#766E5F]/30 text-xs font-mono text-[#39352D] mb-4">
                <span className="font-bold tracking-wider">{currentLead.author}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSaveClipping(currentLead)}
                    className="hover:text-[#9F3028] flex items-center gap-1 cursor-pointer"
                    data-cursor="CLIP"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved(currentLead.id) ? "fill-[#9F3028] text-[#9F3028]" : ""}`} />
                    <span className="text-[11px] hidden sm:inline">
                      {isSaved(currentLead.id) ? "Clipped" : "Clip"}
                    </span>
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => onOpenStory(currentLead)}
                    className="hover:text-[#9F3028] flex items-center gap-1 cursor-pointer font-bold"
                    data-cursor="READ"
                  >
                    <span>Full Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Multi-column Body Text */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[14px] font-serif leading-[1.65] text-[#222222] text-justify">
                <div>
                  <p className="drop-cap mb-3">
                    {currentLead.leadParagraph}
                  </p>
                </div>
                <div>
                  <p className="mb-3">
                    {(currentLead.bodyParagraphs && currentLead.bodyParagraphs[0]) || currentLead.deck}
                  </p>
                  <blockquote className="my-2 py-2 px-3 border-y border-[#766E5F] bg-[#DFD5BC] font-serif italic text-sm text-[#201E19]">
                    “The artisanal spirit of early computing has ascended to the level of intent.”
                  </blockquote>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#766E5F] flex items-center justify-between text-xs font-mono">
              <button
                onClick={() => onOpenStory(currentLead)}
                className="text-[#9F3028] font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
                data-cursor="READ"
              >
                <CornerDownRight className="w-4 h-4" />
                <span>CONTINUED IN DEPTH ON PAGE 04 →</span>
              </button>
              <span className="text-[10px] text-[#777777] uppercase font-mono">
                DISPATCH № 2026-9A
              </span>
            </div>
          </div>

          {/* Right Column (3 columns) */}
          <div
            className="lg:col-span-3 border-l border-[#766E5F]/30 pl-4 space-y-6"
          >
            <div className="border-b border-[#766E5F] pb-1 mb-2 font-mono text-[11px] text-[#9F3028] font-bold uppercase">
              DISPATCH C // SECURITY
            </div>

            {story3 && (
              <article className="group">
                <h4
                  onClick={() => onOpenStory(story3)}
                  className="font-serif font-bold text-xl leading-snug text-[#201E19] group-hover:text-[#9F3028] transition-colors cursor-pointer uppercase mb-1.5"
                  data-cursor="READ"
                >
                  {story3.headline}
                </h4>
                <p className="text-xs font-serif text-[#39352D] leading-relaxed mb-2">
                  {story3.deck}
                </p>
                <div className="text-[10px] font-mono text-[#777777] uppercase">
                  {story3.author} • {story3.readTime}
                </div>
              </article>
            )}

            {/* Official Dispatch Notice Box */}
            <div className="border-2 border-[#766E5F] p-3 bg-[#DFD5BC]">
              <div className="text-[10px] font-mono font-bold tracking-widest text-[#9F3028] uppercase border-b border-[#766E5F] pb-1 mb-1.5 flex items-center justify-between">
                <span>CIRCULATION WIRE</span>
                <span>VOL. 01</span>
              </div>
              <p className="text-[11px] font-serif italic text-[#222222] leading-tight">
                “Telegraphic dispatches delivered continuously to autonomous agent subscriber relays worldwide.”
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
