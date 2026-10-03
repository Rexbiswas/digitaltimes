"use client";

import { futureDeskData } from "@/data/newspaperData";
import { Atom, Compass, Milestone, ArrowRight } from "lucide-react";

export default function FutureDesk({ onOpenStory }) {
  const { lead } = futureDeskData;

  return (
    <section id="future" className="w-full bg-[#ECE6D8] py-12 border-b-2 border-[#1A1A1A]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Department Header */}
        <div className="border-t-4 border-b-2 border-[#1A1A1A] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#A71919] uppercase font-bold">
              THE DEEP HORIZON • SPECULATIVE APPLIED SCIENCE
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#111111] uppercase tracking-tight">
              THE FUTURE
            </h3>
          </div>
          <div className="text-xs font-mono text-[#555555] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-bold">
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
          <div className="lg:col-span-7 lg:pr-6 lg:border-r border-[#1A1A1A]/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#555555] mb-1">
              <span className="text-[#A71919] font-bold uppercase tracking-wider">
                DEEP SCIENCE INVESTIGATION
              </span>
              <span>{lead.page}</span>
            </div>

            <h4
              onClick={() => onOpenStory(lead)}
              className="font-serif font-black text-3xl sm:text-5xl md:text-6xl leading-[0.96] text-[#111111] uppercase hover:text-[#A71919] transition-colors cursor-pointer mb-3"
              data-cursor="READ"
            >
              {lead.headline}
            </h4>

            {/* Editorial Photo Frame */}
            <div
              onClick={() => onOpenStory(lead)}
              className="my-4 border-2 border-[#1A1A1A] p-1 bg-[#1A1A1A] cursor-pointer group"
              data-cursor="VIEW LAB"
            >
              <div className="relative overflow-hidden h-[300px] sm:h-[380px]">
                <img
                  src={lead.image}
                  alt="Quantum Laboratory"
                  className="w-full h-full object-cover object-center filter contrast-[1.08] saturate-[0.85] transition-transform duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute top-2 left-2 bg-[#F2EEE5] text-[#111111] text-[10px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest border border-[#111111]">
                  OXFORD CRYOGENIC CORE № 03
                </div>
              </div>
              <div className="flex items-center justify-between text-[11px] font-mono text-[#E8E2D5] bg-[#111111] py-1.5 px-2">
                <span>{lead.imageCaption}</span>
                <span className="uppercase text-[10px]">{lead.imageCredit}</span>
              </div>
            </div>

            <p className="font-serif text-base sm:text-lg text-[#333333] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <div className="text-xs font-mono text-[#666666] mb-4 pb-2 border-b border-[#1A1A1A]/30">
              {lead.author} • {lead.readTime} • OXFORD RESEARCH CONSORTIUM
            </div>

            <p className="font-serif text-[15px] leading-[1.65] text-[#222222] mb-4 text-justify">
              {lead.body}
            </p>

            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111111] hover:text-[#A71919] border border-[#111111] px-3.5 py-1.5 hover:bg-[#111111] hover:text-[#F2EEE5] transition-all cursor-pointer"
              data-cursor="READ"
            >
              <span>Examine Quantum Architecture</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Column: Timeline of Technological Transitions (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-2 border-[#1A1A1A] p-4 bg-[#F2EEE5]">
              <div className="border-b border-[#1A1A1A] pb-2 mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                  <Atom className="w-3.5 h-3.5 text-[#A71919]" />
                  PROJECTED MILESTONE HORIZON
                </span>
                <span className="font-mono text-[9px] bg-[#111111] text-[#F2EEE5] px-1 font-bold">
                  2027–2030
                </span>
              </div>

              <div className="space-y-4">
                {lead.milestones.map((m) => (
                  <div key={m.year} className="border-b border-[#1A1A1A]/20 pb-3 last:border-b-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-sm font-black text-[#A71919] bg-[#A71919]/10 px-1.5 py-0.5 border border-[#A71919]/30">
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
            <div className="p-4 border border-[#1A1A1A] bg-[#ECE6D8]">
              <div className="text-[10px] font-mono text-[#A71919] uppercase font-bold tracking-widest mb-1">
                PHILOSOPHICAL CORRESPONDENCE
              </div>
              <h5 className="font-serif font-bold text-base text-[#111111] uppercase mb-1">
                The Preservation of the Human Artifact
              </h5>
              <p className="font-serif text-xs text-[#333333] leading-relaxed text-justify">
                Even as computation dissolves into molecular substrate and planetary energy grids, the human impulse to record, to question, and to print persists. The newspaper has survived the telegraph, radio, television, and the internet; it shall survive the singularity as well.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
