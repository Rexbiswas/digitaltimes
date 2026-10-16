"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { startupDeskData } from "@/data/newspaperData";
import { Play, ArrowRight, Radio } from "lucide-react";
import SplitHeadline from "@/components/motion/SplitHeadline";
import RealtimeVentureCharts from "@/components/newspaper/RealtimeVentureCharts";

export default function StartupScene({ onOpenStory, articles }) {
  const currentLead =
    articles && articles[0] ? { ...startupDeskData.lead, ...articles[0] } : startupDeskData.lead;
  const lead = currentLead;
  const dealFlow = startupDeskData.dealFlow;
  const chartData = startupDeskData.chartData;

  const [realtimeStat, setRealtimeStat] = useState({
    amount: 140,
    amountStr: "$140M",
    label: "AVERAGE TIER-1 AI LAB SEED VALUATION",
    subtext: "Autonomous studios with zero human payroll achieve $1B+ market caps in record time",
    isLive: false,
    source: "NewsAPI Live",
    company: "Synthetix Dynamics",
    stage: "Series A",
    updatedAt: null,
  });

  const containerRef = useRef(null);
  const statBoxRef = useRef(null);
  const numberRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const fetchLiveStat = async () => {
      try {
        const res = await fetch("/api/newsroom/venture-analytics", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.deals) && data.deals.length > 0) {
            // Find highest funded venture deal from live NewsAPI wire
            const sorted = [...data.deals].sort((a, b) => b.amount - a.amount);
            const top = sorted[0];
            setRealtimeStat({
              amount: top.amount,
              amountStr: top.amountStr || `$${top.amount}M`,
              label: `LIVE NEWSAPI TOP CAPITAL DEAL: ${top.company.toUpperCase()}`,
              subtext: `${top.focus || top.title || "Frontier AI infrastructure and autonomous reasoning systems"} — Via ${top.source} wire`,
              isLive: true,
              source: top.source || "NewsAPI Live",
              company: top.company,
              stage: top.stage,
              updatedAt: new Date(),
            });
          }
        }
      } catch (e) {
        console.warn("[StartupScene] Real-time stat fetch notice:", e.message);
      }
    };

    fetchLiveStat();
    const timer = setInterval(fetchLiveStat, 45000);
    return () => {
      isMounted = false;
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Large Financial Number counter animation to real-time amount
      if (numberRef.current) {
        const targetNumber = realtimeStat.amount || 140;
        const obj = { val: 0 };
        gsap.to(obj, {
          val: targetNumber,
          duration: 1.5,
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

            {/* Giant Financial Stat Callout with Real-Time NewsAPI Data */}
            <div
              ref={statBoxRef}
              className="my-6 border-y-4 border-[#766E5F] py-5 bg-[#DFD5BC] text-center relative overflow-hidden"
            >
              {/* Live NewsAPI Tag Indicator */}
              <div className="flex items-center justify-center gap-1.5 mb-1.5">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9F3028] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9F3028]"></span>
                </span>
                <span className="font-mono text-[9px] uppercase tracking-widest text-[#9F3028] font-bold">
                  {realtimeStat.isLive ? "REAL-TIME NEWSAPI CAPITAL TELEMETRY" : "VENTURE CAPITAL TELEMETRY"}
                </span>
                {realtimeStat.isLive && (
                  <span className="bg-[#201E19] text-[#E8DFC8] font-mono text-[8px] font-bold px-1 py-0.5 tracking-wider">
                    LIVE WIRE
                  </span>
                )}
              </div>

              <div
                ref={numberRef}
                className="font-mono text-5xl sm:text-6xl md:text-7xl font-black text-[#201E19] tracking-tight"
              >
                ${realtimeStat.amount}M
              </div>

              <div className="font-mono text-xs sm:text-sm tracking-[0.2em] uppercase text-[#9F3028] font-bold mt-1.5 px-2">
                {realtimeStat.label}
              </div>

              <div className="text-[11px] font-serif italic text-[#39352D] mt-1.5 px-4 max-w-xl mx-auto leading-relaxed">
                {realtimeStat.subtext}
              </div>

              {realtimeStat.isLive && (
                <div className="mt-2.5 pt-2 border-t border-[#766E5F]/20 text-[9px] font-mono text-[#766E5F] flex flex-wrap items-center justify-center gap-3">
                  <span>Wire Source: <b>{realtimeStat.source}</b></span>
                  {realtimeStat.stage && <span>Round: <b>{realtimeStat.stage}</b></span>}
                  {realtimeStat.updatedAt && <span>Synced: <b>{realtimeStat.updatedAt.toLocaleTimeString()}</b></span>}
                </div>
              )}
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

          {/* Real-Time Venture Intelligence & Interactive D3 Charts (6 columns) */}
          <div className="lg:col-span-6 min-w-0">
            <RealtimeVentureCharts initialDeals={dealFlow} />
          </div>
        </div>
      </div>
    </section>
  );
}
