"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function EditorialPin({
  pinnedContent,
  scrollingItems = [],
  reverse = false, // if true, right side pinned, left side scrolls
  className = "",
  pinSpacing = true,
}) {
  const containerRef = useRef(null);
  const pinnedRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    if (window.innerWidth < 1024) return; // Keep readable single-column flow on mobile

    const container = containerRef.current;
    const pinned = pinnedRef.current;
    if (!container || !pinned) return;

    const ctx = gsap.context(() => {
      ScrollTrigger.create({
        trigger: container,
        start: "top 15%",
        end: "bottom bottom",
        pin: pinned,
        pinSpacing: pinSpacing,
        anticipatePin: 1,
      });
    }, containerRef);

    return () => ctx.revert();
  }, [pinSpacing]);

  return (
    <div
      ref={containerRef}
      className={`w-full relative py-8 ${className}`}
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Pinned Side */}
          <div
            ref={pinnedRef}
            className={`lg:col-span-5 will-change-transform ${
              reverse ? "lg:order-2 lg:border-l lg:border-[#766E5F]/30 lg:pl-6" : "lg:order-1 lg:border-r lg:border-[#766E5F]/30 lg:pr-6"
            }`}
          >
            {pinnedContent}
          </div>

          {/* Scrolling Side */}
          <div
            className={`lg:col-span-7 space-y-8 ${
              reverse ? "lg:order-1" : "lg:order-2"
            }`}
          >
            {scrollingItems.map((item, idx) => (
              <div key={idx} className="pb-6 border-b border-[#766E5F]/20 last:border-b-0">
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
