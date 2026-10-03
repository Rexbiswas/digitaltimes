"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { startupDeskData } from "@/data/newspaperData";
import SplitHeadline from "@/components/motion/SplitHeadline";

export default function StartupScene({ onOpenStory }) {
  const { lead, dealFlow, chartData } = startupDeskData;
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
      className="w-full bg-[#F2EEE5] py-12 border-b border-[#1A1A1A] select-none scroll-mt-14 sm:scroll-mt-16"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Department Header */}
        <div className="border-t-4 border-b-2 border-[#1A1A1A] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#A71919] uppercase font-bold">
              CAPITAL MARKETS, VENTURE DEALS & EQUITIES
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#111111] uppercase tracking-tight">
              STARTUPS & CAPITAL
            </h3>
          </div>
          <div className="text-xs font-mono text-[#555555] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-bold">
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
          <div className="lg:col-span-6 lg:pr-6 lg:border-r border-[#1A1A1A]/30">
            <div className="text-[11px] font-mono text-[#A71919] uppercase font-bold mb-1">
              VENTURE DISPATCH • {lead.page}
            </div>

            <SplitHeadline
              text={lead.headline}
              as="h4"
              className="text-3xl sm:text-4xl md:text-5xl leading-[1.0] mb-3 hover:text-[#A71919] transition-colors cursor-pointer"
              onClick={() => onOpenStory(lead)}
            />

            {/* Giant Financial Stat Callout with Animated Counter */}
            <div
              ref={statBoxRef}
              className="my-6 border-y-4 border-[#1A1A1A] py-5 bg-[#ECE6D8] text-center"
            >
              <div
                ref={numberRef}
                className="font-mono text-5xl sm:text-6xl md:text-7xl font-black text-[#111111] tracking-tight"
              >
                $0M
              </div>
              <div className="font-mono text-xs sm:text-sm tracking-[0.25em] uppercase text-[#A71919] font-bold mt-1">
                {lead.highlightLabel}
              </div>
              <div className="text-[11px] font-serif italic text-[#555555] mt-1">
                Autonomous studios with zero human payroll achieve $1B+ market caps in record time
              </div>
            </div>

            <p className="font-serif text-base sm:text-lg text-[#333333] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <div className="text-xs font-mono text-[#666666] mb-4 pb-2 border-b border-[#1A1A1A]/30">
              {lead.author} • {lead.readTime} • SILICON VALLEY BUREAU
            </div>

            <p className="font-serif text-[15px] leading-[1.65] text-[#222222] mb-4 text-justify">
              In Sand Hill Road boardrooms, the traditional metrics of head-count expansion and organizational hierarchy have been discarded. Investment memorandums now focus almost exclusively on autonomous reasoning efficiency, token velocity, and energy contracts negotiated directly with hydro-electric utilities.
            </p>
          </div>

          {/* Deal Ledger & Adoption Chart (6 columns) */}
          <div className="lg:col-span-6 min-w-0 space-y-6">
            {/* The Financial Deal Table */}
            <div className="border-2 border-[#1A1A1A] p-4 bg-[#ECE6D8]">
              <div className="flex items-center justify-between border-b border-[#1A1A1A] pb-2 mb-3">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#111111]">
                  THE WEEK IN VENTURE ROUNDS
                </span>
                <span className="font-mono text-[9px] bg-[#111111] text-[#F2EEE5] px-1 font-bold">
                  Q3 2026 LEDGER
                </span>
              </div>

              <div className="overflow-x-auto no-scrollbar scrollbar-none">
                <table className="w-full text-left font-mono text-[11px] text-[#222222]">
                  <thead>
                    <tr className="border-b border-[#1A1A1A]/40 text-[#555555]">
                      <th className="py-1">SYNDICATE</th>
                      <th className="py-1">STAGE</th>
                      <th className="py-1">AMOUNT</th>
                      <th className="py-1">POST-VAL</th>
                      <th className="py-1 text-right">FOCUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1A1A1A]/20">
                    {dealFlow.map((deal, idx) => (
                      <tr
                        key={deal.company}
                        ref={(node) => (dealsRef.current[idx] = node)}
                        className="hover:bg-[#111111]/5 will-change-transform"
                      >
                        <td className="py-2 font-bold text-[#111111]">{deal.company}</td>
                        <td className="py-2 text-[#555555]">{deal.round}</td>
                        <td className="py-2 font-black text-[#A71919]">{deal.amount}</td>
                        <td className="py-2 font-semibold text-[#111111]">{deal.valuation}</td>
                        <td className="py-2 text-right text-[10px] text-[#444444]">{deal.focus}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Editorial ASCII Data Chart */}
            <div
              ref={chartRef}
              className="border border-[#1A1A1A] p-4 bg-[#F2EEE5]"
            >
              <div className="text-[10px] font-mono text-[#A71919] font-bold uppercase tracking-widest mb-1">
                COMPUTE PRICING EVOLUTION (2022–2026)
              </div>
              <h5 className="font-serif font-bold text-base text-[#111111] uppercase mb-3">
                Shift from Per-Seat SaaS to Outcome-Based Autonomous Escrow
              </h5>

              <div className="space-y-2 font-mono text-xs">
                {chartData.map((row) => (
                  <div
                    key={row.year}
                    className="chart-row flex flex-col sm:flex-row sm:items-center justify-between gap-1 py-1 border-b border-[#1A1A1A]/10 will-change-transform"
                  >
                    <span className="font-bold text-[#111111] w-12">{row.year}</span>
                    <span className="text-[#A71919] font-mono font-bold tracking-tighter">
                      {row.value}
                    </span>
                    <span className="text-[10px] text-[#555555] italic sm:text-right">
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
