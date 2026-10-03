"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function PaperReveal({
  children,
  effect = "editorial-wipe", // "editorial-wipe", "ink-reveal", "paper-slide", "column-reveal"
  className = "",
  triggerHook = "top 80%",
}) {
  const containerRef = useRef(null);
  const maskRef = useRef(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      if (effect === "editorial-wipe") {
        gsap.fromTo(
          el,
          { clipPath: "polygon(0 0, 100% 0, 100% 0, 0 0)" },
          {
            clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)",
            duration: 1.1,
            ease: "power3.inOut",
            scrollTrigger: {
              trigger: el,
              start: triggerHook,
              toggleActions: "play none none reverse",
            },
          }
        );
      } else if (effect === "ink-reveal") {
        gsap.fromTo(
          el,
          {
            filter: "contrast(2.5) blur(3px) opacity(0)",
            y: 20,
          },
          {
            filter: "contrast(1) blur(0px) opacity(1)",
            y: 0,
            duration: 0.9,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: triggerHook,
              toggleActions: "play none none reverse",
            },
          }
        );
      } else if (effect === "paper-slide") {
        gsap.fromTo(
          el,
          {
            y: 70,
            opacity: 0.6,
          },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              trigger: el,
              start: triggerHook,
              toggleActions: "play none none reverse",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [effect, triggerHook]);

  return (
    <div ref={containerRef} className={`relative will-change-transform ${className}`}>
      {children}
    </div>
  );
}
