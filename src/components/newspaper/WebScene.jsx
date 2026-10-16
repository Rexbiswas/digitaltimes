"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { webDeskData } from "@/data/newspaperData";
import { Terminal, ArrowRight, Play } from "lucide-react";
import SplitHeadline from "@/components/motion/SplitHeadline";

export default function WebScene({ onOpenStory, articles }) {
  const currentLead =
    articles && articles[0] ? { ...webDeskData.lead, ...articles[0] } : webDeskData.lead;
  const lead = currentLead;
  const frameworkMetrics = webDeskData.frameworkMetrics;

  const containerRef = useRef(null);
  const metricsRef = useRef([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {

      // Framework metrics animate on enter
      const metrics = metricsRef.current.filter(Boolean);
      if (metrics.length > 0) {
        gsap.fromTo(
          metrics,
          { y: 25, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.14,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container,
              start: "top 70%",
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
      id="web"
      ref={containerRef}
      className="w-full bg-[#E8DFC8] py-12 border-b border-[#766E5F] select-none scroll-mt-14 sm:scroll-mt-16"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Department Header */}
        <div className="border-t-4 border-b-2 border-[#766E5F] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#9F3028] uppercase font-bold">
              SYSTEMS, PROTOCOLS & CLIENT ARCHITECTURE
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#201E19] uppercase tracking-tight">
              THE WEB DESK
            </h3>
          </div>
          <div className="text-xs font-mono text-[#39352D] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-bold">
            <span className="border-b border-[#766E5F]">REACT</span>
            <span>•</span>
            <span className="border-b border-[#766E5F]">NEXT.JS</span>
            <span>•</span>
            <span className="border-b border-[#766E5F]">JAVASCRIPT</span>
            <span>•</span>
            <span className="border-b border-[#766E5F]">BROWSERS</span>
            <span>•</span>
            <span className="border-b border-[#766E5F]">CSS</span>
          </div>
        </div>

        {/* Dense Technical Newspaper Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Story & Technical Analysis (7 columns) */}
          <div className="lg:col-span-7 lg:pr-6 lg:border-r border-[#766E5F]/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#39352D] mb-1">
              <span className="text-[#9F3028] font-bold uppercase tracking-wider">
                ARCHITECTURE CRITIQUE
              </span>
              <span>{lead.page}</span>
            </div>

            <SplitHeadline
              text={lead.headline}
              as="h4"
              className="text-3xl sm:text-4xl md:text-5xl leading-[1.02] mb-3 hover:text-[#9F3028] transition-colors cursor-pointer"
              onClick={() => onOpenStory(lead)}
            />

            <p className="font-serif text-base sm:text-lg text-[#39352D] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <div className="text-xs font-mono text-[#666666] mb-4 pb-2 border-b border-[#766E5F]/30">
              {lead.author} • {lead.readTime} • SAN FRANCISCO
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

            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#201E19] hover:text-[#9F3028] border border-[#766E5F] px-3.5 py-1.5 hover:bg-[#201E19] hover:text-[#E8DFC8] transition-all cursor-pointer mt-4"
              data-cursor="READ"
            >
              <span>Examine Specification</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Column: Performance Telemetry & Web Benchmarks (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-2 border-[#766E5F] p-4 bg-[#DFD5BC]">
              <div className="border-b border-[#766E5F] pb-2 mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#201E19]">
                  CLIENT COMPILATION EFFICIENCY
                </span>
                <span className="font-mono text-[9px] bg-[#9F3028] text-[#E8DFC8] px-1 font-bold">
                  2026 AUDIT
                </span>
              </div>

              <div className="space-y-4">
                {frameworkMetrics.map((metric, i) => (
                  <div
                    key={i}
                    ref={(node) => (metricsRef.current[i] = node)}
                    className="border-b border-[#766E5F]/20 pb-3 last:border-b-0 will-change-transform"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="font-mono text-xs font-bold text-[#201E19]">
                        {metric.name}
                      </span>
                      <span className="font-mono text-lg font-black text-[#9F3028]">
                        {metric.value}
                      </span>
                    </div>
                    <div className="text-[11px] font-serif text-[#39352D] italic">
                      {metric.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Editorial Technical Column */}
            <div className="p-4 border border-[#766E5F] bg-[#E8DFC8]">
              <div className="text-[10px] font-mono text-[#9F3028] font-bold uppercase tracking-widest mb-1">
                HISTORICAL CRITIQUE
              </div>
              <h5 className="font-serif font-bold text-lg text-[#201E19] uppercase leading-tight mb-2">
                The Thirty-Year Arc of the Hypertext Protocol
              </h5>
              <p className="font-serif text-xs leading-relaxed text-[#39352D] text-justify">
                When Sir Tim Berners-Lee published the first browser in 1991, document semantics reigned supreme. The intermediate era of giant JavaScript application state was an ephemeral deviation; with WebAssembly and agentic compilation, documents once again communicate purely through structural meaning.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
