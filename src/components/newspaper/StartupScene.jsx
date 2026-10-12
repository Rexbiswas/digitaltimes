"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { startupDeskData } from "@/data/newspaperData";
import { Play, ArrowRight } from "lucide-react";
import SplitHeadline from "@/components/motion/SplitHeadline";

export default function StartupScene({ onOpenStory, articles }) {
  const currentLead =
    articles && articles[0] ? { ...startupDeskData.lead, ...articles[0] } : startupDeskData.lead;
  const lead = currentLead;
  const dealFlow = startupDeskData.dealFlow;
  const chartData = startupDeskData.chartData;

  const containerRef = useRef(null);
  const statBoxRef = useRef(null);
  const numberRef = useRef(null);
  const dealsRef = useRef([]);
  const chartRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Large Financial Number counter animation
      if (numberRef.current) {
        const obj = { val: 0 };
        gsap.to(obj, {
          val: 140,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: {
            trigger: statBoxRef.current,
            start: "top 75%",
            toggleActions: "play none none reverse",
          },
          onUpdate: () => {
            if (numberRef.current) {
              numberRef.current.innerText = `$${Math.round(obj.val)}M`;
            }
          },
        });
      }

      // Deal ledger slide in
      const deals = dealsRef.current.filter(Boolean);
      if (deals.length > 0) {
        gsap.fromTo(
          deals,
          { x: 25, opacity: 0 },
          {
            x: 0,
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

      // ASCII Chart rows reveal
      if (chartRef.current) {
        gsap.fromTo(
          chartRef.current.querySelectorAll(".chart-row"),
          { scaleX: 0.2, opacity: 0, transformOrigin: "left" },
          {
            scaleX: 1,
            opacity: 1,
            stagger: 0.12,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: chartRef.current,
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
      id="startups"
      ref={containerRef}
      className="w-full bg-[#E8DFC8] py-12 border-b border-[#766E5F] select-none scroll-mt-14 sm:scroll-mt-16"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Department Header */}
        <div className="border-t-4 border-b-2 border-[#766E5F] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#9F3028] uppercase font-bold">
              CAPITAL MARKETS, VENTURE DEALS & EQUITIES
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#201E19] uppercase tracking-tight">
              STARTUPS & CAPITAL
            </h3>
          </div>
          <div className="text-xs font-mono text-[#39352D] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-bold">
            <span>FUNDING</span>
            <span>•</span>
            <span>FOUNDERS</span>
            <span>•</span>
            <span>VENTURE CAPITAL</span>
            <span>•</span>
            <span>ACQUISITIONS</span>
            <span>•</span>
            <span>PRODUCTS</span>
          </div>
        </div>

        {/* Large Financial Typography & Deal Flow Broadsheet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Financial Lead (6 columns) */}
          <div className="lg:col-span-6 lg:pr-6 lg:border-r border-[#766E5F]/30">
            <div className="text-[11px] font-mono text-[#9F3028] uppercase font-bold mb-1">
              VENTURE DISPATCH • {lead.page}
            </div>

            <SplitHeadline
              text={lead.headline}
              as="h4"
              className="text-3xl sm:text-4xl md:text-5xl leading-[1.0] mb-3 hover:text-[#9F3028] transition-colors cursor-pointer"
              onClick={() => onOpenStory(lead)}
            />

            {/* Giant Financial Stat Callout with Animated Counter */}
            <div
              ref={statBoxRef}
              className="my-6 border-y-4 border-[#766E5F] py-5 bg-[#DFD5BC] text-center"
            >
              <div
                ref={numberRef}
                className="font-mono text-5xl sm:text-6xl md:text-7xl font-black text-[#201E19] tracking-tight"
              >
                $0M
              </div>
              <div className="font-mono text-xs sm:text-sm tracking-[0.25em] uppercase text-[#9F3028] font-bold mt-1">
                {lead.highlightLabel}
              </div>
              <div className="text-[11px] font-serif italic text-[#39352D] mt-1">
                Autonomous studios with zero human payroll achieve $1B+ market caps in record time
              </div>
            </div>

            <p className="font-serif text-base sm:text-lg text-[#39352D] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <div className="text-xs font-mono text-[#666666] mb-4 pb-2 border-b border-[#766E5F]/30">
              {lead.author} • {lead.readTime} • SILICON VALLEY BUREAU
            </div>

            <p className="font-serif text-[15px] leading-[1.65] text-[#222222] mb-4 text-justify">
              {lead.body || lead.leadParagraph || "In Sand Hill Road boardrooms, the traditional metrics of head-count expansion and organizational hierarchy have been discarded. Investment memorandums now focus almost exclusively on autonomous reasoning efficiency, token velocity, and energy contracts negotiated directly with hydro-electric utilities."}
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
          </div>

          {/* Deal Ledger & Adoption Chart (6 columns) */}
          <div className="lg:col-span-6 min-w-0 space-y-6">
            {/* The Financial Deal Table */}
            <div className="border-2 border-[#766E5F] p-4 bg-[#DFD5BC]">
              <div className="flex items-center justify-between border-b border-[#766E5F] pb-2 mb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#201E19]">
                  THE WEEK IN VENTURE ROUNDS
                </span>
                <span className="font-mono text-[9px] bg-[#201E19] text-[#E8DFC8] px-1 font-bold">
                  Q3 2026 LEDGER
                </span>
              </div>

              <div className="overflow-x-auto no-scrollbar scrollbar-none">
                <table className="w-full text-left font-mono text-[11px] text-[#222222]">
                  <thead>
                    <tr className="border-b border-[#766E5F]/40 text-[#39352D]">
                      <th className="py-1">SYNDICATE</th>
                      <th className="py-1">STAGE</th>
                      <th className="py-1">AMOUNT</th>
                      <th className="py-1">POST-VAL</th>
                      <th className="py-1 text-right">FOCUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#766E5F]/20">
                    {dealFlow.map((deal, idx) => (
                      <tr
                        key={deal.company || `deal-${idx}`}
                        ref={(node) => (dealsRef.current[idx] = node)}
                        className="hover:bg-[#201E19]/5 will-change-transform"
                      >
                        <td className="py-2 font-bold text-[#201E19]">{deal.company}</td>
                        <td className="py-2 text-[#39352D]">{deal.round}</td>
                        <td className="py-2 font-black text-[#9F3028]">{deal.amount}</td>
                        <td className="py-2 font-semibold text-[#201E19]">{deal.valuation}</td>
                        <td className="py-2 text-right text-[10px] text-[#39352D]">{deal.focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Editorial ASCII Data Chart */}
            <div
              ref={chartRef}
              className="border border-[#766E5F] p-4 bg-[#E8DFC8]"
            >
              <div className="text-[10px] font-mono text-[#9F3028] font-bold uppercase tracking-widest mb-1">
                COMPUTE PRICING EVOLUTION (2022–2026)
              </div>
              <h5 className="font-serif font-bold text-base text-[#201E19] uppercase mb-3">
                Shift from Per-Seat SaaS to Outcome-Based Autonomous Escrow
              </h5>

              <div className="space-y-2 font-mono text-xs">
                {chartData.map((row, idx) => (
                  <div
                    key={row.year || `chart-${idx}`}
                    className="chart-row flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-[#766E5F]/10 will-change-transform"
                  >
                    <span className="font-bold text-[#201E19] w-12">{row.year}</span>
                    <span className="text-[#9F3028] font-mono font-bold tracking-tighter">
                      {row.value}
                    </span>
                    <span className="text-[10px] text-[#39352D] italic sm:text-right">
                      {row.label}
                    </span>
                  </div>
                ))}
              </div>
              <div className="mt-2 text-[9px] font-mono text-[#777777] italic text-right">
                Source: The Digital Times Financial Analytics Desk
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
