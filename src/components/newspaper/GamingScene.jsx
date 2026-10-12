"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { gamingDeskData } from "@/data/newspaperData";
import { Gauge, ArrowRight, Play } from "lucide-react";
import SplitHeadline from "@/components/motion/SplitHeadline";

export default function GamingScene({ onOpenStory, articles }) {
  const currentLead =
    articles && articles[0] ? { ...gamingDeskData.lead, ...articles[0] } : gamingDeskData.lead;
  const lead = currentLead;

  const containerRef = useRef(null);
  const photoFrameRef = useRef(null);
  const reviewScoreRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Cinematic crop transition: polygon mask unmasks dynamically
      if (photoFrameRef.current) {
        gsap.fromTo(
          photoFrameRef.current,
          { clipPath: "polygon(0 15%, 100% 0%, 100% 85%, 0% 100%)", scale: 0.95 },
          {
            clipPath: "polygon(0 0%, 100% 0%, 100% 100%, 0% 100%)",
            scale: 1.0,
            duration: 1.1,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: photoFrameRef.current,
              start: "top 75%",
              toggleActions: "play none none reverse",
            },
          }
        );
      }

      // Review score stamp scale in
      if (reviewScoreRef.current) {
        gsap.fromTo(
          reviewScoreRef.current,
          { scale: 0.85, opacity: 0 },
          {
            scale: 1,
            opacity: 1,
            duration: 0.6,
            ease: "back.out(1.7)",
            scrollTrigger: {
              trigger: reviewScoreRef.current,
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
      id="gaming"
      ref={containerRef}
      className="w-full bg-[#E8DFC8] py-12 border-b border-[#766E5F] select-none scroll-mt-14 sm:scroll-mt-16"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Department Header */}
        <div className="border-t-4 border-b-2 border-[#766E5F] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#9F3028] uppercase font-bold">
              INTERACTIVE WORLDS, GRAPHICS ENGINES & NEURAL SIMULATION
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#201E19] uppercase tracking-tight">
              GAMING & SIMULATION DESK
            </h3>
          </div>
          <div className="text-xs font-mono text-[#39352D] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-semibold">
            <span>RADIANCE FIELDS</span>
            <span>•</span>
            <span>PHYSICS ENGINES</span>
            <span>•</span>
            <span>REAL-TIME RAYTRACING</span>
            <span>•</span>
            <span>CRITIC REVIEWS</span>
          </div>
        </div>

        {/* Large Editorial Headline & Review Showcase */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Story & Review (7 columns) */}
          <div className="lg:col-span-7 lg:pr-6 lg:border-r border-[#766E5F]/30">
            <div className="flex items-center justify-between text-[11px] font-mono text-[#39352D] mb-1">
              <span className="text-[#9F3028] font-bold uppercase tracking-wider">
                FEATURE CRITIQUE
              </span>
              <span>{lead.page}</span>
            </div>

            <SplitHeadline
              text={lead.headline}
              as="h4"
              className="text-3xl sm:text-4xl md:text-5xl leading-[1.0] mb-3 hover:text-[#9F3028] transition-colors cursor-pointer"
              onClick={() => onOpenStory(lead)}
            />

            {/* Editorial Review Score Banner with Pop Animation */}
            <div
              ref={reviewScoreRef}
              className="my-4 border-y-2 border-[#766E5F] py-3 px-4 bg-[#DFD5BC] flex flex-col sm:flex-row sm:items-center justify-between gap-3 will-change-transform"
            >
              <div>
                <div className="font-serif font-bold text-base text-[#201E19] uppercase">
                  {lead.reviewTitle}
                </div>
                <div className="text-[11px] font-mono text-[#39352D]">
                  Reviewed by Tobias Weber • Lead Game Critic
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-3xl font-black text-[#9F3028]">
                  {lead.reviewScore}
                </span>
                <span className="font-mono text-[9px] bg-[#201E19] text-[#E8DFC8] px-1.5 py-0.5 uppercase tracking-widest font-bold">
                  TIMES ESSENTIAL
                </span>
              </div>
            </div>

            {/* Cinematic Crop Photo Frame */}
            <div
              ref={photoFrameRef}
              onClick={() => onOpenStory(lead)}
              className="my-4 border-2 border-[#766E5F] bg-[#766E5F] p-1 will-change-transform transform-gpu shadow-sm cursor-pointer group relative overflow-hidden"
            >
              <div className="relative h-60 sm:h-72 bg-[#766E5F] overflow-hidden">
                <img
                  src={lead.urlToImage || lead.image || "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?auto=format&fit=crop&w=1200&q=80"}
                  alt={lead.headline}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/window.svg";
                  }}
                  className="w-full h-full object-cover filter contrast-[1.1] group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-4 text-[#DFD5BC]">
                  <span className="font-mono text-xs uppercase tracking-widest text-[#9F3028] font-bold">
                    LITHOGRAPHIC CAPTURE // 4K 120 FPS
                  </span>
                  <h5 className="font-serif text-lg sm:text-xl font-bold uppercase line-clamp-2">
                    {lead.headline}
                  </h5>
                </div>
                {lead.video && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded-xs bg-[#201E19]/90 text-[#E8DFC8] text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 border border-white/20">
                    <Play className="w-2.5 h-2.5 fill-[#9F3028] text-[#9F3028]" />
                    <span>GAMEPLAY REEL</span>
                  </div>
                )}
              </div>
            </div>

            <p className="font-serif text-base sm:text-lg text-[#39352D] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <p className="font-serif text-[15px] leading-[1.65] text-[#222222] mb-4 text-justify">
              {lead.snippet}
            </p>

            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#201E19] hover:text-[#9F3028] border border-[#766E5F] px-3.5 py-1.5 hover:bg-[#201E19] hover:text-[#E8DFC8] transition-all cursor-pointer"
              data-cursor="READ"
            >
              <span>Read Full Review & Engine Analysis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Column: Engine Frame Statistics & Telemetry (5 columns) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="border-2 border-[#766E5F] p-4 bg-[#DFD5BC]">
              <div className="border-b border-[#766E5F] pb-2 mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-bold uppercase tracking-wider text-[#201E19] flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-[#9F3028]" />
                  ENGINE PIPELINE TELEMETRY (120 FPS LOCK)
                </span>
                <span className="font-mono text-[9px] bg-[#201E19] text-[#E8DFC8] px-1 font-bold">
                  VERIFIED
                </span>
              </div>

              <div className="space-y-3 font-mono">
                {lead.stats.map((stat, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-[#766E5F]/15 text-xs">
                    <span className="text-[#39352D]">{stat.label}</span>
                    <span className="font-black text-[#201E19]">{stat.val}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[9px] font-mono text-[#666666] italic text-right">
                Tested across 4K stereoscopic displays running dual neural coprocessors.
              </div>
            </div>

            {/* Editorial Column */}
            <div className="border border-[#766E5F] p-4 bg-[#E8DFC8]">
              <div className="text-[10px] font-mono text-[#9F3028] font-bold uppercase tracking-widest mb-1">
                AESTHETIC DISPATCH
              </div>
              <h5 className="font-serif font-bold text-base text-[#201E19] uppercase mb-1">
                The Disappearance of the Polygon
              </h5>
              <p className="font-serif text-xs text-[#39352D] leading-relaxed text-justify">
                For half a century, 3D graphics were constructed from flat geometric triangles glued together like paper origami. Today, neural volumetric fields represent matter as continuous probabilistic fields of light. The polygon is dead; long live the photon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
