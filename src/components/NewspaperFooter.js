"use client";

import { mastheadData, navigationDesks } from "@/data/newspaperData";
import { ArrowUp, BookOpen, ShieldCheck, Printer } from "lucide-react";

export default function NewspaperFooter({ onSelectDesk }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="w-full bg-[#EAE3D2] border-t-4 border-[#1A1A1A] pt-10 pb-16 text-[#111111] select-none">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Newspaper Colophon & Broadsheet Index */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b-2 border-[#1A1A1A]">
          {/* Masthead Identity (5 columns) */}
          <div className="md:col-span-5 md:pr-6 md:border-r border-[#1A1A1A]/30">
            <h2 className="font-masthead font-normal text-3xl sm:text-4xl text-[#111111] tracking-normal mb-2">
              The Digital Times
            </h2>
            <p className="font-serif text-sm text-[#444444] italic mb-4">
              “The Independent Journal of the Computational Age — Published Daily in Broadside Format Across Distributed Networks.”
            </p>
            <div className="text-xs font-mono text-[#666666] space-y-1">
              <div>FOUNDED: 2026 • REGISTERED AS SOVEREIGN CHRONICLE</div>
              <div>BUREAUS: NEW DELHI • SAN FRANCISCO • ZURICH • TOKYO • GENEVA</div>
              <div>PRESS REGISTRY: ISSN 2991-8842 // GLOBAL COMMERCE</div>
            </div>
          </div>

          {/* Department Page Index (4 columns) */}
          <div className="md:col-span-4 md:pr-6 md:border-r border-[#1A1A1A]/30">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#A71919] mb-3">
              BROADSHEET FOLIO & DESK INDEX
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {navigationDesks.map((d) => (
                <button
                  key={d.id}
                  onClick={() => onSelectDesk(d.id)}
                  className="text-left text-[#333333] hover:text-[#A71919] hover:underline cursor-pointer flex items-center justify-between pr-2"
                  data-cursor="GOTO"
                >
                  <span>{d.label}</span>
                  <span className="text-[#888888]">P.{d.page}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Editorial Standards & Colophon (3 columns) */}
          <div className="md:col-span-3 space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-[#111111]">
              EDITORIAL GUARANTEE
            </div>
            <p className="font-serif text-xs leading-relaxed text-[#555555]">
              Every dispatch published by The Digital Times is audited through cryptographic timestamping and dual-blind fact-checking matrices.
            </p>
            <div className="pt-2">
              <button
                onClick={scrollToTop}
                className="w-full inline-flex items-center justify-center gap-2 border-2 border-[#1A1A1A] bg-[#F2EEE5] py-2 px-3 text-xs font-mono font-bold uppercase hover:bg-[#111111] hover:text-[#F2EEE5] transition-all cursor-pointer"
                data-cursor="TOP"
              >
                <ArrowUp className="w-3.5 h-3.5" />
                <span>RETURN TO MASTHEAD</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Imprint & Copyright */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs font-mono text-[#666666] gap-3">
          <div>
            © 2026 THE DIGITAL TIMES PUBLISHING CONSORTIUM • ALL RIGHTS RESERVED
          </div>
          <div className="flex items-center space-x-4">
            <span>PRESS REVISION: 2026.09.30-FINAL</span>
            <span>•</span>
            <span className="text-[#A71919] font-bold">100% INK & PAPER FIDELITY</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
