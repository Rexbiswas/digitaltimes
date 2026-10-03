"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export default function SplitHeadline({
  text,
  className = "",
  as = "h2",
  scrub = false,
  triggerHook = "top 80%",
  stagger = 0.04,
  offsetRange = 60,
  dataCursor = "READ",
  onClick,
}) {
  const containerRef = useRef(null);
  const wordsRef = useRef([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) return;

    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const words = wordsRef.current.filter(Boolean);
      if (words.length === 0) return;

      if (scrub) {
        // Continuous scrub linked directly to scroll progress
        gsap.fromTo(
          words,
          {
            y: (i) => (i % 2 === 0 ? -offsetRange : offsetRange * 0.8),
            opacity: 0.15,
            rotateZ: (i) => (i % 2 === 0 ? -1.5 : 1.5),
          },
          {
            y: 0,
            opacity: 1,
            rotateZ: 0,
            ease: "power2.out",
            stagger: stagger,
            scrollTrigger: {
              trigger: el,
              start: triggerHook,
              end: "bottom 40%",
              scrub: 1,
            },
          }
        );
      } else {
        // Dramatic editorial reveal on enter
        gsap.fromTo(
          words,
          {
            y: 80,
            opacity: 0,
            rotateX: 20,
          },
          {
            y: 0,
            opacity: 1,
            rotateX: 0,
            duration: 0.85,
            ease: "power3.out",
            stagger: stagger,
            scrollTrigger: {
              trigger: el,
              start: triggerHook,
              toggleActions: "play none none none",
            },
          }
        );
      }
    }, containerRef);

    return () => ctx.revert();
  }, [scrub, triggerHook, stagger, offsetRange]);

  const words = text ? text.split(" ") : [];
  const Tag = as;

  return (
    <Tag
      ref={containerRef}
      onClick={onClick}
      className={`font-serif font-black uppercase tracking-tight text-[#111111] ${className}`}
      data-cursor={dataCursor}
    >
      {words.map((word, index) => (
        <span
          key={index}
          className="inline-block overflow-hidden mr-[0.25em] align-top py-1"
        >
          <span
            ref={(node) => (wordsRef.current[index] = node)}
            className="inline-block transform-gpu will-change-transform"
          >
            {word}
          </span>
        </span>
      ))}
    </Tag>
  );
}
