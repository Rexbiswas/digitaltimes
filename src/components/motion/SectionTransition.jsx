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
      className="w-full bg-[#DFD5BC] py-3.5 border-y border-[#766E5F] select-none my-6 transition-colors hover:bg-[#D7CCB2] group no-scrollbar"
    >
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        <Link
          href={targetHref}
          onClick={handleAdvanceClick}
          className="flex flex-col sm:flex-row items-center justify-between font-mono text-[11px] text-[#39352D] uppercase tracking-widest gap-2 cursor-pointer"
          title={`Advance to ${toSection}`}
          data-cursor="ADVANCE"
        >
          {/* Left Folio Advance Marker */}
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 bg-[#9F3028] inline-block shrink-0 transition-transform group-hover:scale-125" />
            <span className="font-bold text-[#201E19] group-hover:text-[#9F3028] transition-colors">
              FOLIO ADVANCE: {fromSection} → {toSection}
            </span>
          </div>

          {/* Center Editorial Broadsheet Motto */}
          <div className="hidden md:flex items-center gap-3 text-[#666666]">
            <span className="h-[1px] w-12 bg-[#766E5F]/30" />
            <span className="italic font-serif text-xs capitalize text-[#39352D]">
              Turn the page to continue reading
            </span>
            <span className="h-[1px] w-12 bg-[#766E5F]/30" />
          </div>

          {/* Right Action Button with Clickable Routing */}
          <div className="flex items-center gap-2 font-bold text-[#201E19] group-hover:text-[#9F3028] transition-colors">
            <span>PAGE {pageNumber}</span>
            <span>•</span>
            <span className="flex items-center gap-1 underline underline-offset-4 decoration-[#9F3028]">
              <span>ADVANCE BROADSHEET</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </span>
          </div>
        </Link>
      </div>
    </aside>
  );
}
