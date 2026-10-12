"use client";

import { futureDeskData } from "@/data/newspaperData";
import { Atom, Compass, Milestone, ArrowRight } from "lucide-react";

export default function FutureDesk({ onOpenStory }) {
  const { lead } = futureDeskData;

  return (
    <section id="future" className="w-full bg-[#DFD5BC] py-12 border-b-2 border-[#766E5F]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Department Header */}
        <div className="border-t-4 border-b-2 border-[#766E5F] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#9F3028] uppercase font-bold">
              THE DEEP HORIZON • SPECULATIVE APPLIED SCIENCE
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#201E19] uppercase tracking-tight">
              THE FUTURE
            </h3>
          </div>
          <div className="text-xs font-mono text-[#39352D] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-bold">
            <span className="tracking-widest">ROBOTICS</span>
            <span>•</span>
            <span className="tracking-widest">SPACE</span>
            <span>•</span>
            <span className="tracking-widest">AI</span>
            <span>•</span>
            <span className="tracking-widest">QUANTUM</span>
            <span>•</span>
            <span className="tracking-widest">BIOTECH</span>
            <span>•</span>
            <span className="tracking-widest">SMART CITIES</span>
          </div>
        </div>

        {/* Most Cinematic Section: Visual & Scientific Milestones */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Visual & Story (7 columns) */}
          <div className="lg:col-span-7 lg:pr-6 lg:border-r border-[#766E5F]/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#39352D] mb-1">
              <span className="text-[#9F3028] font-bold uppercase tracking-wider">
                DEEP SCIENCE INVESTIGATION
              </span>
              <span>{lead.page}</span>
            </div>

            <h4
              onClick={() => onOpenStory(lead)}
              className="font-serif font-black text-3xl sm:text-5xl md:text-6xl leading-[0.96] text-[#201E19] uppercase hover:text-[#9F3028] transition-colors cursor-pointer mb-3"
              data-cursor="READ"
            >
              {lead.headline}
            </h4>

            {/* Editorial Photo Frame */}
            <div
              onClick={() => onOpenStory(lead)}
              className="my-4 border-2 border-[#766E5F] p-1 bg-[#766E5F] cursor-pointer group"
              data-cursor="VIEW LAB"
            >
              <div className="relative overflow-hidden h-[300px] sm:h-[380px]">
                <img
                  src={lead.urlToImage || lead.image || "/window.svg"}
                  alt="Quantum Laboratory"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/window.svg";
                  }}
                  className="w-full h-full object-cover object-center filter contrast-[1.08] saturate-[0.85] transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute top-2 left-2 bg-[#E8DFC8] text-[#201E19] text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest border border-[#766E5F]">
                  OXFORD CRYOGENIC CORE № 03
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#E8E2D5] bg-[#201E19] py-1.5 px-2">
                <span>{lead.imageCaption}</span>
                <span className="uppercase text-[10px]">{lead.imageCredit}</span>
              </div>
            </div>

            <p className="font-serif text-base sm:text-lg text-[#39352D] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <div className="text-xs font-mono text-[#666666] mb-4 pb-2 border-b border-[#766E5F]/30">
              {lead.author} • {lead.readTime} • OXFORD RESEARCH CONSORTIUM
            </div>

            <p className="font-serif text-[15px] leading-[1.65] text-[#222222] mb-4 text-justify">
              {lead.body}
            </p>

            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#201E19] hover:text-[#9F3028] border border-[#766E5F] px-3.5 py-1.5 hover:bg-[#201E19] hover:text-[#E8DFC8] transition-all cursor-pointer"
              data-cursor="READ"
            >
              <span>Examine Quantum Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Column: Timeline of Technological Transitions (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-2 border-[#766E5F] p-4 bg-[#E8DFC8]">
              <div className="border-b border-[#766E5F] pb-2 mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#201E19] flex items-center gap-1.5">
                  <Atom className="w-3.5 h-3.5 text-[#9F3028]" />
                  PROJECTED MILESTONE HORIZON
                </span>
                <span className="font-mono text-[9px] bg-[#201E19] text-[#E8DFC8] px-1 font-bold">
                  2027–2030
                </span>
              </div>

              <div className="space-y-4">
                {lead.milestones.map((m) => (
                  <div key={m.year} className="border-b border-[#766E5F]/20 pb-3 last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-black text-[#9F3028] bg-[#9F3028]/10 px-1.5 py-0.5 border border-[#9F3028]/30">
                        {m.year}
                      </span>
                      <span className="text-[10px] font-mono uppercase text-[#777777] tracking-wider">
                        TRANSITION TARGET
                      </span>
                    </div>
                    <div className="font-serif text-sm text-[#222222] leading-snug">
                      {m.milestone}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Speculative Broadsheet Column */}
            <div className="p-4 border border-[#766E5F] bg-[#DFD5BC]">
              <div className="text-[10px] font-mono text-[#9F3028] uppercase font-bold tracking-widest mb-1">
                PHILOSOPHICAL CORRESPONDENCE
              </div>
              <h5 className="font-serif font-bold text-base text-[#201E19] uppercase mb-1">
                The Preservation of the Human Artifact
              </h5>
              <p className="font-serif text-xs text-[#39352D] leading-relaxed text-justify">
                Even as computation dissolves into molecular substrate and planetary energy grids, the human impulse to record, to question, and to print persists. The newspaper has survived the telegraph, radio, television, and the internet; it shall survive the singularity as well.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
