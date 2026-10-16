"use client";

import { startupDeskData } from "@/data/newspaperData";
import { TrendingUp, DollarSign, Layers, ArrowUpRight } from "lucide-react";
import RealtimeVentureCharts from "@/components/newspaper/RealtimeVentureCharts";

export default function StartupDesk({ onOpenStory }) {
  const { lead, dealFlow, chartData } = startupDeskData;

  return (
    <section id="startups" className="w-full bg-[#E8DFC8] py-10 border-b border-[#766E5F]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Newspaper Department Header (Financial Broadside Tone) */}
        <div className="border-t-4 border-b-2 border-[#766E5F] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#9F3028] uppercase font-bold">
              CAPITAL MARKETS, VENTURE DEALS & EQUITIES
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#201E19] uppercase tracking-tight">
              STARTUP & BUSINESS DESK
            </h3>
          </div>
          <div className="text-xs font-mono text-[#39352D] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-bold">
            <span>FUNDING</span>
            <span>•</span>
            <span>FOUNDERS</span>
            <span>•</span>
            <span>VENTURE ROUNDS</span>
            <span>•</span>
            <span>MARKETS</span>
            <span>•</span>
            <span>LEDGERS</span>
          </div>
        </div>

        {/* Large Financial Typography & Deal Flow Broadsheet */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Financial Lead (6 columns) */}
          <div className="lg:col-span-6 lg:pr-6 lg:border-r border-[#766E5F]/30">
            <div className="text-[11px] font-mono text-[#9F3028] uppercase font-bold mb-1">
              VENTURE DISPATCH • {lead.page}
            </div>

            <h4
              onClick={() => onOpenStory(lead)}
              className="font-serif font-black text-3xl sm:text-4xl md:text-5xl leading-[1.0] text-[#201E19] uppercase hover:text-[#9F3028] transition-colors cursor-pointer mb-3"
              data-cursor="READ"
            >
              {lead.headline}
            </h4>

            {/* Giant Financial Stat Callout (as requested in Section 16) */}
            <div className="my-6 border-y-4 border-[#766E5F] py-4 bg-[#DFD5BC] text-center">
              <div className="font-mono text-5xl sm:text-6xl md:text-7xl font-black text-[#201E19] tracking-tight">
                {lead.highlightStat}
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
              In Sand Hill Road boardrooms, the traditional metrics of head-count expansion and organizational hierarchy have been discarded. Investment memorandums now focus almost exclusively on autonomous reasoning efficiency, token velocity, and energy contracts negotiated directly with hydro-electric utilities.
            </p>
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
