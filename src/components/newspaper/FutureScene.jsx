"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { futureDeskData } from "@/data/newspaperData";
import { Atom, ArrowRight } from "lucide-react";
import SplitHeadline from "@/components/motion/SplitHeadline";

export default function FutureScene({ onOpenStory, articles }) {
  const currentLead =
    articles && articles[0] ? { ...futureDeskData.lead, ...articles[0] } : futureDeskData.lead;
  const lead = currentLead;
  const containerRef = useRef(null);
  const heroImageFrameRef = useRef(null);
  const heroImageRef = useRef(null);
  const floatingTypographyRef = useRef(null);
  const milestonesBoxRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (window.innerWidth < 1024) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Subtle reveal on enter without locking screen pin
      if (floatingTypographyRef.current) {
        gsap.fromTo(
          floatingTypographyRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: container,
              start: "top 70%",
              toggleActions: "play none none none",
            },
          }
        );
      }

      if (milestonesBoxRef.current) {
        gsap.fromTo(
          milestonesBoxRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: "power2.out",
            scrollTrigger: {
              trigger: milestonesBoxRef.current,
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="future"
      ref={containerRef}
      className="w-full min-h-screen bg-[#DFD5BC] py-14 border-b-2 border-[#766E5F] select-none flex flex-col justify-between overflow-hidden scroll-mt-14 sm:scroll-mt-16"
    >
      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 relative z-10 flex flex-col flex-1 justify-between">
        {/* Department Header */}
        <div className="border-t-4 border-b-2 border-[#766E5F] py-2 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#9F3028] uppercase font-bold">
              THE DEEP HORIZON • SPECULATIVE APPLIED SCIENCE
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#201E19] uppercase tracking-tight">
              THE FUTURE
            </h3>
          </div>
          <div className="text-xs font-mono text-[#39352D] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-bold">
            <span>ROBOTICS</span>
            <span>•</span>
            <span>SPACE</span>
            <span>•</span>
            <span>AI</span>
            <span>•</span>
            <span>QUANTUM</span>
            <span>•</span>
            <span>BIOTECH</span>
            <span>•</span>
            <span>SMART CITIES</span>
          </div>
        </div>

        {/* Headline */}
        <div className="text-center max-w-4xl mx-auto mb-6">
          <div className="text-[11px] font-mono text-[#9F3028] uppercase font-bold mb-1">
            DEEP SCIENCE INVESTIGATION • {lead.page}
          </div>

          <SplitHeadline
            text={lead.headline}
            as="h4"
            className="text-3xl sm:text-5xl md:text-6xl leading-[0.96] mb-3 hover:text-[#9F3028] transition-colors cursor-pointer"
            onClick={() => onOpenStory(lead)}
          />

          <p className="font-serif text-base sm:text-lg text-[#39352D] leading-relaxed max-w-2xl mx-auto">
            {lead.deck}
          </p>
        </div>

        {/* Pinned Expanding Quantum Photo Scene */}
        <div className="w-full flex flex-col items-center relative my-4">
          <div
            ref={heroImageFrameRef}
            onClick={() => onOpenStory(lead)}
            className="relative w-full max-w-5xl h-[46vh] sm:h-[54vh] overflow-hidden border-2 border-[#766E5F] bg-[#766E5F] cursor-pointer group shadow-md"
            data-cursor="VIEW LAB"
          >
            <img
              ref={heroImageRef}
              src={lead.urlToImage || lead.image || "/window.svg"}
              alt="Quantum Laboratory"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/window.svg";
              }}
              className="w-full h-full object-cover object-center filter contrast-[1.10] saturate-[0.85] scale-[1.08] transition-transform duration-700 group-hover:scale-100 will-change-transform transform-gpu"
            />

            <div className="absolute inset-0 bg-gradient-to-t from-[#201E19]/85 via-transparent to-transparent pointer-events-none" />

            {/* Stage 2 Floating Futuristic Typography Layer */}
            <div
              ref={floatingTypographyRef}
              className="absolute inset-0 flex flex-col justify-end p-6 sm:p-12 pointer-events-none text-[#E8DFC8]"
            >
              <div className="max-w-2xl bg-[#201E19]/90 p-5 sm:p-8 border-l-4 border-[#9F3028] backdrop-blur-xs">
                <span className="font-mono text-xs uppercase tracking-widest text-[#9F3028] font-bold block mb-2">
                  THE COMING CENTURY // TRANSITION HORIZON
                </span>
                <p className="font-serif text-xl sm:text-3xl font-light italic leading-snug">
                  “The boundary between computational physics and living biochemistry is dissolving. Humanity&apos;s next broadsheet will be written into synthetic DNA.”
                </p>
                <div className="mt-3 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#D4CDBC]">
                  — DR. A. K. SUBRAMANIAM • OXFORD CRYOGENIC CORE
                </div>
              </div>
            </div>

            <div className="absolute top-3 left-3 bg-[#E8DFC8] text-[#201E19] px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-[#766E5F]">
              OXFORD CRYOGENIC CORE № 03
            </div>
          </div>

          <div className="w-full max-w-5xl flex items-center justify-between text-[11px] font-mono text-[#39352D] pt-2 px-1 border-b border-[#766E5F]/20">
            <span>{lead.imageCaption}</span>
            <span className="uppercase text-[10px] text-[#777777] font-bold">{lead.imageCredit}</span>
          </div>
        </div>

        {/* Milestones Horizon */}
        <div
          ref={milestonesBoxRef}
          className="max-w-4xl mx-auto w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 my-4"
        >
          {lead.milestones.map((m) => (
            <div
              key={m.year}
              className="p-3 border border-[#766E5F] bg-[#E8DFC8] text-xs font-mono"
            >
              <div className="font-black text-sm text-[#9F3028] mb-1">{m.year}</div>
              <div className="font-serif text-xs text-[#222222] leading-tight">
                {m.milestone}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
