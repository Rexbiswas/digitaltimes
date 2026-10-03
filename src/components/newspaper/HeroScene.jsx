"use client";

import { leadStory } from "@/data/newspaperData";
import { Clock, ArrowRight } from "lucide-react";

export default function HeroScene({ onOpenStory }) {
  return (
    <section
      id="hero-dispatch"
      className="relative w-full bg-[#F2EEE5] pt-6 pb-10 border-b border-[#1A1A1A] select-none"
    >
      {/* Background Watermark Date */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] font-serif text-[16vw] font-black leading-none text-[#111111] z-0">
        1926–2026
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 relative z-10 space-y-6">
        {/* Top Editorial Ribbon */}
        <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2 text-xs font-mono text-[#555555]">
          <div className="flex items-center gap-2">
            <span className="bg-[#A71919] text-[#F2EEE5] text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase">
              {leadStory.editionBadge}
            </span>
            <span className="font-semibold text-[#111111]">{leadStory.desk} DESK</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{leadStory.location}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#A71919]" />
              {leadStory.readTime}
            </span>
            <span className="font-bold text-[#111111]">{leadStory.page}</span>
          </div>
        </div>

        {/* Lead Headline & Deck (Clean, Static, Authentic Broadsheet) */}
        <div className="text-center max-w-5xl mx-auto space-y-3">
          <div className="inline-block border-y border-[#1A1A1A]/30 py-1 px-4">
            <span className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.3em] uppercase text-[#333333]">
              THE STORIES SHAPING THE DIGITAL WORLD
            </span>
          </div>

          <h2
            onClick={() => onOpenStory(leadStory)}
            className="font-serif font-black text-3xl sm:text-5xl md:text-6xl lg:text-[5.2rem] leading-[0.96] tracking-tight text-[#111111] uppercase hover:text-[#A71919] transition-colors cursor-pointer select-text"
            data-cursor="READ LEAD"
          >
            {leadStory.headline}
          </h2>

          <p className="text-base sm:text-lg md:text-xl font-serif text-[#333333] max-w-3xl mx-auto leading-relaxed font-normal select-text">
            {leadStory.deck}
          </p>

          <div className="text-xs font-mono text-[#555555] tracking-wider uppercase pt-1">
            {leadStory.author} • {leadStory.date}
          </div>
        </div>

        {/* Documentary Editorial Photo */}
        <div className="w-full flex flex-col items-center">
          <div
            onClick={() => onOpenStory(leadStory)}
            className="relative w-full max-w-4xl h-[380px] sm:h-[460px] md:h-[520px] overflow-hidden border-2 border-[#1A1A1A] cursor-pointer group shadow-sm bg-[#1A1A1A]"
            data-cursor="VIEW STORY"
          >
            <img
              src={leadStory.image}
              alt="The Digital Times Lead Photo"
              className="w-full h-full object-cover object-center filter contrast-[1.08] saturate-[0.88] transition-transform duration-500 group-hover:scale-[1.02]"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/80 via-transparent to-transparent pointer-events-none" />

            <div className="absolute top-3 left-3 bg-[#F2EEE5] text-[#111111] px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase border border-[#111111] shadow-xs">
              DOCUMENTARY EVIDENCE № 26-A
            </div>

            {/* Embedded Broadsheet Pull Quote */}
            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-8 pointer-events-none text-[#F2EEE5]">
              <div className="max-w-2xl bg-[#111111]/85 p-3.5 sm:p-5 border-l-4 border-[#A71919] backdrop-blur-xs">
                <p className="font-serif text-sm sm:text-base md:text-lg font-light italic leading-snug">
                  “Software is no longer static instructions executing deterministically; it has evolved into conversational, self-healing ecologies operating at the speed of thought.”
                </p>
                <div className="mt-1.5 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#D4CDBC]">
                  — THE EDITORIAL BOARD DISPATCH
                </div>
              </div>
            </div>
          </div>

          <div className="w-full max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-[#555555] pt-2 px-1 gap-1 border-b border-[#1A1A1A]/30">
            <span className="italic">{leadStory.imageCaption}</span>
            <span className="uppercase text-[10px] text-[#777777] shrink-0 font-bold">
              {leadStory.imageCredit}
            </span>
          </div>

          {/* Direct Article Button */}
          <div className="pt-4">
            <button
              onClick={() => onOpenStory(leadStory)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111111] hover:text-[#A71919] border border-[#111111] px-4 py-2 hover:bg-[#111111] hover:text-[#F2EEE5] transition-all cursor-pointer"
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
