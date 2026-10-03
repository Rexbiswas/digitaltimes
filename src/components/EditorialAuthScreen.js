"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Compass,
  Radio,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Check
} from "lucide-react";
import { marketTickers } from "@/data/newspaperData";

export default function EditorialAuthScreen({
  onLogin,
  onBrowseGuest
}) {
  const [authMode, setAuthMode] = useState("signin"); // "signin" | "signup"
  const [showPassword, setShowPassword] = useState(false);

  // Sign In Form State
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form State
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [selectedTopics, setSelectedTopics] = useState([
    "Artificial Intelligence",
    "Startups",
    "Cybersecurity"
  ]);

  const availableTopics = [
    "Artificial Intelligence",
    "Startups",
    "Cybersecurity",
    "Web Development",
    "Technology",
    "Editorial Design",
    "Deep Tech",
    "Markets"
  ];

  const toggleTopic = (topic) => {
    if (selectedTopics.includes(topic)) {
      if (selectedTopics.length > 1) {
        setSelectedTopics(selectedTopics.filter((t) => t !== topic));
      }
    } else {
      setSelectedTopics([...selectedTopics, topic]);
    }
  };

  const handleSignInSubmit = (e) => {
    e.preventDefault();
    const user = {
      name: signInEmail.split("@")[0] || "Alex",
      email: signInEmail || "alex@email.com",
      avatar: null,
      topics: [
        "Artificial Intelligence",
        "Startups",
        "Cybersecurity",
        "Web Development",
        "Technology"
      ],
      role: "Pro Reader",
      edition: "Edition № 001"
    };
    onLogin(user);
  };

  const handleSignUpSubmit = (e) => {
    e.preventDefault();
    const user = {
      name: signUpName.trim() || "Alex",
      email: signUpEmail.trim() || "alex@email.com",
      avatar: null,
      topics: selectedTopics.length > 0 ? selectedTopics : ["Artificial Intelligence", "Startups"],
      role: "Subscriber",
      edition: "Edition № 001"
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#F2EEE5] text-[#111111] font-sans flex flex-col lg:flex-row select-none overflow-y-auto lg:overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          LEFT COLUMN: GRAND EDITORIAL BROADSHEET SHOWCASE
         ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-1/2 2xl:w-7/12 h-full overflow-y-auto no-scrollbar flex-col justify-between p-3.5 sm:p-4 lg:p-5 xl:p-6 border-r-2 border-[#1A1A1A] relative bg-[#ECE6D8]/50">
        {/* Top Broadsheet Ear Bar */}
        <div className="shrink-0">
          <div className="flex items-center justify-between text-[10px] xl:text-[11px] font-mono tracking-wider text-[#555555] pb-1 border-b border-[#1A1A1A]/30">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#111111]">EDITION Nº 001</span>
              <span>•</span>
              <span className="truncate">NEW DELHI • GLOBAL PRINT EDITION</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-bold text-[#111111] text-[9.5px]">LIVE WIRE ACTIVE</span>
            </div>
          </div>

          {/* Oxford Header Frame */}
          <div className="rule-oxford my-1" />

          {/* Grand Masthead with subtle breathing hover animation */}
          <div className="py-0.5 xl:py-1 text-center group cursor-default">
            <div className="flex items-center justify-center gap-2.5 mb-0.5 opacity-85">
              <span className="h-[1px] w-6 xl:w-8 bg-[#1A1A1A]" />
              <span className="text-[8px] xl:text-[9px] tracking-[0.2em] font-mono uppercase text-[#444444]">
                ESTABLISHED IN THE DAWN OF THE GLOBAL NETWORK
              </span>
              <span className="h-[1px] w-6 xl:w-8 bg-[#1A1A1A]" />
            </div>

            <h1 className="font-masthead text-3xl lg:text-4xl xl:text-5xl font-normal text-[#111111] transition-transform duration-500 group-hover:scale-[1.01] leading-none">
              The Digital Times
            </h1>

            <p className="mt-0.5 text-[9px] xl:text-[10px] tracking-[0.25em] uppercase font-serif text-[#333333] font-semibold">
              THE STORIES SHAPING THE DIGITAL WORLD
            </p>
          </div>

          <div className="rule-oxford my-1" />
        </div>

        {/* Center Feature Broadsheet Article Showcase (Flows directly beneath masthead) */}
        <div className="py-2 xl:py-3 flex flex-col gap-2.5 xl:gap-3 max-w-xl mx-auto w-full my-auto">
          {/* Hero Article Photo with Hover Parallax Zoom */}
          <div className="relative aspect-[16/9] max-h-[140px] sm:max-h-[155px] lg:max-h-[165px] xl:max-h-[185px] 2xl:max-h-[220px] w-full rounded-xl overflow-hidden border-2 border-[#1A1A1A] shadow-md bg-[#FAF7F0] group shrink-0">
            <Image
              src="/images/hero_editorial.jpg"
              alt="The Digital Times Broadsheet Editorial"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              priority
            />
            <div className="absolute top-2 left-2 bg-[#A71919] text-[#F2EEE5] text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>INVESTIGATIVE DISPATCH</span>
            </div>
          </div>

          {/* Article Editorial Commentary */}
          <div className="flex flex-col justify-center">
            <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#A71919] mb-0.5 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#A71919]" />
              <span>THE AI & SOFTWARE DESK</span>
            </span>
            <h2 className="font-serif font-bold text-base lg:text-lg xl:text-xl text-[#111111] leading-tight mb-1">
              The Internet is Entering a Sovereign Cognitive Era
            </h2>
            <p className="font-serif text-[10.5px] xl:text-[11.5px] text-[#444444] leading-relaxed mb-1 line-clamp-2">
              Autonomous reasoning agents, verified WebAssembly compilation pipelines, and local neural models are dissolving the deterministic boundaries of modern software.
            </p>

            {/* Reader Quote Block */}
            <div className="border-l-2 border-[#1A1A1A] pl-2 py-0.5 bg-[#FAF7F0]/70 text-[10px] xl:text-[11px] italic font-serif text-[#333333] shadow-xs">
              “Typography and journalism tailored to your cognitive intent, etched in real time.”
            </div>
          </div>
        </div>

        {/* Bottom Market Wire Telemetry with Animated Scrolling Ticker Tape */}
        <div className="mt-auto shrink-0 border-t border-[#1A1A1A]/30 pt-1.5 pb-1 bg-[#ECE6D8]/60 px-2 rounded-lg flex items-center justify-between text-[9px] xl:text-[10px] font-mono text-[#444444] overflow-hidden gap-3">
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <span className="bg-[#111111] text-[#F2EEE5] px-1.5 py-0.5 font-bold uppercase text-[8.5px] tracking-wider">
              COMPUTE TICKER
            </span>
            <span className="font-bold text-[#111111]">NASDAQ-TECH 19,842.10</span>
            <span className="text-emerald-700 font-bold bg-emerald-600/10 px-1 py-0.2 rounded text-[8.5px]">
              +1.38%
            </span>
          </div>

          <div className="overflow-hidden flex-1 hidden md:block">
            <div className="animate-ticker flex items-center gap-6 whitespace-nowrap">
              {marketTickers.map((t, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  <span className="font-bold text-[#111111]">{t.symbol}</span>
                  <span className="text-[#333333]">{t.value}</span>
                  <span className={`text-[8.5px] font-bold ${t.up ? "text-emerald-700" : "text-[#A71919]"}`}>
                    {t.change}
                  </span>
                  <span className="text-[#888888]">•</span>
                </span>
              ))}
            </div>
          </div>

          <span className="text-[8.5px] font-mono text-[#777777] shrink-0 hidden xl:inline">
            1,840,290 BROADSHEETS CIRCULATED
          </span>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          RIGHT COLUMN: FULL-HEIGHT AUTHENTICATION CONSOLE (Responsive)
         ───────────────────────────────────────────────────────────── */}
      <div className="w-full lg:w-1/2 xl:w-1/2 2xl:w-5/12 min-h-screen lg:min-h-0 lg:h-full overflow-y-auto no-scrollbar flex flex-col justify-between p-4 sm:p-5 lg:p-6 xl:p-8 bg-[#FAF7F0]">
        {/* Mobile & Tablet Portrait Masthead (Visible only on < lg) */}
        <div className="lg:hidden w-full max-w-md mx-auto text-center pt-1 pb-2 shrink-0">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#555555] pb-1 border-b border-[#1A1A1A]/20">
            <span className="font-bold text-[#111111]">EDITION Nº 001</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-bold text-[#111111] text-[9px]">LIVE WIRE</span>
            </div>
          </div>
          <div className="rule-oxford my-1" />
          <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight text-[#111111]">
            THE DIGITAL TIMES
          </h1>
          <p className="text-[9px] sm:text-[10px] tracking-[0.25em] uppercase font-serif text-[#444444] font-semibold mt-0.5">
            THE STORIES SHAPING THE DIGITAL WORLD
          </p>
          <div className="rule-oxford my-1" />
        </div>

        {/* Central Auth Docket (Tabs and Form strictly grouped together, fits 100% zoom) */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-1 sm:py-2 flex flex-col justify-center">
          {/* Mode Tabs (Sign In / Create Account) */}
          <div className="w-full mb-3 xl:mb-4">
            <div className="flex border-2 border-[#1A1A1A] rounded-xl bg-[#ECE6D8] p-0.5 sm:p-1 text-xs font-mono font-bold shadow-xs">
              <button
                type="button"
                onClick={() => setAuthMode("signin")}
                className={`flex-1 py-1.5 xl:py-2 rounded-lg text-center transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === "signin"
                    ? "bg-[#111111] text-[#F2EEE5] shadow-sm scale-[1.01]"
                    : "text-[#555555] hover:text-[#111111] hover:bg-[#FAF7F0]/60"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>SIGN IN</span>
              </button>

              <button
                type="button"
                onClick={() => setAuthMode("signup")}
                className={`flex-1 py-1.5 xl:py-2 rounded-lg text-center transition-all duration-200 cursor-pointer flex items-center justify-center gap-1.5 ${
                  authMode === "signup"
                    ? "bg-[#111111] text-[#F2EEE5] shadow-sm scale-[1.01]"
                    : "text-[#555555] hover:text-[#111111] hover:bg-[#FAF7F0]/60"
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>CREATE ACCOUNT</span>
              </button>
            </div>
          </div>

          {/* ── 1. SIGN IN VIEW ────────────────────────────────────────── */}
          {authMode === "signin" && (
            <form
              onSubmit={handleSignInSubmit}
              className="space-y-2.5 xl:space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl xl:text-2xl text-[#111111] tracking-tight">
                  Welcome Back, Reader
                </h2>
                <p className="text-[10.5px] text-[#666666] font-mono mt-0.5">
                  Sign in to access your customized &ldquo;Your Times&rdquo; dispatch.
                </p>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-[10px] xl:text-[11px] font-mono font-bold text-[#333333] uppercase mb-0.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="alex@email.com"
                    value={signInEmail}
                    onChange={(e) => setSignInEmail(e.target.value)}
                    className="w-full bg-[#ECE6D8] border border-[#1A1A1A]/30 rounded-xl pl-9 pr-3 py-2 text-xs text-[#111111] placeholder-[#777777] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                  />
                  <Mail className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="block text-[10px] xl:text-[11px] font-mono font-bold text-[#333333] uppercase">
                    Password
                  </label>
                  <span className="text-[9.5px] font-mono text-[#777777] hover:underline cursor-pointer">
                    Forgot?
                  </span>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="••••••••••••"
                    value={signInPassword}
                    onChange={(e) => setSignInPassword(e.target.value)}
                    className="w-full bg-[#ECE6D8] border border-[#1A1A1A]/30 rounded-xl pl-9 pr-9 py-2 text-xs text-[#111111] placeholder-[#777777] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                  />
                  <Lock className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#111111] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-[10.5px] font-mono text-[#555555]">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded accent-[#111111] w-3.5 h-3.5"
                  />
                  <span>Remember this station</span>
                </label>
              </div>

              {/* Submit Sign In Button */}
              <button
                type="submit"
                className="w-full bg-[#111111] hover:bg-[#2A2A2A] text-[#F2EEE5] text-xs font-semibold py-2.5 xl:py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md font-mono tracking-wider uppercase active:scale-[0.99] hover:scale-[1.01]"
              >
                <span>Sign In & Open Your Times</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Guest Option Link */}
              <div className="pt-1 xl:pt-1.5 text-center">
                <button
                  type="button"
                  onClick={onBrowseGuest}
                  className="text-[10.5px] font-mono text-[#666666] hover:text-[#A71919] hover:underline cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-[#A71919]" />
                  <span>Read Public Front Page Broadsheet as Guest</span>
                </button>
              </div>
            </form>
          )}

          {/* ── 2. SIGN UP VIEW ────────────────────────────────────────── */}
          {authMode === "signup" && (
            <form
              onSubmit={handleSignUpSubmit}
              className="space-y-2 xl:space-y-2.5 animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <div>
                <h2 className="font-serif font-bold text-xl sm:text-2xl xl:text-2xl text-[#111111] tracking-tight">
                  Create Reader Profile
                </h2>
                <p className="text-[10.5px] text-[#666666] font-mono mt-0.5">
                  Subscribe to receive tailored real-time algorithmic editions.
                </p>
              </div>

              {/* Full Name Field */}
              <div>
                <label className="block text-[10px] xl:text-[11px] font-mono font-bold text-[#333333] uppercase mb-0.5">
                  Your Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. Alex Morgan"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    className="w-full bg-[#ECE6D8] border border-[#1A1A1A]/30 rounded-xl pl-9 pr-3 py-1.5 xl:py-2 text-xs text-[#111111] placeholder-[#777777] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                  />
                  <User className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Email Address Field */}
              <div>
                <label className="block text-[10px] xl:text-[11px] font-mono font-bold text-[#333333] uppercase mb-0.5">
                  Email Address
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    placeholder="alex@email.com"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    className="w-full bg-[#ECE6D8] border border-[#1A1A1A]/30 rounded-xl pl-9 pr-3 py-1.5 xl:py-2 text-xs text-[#111111] placeholder-[#777777] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                  />
                  <Mail className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-[10px] xl:text-[11px] font-mono font-bold text-[#333333] uppercase mb-0.5">
                  Create Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="At least 6 characters"
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    className="w-full bg-[#ECE6D8] border border-[#1A1A1A]/30 rounded-xl pl-9 pr-9 py-1.5 xl:py-2 text-xs text-[#111111] placeholder-[#777777] focus:outline-none focus:border-[#111111] focus:ring-1 focus:ring-[#111111] transition-all"
                  />
                  <Lock className="w-4 h-4 text-[#666666] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#111111] cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Preferred Topics Selector */}
              <div>
                <label className="block text-[10px] xl:text-[11px] font-mono font-bold text-[#333333] uppercase mb-0.5">
                  Select Your Reading Beats:
                </label>
                <div className="flex flex-wrap gap-1">
                  {availableTopics.map((topic) => {
                    const isSelected = selectedTopics.includes(topic);
                    return (
                      <button
                        type="button"
                        key={topic}
                        onClick={() => toggleTopic(topic)}
                        className={`text-[9.5px] font-mono font-semibold px-2 py-0.5 rounded-md transition-all cursor-pointer border flex items-center gap-1 ${
                          isSelected
                            ? "bg-[#111111] text-[#F2EEE5] border-[#111111] shadow-xs"
                            : "bg-[#ECE6D8] text-[#555555] border-[#1A1A1A]/20 hover:bg-[#DFD7C7]"
                        }`}
                      >
                        {isSelected && <Check className="w-2.5 h-2.5 text-emerald-400" />}
                        <span>{topic}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Sign Up Button */}
              <button
                type="submit"
                className="w-full bg-[#111111] hover:bg-[#2A2A2A] text-[#F2EEE5] text-xs font-semibold py-2.5 xl:py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md font-mono tracking-wider uppercase active:scale-[0.99] hover:scale-[1.01]"
              >
                <span>Complete Registration & Open Dashboard</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Guest Option Link */}
              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={onBrowseGuest}
                  className="text-[10.5px] font-mono text-[#666666] hover:text-[#A71919] hover:underline cursor-pointer inline-flex items-center gap-1.5 transition-colors"
                >
                  <Compass className="w-3.5 h-3.5 text-[#A71919]" />
                  <span>Read Public Front Page Broadsheet as Guest</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Bottom Imprint Footer */}
        <div className="shrink-0 w-full text-center pt-2 text-[9px] sm:text-[9.5px] font-mono text-[#777777] border-t border-[#1A1A1A]/10 mt-auto">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <span>THE DIGITAL TIMES CO.</span>
            <span>•</span>
            <span>SOVEREIGN ARCHIVE</span>
            <span>•</span>
            <span>EST. 2026</span>
          </div>
          <p className="text-[8.5px] sm:text-[9px] text-[#888888]">
            Encrypted authentication with local client-side memory. No intrusive tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
