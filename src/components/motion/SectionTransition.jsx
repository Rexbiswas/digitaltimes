"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, CornerDownRight } from "lucide-react";

export default function SectionTransition({
  fromSection = "AI",
  toSection = "WEB",
  pageNumber = "03",
  targetId,
}) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  // Derive target ID if not provided
  const derivedTargetId =
    targetId ||
    toSection
      .toLowerCase()
      .replace("the ", "")
      .replace(" & simulation", "")
      .replace(" & markets", "")
      .replace(" & capital", "")
      .replace(" & puzzles", "")
      .replace("broadsheet", "")
      .replace("editorial ", "")
      .trim()
      .replace(/\s+/g, "");

  const handleAdvanceClick = (e) => {
    if (isHomePage && derivedTargetId) {
      e.preventDefault();
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.scrollTo(`#${derivedTargetId}`, { offset: -60, duration: 1.0 });
      } else {
        const el = document.getElementById(derivedTargetId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
      window.history.pushState(null, "", `#${derivedTargetId}`);
    }
  };

  const targetHref = isHomePage ? `/#${derivedTargetId}` : `/desk/${derivedTargetId}`;

  return (
    <aside
      aria-label={`Folio advance from ${fromSection} to ${toSection}`}
      className="w-full bg-[#ECE6D8] py-3.5 border-y border-[#1A1A1A] select-none my-6 transition-colors hover:bg-[#E4DDD0] group no-scrollbar"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <Link
          href={targetHref}
          onClick={handleAdvanceClick}
          className="flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] text-[#444444] uppercase tracking-widest gap-2 cursor-pointer"
          title={`Advance to ${toSection}`}
          data-cursor="ADVANCE"
        >
          {/* Left Folio Advance Marker */}
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-[#A71919] inline-block shrink-0 transition-transform group-hover:scale-125" />
            <span className="font-bold text-[#111111] group-hover:text-[#A71919] transition-colors">
              FOLIO ADVANCE: {fromSection} → {toSection}
            </span>
          </div>

          {/* Center Editorial Broadsheet Motto */}
          <div className="hidden md:flex items-center gap-3 text-[#666666]">
            <span className="h-[1px] w-12 bg-[#1A1A1A]/30" />
            <span className="italic font-serif text-xs capitalize text-[#333333]">
              Turn the page to continue reading
            </span>
            <span className="h-[1px] w-12 bg-[#1A1A1A]/30" />
          </div>

          {/* Right Action Button with Clickable Routing */}
          <div className="flex items-center gap-2 font-bold text-[#111111] group-hover:text-[#A71919] transition-colors">
            <span>PAGE {pageNumber}</span>
            <span>•</span>
            <span className="flex items-center gap-1 underline underline-offset-4 decoration-[#A71919]">
              <span>ADVANCE BROADSHEET</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
