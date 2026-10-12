"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { leadStory } from "@/data/newspaperData";
import { ArrowDown, BookOpen, Clock, Compass } from "lucide-react";

export default function HeroScrollSection({ onOpenStory }) {
  const containerRef = useRef(null);
  const headlineRef = useRef(null);
  const imageFrameRef = useRef(null);
  const imageRef = useRef(null);
  const deckRef = useRef(null);
  const overlayQuoteRef = useRef(null);
  const stageTrackerRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    // Respect reduced motion
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top top",
          end: "+=160%",
          pin: true,
          scrub: 0.8,
          anticipatePin: 1,
        },
      });

      // Stage 1 & 2: Image slowly expands, scale slightly, headline holds then ascends
      tl.to(
        imageFrameRef.current,
        {
          width: "100%",
          maxWidth: "100vw",
          height: "82vh",
          borderRadius: 0,
          duration: 1.2,
          ease: "power2.inOut",
        },
        0
      );

      tl.to(
        imageRef.current,
        {
          scale: 1.0,
          filter: "contrast(1.1) saturate(1.0)",
          duration: 1.2,
          ease: "power2.inOut",
        },
        0
      );

      // Stage 3: Headline ascends upward with subtle paper perspective
      tl.to(
        headlineRef.current,
        {
          y: -80,
          opacity: 0.25,
          scale: 0.95,
          duration: 0.8,
          ease: "power1.out",
        },
        0.3
      );

      tl.to(
        deckRef.current,
        {
          y: -40,
          opacity: 0,
          duration: 0.5,
          ease: "power1.out",
        },
        0.2
      );

      // Stage 4: Cinematic Pull Quote overlays onto the expanded image
      tl.fromTo(
        overlayQuoteRef.current,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
        0.6
      );

      // Stage 5 & 6: Prepares transition to next broadsheet section
      tl.to(
        overlayQuoteRef.current,
        { opacity: 0.8, y: -20, duration: 0.4 },
        1.1
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  const headlineWords = leadStory.headline.split(" ");

  return (
    <section
      ref={containerRef}
      className="relative w-full min-h-screen bg-[#E8DFC8] overflow-hidden flex flex-col justify-between pt-4 pb-8 border-b border-[#766E5F]"
    >
      {/* Background Watermark Date */}
      <div className="absolute right-6 top-1/2 -translate-y-1/2 select-none pointer-events-none opacity-[0.03] font-serif text-[18vw] font-black leading-none text-[#201E19] z-0">
        1926–2026
      </div>

      <div className="max-w-[1400px] w-full mx-auto px-4 sm:px-6 relative z-10 flex flex-col flex-1 justify-between">
        {/* Top Editorial Ribbon */}
        <div className="flex items-center justify-between border-b border-[#766E5F] pb-2 text-xs font-mono text-[#39352D]">
          <div className="flex items-center gap-2">
            <span className="bg-[#9F3028] text-[#E8DFC8] text-[10px] font-bold px-2 py-0.5 tracking-widest uppercase">
              {leadStory.editionBadge}
            </span>
            <span className="font-semibold text-[#201E19]">{leadStory.desk} DESK</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline">{leadStory.location}</span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3 text-[#9F3028]" />
              {leadStory.readTime}
            </span>
            <span className="font-bold text-[#201E19]">{leadStory.page}</span>
          </div>
        </div>

        {/* Dramatic Headline with Word-by-Word Editorial Staging */}
        <div ref={headlineRef} className="pt-4 sm:pt-6 text-center max-w-5xl mx-auto">
          <div className="inline-block border-y border-[#766E5F]/30 py-1 px-4 mb-2">
            <span className="font-mono text-[11px] sm:text-xs font-bold tracking-[0.3em] uppercase text-[#39352D]">
              THE STORIES SHAPING THE DIGITAL WORLD
            </span>
          </div>

          <h2
            onClick={() => onOpenStory(leadStory)}
            className="font-serif font-black text-3xl sm:text-5xl md:text-7xl lg:text-[5.4rem] leading-[0.94] tracking-tight text-[#201E19] uppercase hover:text-[#9F3028] transition-colors cursor-pointer"
            data-cursor="READ LEAD"
          >
            {headlineWords.map((word, i) => (
              <span key={i} className="inline-block mx-1.5 sm:mx-2.5">
                {word}
              </span>
            ))}
          </h2>

          <p
            ref={deckRef}
            className="mt-3 sm:mt-5 text-sm sm:text-base md:text-xl font-serif text-[#39352D] max-w-3xl mx-auto leading-relaxed font-normal"
          >
            {leadStory.deck}
          </p>

          <div className="mt-2 text-xs font-mono text-[#39352D] tracking-wider uppercase">
            {leadStory.author} • {leadStory.date}
          </div>
        </div>

        {/* The Cinematic Expanding Photo Frame */}
        <div className="w-full flex flex-col items-center my-4 sm:my-6">
          <div
            ref={imageFrameRef}
            onClick={() => onOpenStory(leadStory)}
            className="relative w-full max-w-4xl h-[42vh] sm:h-[50vh] overflow-hidden border-2 border-[#766E5F] cursor-pointer group shadow-sm bg-[#766E5F]"
            data-cursor="VIEW STORY"
          >
            {/* The Image with subtle zoom and vintage contrast */}
            <img
              ref={imageRef}
              src={leadStory.urlToImage || leadStory.image || "/window.svg"}
              alt="The Digital Times Lead Photo"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/window.svg";
              }}
              className="w-full h-full object-cover object-center filter contrast-[1.08] saturate-[0.88] scale-[1.06] transition-transform duration-700 group-hover:scale-100"
            />

            {/* Subtle Vignette & Ink Grain Texture */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#201E19]/80 via-transparent to-transparent pointer-events-none" />

            {/* Overlay Quote during Cinematic Scroll Stage 4 */}
            <div
              ref={overlayQuoteRef}
              className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10 pointer-events-none text-[#E8DFC8]"
            >
              <div className="max-w-2xl bg-[#201E19]/85 p-4 sm:p-6 border-l-4 border-[#9F3028] backdrop-blur-xs">
                <span className="font-serif text-3xl sm:text-4xl text-[#9F3028] font-black leading-none block mb-1">
                  “
                </span>
                <p className="font-serif text-base sm:text-xl md:text-2xl font-light italic leading-snug">
                  Software is no longer static instructions executing deterministically; it has evolved into conversational, self-healing ecologies operating at the speed of thought.
                </p>
                <div className="mt-2 text-[10px] sm:text-xs font-mono uppercase tracking-widest text-[#D4CDBC]">
                  — THE EDITORIAL BOARD DISPATCH
                </div>
              </div>
            </div>

            {/* In-Frame Newspaper Stamp Badge */}
            <div className="absolute top-3 left-3 bg-[#E8DFC8] text-[#201E19] px-2 py-0.5 text-[10px] font-mono font-bold tracking-widest uppercase border border-[#766E5F] shadow-xs">
              DOCUMENTARY EVIDENCE № 26-A
            </div>
          </div>

          {/* Photo Caption & Lithograph Details */}
          <div className="w-full max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-[#39352D] pt-1.5 px-1 gap-1 border-b border-[#766E5F]/20">
            <span className="italic">{leadStory.imageCaption}</span>
            <span className="uppercase text-[10px] text-[#777777] shrink-0 font-bold">
              {leadStory.imageCredit}
            </span>
          </div>
        </div>

        {/* Scroll Indicator Prompt */}
        <div className="flex items-center justify-center pt-1 text-[11px] font-mono text-[#39352D] tracking-widest uppercase gap-2 animate-bounce">
          <ArrowDown className="w-3.5 h-3.5 text-[#9F3028]" />
          <span>SCROLL TO TURN BROADSHEET PAGE</span>
          <ArrowDown className="w-3.5 h-3.5 text-[#9F3028]" />
        </div>
      </div>
    </section>
  );
}
