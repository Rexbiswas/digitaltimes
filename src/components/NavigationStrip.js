"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationDesks } from "@/data/newspaperData";

export default function NavigationStrip({ activeDesk, onSelectDesk }) {
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  const handleDeskClick = (e, deskId) => {
    if (isHomePage) {
      e.preventDefault();
      if (onSelectDesk) {
        onSelectDesk(deskId);
      } else {
        const el = document.getElementById(deskId);
        if (el) {
          if (typeof window !== "undefined" && window.__lenis) {
            window.__lenis.scrollTo(el, { duration: 1.0 });
          } else {
            el.scrollIntoView({ behavior: "smooth" });
          }
        }
      }
      // Update browser URL hash cleanly without page reload
      window.history.pushState(null, "", `#${deskId}`);
    }
  };

  return (
    <nav className="w-full bg-[#E8DFC8]/98 backdrop-blur-md sticky top-[33px] sm:top-[37px] z-30 border-b-2 border-[#766E5F] select-none shadow-xs transition-colors">
      <div className="max-w-[1440px] mx-auto px-1 sm:px-3 lg:px-6">
        <div className="w-full flex items-center overflow-x-auto no-scrollbar scrollbar-none py-1 sm:py-1.5 md:py-2 text-[10.5px] sm:text-[11px] md:text-[12px] font-mono tracking-wider text-[#201E19] gap-1 sm:gap-1.5 md:justify-between">
          {navigationDesks.map((desk, idx) => {
            const isActive = activeDesk === desk.id;
            const targetHref = isHomePage ? `/#${desk.id}` : `/desk/${desk.id}`;

            return (
              <div key={desk.id} className="shrink-0 md:flex-1 flex items-center justify-center">
                <Link
                  href={targetHref}
                  onClick={(e) => handleDeskClick(e, desk.id)}
                  className={`whitespace-nowrap px-2.5 sm:px-2 py-1 transition-all cursor-pointer font-bold relative flex items-center justify-center gap-1 rounded-sm ${
                    isActive
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "hover:bg-[#201E19]/10 text-[#222222]"
                  }`}
                  title={`Turn to ${desk.label} (Page ${desk.page})`}
                  data-cursor="DESK"
                >
                  <span className="text-[8.5px] sm:text-[9px] md:text-[10px] opacity-70 hidden md:inline">
                    P.{desk.page}
                  </span>
                  <span>{desk.label}</span>
                </Link>

                {idx < navigationDesks.length - 1 && (
                  <span className="text-[#766E5F]/25 select-none hidden md:inline px-1">
                    |
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
