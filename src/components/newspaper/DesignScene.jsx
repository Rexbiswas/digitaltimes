"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { designDeskData } from "@/data/newspaperData";
import { Palette, Layers, Sparkles, ArrowRight } from "lucide-react";
import SplitHeadline from "@/components/motion/SplitHeadline";

export default function DesignScene({ onOpenStory }) {
  const { lead } = designDeskData;
  const containerRef = useRef(null);
  const card1Ref = useRef(null);
  const card2Ref = useRef(null);
  const card3Ref = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    if (!container) return;

    const ctx = gsap.context(() => {
      // Restrained multi-speed collage parallax
      if (card1Ref.current && card2Ref.current && card3Ref.current) {
        gsap.to(card1Ref.current, {
          yPercent: -12,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });

        gsap.to(card2Ref.current, {
          yPercent: 10,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.8,
          },
        });

        gsap.to(card3Ref.current, {
          yPercent: -18,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.5,
          },
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="design"
      ref={containerRef}
      className="w-full bg-[#EAE3D2] py-12 border-b border-[#1A1A1A] select-none scroll-mt-14 sm:scroll-mt-16"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Department Header */}
        <div className="border-t-4 border-b-2 border-[#1A1A1A] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#A71919] uppercase font-bold">
              GRAPHIC ARTS, TYPOGRAPHY & MATERIAL INTERFACES
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#111111] uppercase tracking-tight">
              EDITORIAL DESIGN DESK
            </h3>
          </div>
          <div className="text-xs font-mono text-[#555555] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-bold">
            <span>TYPOGRAPHY</span>
            <span>•</span>
            <span>GRIDS</span>
            <span>•</span>
            <span>MATERIALITY</span>
            <span>•</span>
            <span>HALFTONE</span>
            <span>•</span>
            <span>ASYMMETRY</span>
          </div>
        </div>

        {/* Magazine Editorial Composition */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Story & Principles (7 columns) */}
          <div className="lg:col-span-7 lg:pr-6 lg:border-r border-[#1A1A1A]/30">
            <div className="text-[11px] font-mono text-[#A71919] uppercase font-bold mb-1">
              MAGAZINE CRITIQUE • {lead.page}
            </div>

            <SplitHeadline
              text={lead.headline}
              as="h4"
              className="text-3xl sm:text-4xl md:text-5xl leading-[1.0] mb-3 hover:text-[#A71919] transition-colors cursor-pointer"
              onClick={() => onOpenStory(lead)}
            />

            <p className="font-serif text-base sm:text-lg text-[#333333] leading-relaxed mb-4">
              {lead.deck}
            </p>

            <div className="text-xs font-mono text-[#666666] mb-4 pb-2 border-b border-[#1A1A1A]/30">
              {lead.author} • {lead.readTime} • BASEL EDITORIAL SALON
            </div>

            <p className="font-serif text-[15px] leading-[1.65] text-[#222222] mb-4 text-justify">
              {lead.body}
            </p>

            {/* Design Principles Grid */}
            <div className="my-6 border-y-2 border-[#1A1A1A] py-4 bg-[#F2EEE5] grid grid-cols-1 md:grid-cols-3 gap-4">
              {lead.designPrinciples.map((p) => (
                <div key={p.num} className="border-r border-[#1A1A1A]/20 pr-2 last:border-r-0">
                  <span className="font-mono text-xs font-black text-[#A71919] block mb-1">
                    CANON {p.num}
                  </span>
                  <div className="font-serif font-bold text-sm text-[#111111] mb-1">
                    {p.title}
                  </div>
                  <div className="font-serif text-xs text-[#555555] leading-snug">
                    {p.desc}
                  </div>
                </div>
              ))}
            </div>

            <blockquote className="my-4 p-4 border-l-4 border-[#1A1A1A] bg-[#ECE6D8] font-serif italic text-base text-[#111111]">
              {lead.pullQuote}
            </blockquote>

            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#111111] hover:text-[#A71919] border border-[#111111] px-3.5 py-1.5 hover:bg-[#111111] hover:text-[#F2EEE5] transition-all cursor-pointer"
              data-cursor="READ"
            >
              <span>Read Full Design Manifesto</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Multi-speed Image Collage (5 columns) */}
          <div className="lg:col-span-5 space-y-6 pt-2">
            <div className="border border-[#1A1A1A] pb-1 font-mono text-xs font-bold uppercase text-[#555555]">
              MATERIAL PRINT COLLAGE // THREE ETCHINGS
            </div>

            <div className="space-y-4">
              {/* Collage Item 1 */}
              <div
                ref={card1Ref}
                className="p-4 border-2 border-[#1A1A1A] bg-[#F2EEE5] shadow-xs will-change-transform transform-gpu"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#A71919] font-bold mb-1">
                  <span>EXHIBIT 01</span>
                  <span>{lead.collageImages[0]?.meta}</span>
                </div>
                <div className="font-serif font-bold text-lg text-[#111111] uppercase">
                  {lead.collageImages[0]?.caption}
                </div>
                <div className="h-20 mt-2 bg-[#E4DDD0] border border-[#1A1A1A]/30 flex items-center justify-center font-serif text-2xl font-black text-[#111111]/80 tracking-widest">
                  Aa Bb Gg 1926
                </div>
              </div>

              {/* Collage Item 2 */}
              <div
                ref={card2Ref}
                className="p-4 border-2 border-[#1A1A1A] bg-[#ECE6D8] ml-4 sm:ml-8 shadow-sm will-change-transform transform-gpu"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#A71919] font-bold mb-1">
                  <span>EXHIBIT 02</span>
                  <span>{lead.collageImages[1]?.meta}</span>
                </div>
                <div className="font-serif font-bold text-lg text-[#111111] uppercase">
                  {lead.collageImages[1]?.caption}
                </div>
                <div className="mt-2 space-y-1">
                  <div className="h-[2px] bg-[#111111] w-full" />
                  <div className="h-[1px] bg-[#111111] w-3/4" />
                  <div className="h-[1px] bg-[#A71919] w-1/2" />
                </div>
              </div>

              {/* Collage Item 3 */}
              <div
                ref={card3Ref}
                className="p-4 border-2 border-[#1A1A1A] bg-[#F2EEE5] mr-4 sm:mr-8 shadow-xs will-change-transform transform-gpu"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#A71919] font-bold mb-1">
                  <span>EXHIBIT 03</span>
                  <span>{lead.collageImages[2]?.meta}</span>
                </div>
                <div className="font-serif font-bold text-lg text-[#111111] uppercase">
                  {lead.collageImages[2]?.caption}
                </div>
                <p className="font-serif text-xs text-[#555555] italic mt-1">
                  Simulating organic grain and ink dispersal in SVG shader networks.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
