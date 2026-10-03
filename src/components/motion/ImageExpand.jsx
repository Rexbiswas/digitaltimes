"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ImageExpand({
  src,
  alt = "Hero Newspaper Photograph",
  caption,
  credit,
  onClick,
  dataCursor = "VIEW STORY",
}) {
  const triggerRef = useRef(null);
  const frameRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const trigger = triggerRef.current;
    const frame = frameRef.current;
    const img = imageRef.current;
    if (!trigger || !frame || !img) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: trigger,
          start: "top 60%",
          end: "bottom 15%",
          scrub: 0.8,
        },
      });

      tl.fromTo(
        frame,
        {
          width: "72%",
          height: "380px",
          clipPath: "inset(0% round 0px)",
        },
        {
          width: "100%",
          height: "640px",
          clipPath: "inset(0% round 0px)",
          ease: "power2.inOut",
        }
      );

      tl.fromTo(
        img,
        {
          scale: 1.15,
          filter: "contrast(1.04) saturate(0.85)",
        },
        {
          scale: 1.0,
          filter: "contrast(1.10) saturate(1.0)",
          ease: "power2.inOut",
        },
        0
      );
    }, triggerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={triggerRef} className="w-full flex flex-col items-center py-6">
      <div
        ref={frameRef}
        onClick={onClick}
        className="relative overflow-hidden border-2 border-[#1A1A1A] bg-[#111111] cursor-pointer group shadow-sm transition-all duration-75"
        style={{ width: "72%", height: "380px" }}
        data-cursor={dataCursor}
      >
        <img
          ref={imageRef}
          src={src}
          alt={alt}
          className="w-full h-full object-cover object-center will-change-transform transform-gpu"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111]/70 via-transparent to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 bg-[#F2EEE5] text-[#111111] px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest border border-[#111111]">
          EXPANDING BROADSHEET ARCHIVE
        </div>
      </div>

      {(caption || credit) && (
        <div className="w-full max-w-4xl flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-[#555555] pt-2 px-1 gap-1 border-b border-[#1A1A1A]/20">
          {caption && <span className="italic">{caption}</span>}
          {credit && <span className="uppercase text-[10px] text-[#777777] font-bold">{credit}</span>}
        </div>
      )}
    </div>
  );
}
