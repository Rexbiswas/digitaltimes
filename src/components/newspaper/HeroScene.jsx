"use client";

import { leadStory } from "@/data/newspaperData";
import { Clock, ArrowRight } from "lucide-react";
import { cleanEditorialText } from "@/utils/articlePresenter";

export default function HeroScene({ onOpenStory, story }) {
  const rawStory = story || leadStory;
  const currentStory = {
    ...rawStory,
    deck: cleanEditorialText(rawStory.deck, rawStory.headline),
    leadParagraph: cleanEditorialText(rawStory.leadParagraph, rawStory.headline),
  };

  return (
    <section
      id="hero-dispatch"
      className="relative w-full bg-[#E8DFC8] pt-6 pb-10 border-b border-[#766E5F] select-none"
    >
      {/* Background Watermark Date */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] font-serif text-[16vw] font-black leading-none text-[#201E19] z-0">
        1926–2026
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 relative z-10 space-y-6">
        {/* Top Editorial Ribbon */}
        <div className="flex items-center justify-between border-b border-[#766E5F] pb-2 text-xs font-mono text-[#39352D]">
          <div className="flex items-center gap-2">
            <span className="bg-[#9F3028] text-[#E8DFC8] text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase">
              {currentStory.editionBadge || "SPECIAL INVESTIGATION"}
            </span>
            <span className="font-semibold text-[#201E19]">{currentStory.desk || "TECHNOLOGY"} DESK</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{currentStory.location || "WIRE BUREAU"}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#9F3028]" />
              {currentStory.readTime || "5 MIN READ"}
            </span>
            <span className="font-bold text-[#201E19]">{currentStory.page || "PAGE 01"}</span>
          </div>
        </div>

        {/* Lead Headline & Deck (Clean, Static, Authentic Broadsheet) */}
        <div className="text-center max-w-5xl mx-auto space-y-3">
          <div className="inline-block border-y border-[#766E5F]/30 py-1 px-4">
            <span className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.3em] uppercase text-[#39352D]">
              THE STORIES SHAPING THE DIGITAL WORLD
            </span>
          </div>

          <h2
            onClick={() => onOpenStory(currentStory)}
            className="font-serif font-black text-3xl sm:text-5xl md:text-6xl lg:text-[5.2rem] leading-[0.96] tracking-tight text-[#201E19] uppercase hover:text-[#9F3028] transition-colors cursor-pointer select-text"
            data-cursor="READ LEAD"
          >
            {currentStory.headline}
          </h2>

          <p className="text-base sm:text-lg md:text-xl font-serif text-[#39352D] max-w-3xl mx-auto leading-relaxed font-normal select-text">
            {currentStory.deck}
          </p>

          <div className="text-xs font-mono text-[#39352D] tracking-wider uppercase pt-1">
            {currentStory.author} • {currentStory.date}
          </div>
        </div>

        {/* Documentary Editorial Photo */}
        <div className="w-full flex flex-col items-center">
          <div
            onClick={() => onOpenStory(currentStory)}
            className="relative w-full max-w-4xl h-[380px] sm:h-[460px] md:h-[520px] overflow-hidden border-2 border-[#766E5F] cursor-pointer group shadow-sm bg-[#766E5F]"
            data-cursor="VIEW STORY"
          >
            <img
              src={currentStory.urlToImage || currentStory.image || "/window.svg"}
              alt="The Digital Times Lead Photo"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/window.svg";
              }}
              className="w-full h-full object-cover object-center filter contrast-[1.08] saturate-[0.88] transition-transform duration-500 group-hover:scale-[1.02]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#201E19]/80 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-3 left-3 bg-[#E8DFC8] text-[#201E19] px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase border border-[#766E5F] shadow-xs">
              DOCUMENTARY EVIDENCE № 26-A
            </div>

            {/* Embedded Broadsheet Pull Quote */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 pointer-events-none text-[#E8DFC8]">
              <div className="max-w-2xl bg-[#201E19]/85 p-3.5 sm:p-5 border-l-4 border-[#9F3028] backdrop-blur-xs">
                <p className="font-serif text-sm sm:text-base md:text-lg font-light italic leading-snug">
                  {currentStory.pullQuote || "“Software is no longer static instructions executing deterministically; it has evolved into conversational, self-healing ecologies operating at the speed of thought.”"}
                </p>
                <div className="mt-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#D4CDBC]">
                  — THE EDITORIAL BOARD DISPATCH
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-[#39352D] pt-2 px-1 gap-1 border-b border-[#766E5F]/30">
            <span className="italic">{currentStory.imageCaption || "THE DIGITAL TIMES INVESTIGATIVE WIRE"}</span>
            <span className="uppercase text-[10px] text-[#777777] shrink-0 font-bold">
              {currentStory.imageCredit || "The Digital Times Bureau"}
            </span>
          </div>

          {/* Direct Article Button */}
          <div className="pt-4">
            <button
              onClick={() => onOpenStory(currentStory)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#201E19] hover:text-[#9F3028] border border-[#766E5F] px-4 py-2 hover:bg-[#201E19] hover:text-[#E8DFC8] transition-all cursor-pointer"
              data-cursor="READ"
            >
              <span>Read Full Investigation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
