"use client";

import { gamingDeskData } from "@/data/newspaperData";
import { Gamepad2, Star, Gauge, Cpu, ArrowRight } from "lucide-react";

export default function GamingDesk({ onOpenStory }) {
  const { lead } = gamingDeskData;

  return (
    <section id="gaming" className="w-full bg-[#F2EEE5] py-10 border-b border-[#1A1A1A]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Newspaper Department Header */}
        <div className="border-t-4 border-b-2 border-[#1A1A1A] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#A71919] uppercase font-bold">
              INTERACTIVE WORLDS, GRAPHICS ENGINES & NEURAL SIMULATION
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#111111] uppercase tracking-tight">
              GAMING & SIMULATION DESK
            </h3>
          </div>
          <div className="text-xs font-mono text-[#555555] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-semibold">
            <span>RADIANCE FIELDS</span>
            <span>•</span>
            <span>PHYSICS ENGINES</span>
            <span>•</span>
            <span>REAL-TIME RAYTRACING</span>
            <span>•</span>
            <span>CRITIC REVIEWS</span>
          </div>
        </div>

        {/* Large Editorial Headline & Review Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Story & Review (7 columns) */}
          <div className="lg:col-span-7 lg:pr-6 lg:border-r border-[#1A1A1A]/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#555555] mb-1">
              <span className="text-[#A71919] font-bold uppercase tracking-wider">
                FEATURE CRITIQUE
              </span>
              <span>{lead.page}</span>
            </div>

            <h4
              onClick={() => onOpenStory(lead)}
              className="font-serif font-black text-3xl sm:text-4xl md:text-5xl leading-[1.0] text-[#111111] uppercase hover:text-[#A71919] transition-colors cursor-pointer mb-3"
              data-cursor="READ"
            >
              {lead.headline}
            </h4>

            {/* Editorial Review Score Banner */}
            <div className="my-4 border-y-2 border-[#1A1A1A] py-3 px-4 bg-[#ECE6D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="font-serif font-bold text-base text-[#111111] uppercase">
                  {lead.reviewTitle}
                </div>
                <div className="text-[11px] font-mono text-[#555555]">
                  Reviewed by Tobias Weber • Lead Game Critic
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-3xl font-black text-[#A71919]">
                  {lead.reviewScore}
                </span>
                <span className="font-mono text-[9px] bg-[#111111] text-[#F2EEE5] px-1.5 py-0.5 uppercase tracking-widest font-bold">
                  TIMES ESSENTIAL
                </span>
              </div>
            </div>

            <p className="font-serif text-base sm:text-lg text-[#333333] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <p className="font-serif text-[15px] leading-[1.65] text-[#222222] mb-4 text-justify">
              {lead.snippet}
            </p>

            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111111] hover:text-[#A71919] border border-[#111111] px-3.5 py-1.5 hover:bg-[#111111] hover:text-[#F2EEE5] transition-all cursor-pointer"
              data-cursor="READ"
            >
              <span>Read Full Review & Engine Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Column: Engine Frame Statistics & Simulation Telemetry (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-2 border-[#1A1A1A] p-4 bg-[#ECE6D8]">
              <div className="border-b border-[#1A1A1A] pb-2 mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#A71919]" />
                  ENGINE PIPELINE TELEMETRY (120 FPS LOCK)
                </span>
                <span className="font-mono text-[9px] bg-[#111111] text-[#F2EEE5] px-1 font-bold">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-3 font-mono">
                {lead.stats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#1A1A1A]/15 text-xs">
                    <span className="text-[#444444]">{stat.label}</span>
                    <span className="font-black text-[#111111]">{stat.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[9px] font-mono text-[#666666] italic text-right">
                Tested across 4K stereoscopic displays running dual neural coprocessors.
              </div>
            </div>

            {/* Editorial Column */}
            <div className="border border-[#1A1A1A] p-4 bg-[#F2EEE5]">
              <div className="text-[10px] font-mono text-[#A71919] font-bold uppercase tracking-widest mb-1">
                AESTHETIC DISPATCH
              </div>
              <h5 className="font-serif font-bold text-base text-[#111111] uppercase mb-1">
                The Disappearance of the Polygon
              </h5>
              <p className="font-serif text-xs text-[#333333] leading-relaxed text-justify">
                For half a century, 3D graphics were constructed from flat geometric triangles glued together like paper origami. Today, neural volumetric fields represent matter as continuous probabilistic fields of light. The polygon is dead; long live the photon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
