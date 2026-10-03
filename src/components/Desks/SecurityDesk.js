"use client";

import { securityDeskData } from "@/data/newspaperData";
import { ShieldAlert, FileText, AlertTriangle, ArrowRight, Lock } from "lucide-react";

export default function SecurityDesk({ onOpenStory }) {
  const { lead, bulletins } = securityDeskData;

  return (
    <section id="security" className="w-full bg-[#181715] text-[#ECE6D8] py-12 border-b-2 border-[#111111] select-none">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Newspaper Department Header (Dark Broadsheet) */}
        <div className="border-t-2 border-b border-[#ECE6D8]/30 py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-widest text-[#E83B3B] uppercase font-bold">
                INVESTIGATIVE DOSSIER // CLASSIFIED DISPATCH
              </span>
              <span className="stamp-classified">
                TOP SECRET // DEFENSE-LEVEL
              </span>
            </div>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#ECE6D8] uppercase tracking-tight">
              CYBERSECURITY & THREAT AUDIT
            </h3>
          </div>
          <div className="text-xs font-mono text-[#A8A295] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-semibold">
            <span className="text-[#E83B3B]">THREATS</span>
            <span>•</span>
            <span>BREACHES</span>
            <span>•</span>
            <span>PRIVACY</span>
            <span>•</span>
            <span>VULNERABILITIES</span>
            <span>•</span>
            <span>ENCRYPTION</span>
          </div>
        </div>

        {/* Investigative Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Story & Classified Photo (7 columns) */}
          <div className="lg:col-span-7 lg:pr-6 lg:border-r border-[#ECE6D8]/20">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#A8A295] mb-2">
              <span className="text-[#E83B3B] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {lead.threatLevel}
              </span>
              <span>{lead.page}</span>
            </div>

            <h4
              onClick={() => onOpenStory(lead)}
              className="font-serif font-black text-3xl sm:text-4xl md:text-5xl leading-[1.02] text-[#ECE6D8] uppercase hover:text-[#E83B3B] transition-colors cursor-pointer mb-3"
              data-cursor="EXAMINE"
            >
              {lead.headline}
            </h4>

            {/* Editorial Investigative Photograph */}
            <div
              onClick={() => onOpenStory(lead)}
              className="my-4 border border-[#ECE6D8]/40 p-1 bg-[#100F0E] cursor-pointer group"
              data-cursor="VIEW DOSSIER"
            >
              <div className="relative overflow-hidden h-[260px] sm:h-[320px]">
                <img
                  src={lead.image}
                  alt="Cyber Command Room"
                  className="w-full h-full object-cover object-center filter contrast-[1.12] grayscale transition-transform duration-500 group-hover:scale-[1.02]"
                />
                <div className="absolute top-2 right-2 bg-[#E83B3B] text-[#ECE6D8] text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest">
                  EVIDENCE LOG № 2026-X
                </div>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8C867A] pt-1.5 px-1">
                <span>{lead.imageCaption}</span>
                <span className="uppercase">{lead.imageCredit}</span>
              </div>
            </div>

            <p className="font-serif text-base sm:text-lg text-[#D0C9BA] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <div className="text-xs font-mono text-[#8C867A] mb-4 pb-2 border-b border-[#ECE6D8]/20">
              {lead.author} • {lead.readTime} • ENCRYPTED CIPHER CHANNEL
            </div>

            <p className="font-serif text-[15px] leading-[1.65] text-[#D0C9BA] mb-4 text-justify">
              {lead.body}
            </p>

            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#ECE6D8] hover:text-[#181715] border border-[#ECE6D8] px-3.5 py-1.5 hover:bg-[#ECE6D8] transition-all cursor-pointer"
              data-cursor="EXAMINE"
            >
              <span>Inspect Full Incident Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Column: Zero-Day Threat Bulletin Matrix (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#ECE6D8]/30 p-4 bg-[#100F0E]">
              <div className="border-b border-[#ECE6D8]/20 pb-2 mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#ECE6D8] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#E83B3B]" />
                  ACTIVE ZERO-DAY DISPATCHES
                </span>
                <span className="font-mono text-[9px] text-[#E83B3B] font-bold">
                  SEV-1 LIVE
                </span>
              </div>

              <div className="space-y-4">
                {bulletins.map((item) => (
                  <div key={item.code} className="border-b border-[#ECE6D8]/15 pb-3 last:border-b-0">
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="font-bold text-[#ECE6D8]">{item.code}</span>
                      <span className="bg-[#E83B3B]/20 text-[#E83B3B] text-[9px] font-bold px-1.5 py-0.5 border border-[#E83B3B]/50">
                        {item.severity}
                      </span>
                    </div>
                    <div className="font-serif text-sm text-[#D0C9BA] leading-snug">
                      {item.title}
                    </div>
                    <div className="text-[10px] font-mono text-[#8C867A] mt-1">
                      DISPATCH FILED: {item.date}, 2026
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Redacted Classified Notice */}
            <div className="border border-[#ECE6D8]/20 p-4 bg-[#141311]">
              <div className="text-[10px] font-mono text-[#E83B3B] uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                REDACTED COLD STORAGE PROTOCOL
              </div>
              <p className="font-serif text-xs text-[#A8A295] leading-relaxed">
                Notice to network operators: All fiber-optic backbones terminating within the North Atlantic corridor have been placed under automated lattice rotation. Please verify public PGP fingerprint:
              </p>
              <div className="mt-2 p-2 bg-[#0A0A09] font-mono text-[10px] text-[#A8A295] border border-[#ECE6D8]/20 tracking-widest">
                4B8F 9012 37CA 8901 DDE7 4390 12FA 8871
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
