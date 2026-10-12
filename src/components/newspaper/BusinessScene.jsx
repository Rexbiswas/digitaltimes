"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { businessDeskData, marketTickers } from "@/data/newspaperData";
import { TrendingUp, DollarSign, ArrowRight } from "lucide-react";
import SplitHeadline from "@/components/motion/SplitHeadline";

export default function BusinessScene({ onOpenStory, articles }) {
  const currentLead =
    articles && articles[0] ? { ...businessDeskData.lead, ...articles[0] } : businessDeskData.lead;
  const lead = currentLead;
  const containerRef = useRef(null);
  const rowsRef = useRef([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      const rows = rowsRef.current.filter(Boolean);
      if (rows.length > 0) {
        gsap.fromTo(
          rows,
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            stagger: 0.1,
            duration: 0.6,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container,
              start: "top 65%",
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
      id="business"
      ref={containerRef}
      className="w-full bg-[#DFD5BC] py-12 border-b border-[#766E5F] select-none scroll-mt-14 sm:scroll-mt-16"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Department Header */}
        <div className="border-t-4 border-b-2 border-[#766E5F] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#9F3028] uppercase font-bold">
              COMMODITIES, ENERGY CONTRACTS & SYSTEMIC EQUITIES
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#201E19] uppercase tracking-tight">
              BUSINESS & MARKETS DESK
            </h3>
          </div>
          <div className="text-xs font-mono text-[#39352D] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-bold">
            <span>MARKETS</span>
            <span>•</span>
            <span>COMPANIES</span>
            <span>•</span>
            <span>STARTUPS</span>
            <span>•</span>
            <span>INVESTMENT</span>
            <span>•</span>
            <span>ECONOMY</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Story (7 columns) */}
          <div className="lg:col-span-7 lg:pr-6 lg:border-r border-[#766E5F]/30">
            <div className="text-[11px] font-mono text-[#9F3028] uppercase font-bold mb-1">
              FINANCIAL TELEGRAPH • {lead.page}
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
              {lead.author} • {lead.readTime} • LONDON & CHICAGO DESKS
            </div>

            <p className="font-serif text-[15px] leading-[1.65] text-[#222222] mb-4 text-justify">
              {lead.editorialColumn}
            </p>

            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#201E19] hover:text-[#9F3028] border border-[#766E5F] px-3.5 py-1.5 hover:bg-[#201E19] hover:text-[#E8DFC8] transition-all cursor-pointer"
              data-cursor="READ"
            >
              <span>Read Full Commodities Ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Column: Market Indicators & Tickers (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-2 border-[#766E5F] p-4 bg-[#E8DFC8]">
              <div className="border-b border-[#766E5F] pb-2 mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#201E19] flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-[#1d6b2c]" />
                  GLOBAL RESERVE COMPUTE INDICATORS
                </span>
                <span className="font-mono text-[9px] bg-[#201E19] text-[#E8DFC8] px-1 font-bold">
                  LIVE BENCHMARK
                </span>
              </div>

              <div className="space-y-3 font-mono">
                {lead.marketIndicators.map((item, idx) => (
                  <div
                    key={item.name}
                    ref={(node) => (rowsRef.current[idx] = node)}
                    className="flex items-center justify-between py-2 border-b border-[#766E5F]/20 last:border-b-0 will-change-transform"
                  >
                    <div>
                      <div className="font-bold text-xs text-[#201E19]">{item.name}</div>
                      <div className="text-[10px] text-[#1d6b2c] font-semibold">{item.delta}</div>
                    </div>
                    <div className="font-mono text-base font-black text-[#201E19]">
                      {item.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Wire Market Strip */}
            <div className="border border-[#766E5F] p-3.5 bg-[#D7CCB2]">
              <div className="font-mono text-[10px] uppercase font-bold text-[#9F3028] mb-1">
                FOREIGN EXCHANGE & TOKEN RATIOS
              </div>
              <p className="font-serif text-xs text-[#39352D] leading-relaxed">
                Autonomous corporate treasuries report 91.4% of working capital held in direct TFLOPS escrow contracts, eliminating currency fluctuations between human sovereign denominations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
