"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { securityDeskData } from "@/data/newspaperData";
import { ShieldAlert, AlertTriangle, ArrowRight, Lock, Play } from "lucide-react";
import SplitHeadline from "@/components/motion/SplitHeadline";

export default function SecurityScene({ onOpenStory, articles }) {
  const currentLead =
    articles && articles[0] ? { ...securityDeskData.lead, ...articles[0] } : securityDeskData.lead;
  const lead = currentLead;
  const bulletins = securityDeskData.bulletins;

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const bulletinsRef = useRef([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Slow investigative photo movement
      if (imageRef.current) {
        gsap.fromTo(
          imageRef.current,
          { yPercent: -10, scale: 1.08 },
          {
            yPercent: 10,
            scale: 1.0,
            ease: "none",
            scrollTrigger: {
              trigger: container,
              start: "top bottom",
              end: "bottom top",
              scrub: 0.6,
            },
          }
        );
      }

      // Threat bulletins enter with teletype cadence
      const items = bulletinsRef.current.filter(Boolean);
      if (items.length > 0) {
        gsap.fromTo(
          items,
          { x: 30, opacity: 0 },
          {
            x: 0,
            opacity: 1,
            stagger: 0.12,
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
      id="security"
      ref={containerRef}
      className="w-full bg-[#181715] text-[#DFD5BC] py-14 border-b-2 border-[#766E5F] select-none scroll-mt-14 sm:scroll-mt-16"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Newspaper Department Header (Dark Broadsheet) */}
        <div className="border-t-2 border-b border-[#DFD5BC]/30 py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs tracking-widest text-[#E83B3B] uppercase font-bold">
                INVESTIGATIVE DOSSIER // CLASSIFIED DISPATCH
              </span>
              <span className="stamp-classified">
                TOP SECRET // DEFENSE-LEVEL
              </span>
            </div>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#DFD5BC] uppercase tracking-tight">
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
          <div className="lg:col-span-7 lg:pr-6 lg:border-r border-[#DFD5BC]/20">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#A8A295] mb-2">
              <span className="text-[#E83B3B] font-bold uppercase tracking-wider flex items-center gap-1">
                <ShieldAlert className="w-3.5 h-3.5" />
                {lead.threatLevel}
              </span>
              <span>{lead.page}</span>
            </div>

            <SplitHeadline
              text={lead.headline}
              as="h4"
              className="text-3xl sm:text-4xl md:text-5xl leading-[1.02] text-[#DFD5BC] mb-3 hover:text-[#E83B3B] transition-colors cursor-pointer"
              onClick={() => onOpenStory(lead)}
              dataCursor="EXAMINE"
            />

            {/* Editorial Investigative Photograph with Slow Parallax */}
            <div
              onClick={() => onOpenStory(lead)}
              className="my-4 border border-[#DFD5BC]/40 p-1 bg-[#100F0E] cursor-pointer group overflow-hidden"
              data-cursor="VIEW DOSSIER"
            >
              <div className="relative overflow-hidden h-[280px] sm:h-[340px]">
                <img
                  ref={imageRef}
                  src={lead.urlToImage || lead.image || "/window.svg"}
                  alt="Cyber Command Room"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/window.svg";
                  }}
                  className="w-full h-full object-cover object-center filter contrast-[1.12] grayscale will-change-transform transform-gpu"
                />
                <div className="absolute top-2 right-2 bg-[#E83B3B] text-[#DFD5BC] text-[9px] font-mono font-bold px-2 py-0.5 uppercase tracking-widest">
                  EVIDENCE LOG № 2026-X
                </div>
                {lead.video && (
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-xs bg-[#201E19]/90 text-[#E8DFC8] text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 border border-white/20">
                    <Play className="w-2.5 h-2.5 fill-[#E83B3B] text-[#E83B3B]" />
                    <span>VIDEO DOSSIER</span>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-[#8C867A] pt-1.5 px-1 bg-[#100F0E]">
                <span>{lead.imageCaption}</span>
                <span className="uppercase">{lead.imageCredit}</span>
              </div>
            </div>

            <p className="font-serif text-base sm:text-lg text-[#D0C9BA] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <div className="text-xs font-mono text-[#8C867A] mb-4 pb-2 border-b border-[#DFD5BC]/20">
              {lead.author} • {lead.readTime} • ENCRYPTED CIPHER CHANNEL
            </div>

            <p className="font-serif text-[15px] leading-[1.65] text-[#D0C9BA] mb-4 text-justify">
              {lead.body}
            </p>

            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#DFD5BC] hover:text-[#181715] border border-[#DFD5BC] px-3.5 py-1.5 hover:bg-[#DFD5BC] transition-all cursor-pointer"
              data-cursor="EXAMINE"
            >
              <span>Inspect Full Incident Dossier</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Column: Zero-Day Threat Bulletin Matrix (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[#DFD5BC]/30 p-4 bg-[#100F0E]">
              <div className="border-b border-[#DFD5BC]/20 pb-2 mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#DFD5BC] flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-[#E83B3B]" />
                  ACTIVE ZERO-DAY DISPATCHES
                </span>
                <span className="font-mono text-[9px] text-[#E83B3B] font-bold">
                  SEV-1 LIVE
                </span>
              </div>

              <div className="space-y-4">
                {bulletins.map((item, idx) => (
                  <div
                    key={item.code || `bulletin-${idx}`}
                    ref={(node) => (bulletinsRef.current[idx] = node)}
                    className="border-b border-[#DFD5BC]/15 pb-3 last:border-b-0 will-change-transform"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                      <span className="font-bold text-[#DFD5BC]">{item.code}</span>
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
            <div className="border border-[#DFD5BC]/20 p-4 bg-[#141311]">
              <div className="text-[10px] font-mono text-[#E83B3B] uppercase font-bold tracking-widest mb-1.5 flex items-center gap-1">
                <Lock className="w-3 h-3" />
                REDACTED COLD STORAGE PROTOCOL
              </div>
              <p className="font-serif text-xs text-[#A8A295] leading-relaxed">
                Notice to network operators: All fiber-optic backbones terminating within the North Atlantic corridor have been placed under automated lattice rotation. Please verify public PGP fingerprint:
              </p>
              <div className="mt-2 p-2 bg-[#0A0A09] font-mono text-[10px] text-[#A8A295] border border-[#DFD5BC]/20 tracking-widest">
                4B8F 9012 37CA 8901 DDE7 4390 12FA 8871
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
