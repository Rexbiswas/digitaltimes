"use client";

import { aiDeskArticles } from "@/data/newspaperData";
import { Cpu, Award, Zap, BarChart2, ArrowRight } from "lucide-react";

export default function AiDesk({ onOpenStory }) {
  const { lead, secondaries } = aiDeskArticles;

  return (
    <section id="ai" className="w-full bg-[#F2EEE5] py-10 border-b border-[#1A1A1A]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Newspaper Department Header */}
        <div className="border-t-4 border-b-2 border-[#1A1A1A] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#A71919] uppercase font-bold">
              DEPARTMENT OF COMPUTATION & COGNITION
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#111111] uppercase tracking-tight">
              THE AI DESK
            </h3>
          </div>
          <div className="text-xs font-mono text-[#555555] flex flex-wrap items-center gap-2 sm:gap-4 uppercase">
            <span>ARTIFICIAL INTELLIGENCE</span>
            <span>•</span>
            <span>MACHINE LEARNING</span>
            <span>•</span>
            <span>AGENTS</span>
            <span>•</span>
            <span>MODELS</span>
            <span>•</span>
            <span>RESEARCH</span>
          </div>
        </div>

        {/* The Desk Broadsheet Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main AI Feature (7 columns) */}
          <div className="lg:col-span-7 lg:pr-6 lg:border-r border-[#1A1A1A]/30">
            <div className="text-[11px] font-mono text-[#A71919] uppercase font-bold mb-1">
              FRONTIER LABORATORY REPORT • {lead.page}
            </div>

            <h4
              onClick={() => onOpenStory(lead)}
              className="font-serif font-black text-3xl sm:text-4xl md:text-5xl leading-[1.0] text-[#111111] uppercase hover:text-[#A71919] transition-colors cursor-pointer mb-3"
              data-cursor="READ"
            >
              {lead.headline}
            </h4>

            <p className="font-serif text-base sm:text-lg text-[#333333] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <div className="text-xs font-mono text-[#666666] mb-4 pb-2 border-b border-[#1A1A1A]/30">
              {lead.author} • 6 MIN READ • GENEVA BUREAU
            </div>

            {/* Editorial Body Text */}
            <p className="font-serif text-[15px] leading-[1.65] text-[#222222] mb-4 text-justify">
              {lead.body}
            </p>

            {/* Editorial Pull Quote */}
            <blockquote className="my-6 p-4 border-l-4 border-[#1A1A1A] bg-[#ECE6D8] font-serif italic text-lg text-[#111111] leading-snug">
              {lead.pullQuote}
            </blockquote>

            {/* Read Button */}
            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111111] hover:text-[#A71919] border border-[#111111] px-3 py-1.5 hover:bg-[#111111] hover:text-[#F2EEE5] transition-all cursor-pointer"
              data-cursor="READ"
            >
              <span>Read Full Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Benchmarks Table & Secondary Stories (5 columns) */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
            {/* The Model Benchmark Table (Section 25 Editorial Data) */}
            <div className="border-2 border-[#1A1A1A] p-4 bg-[#ECE6D8]">
              <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2 mb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111] flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-[#A71919]" />
                  AUTONOMOUS REASONING ELO BENCHMARK (2026)
                </span>
                <span className="font-mono text-[9px] bg-[#111111] text-[#F2EEE5] px-1">
                  OFFICIAL AUDIT
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-[11px] text-[#222222]">
                  <thead>
                    <tr className="border-b border-[#1A1A1A]/40 text-[#555555]">
                      <th className="py-1">MODEL</th>
                      <th className="py-1">REASONING</th>
                      <th className="py-1">FORMAL MATH</th>
                      <th className="py-1 text-right">LATENCY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]/20">
                    {lead.benchmarks.map((row) => (
                      <tr key={row.model} className="hover:bg-[#111111]/5">
                        <td className="py-1.5 font-bold text-[#111111]">{row.model}</td>
                        <td className="py-1.5">{row.reasoningElo}</td>
                        <td className="py-1.5 text-[#1d6b2c] font-semibold">{row.mathElo}</td>
                        <td className="py-1.5 text-right font-mono">{row.latency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-2 text-[9px] font-mono text-[#666666] italic text-right">
                Audited under dual-blind verification standards by the Open Weights Registry.
              </div>
            </div>

            {/* Secondary AI Dispatches */}
            <div className="space-y-4">
              <div className="border-b border-[#1A1A1A] pb-1 text-xs font-mono font-bold uppercase text-[#555555]">
                AI RESEARCH TELEGRAPH
              </div>

              {secondaries.map((sec) => (
                <div
                  key={sec.id}
                  onClick={() => onOpenStory(sec)}
                  className="group pb-3 border-b border-[#1A1A1A]/25 cursor-pointer"
                  data-cursor="READ"
                >
                  <div className="text-[10px] font-mono text-[#777777] mb-0.5">
                    {sec.time} • {sec.readTime}
                  </div>
                  <h5 className="font-serif font-bold text-lg text-[#111111] group-hover:text-[#A71919] transition-colors leading-snug">
                    {sec.headline}
                  </h5>
                  <p className="font-serif text-xs text-[#444444] mt-1 leading-normal">
                    {sec.deck}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
