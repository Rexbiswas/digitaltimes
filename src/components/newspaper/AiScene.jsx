"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { aiDeskArticles } from "@/data/newspaperData";
import { BarChart2, ArrowRight, Play } from "lucide-react";
import SplitHeadline from "@/components/motion/SplitHeadline";

export default function AiScene({ onOpenStory, articles }) {
  const currentLead =
    articles && articles[0] ? { ...aiDeskArticles.lead, ...articles[0] } : aiDeskArticles.lead;
  const currentSecondaries =
    Array.isArray(articles) && articles.length > 1
      ? articles.slice(1, 4)
      : aiDeskArticles.secondaries;
  const lead = currentLead;
  const secondaries = currentSecondaries;

  const containerRef = useRef(null);
  const pinnedHeaderRef = useRef(null);
  const benchmarkTableRef = useRef(null);
  const rowsRef = useRef([]);
  const quoteRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Benchmark Table Rows slide in like fresh teletype data
      const rows = rowsRef.current.filter(Boolean);
      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          { x: 30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.12,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: benchmarkTableRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Editorial Pull quote unmasks on scroll
      if (quoteRef.current) {
        gsap.fromTo(
          quoteRef.current,
          { y: 40, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: quoteRef.current,
              start: "top 80%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="ai"
      ref={containerRef}
      className="w-full bg-[#E8DFC8] py-12 border-b border-[#766E5F] select-none scroll-mt-14 sm:scroll-mt-16"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Pinned Department Header */}
        <div
          ref={pinnedHeaderRef}
          className="border-t-4 border-b-2 border-[#766E5F] py-2 mb-8 bg-[#E8DFC8] z-20 flex flex-col md:flex-row items-start md:items-center justify-between gap-2"
        >
          <div>
            <span className="font-mono text-xs tracking-widest text-[#9F3028] uppercase font-bold">
              DEPARTMENT OF COMPUTATION & COGNITION
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#201E19] uppercase tracking-tight">
              THE AI DESK
            </h3>
          </div>
          <div className="text-xs font-mono text-[#39352D] flex flex-wrap items-center gap-2 sm:gap-4 uppercase">
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

        {/* Department Feature & Benchmark Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main AI Feature (7 columns) */}
          <div className="lg:col-span-7 min-w-0 lg:pr-6 lg:border-r border-[#766E5F]/30">
            <div className="text-[11px] font-mono text-[#9F3028] uppercase font-bold mb-1">
              FRONTIER LABORATORY REPORT • {lead.page}
            </div>

            <SplitHeadline
              text={lead.headline}
              as="h4"
              className="text-3xl sm:text-4xl md:text-5xl leading-[1.0] mb-3 hover:text-[#9F3028] transition-colors cursor-pointer"
              onClick={() => onOpenStory(lead)}
            />

            <p className="font-serif text-base sm:text-lg text-[#39352D] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <div className="text-xs font-mono text-[#666666] mb-4 pb-2 border-b border-[#766E5F]/30">
              {lead.author} • 6 MIN READ • GENEVA BUREAU
            </div>

            <p className="font-serif text-[15px] leading-[1.65] text-[#222222] mb-4 text-justify">
              {lead.body || lead.leadParagraph}
            </p>

            {(lead.urlToImage || lead.image) && (
              <div
                onClick={() => onOpenStory(lead)}
                className="relative w-full h-52 sm:h-64 my-4 border border-[#766E5F] overflow-hidden bg-[#201E19] group cursor-pointer"
              >
                <img
                  src={lead.urlToImage || lead.image || "/window.svg"}
                  alt={lead.headline}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/window.svg";
                  }}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 filter contrast-[1.08]"
                />
                {lead.video && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-xs bg-[#201E19]/90 text-[#E8DFC8] text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 border border-white/20">
                    <Play className="w-2.5 h-2.5 fill-[#9F3028] text-[#9F3028]" />
                    <span>VIDEO DISPATCH</span>
                  </div>
                )}
              </div>
            )}

            {/* Editorial Pull Quote */}
            <blockquote
              ref={quoteRef}
              className="my-6 p-4 border-l-4 border-[#766E5F] bg-[#DFD5BC] font-serif italic text-lg text-[#201E19] leading-snug"
            >
              {lead.pullQuote}
            </blockquote>

            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#201E19] hover:text-[#9F3028] border border-[#766E5F] px-3.5 py-1.5 hover:bg-[#201E19] hover:text-[#E8DFC8] transition-all cursor-pointer"
              data-cursor="READ"
            >
              <span>Read Full Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* AI Benchmarks Table & Secondary Stories (5 columns) */}
          <div className="lg:col-span-5 min-w-0 flex flex-col justify-between space-y-6">
            {/* The Model Benchmark Table */}
            <div
              ref={benchmarkTableRef}
              className="border-2 border-[#766E5F] p-4 bg-[#DFD5BC]"
            >
              <div className="flex items-center justify-between border-b border-[#766E5F] pb-2 mb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#201E19] flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5 text-[#9F3028]" />
                  AUTONOMOUS REASONING ELO BENCHMARK (2026)
                </span>
                <span className="font-mono text-[9px] bg-[#201E19] text-[#E8DFC8] px-1 font-bold">
                  OFFICIAL AUDIT
                </span>
              </div>

              <div className="overflow-x-auto no-scrollbar scrollbar-none">
                <table className="w-full text-left font-mono text-[11px] text-[#222222]">
                  <thead>
                    <tr className="border-b border-[#766E5F]/40 text-[#39352D]">
                      <th className="py-1">MODEL</th>
                      <th className="py-1">REASONING</th>
                      <th className="py-1">FORMAL MATH</th>
                      <th className="py-1 text-right">LATENCY</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#766E5F]/20">
                    {(lead.benchmarks || aiDeskArticles.lead.benchmarks || []).map((row, idx) => (
                      <tr
                        key={row.model || `benchmark-${idx}`}
                        ref={(node) => (rowsRef.current[idx] = node)}
                        className="hover:bg-[#201E19]/5 will-change-transform"
                      >
                        <td className="py-1.5 font-bold text-[#201E19]">{row.model}</td>
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

            {/* Secondary Dispatches */}
            <div className="space-y-4">
              <div className="border-b border-[#766E5F] pb-1 text-xs font-mono font-bold uppercase text-[#39352D]">
                AI RESEARCH TELEGRAPH
              </div>

              {secondaries.map((sec, idx) => (
                <div
                  key={sec.id || sec._id || `ai-sec-${idx}`}
                  onClick={() => onOpenStory(sec)}
                  className="group pb-3 border-b border-[#766E5F]/25 cursor-pointer"
                  data-cursor="READ"
                >
                  <div className="text-[10px] font-mono text-[#777777] mb-0.5">
                    {sec.time} • {sec.readTime}
                  </div>
                  <h5 className="font-serif font-bold text-lg text-[#201E19] group-hover:text-[#9F3028] transition-colors leading-snug">
                    {sec.headline}
                  </h5>
                  <p className="font-serif text-xs text-[#39352D] mt-1 leading-normal">
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
