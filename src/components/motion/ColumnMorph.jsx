"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function ColumnMorph({
  leftColumn,
  centerColumn,
  rightColumn,
  className = "",
}) {
  const containerRef = useRef(null);
  const leftRef = useRef(null);
  const centerRef = useRef(null);
  const rightRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const container = containerRef.current;
    const left = leftRef.current;
    const center = centerRef.current;
    const right = rightRef.current;
    if (!container || !left || !center || !right) return;

    // Desktop only morph to preserve readable mobile columns
    if (window.innerWidth < 1024) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: "top 25%",
          end: "+=120%",
          scrub: 0.8,
          pin: true,
          anticipatePin: 1,
        },
      });

      // Stage 1: Side columns move outward subtly, center column expands
      tl.to(
        left,
        {
          xPercent: -35,
          opacity: 0.35,
          scale: 0.94,
          duration: 1,
          ease: "power2.inOut",
        },
        0
      );

      tl.to(
        right,
        {
          xPercent: 35,
          opacity: 0.35,
          scale: 0.94,
          duration: 1,
          ease: "power2.inOut",
        },
        0
      );

      tl.to(
        center,
        {
          scale: 1.06,
          zIndex: 20,
          duration: 1,
          ease: "power2.inOut",
        },
        0
      );

      // Stage 2: Center story becomes dominant, side columns slide away completely
      tl.to(
        [left, right],
        {
          opacity: 0,
          duration: 0.5,
          ease: "power2.out",
        },
        0.8
      );

      tl.to(
        center,
        {
          scale: 1.12,
          y: -20,
          duration: 0.8,
          ease: "power2.out",
        },
        0.8
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className={`w-full relative overflow-hidden py-8 ${className}`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column (3 cols) */}
          <div
            ref={leftRef}
            className="lg:col-span-3 border-r border-[#1A1A1A]/30 pr-4 will-change-transform transform-gpu"
          >
            {leftColumn}
          </div>

          {/* Center Column (6 cols -> morphing hero) */}
          <div
            ref={centerRef}
            className="lg:col-span-6 will-change-transform transform-gpu px-2"
          >
            {centerColumn}
          </div>

          {/* Right Column (3 cols) */}
          <div
            ref={rightRef}
            className="lg:col-span-3 border-l border-[#1A1A1A]/30 pl-4 will-change-transform transform-gpu"
          >
            {rightColumn}
          </div>
        </div>
      </div>
    </div>
  );
}
