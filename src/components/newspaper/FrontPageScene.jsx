"use client";

import { leadStory, frontPageSecondaryStories } from "@/data/newspaperData";
import { Bookmark, ArrowRight, CornerDownRight } from "lucide-react";

export default function FrontPageScene({ onOpenStory, onSaveClipping, isSaved }) {
  const story1 = frontPageSecondaryStories[0];
  const story2 = frontPageSecondaryStories[1];
  const story3 = frontPageSecondaryStories[2];

  return (
    <section
      id="frontpage"
      className="w-full bg-[#F2EEE5] py-8 border-b border-[#1A1A1A] select-none scroll-mt-14 sm:scroll-mt-16"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between border-b-2 border-[#1A1A1A] pb-1.5 mb-6 text-xs font-mono text-[#111111]">
          <div className="flex items-center gap-2">
            <span className="font-serif font-black text-lg tracking-wider uppercase">
              SECTION 1: DISPATCHES FROM THE FRONT
            </span>
            <span className="bg-[#111111] text-[#F2EEE5] text-[10px] px-1.5 py-0.2 uppercase font-mono">
              THE BROADSHEET
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[#555555]">
            <span>FOLIO NO. 01</span>
            <span>•</span>
            <span>PAGE 01</span>
          </div>
        </div>

        {/* Morphing 3-Column Newspaper Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (3 columns on large screens) */}
          <div
            className="lg:col-span-3 border-r border-[#1A1A1A]/30 pr-4 space-y-6"
          >
            <div className="border-b border-[#1A1A1A] pb-1 mb-2 font-mono text-[11px] text-[#A71919] font-bold uppercase">
              DISPATCH A // THE WEB
            </div>

            {story1 && (
              <article className="group">
                <h4
                  onClick={() => onOpenStory(story1)}
                  className="font-serif font-bold text-xl leading-snug text-[#111111] group-hover:text-[#A71919] transition-colors cursor-pointer uppercase mb-1.5"
                  data-cursor="READ"
                >
                  {story1.headline}
                </h4>
                <p className="text-xs font-serif text-[#444444] leading-relaxed mb-2">
                  {story1.deck}
                </p>
                <div className="text-[10px] font-mono text-[#777777] uppercase">
                  {story1.author} • {story1.readTime}
                </div>
              </article>
            )}

            <div className="border-t border-[#1A1A1A]/20 pt-4">
              <div className="border-b border-[#1A1A1A] pb-1 mb-2 font-mono text-[11px] text-[#A71919] font-bold uppercase">
                DISPATCH B // SILICON
              </div>
              {story2 && (
                <article className="group">
                  <h4
                    onClick={() => onOpenStory(story2)}
                    className="font-serif font-bold text-lg leading-snug text-[#111111] group-hover:text-[#A71919] transition-colors cursor-pointer uppercase mb-1.5"
                    data-cursor="READ"
                  >
                    {story2.headline}
                  </h4>
                  <p className="text-xs font-serif text-[#444444] leading-relaxed mb-2">
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
              <div className="flex items-center justify-between text-xs font-mono text-[#555555] mb-2">
                <span className="text-[#A71919] font-bold uppercase tracking-wider">
                  {leadStory.kicker || "SPECIAL CORRESPONDENCE"}
                </span>
                <span>{leadStory.location} — {leadStory.date}</span>
              </div>

              <h3
                onClick={() => onOpenStory(leadStory)}
                className="font-serif font-bold text-2xl sm:text-4xl leading-[1.05] text-[#111111] tracking-tight uppercase hover:text-[#A71919] transition-colors cursor-pointer mb-3"
                data-cursor="READ"
              >
                {leadStory.headline}
              </h3>

              {/* Action Bar */}
              <div className="flex items-center justify-between py-2 border-y border-[#1A1A1A]/30 text-xs font-mono text-[#333333] mb-4">
                <span className="font-bold tracking-wider">{leadStory.author}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSaveClipping(leadStory)}
                    className="hover:text-[#A71919] flex items-center gap-1 cursor-pointer"
                    data-cursor="CLIP"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved(leadStory.id) ? "fill-[#A71919] text-[#A71919]" : ""}`} />
                    <span className="text-[11px] hidden sm:inline">
                      {isSaved(leadStory.id) ? "Clipped" : "Clip"}
                    </span>
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => onOpenStory(leadStory)}
                    className="hover:text-[#A71919] flex items-center gap-1 cursor-pointer font-bold"
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
                    {leadStory.leadParagraph}
                  </p>
                </div>
                <div>
                  <p className="mb-3">
                    {leadStory.bodyParagraphs[0]}
                  </p>
                  <blockquote className="my-2 py-2 px-3 border-y border-[#1A1A1A] bg-[#ECE6D8] font-serif italic text-sm text-[#111111]">
                    “The artisanal spirit of early computing has ascended to the level of intent.”
                  </blockquote>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#1A1A1A] flex items-center justify-between text-xs font-mono">
              <button
                onClick={() => onOpenStory(leadStory)}
                className="text-[#A71919] font-bold hover:underline flex items-center gap-1.5 cursor-pointer"
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
            className="lg:col-span-3 border-l border-[#1A1A1A]/30 pl-4 space-y-6"
          >
            <div className="border-b border-[#1A1A1A] pb-1 mb-2 font-mono text-[11px] text-[#A71919] font-bold uppercase">
              DISPATCH C // SECURITY
            </div>

            {story3 && (
              <article className="group">
                <h4
                  onClick={() => onOpenStory(story3)}
                  className="font-serif font-bold text-xl leading-snug text-[#111111] group-hover:text-[#A71919] transition-colors cursor-pointer uppercase mb-1.5"
                  data-cursor="READ"
                >
                  {story3.headline}
                </h4>
                <p className="text-xs font-serif text-[#444444] leading-relaxed mb-2">
                  {story3.deck}
                </p>
                <div className="text-[10px] font-mono text-[#777777] uppercase">
                  {story3.author} • {story3.readTime}
                </div>
              </article>
            )}

            {/* Official Dispatch Notice Box */}
            <div className="border-2 border-[#1A1A1A] p-3 bg-[#ECE6D8]">
              <div className="text-[10px] font-mono font-bold tracking-widest text-[#A71919] uppercase border-b border-[#1A1A1A] pb-1 mb-1.5 flex items-center justify-between">
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
