"use client";

import { leadStory, frontPageSecondaryStories } from "@/data/newspaperData";
import { Bookmark, ArrowRight, CornerDownRight, FileText } from "lucide-react";

export default function FrontPageGrid({ onOpenStory, onSaveClipping, isSaved }) {
  return (
    <section id="frontpage" className="w-full bg-[#E8DFC8] py-8 border-b border-[#766E5F]">
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

        {/* The Broad Editorial Layout: Left Lead Story Columns, Right Secondary Wire Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Lead Story Full Column Treatment (8 columns on large screens) */}
          <div className="lg:col-span-8 lg:pr-6 lg:border-r border-[#766E5F]/30 flex flex-col justify-between">
            <div>
              {/* Kicker & Meta */}
              <div className="flex items-center justify-between text-xs font-mono text-[#39352D] mb-2">
                <span className="text-[#9F3028] font-bold uppercase tracking-wider">
                  {leadStory.kicker || "SPECIAL CORRESPONDENCE"}
                </span>
                <span>{leadStory.location} — {leadStory.date}</span>
              </div>

              {/* Headline */}
              <h3
                onClick={() => onOpenStory(leadStory)}
                className="font-serif font-bold text-3xl sm:text-4xl md:text-5xl leading-[1.05] text-[#201E19] tracking-tight uppercase hover:text-[#9F3028] transition-colors cursor-pointer mb-3"
                data-cursor="READ"
              >
                {leadStory.headline}
              </h3>

              {/* Byline with Action Bar */}
              <div className="flex items-center justify-between py-2 border-y border-[#766E5F]/30 text-xs font-mono text-[#39352D] mb-4">
                <span className="font-bold tracking-wider">{leadStory.author}</span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => onSaveClipping(leadStory)}
                    className="hover:text-[#9F3028] flex items-center gap-1 cursor-pointer"
                    title="Clip to Scrapbook"
                    data-cursor="CLIP"
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isSaved(leadStory.id) ? "fill-[#9F3028] text-[#9F3028]" : ""}`} />
                    <span className="text-[11px] hidden sm:inline">
                      {isSaved(leadStory.id) ? "Clipped" : "Clip Story"}
                    </span>
                  </button>
                  <span>•</span>
                  <button
                    onClick={() => onOpenStory(leadStory)}
                    className="hover:text-[#9F3028] flex items-center gap-1 cursor-pointer font-bold"
                    data-cursor="READ"
                  >
                    <span>Full Article</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Multi-column Newspaper Body Typography */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[15px] font-serif leading-[1.65] text-[#222222] text-justify">
                <div>
                  <p className="drop-cap mb-4">
                    {leadStory.leadParagraph}
                  </p>
                  <p className="mb-4">
                    {leadStory.bodyParagraphs[0]}
                  </p>
                </div>

                <div>
                  <p className="mb-4">
                    {leadStory.bodyParagraphs[1]}
                  </p>

                  {/* Editorial Pull Quote inside column */}
                  <blockquote className="my-4 py-3 px-4 border-y-2 border-[#766E5F] bg-[#DFD5BC] font-serif italic text-base sm:text-lg leading-snug text-[#201E19]">
                    “The artisanal spirit of early computing has not evaporated; it has ascended to the level of intent.”
                  </blockquote>

                  <p className="mb-4">
                    {leadStory.bodyParagraphs[2]}
                  </p>
                </div>
              </div>
            </div>

            {/* Bottom Continued Indicator & Boxed Editorial Sidebar */}
            <div className="mt-6 pt-4 border-t border-[#766E5F] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2 text-[#9F3028] font-bold">
                <CornerDownRight className="w-4 h-4" />
                <button
                  onClick={() => onOpenStory(leadStory)}
                  className="hover:underline tracking-wider"
                  data-cursor="READ"
                >
                  CONTINUED IN DEPTH WITH FULL CITATIONS ON PAGE 04 →
                </button>
              </div>

              <div className="bg-[#201E19] text-[#E8DFC8] text-[10px] px-2 py-1 tracking-widest uppercase">
                EDITION ARCHIVE: DISPATCH № 2026-9A
              </div>
            </div>
          </div>

          {/* Right Column: Secondary Stories & Desk Previews (4 columns) */}
          <div className="lg:col-span-4 flex flex-col justify-between space-y-6">
            <div>
              <div className="border-b border-[#766E5F] pb-1 mb-4 flex items-center justify-between text-xs font-mono text-[#201E19] font-bold">
                <span>FRONT PAGE WIRE</span>
                <span className="text-[#9F3028]">COLUMNS 2–4</span>
              </div>

              {/* Stacked Authentic Newspaper Articles separated by Hairline Rules */}
              <div className="space-y-6">
                {frontPageSecondaryStories.map((story, idx) => (
                  <article
                    key={story.id}
                    className="pb-5 border-b border-[#766E5F]/30 last:border-b-0 group"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-[#39352D] mb-1">
                      <span className="text-[#9F3028] font-bold uppercase tracking-wider">
                        {story.desk}
                      </span>
                      <span>{story.page}</span>
                    </div>

                    <h4
                      onClick={() => onOpenStory(story)}
                      className="font-serif font-bold text-xl sm:text-2xl leading-snug text-[#201E19] group-hover:text-[#9F3028] transition-colors cursor-pointer uppercase mb-1.5"
                      data-cursor="READ"
                    >
                      {story.headline}
                    </h4>

                    <p className="text-xs sm:text-sm font-serif text-[#39352D] leading-relaxed mb-2">
                      {story.deck}
                    </p>

                    <p className="text-xs font-serif text-[#39352D] italic leading-normal line-clamp-3 mb-2">
                      {story.snippet}
                    </p>

                    <div className="flex items-center justify-between text-[11px] font-mono text-[#666666] pt-1">
                      <span>{story.author}</span>
                      <button
                        onClick={() => onOpenStory(story)}
                        className="text-[#201E19] hover:text-[#9F3028] font-bold inline-flex items-center gap-1 cursor-pointer"
                        data-cursor="READ"
                      >
                        <span>Read</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {/* Authentic Classified Wire Box at the bottom of the right column */}
            <div className="border-2 border-[#766E5F] p-3.5 bg-[#DFD5BC]">
              <div className="text-[10px] font-mono font-bold tracking-widest text-[#9F3028] uppercase border-b border-[#766E5F] pb-1 mb-2 flex items-center justify-between">
                <span>OFFICIAL DISPATCH NOTICE</span>
                <span>VOL. 01</span>
              </div>
              <p className="text-xs font-serif italic text-[#222222] leading-tight">
                “Subscribers desiring telegraphic updates directly to their autonomous agent relays may deposit token stakes at the New Delhi bureau.”
              </p>
              <div className="mt-2 text-[9px] font-mono text-[#39352D] uppercase text-right">
                — CIRCULATION DEPT.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
