"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ParallaxImage({
  src,
  alt = "Editorial Newspaper Photograph",
  caption,
  credit,
  speed = 15, // subtle yPercent parallax
  scaleStart = 1.1,
  scaleEnd = 1.0,
  className = "",
  containerClassName = "",
  onClick,
  dataCursor = "VIEW STORY",
}) {
  const containerRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const img = imageRef.current;
    if (!container || !img) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        img,
        {
          yPercent: -speed,
          scale: scaleStart,
        },
        {
          yPercent: speed,
          scale: scaleEnd,
          ease: "none",
          scrollTrigger: {
            trigger: container,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, [speed, scaleStart, scaleEnd]);

  return (
    <div className={`flex flex-col ${containerClassName}`}>
      <div
        ref={containerRef}
        onClick={onClick}
        className={`relative overflow-hidden border border-[#766E5F] bg-[#201E19] cursor-pointer group ${className}`}
        data-cursor={dataCursor}
      >
        <img
          ref={imageRef}
          src={src || "/window.svg"}
          alt={alt}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/window.svg";
          }}
          className="w-full h-full object-cover filter contrast-[1.08] saturate-[0.88] will-change-transform transform-gpu"
        />
        {/* Newspaper halftone and subtle vignette gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#201E19]/60 via-transparent to-transparent pointer-events-none opacity-80" />
      </div>

      {(caption || credit) && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-[11px] font-mono text-[#39352D] pt-1.5 px-0.5 gap-1 border-b border-[#766E5F]/20">
          {caption && <span className="italic">{caption}</span>}
          {credit && (
            <span className="uppercase text-[10px] text-[#777777] font-bold shrink-0">
              {credit}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
