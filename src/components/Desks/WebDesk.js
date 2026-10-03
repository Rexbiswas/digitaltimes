"use client";

import { webDeskData } from "@/data/newspaperData";
import { Terminal, Code2, ArrowRight } from "lucide-react";

export default function WebDesk({ onOpenStory }) {
  const { lead, frameworkMetrics } = webDeskData;

  return (
    <section id="web" className="w-full bg-[#F2EEE5] py-10 border-b border-[#1A1A1A]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Newspaper Department Header */}
        <div className="border-t-4 border-b-2 border-[#1A1A1A] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#A71919] uppercase font-bold">
              SYSTEMS, PROTOCOLS & CLIENT ARCHITECTURE
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#111111] uppercase tracking-tight">
              THE WEB DESK
            </h3>
          </div>
          <div className="text-xs font-mono text-[#555555] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-bold">
            <span className="border-b border-[#111111]">REACT</span>
            <span>•</span>
            <span className="border-b border-[#111111]">NEXT.JS</span>
            <span>•</span>
            <span className="border-b border-[#111111]">WEBASSEMBLY</span>
            <span>•</span>
            <span className="border-b border-[#111111]">LOCAL-FIRST</span>
          </div>
        </div>

        {/* Dense Technical Newspaper Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Story & Technical Analysis (7 columns) */}
          <div className="lg:col-span-7 lg:pr-6 lg:border-r border-[#1A1A1A]/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#555555] mb-1">
              <span className="text-[#A71919] font-bold uppercase tracking-wider">
                ARCHITECTURE CRITIQUE
              </span>
              <span>{lead.page}</span>
            </div>

            <h4
              onClick={() => onOpenStory(lead)}
              className="font-serif font-black text-3xl sm:text-4xl md:text-5xl leading-[1.02] text-[#111111] uppercase hover:text-[#A71919] transition-colors cursor-pointer mb-3"
              data-cursor="READ"
            >
              {lead.headline}
            </h4>

            <p className="font-serif text-base sm:text-lg text-[#333333] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <div className="text-xs font-mono text-[#666666] mb-4 pb-2 border-b border-[#1A1A1A]/30">
              {lead.author} • {lead.readTime} • SAN FRANCISCO
            </div>

            <p className="font-serif text-[15px] leading-[1.65] text-[#222222] mb-4 text-justify">
              {lead.body}
            </p>

            {/* Tiny Code Snippet as an Editorial Woodcut / Etching Element */}
            <div className="my-6 border-2 border-[#1A1A1A] bg-[#ECE6D8] p-3 shadow-inner">
              <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-1.5 mb-2 font-mono text-[10px] text-[#111111] font-bold">
                <span className="flex items-center gap-1.5">
                  <Terminal className="w-3.5 h-3.5 text-[#A71919]" />
                  EXHIBIT B: DRAFT SPECIFICATION (RFC-9482)
                </span>
                <span className="text-[#555555]">[TYPESCRIPT SYNTAX]</span>
              </div>
              <pre className="font-mono text-[11px] leading-relaxed text-[#111111] overflow-x-auto p-2 bg-[#F2EEE5] border border-[#1A1A1A]/30">
                <code>{lead.codeSnippet}</code>
              </pre>
              <div className="mt-1.5 text-[9px] font-mono text-[#666666] italic">
                Figure 1.2 — The negotiation contract between human-facing browsers and background agent reasoning clusters.
              </div>
            </div>

            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111111] hover:text-[#A71919] border border-[#111111] px-3 py-1.5 hover:bg-[#111111] hover:text-[#F2EEE5] transition-all cursor-pointer"
              data-cursor="READ"
            >
              <span>Examine Specification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Column: Performance Telemetry & Web Benchmarks (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-2 border-[#1A1A1A] p-4 bg-[#ECE6D8]">
              <div className="border-b border-[#1A1A1A] pb-2 mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
                  CLIENT COMPILATION EFFICIENCY
                </span>
                <span className="font-mono text-[9px] bg-[#A71919] text-[#F2EEE5] px-1 font-bold">
                  2026 AUDIT
                </span>
              </div>

              <div className="space-y-4">
                {frameworkMetrics.map((metric, i) => (
                  <div key={i} className="border-b border-[#1A1A1A]/20 pb-3 last:border-b-0">
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-xs font-bold text-[#111111]">
                        {metric.name}
                      </span>
                      <span className="font-mono text-lg font-black text-[#A71919]">
                        {metric.value}
                      </span>
                    </div>
                    <div className="text-[11px] font-serif text-[#555555] italic">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editorial Technical Column */}
            <div className="p-4 border border-[#1A1A1A] bg-[#F2EEE5]">
              <div className="text-[10px] font-mono text-[#A71919] font-bold uppercase tracking-widest mb-1">
                HISTORICAL CRITIQUE
              </div>
              <h5 className="font-serif font-bold text-lg text-[#111111] uppercase leading-tight mb-2">
                The Thirty-Year Arc of the Hypertext Protocol
              </h5>
              <p className="font-serif text-xs leading-relaxed text-[#333333] text-justify">
                When Sir Tim Berners-Lee published the first browser in 1991, document semantics reigned supreme. The intermediate era of giant JavaScript application state was an ephemeral deviation; with WebAssembly and agentic compilation, documents once again communicate purely through structural meaning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
