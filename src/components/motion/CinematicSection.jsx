"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function CinematicSection({
  children,
  id,
  className = "",
  onScrollProgress,
}) {
  const sectionRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      if (onScrollProgress) {
        ScrollTrigger.create({
          trigger: el,
          start: "top bottom",
          end: "bottom top",
          onUpdate: (self) => {
            onScrollProgress(self.progress);
          },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, [onScrollProgress]);

  return (
    <section
      ref={sectionRef}
      id={id}
      className={`relative w-full overflow-hidden ${className}`}
    >
      {children}
    </section>
  );
}
