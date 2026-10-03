"use client";

import { X, Trash2, ArrowRight, Bookmark } from "lucide-react";

export default function ClippingsDrawer({ isOpen, onClose, clippings, onOpenStory, onRemoveClipping }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#111111]/70 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-[#F2EEE5] text-[#111111] h-full border-l-2 border-[#1A1A1A] shadow-2xl flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div className="p-4 bg-[#ECE6D8] border-b-2 border-[#1A1A1A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#A71919]" />
            <h3 className="font-serif font-black text-lg uppercase tracking-tight">
              READER’S SCRAPBOOK
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[#111111] hover:text-[#F2EEE5] transition-colors cursor-pointer"
            data-cursor="CLOSE"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Clippings Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="text-xs font-mono text-[#555555] uppercase border-b border-[#1A1A1A]/20 pb-2">
            SAVED CLIPPINGS ({clippings.length})
          </div>

          {clippings.length === 0 ? (
            <div className="py-12 text-center text-xs font-mono text-[#777777] italic">
              Your scrapbook is empty. Click the “Clip Story” button on any article to save it to your broadsheet scrapbook.
            </div>
          ) : (
            clippings.map((item) => (
              <div
                key={item.id}
                className="p-3 border border-[#1A1A1A] bg-[#ECE6D8]/60 relative group"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#A71919] uppercase font-bold mb-1">
                  <span>{item.desk || "DISPATCH"}</span>
                  <span>{item.page || "PAGE 01"}</span>
                </div>

                <h4
                  onClick={() => {
                    onOpenStory(item);
                    onClose();
                  }}
                  className="font-serif font-bold text-base text-[#111111] hover:text-[#A71919] transition-colors cursor-pointer leading-snug mb-2"
                  data-cursor="READ"
                >
                  {item.headline}
                </h4>

                <div className="flex items-center justify-between pt-2 border-t border-[#1A1A1A]/20 text-xs font-mono">
                  <button
                    onClick={() => {
                      onOpenStory(item);
                      onClose();
                    }}
                    className="text-[#111111] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                    data-cursor="READ"
                  >
                    <span>Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  <button
                    onClick={() => onRemoveClipping(item.id)}
                    className="text-[#888888] hover:text-[#A71919] p-1 cursor-pointer transition-colors"
                    title="Remove from Scrapbook"
                    data-cursor="REMOVE"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Drawer Footer */}
        <div className="p-4 bg-[#ECE6D8] border-t border-[#1A1A1A] text-center text-[10px] font-mono text-[#555555] uppercase">
          CLIPPINGS ARE PERSISTED IN LOCAL BROWSER LEDGER
        </div>
      </div>
    </div>
  );
}
