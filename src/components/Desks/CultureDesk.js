"use client";

import { useState } from "react";
import { cultureDeskData } from "@/data/newspaperData";
import { Sparkles, HelpCircle, CheckCircle, ArrowRight } from "lucide-react";

export default function CultureDesk({ onOpenStory }) {
  const { lead, classifieds, miniCrossword } = cultureDeskData;
  const [crosswordAnswers, setCrosswordAnswers] = useState({
    "1-ACROSS": "",
    "2-ACROSS": "",
    "3-DOWN": "",
    "4-DOWN": "",
  });
  const [solvedState, setSolvedState] = useState({
    "1-ACROSS": false,
    "2-ACROSS": false,
    "3-DOWN": false,
    "4-DOWN": false,
  });

  const handleCrosswordChange = (num, val, expected) => {
    const clean = val.toUpperCase().slice(0, expected.length);
    setCrosswordAnswers((prev) => ({ ...prev, [num]: clean }));
    if (clean === expected) {
      setSolvedState((prev) => ({ ...prev, [num]: true }));
    } else {
      setSolvedState((prev) => ({ ...prev, [num]: false }));
    }
  };

  return (
    <section id="culture" className="w-full bg-[#E8DFC8] py-10 border-b border-[#766E5F]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6">
        {/* Newspaper Department Header */}
        <div className="border-t-4 border-b-2 border-[#766E5F] py-2 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-2">
          <div>
            <span className="font-mono text-xs tracking-widest text-[#9F3028] uppercase font-bold">
              ESSAYS, ARCHIVES, SUBCULTURES & CLASSIFIED ADVERTISEMENTS
            </span>
            <h3 className="font-serif font-black text-2xl sm:text-4xl text-[#201E19] uppercase tracking-tight">
              INTERNET CULTURE & CLASSIFIEDS
            </h3>
          </div>
          <div className="text-xs font-mono text-[#39352D] flex flex-wrap items-center gap-2 sm:gap-4 uppercase font-semibold">
            <span>SMALL-WEB</span>
            <span>•</span>
            <span>HYPERTEXT</span>
            <span>•</span>
            <span>DIGITAL ZINES</span>
            <span>•</span>
            <span>CLASSIFIEDS</span>
            <span>•</span>
            <span>CRYPTIC PUZZLE</span>
          </div>
        </div>

        {/* Culture Layout: Left Lead Essay, Center Classifieds, Right Mini Crossword */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Culture Essay (6 columns) */}
          <div className="lg:col-span-6 lg:pr-6 lg:border-r border-[#766E5F]/30">
            <div className="text-[11px] font-mono text-[#9F3028] uppercase font-bold mb-1">
              CULTURAL DISPATCH • {lead.page}
            </div>

            <h4
              onClick={() => onOpenStory(lead)}
              className="font-serif font-black text-3xl sm:text-4xl md:text-5xl leading-[1.0] text-[#201E19] uppercase hover:text-[#9F3028] transition-colors cursor-pointer mb-3"
              data-cursor="READ"
            >
              {lead.headline}
            </h4>

            <p className="font-serif text-base sm:text-lg text-[#39352D] leading-relaxed mb-4">
              {lead.deck}
            </p>

            {/* Grand Editorial Pull Quote */}
            <blockquote className="my-6 p-5 border-y-2 border-[#766E5F] bg-[#DFD5BC] font-serif italic text-lg sm:text-xl text-[#201E19] leading-snug">
              {lead.pullQuote}
            </blockquote>

            <p className="font-serif text-[15px] leading-[1.65] text-[#222222] mb-4 text-justify">
              {lead.snippet}
            </p>

            <button
              onClick={() => onOpenStory(lead)}
              className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#201E19] hover:text-[#9F3028] border border-[#766E5F] px-3.5 py-1.5 hover:bg-[#201E19] hover:text-[#E8DFC8] transition-all cursor-pointer"
              data-cursor="READ"
            >
              <span>Read Culture Broadside</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Authentic Newspaper Classified Ads (3 columns) */}
          <div className="lg:col-span-3 lg:pr-4 lg:border-r border-[#766E5F]/30 space-y-4">
            <div className="border-b border-[#766E5F] pb-1 flex items-center justify-between font-mono text-xs text-[#201E19] font-bold">
              <span>TIMES CLASSIFIED ADS</span>
              <span className="text-[#9F3028]">COL. 5</span>
            </div>

            {classifieds.map((ad, idx) => (
              <div
                key={idx}
                className="p-3 border border-[#766E5F]/40 bg-[#DFD5BC]/50 text-xs select-text"
              >
                <div className="font-mono font-bold text-[11px] text-[#201E19] uppercase border-b border-[#766E5F]/20 pb-1 mb-1">
                  {ad.title}
                </div>
                <p className="font-serif text-[12px] leading-relaxed text-[#39352D]">
                  {ad.text}
                </p>
                <div className="mt-2 text-[9px] font-mono text-[#888888] uppercase text-right">
                  BOX № 0{idx + 1}-CL
                </div>
              </div>
            ))}
          </div>

          {/* Authentic Times Cryptic Mini Crossword (3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            <div className="border-2 border-[#766E5F] p-3.5 bg-[#DFD5BC]">
              <div className="border-b border-[#766E5F] pb-1.5 mb-3 flex items-center justify-between">
                <span className="font-mono text-xs font-black uppercase tracking-wider text-[#201E19]">
                  {miniCrossword.title}
                </span>
                <span className="font-mono text-[9px] bg-[#201E19] text-[#E8DFC8] px-1 font-bold">
                  NO. 104
                </span>
              </div>

              <div className="text-[11px] font-serif italic text-[#39352D] mb-3">
                Fill the blanks with standard broadsheet telegraphic answers:
              </div>

              <div className="space-y-3 font-mono text-xs">
                {miniCrossword.clues.map((clueItem) => {
                  const isSolved = solvedState[clueItem.num];
                  return (
                    <div key={clueItem.num} className="border-b border-[#766E5F]/20 pb-2">
                      <div className="flex items-center justify-between text-[11px] text-[#201E19] font-bold mb-1">
                        <span>{clueItem.num}</span>
                        {isSolved && (
                          <span className="text-[#1d6b2c] flex items-center gap-0.5 text-[10px]">
                            <CheckCircle className="w-3 h-3" /> SOLVED
                          </span>
                        )}
                      </div>
                      <div className="font-serif text-xs text-[#39352D] mb-1.5 leading-tight">
                        {clueItem.clue}
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          maxLength={clueItem.answer.length}
                          placeholder={`${clueItem.answer.length} letters`}
                          value={crosswordAnswers[clueItem.num]}
                          onChange={(e) =>
                            handleCrosswordChange(clueItem.num, e.target.value, clueItem.answer)
                          }
                          className={`w-full px-2 py-1 uppercase font-mono tracking-widest text-xs border ${
                            isSolved
                              ? "border-[#1d6b2c] bg-[#eaf4eb] text-[#1d6b2c] font-bold"
                              : "border-[#766E5F] bg-[#E8DFC8] text-[#201E19]"
                          }`}
                          data-cursor="PUZZLE"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 pt-2 border-t border-[#766E5F]/30 flex items-center justify-between text-[10px] font-mono text-[#777777]">
                <span>TOMORROW&apos;S SOLUTION IN NO. 002</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
