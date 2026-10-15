"use client";

import { useState } from "react";
import { Check, ShieldCheck } from "lucide-react";

/**
 * Vintage Broadside Verified Badge
 * Restrained ink-blue editorial verification seal with accessible tooltip
 */
export default function VerifiedBadge({
  category = "journalist", // "journalist" | "editor" | "publication"
  size = "md", // "sm" | "md" | "lg"
  showLabel = false,
  className = "",
}) {
  const [showTooltip, setShowTooltip] = useState(false);

  const categoryLabels = {
    journalist: "Verified Journalist",
    editor: "Editorial Board Member",
    publication: "Accredited Publication",
  };

  const categoryDescriptions = {
    journalist: "Identity & published reporting verified by The Digital Times Editorial Board.",
    editor: "Official newsroom editor and broadsheet curator.",
    publication: "Accredited newsroom institution or independent publication syndicate.",
  };

  const label = categoryLabels[category.toLowerCase()] || "Verified Broadcaster";
  const description =
    categoryDescriptions[category.toLowerCase()] ||
    "Verified against official press credentials.";

  const sizeClasses = {
    sm: "w-3.5 h-3.5 text-[9px]",
    md: "w-4 h-4 text-[10px]",
    lg: "w-5 h-5 text-xs",
  };

  const iconSizes = {
    sm: "w-2.5 h-2.5",
    md: "w-3 h-3",
    lg: "w-3.5 h-3.5",
  };

  return (
    <span
      className={`relative inline-flex items-center gap-1 align-middle select-none ${className}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onFocus={() => setShowTooltip(true)}
      onBlur={() => setShowTooltip(false)}
      tabIndex={0}
      role="status"
      aria-label={label}
    >
      <span
        className={`inline-flex items-center justify-center rounded-full bg-[#1A365D] text-[#E8DFC8] border border-[#2B6CB0]/40 shadow-xs transition-transform hover:scale-110 cursor-help ${
          sizeClasses[size] || sizeClasses.md
        }`}
      >
        <Check className={`${iconSizes[size] || iconSizes.md} stroke-[2.75]`} />
      </span>

      {showLabel && (
        <span className="font-mono text-[10px] tracking-wider uppercase text-[#1A365D] font-bold">
          {label}
        </span>
      )}

      {/* Accessible Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 z-50 w-52 p-2 bg-[#201E19] text-[#E8DFC8] border border-[#766E5F]/40 shadow-xl rounded pointer-events-none text-left"
        >
          <div className="flex items-center gap-1.5 mb-1 text-[11px] font-serif font-bold text-[#D4AF37] uppercase tracking-wider">
            <ShieldCheck className="w-3.5 h-3.5 text-[#3182CE]" />
            <span>{label}</span>
          </div>
          <p className="text-[10px] font-sans leading-tight text-[#E8DFC8]/90 font-normal">
            {description}
          </p>
          <div className="mt-1 text-[8px] font-mono uppercase text-[#E8DFC8]/60 border-t border-[#766E5F]/30 pt-0.5">
            Press Registry • The Digital Times
          </div>
          {/* Tooltip triangle */}
          <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-px border-4 border-transparent border-t-[#201E19]" />
        </div>
      )}
    </span>
  );
}
