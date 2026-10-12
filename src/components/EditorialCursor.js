"use client";

import { useEffect, useState } from "react";

export default function EditorialCursor() {
  const [position, setPosition] = useState({ x: -100, y: -100 });
  const [cursorText, setCursorText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isPointer, setIsPointer] = useState(false);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const handleMouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);

      // Check if hovering an element with data-cursor
      const target = e.target.closest("[data-cursor]");
      if (target) {
        setCursorText(target.getAttribute("data-cursor") || "");
      } else {
        setCursorText("");
      }

      // Check if interactive
      const isClickable = e.target.closest("button, a, input, select, [role='button']");
      setIsPointer(!!isClickable);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div
      className="fixed pointer-events-none z-[9999] transition-transform duration-75 ease-out select-none"
      style={{
        transform: `translate3d(${position.x}px, ${position.y}px, 0)`,
        left: -10,
        top: -10,
      }}
    >
      {cursorText ? (
        <div className="bg-[#201E19] text-[#E8DFC8] text-[10px] tracking-widest uppercase font-mono px-2 py-1 border border-[#E8DFC8] shadow-md transform -translate-x-1/2 -translate-y-10 whitespace-nowrap animate-in fade-in zoom-in-95 duration-150">
          {cursorText}
        </div>
      ) : (
        <div
          className={`w-4 h-4 rounded-full border border-[#766E5F]/70 transition-all duration-150 ${
            isPointer ? "scale-150 bg-[#201E19]/15" : "scale-75 bg-[#201E19]/30"
          }`}
        />
      )}
    </div>
  );
}
