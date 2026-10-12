"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  Radio,
  Eye,
  EyeOff,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Check,
  RefreshCw
} from "lucide-react";
import { marketTickers, dashboardRecommendedStories, leadStory as fallbackLeadStory } from "@/data/newspaperData";

export default function EditorialAuthScreen({
  onLogin,
  onBrowseGuest,
  leadStory,
  articles
}) {
  const [authMode, setAuthMode] = useState("signin"); // "signin" | "signup"
  const [showPassword, setShowPassword] = useState(false);
  const [activeStoryIndex, setActiveStoryIndex] = useState(0);
  const [isAuthPending, setIsAuthPending] = useState(false);

  // Dynamic live stories pool
  const [liveStories, setLiveStories] = useState(() => {
    if (Array.isArray(articles) && articles.length > 0) return articles;
    return dashboardRecommendedStories;
  });

  // Fetch updated news wire if articles not passed
  useEffect(() => {
    let isMounted = true;
    const fetchFresh = async () => {
      try {
        const res = await fetch("/api/articles?limit=10", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.articles && json.articles.length > 0 && isMounted) {
            setLiveStories(json.articles);
          }
        }
      } catch (err) {}
    };

    if (!articles || articles.length === 0) {
      fetchFresh();
    }
    return () => {
      isMounted = false;
    };
  }, [articles]);

  useEffect(() => {
    if (Array.isArray(articles) && articles.length > 0) {
      setLiveStories(articles);
    }
  }, [articles]);

  // Combined pool of available updated stories
  const storiesPool = useMemo(() => {
    const list = [];
    if (leadStory) list.push(leadStory);
    if (Array.isArray(liveStories)) {
      liveStories.forEach((s) => {
        if (!list.some((existing) => existing.id === s.id || existing.headline === s.headline)) {
          list.push(s);
        }
      });
    }
    if (list.length === 0) {
      list.push(fallbackLeadStory);
    }
    return list;
  }, [leadStory, liveStories]);

  // Auto-cycle updated news visual showcase every 6 seconds
  useEffect(() => {
    if (storiesPool.length <= 1) return;
    const interval = setInterval(() => {
      setActiveStoryIndex((prev) => (prev + 1) % storiesPool.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [storiesPool.length]);

  const currentShowcase = useMemo(() => {
    return storiesPool[activeStoryIndex % storiesPool.length] || storiesPool[0] || fallbackLeadStory;
  }, [storiesPool, activeStoryIndex]);

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

  const handleSignInSubmit = async (e) => {
    e.preventDefault();
    if (isAuthPending) return;
    setIsAuthPending(true);
    let token = null;
    try {
      const res = await fetch("/api/users/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signInEmail || "alex@email.com",
          name: signInEmail.split("@")[0] || "Alex",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          token = data.token;
          try {
            localStorage.setItem("times_auth_token", token);
          } catch (err) {}
        }
      }
    } catch (err) {
      console.warn("Auth request error:", err);
    } finally {
      setIsAuthPending(false);
    }

    const user = {
      name: signInEmail.split("@")[0] || "Alex",
      email: signInEmail || "alex@email.com",
      token: token,
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

  const handleSignUpSubmit = async (e) => {
    e.preventDefault();
    if (isAuthPending) return;
    setIsAuthPending(true);
    let token = null;
    try {
      const res = await fetch("/api/users/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: signUpEmail.trim() || "alex@email.com",
          name: signUpName.trim() || "Alex",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          token = data.token;
          try {
            localStorage.setItem("times_auth_token", token);
          } catch (err) {}
        }
      }
    } catch (err) {
      console.warn("Sign up request error:", err);
    } finally {
      setIsAuthPending(false);
    }

    const user = {
      name: signUpName.trim() || "Alex",
      email: signUpEmail.trim() || "alex@email.com",
      token: token,
      avatar: null,
      topics: selectedTopics.length > 0 ? selectedTopics : ["Artificial Intelligence", "Startups"],
      role: "Subscriber",
      edition: "Edition № 001"
    };
    onLogin(user);
  };

  return (
    <div className="min-h-screen lg:h-screen w-full bg-[#E8DFC8] text-[#201E19] font-sans flex flex-col lg:flex-row select-none overflow-y-auto lg:overflow-hidden">
      {/* ─────────────────────────────────────────────────────────────
          LEFT COLUMN: GRAND EDITORIAL BROADSHEET SHOWCASE
         ───────────────────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-1/2 2xl:w-7/12 h-full overflow-hidden flex-col justify-between p-3 lg:p-3.5 xl:p-4 2xl:p-6 border-r-2 border-[#766E5F] relative bg-[#DFD5BC]/50">
        {/* Top Broadsheet Ear Bar */}
        <div className="shrink-0">
          <div className="flex items-center justify-between text-[10px] xl:text-[11px] font-mono tracking-wider text-[#39352D] pb-1 border-b border-[#766E5F]/30">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#201E19]">{currentShowcase.editionBadge || "EDITION Nº 001"}</span>
              <span>•</span>
              <span className="truncate">{currentShowcase.location || "GLOBAL PRINT WIRE"} • {currentShowcase.date || "TODAY"}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-bold text-[#201E19] text-[9.5px]">LIVE WIRE ACTIVE</span>
            </div>
          </div>

          {/* Oxford Header Frame */}
          <div className="rule-oxford my-1" />

          {/* Grand Masthead with subtle breathing hover animation */}
          <div className="py-0.5 xl:py-1 text-center group cursor-default">
            <div className="flex items-center justify-center gap-2.5 mb-0.5 opacity-85">
              <span className="h-[1px] w-6 xl:w-8 bg-[#766E5F]" />
              <span className="text-[8px] xl:text-[9px] tracking-[0.2em] font-mono uppercase text-[#39352D]">
                ESTABLISHED IN THE DAWN OF THE GLOBAL NETWORK
              </span>
              <span className="h-[1px] w-6 xl:w-8 bg-[#766E5F]" />
            </div>

            <h1 className="font-masthead text-3xl lg:text-4xl xl:text-5xl font-normal text-[#201E19] transition-transform duration-500 group-hover:scale-[1.01] leading-none">
              The Digital Times
            </h1>

            <p className="mt-0.5 text-[9px] xl:text-[10px] tracking-[0.25em] uppercase font-serif text-[#39352D] font-semibold">
              THE STORIES SHAPING THE DIGITAL WORLD
            </p>
          </div>

          <div className="rule-oxford my-1" />
        </div>

        {/* Center Feature Broadsheet Article Showcase (Dynamic as per updated news) */}
        <div className="py-1 xl:py-2 flex flex-col gap-1.5 xl:gap-2 max-w-xl mx-auto w-full my-auto">
          {/* Hero Article Photo with Hover Parallax Zoom */}
          <div className="relative aspect-[16/9] max-h-[135px] sm:max-h-[150px] lg:max-h-[155px] xl:max-h-[175px] 2xl:max-h-[210px] w-full rounded-xl overflow-hidden border-2 border-[#766E5F] shadow-md bg-[#EFE8D5] group shrink-0">
            <Image
              src={currentShowcase.urlToImage || currentShowcase.image || "/window.svg"}
              alt={currentShowcase.headline || "The Digital Times Broadsheet Editorial"}
              fill
              unoptimized
              className="object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              priority
              onError={(e) => {
                e.currentTarget.srcset = "";
                e.currentTarget.src = "/window.svg";
              }}
            />
            <div className="absolute top-2 left-2 bg-[#9F3028] text-[#E8DFC8] text-[8.5px] font-mono font-bold px-2 py-0.5 rounded-sm uppercase tracking-wider shadow-xs flex items-center gap-1 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>{currentShowcase.kicker || "UPDATED DISPATCH"}</span>
            </div>

            {/* Stories Rotation Pills Overlay */}
            {storiesPool.length > 1 && (
              <div className="absolute bottom-2 right-2 flex items-center gap-1 bg-[#201E19]/85 backdrop-blur-xs px-2 py-0.5 rounded-full border border-white/20 z-10">
                {storiesPool.slice(0, 5).map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveStoryIndex(idx)}
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
                      activeStoryIndex === idx ? "w-3.5 bg-[#9F3028]" : "w-1.5 bg-white/40 hover:bg-white/80"
                    }`}
                    title={`View story ${idx + 1}`}
                    aria-label={`View story ${idx + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Article Editorial Commentary */}
          <div className="flex flex-col justify-center">
            <div className="flex items-center justify-between mb-0.5">
              <span className="text-[9.5px] font-mono font-bold uppercase tracking-widest text-[#9F3028] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#9F3028]" />
                <span>THE {(currentShowcase.desk || "TECHNOLOGY").toUpperCase()} DESK</span>
              </span>
              <span className="text-[9px] font-mono text-[#666666]">
                {currentShowcase.date || "TODAY"}
              </span>
            </div>

            <h2 className="font-serif font-bold text-base lg:text-lg xl:text-xl text-[#201E19] leading-tight mb-1 line-clamp-2">
              {currentShowcase.headline}
            </h2>
            <p className="font-serif text-[10.5px] xl:text-[11.5px] text-[#39352D] leading-relaxed mb-1 line-clamp-2">
              {currentShowcase.deck || currentShowcase.leadParagraph}
            </p>

            {/* Reader Quote / Metadata Block */}
            <div className="border-l-2 border-[#766E5F] pl-2 py-0.5 bg-[#EFE8D5]/70 text-[10px] xl:text-[11px] italic font-serif text-[#39352D] shadow-xs flex items-center justify-between">
              <span>{currentShowcase.readTime || "4 MIN READ"} • {currentShowcase.author || "By THE DIGITAL TIMES WIRE"}</span>
              {currentShowcase.topic && (
                <span className="font-mono text-[9px] uppercase tracking-wider text-[#9F3028] not-italic font-bold">
                  {currentShowcase.topic}
                </span>
              )}
            </div>

            {/* Interactive Story Rotation Controls */}
            {storiesPool.length > 1 && (
              <div className="flex items-center justify-between pt-1.5 text-[9px] font-mono text-[#666666]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#201E19]">DISPATCH {activeStoryIndex + 1} OF {storiesPool.length}</span>
                  <span className="text-[8.5px] text-[#9F3028] font-bold">• UPDATED NEWS</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setActiveStoryIndex((prev) => (prev > 0 ? prev - 1 : storiesPool.length - 1))}
                    className="px-1.5 py-0.5 rounded border border-[#766E5F]/20 hover:bg-[#EAE4D6] transition-colors cursor-pointer"
                    title="Previous story"
                    aria-label="Previous story"
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStoryIndex((prev) => (prev + 1) % storiesPool.length)}
                    className="px-1.5 py-0.5 rounded border border-[#766E5F]/20 hover:bg-[#EAE4D6] transition-colors cursor-pointer"
                    title="Next story"
                    aria-label="Next story"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Market Wire Telemetry with Animated Scrolling Ticker Tape */}
        <div className="mt-auto shrink-0 border-t border-[#766E5F]/30 pt-1.5 pb-1 bg-[#DFD5BC]/60 px-2 rounded-lg flex items-center justify-between text-[9px] xl:text-[10px] font-mono text-[#39352D] overflow-hidden gap-3">
          <div className="flex items-center gap-1.5 shrink-0 pl-1">
            <span className="bg-[#201E19] text-[#E8DFC8] px-1.5 py-0.5 font-bold uppercase text-[8.5px] tracking-wider">
              COMPUTE TICKER
            </span>
            <span className="font-bold text-[#201E19]">NASDAQ-TECH 19,842.10</span>
            <span className="text-emerald-700 font-bold bg-emerald-600/10 px-1 py-0.2 rounded text-[8.5px]">
              +1.38%
            </span>
          </div>

          <div className="overflow-hidden flex-1 hidden md:block">
            <div className="animate-ticker flex items-center gap-6 whitespace-nowrap">
              {marketTickers.map((t, idx) => (
                <span key={idx} className="flex items-center gap-1.5">
                  <span className="font-bold text-[#201E19]">{t.symbol}</span>
                  <span className="text-[#39352D]">{t.value}</span>
                  <span className={`text-[8.5px] font-bold ${t.up ? "text-emerald-700" : "text-[#9F3028]"}`}>
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
      <div className="w-full lg:w-1/2 xl:w-1/2 2xl:w-5/12 min-h-screen lg:min-h-0 lg:h-full overflow-y-auto lg:overflow-hidden no-scrollbar flex flex-col justify-between p-3.5 sm:p-5 lg:py-2.5 lg:px-4 xl:py-3 xl:px-6 2xl:px-8 bg-[#EFE8D5]">
        {/* Mobile & Tablet Portrait Masthead (Visible only on < lg) */}
        <div className="lg:hidden w-full max-w-sm sm:max-w-md mx-auto text-center pt-1 pb-1.5 shrink-0">
          <div className="flex items-center justify-between text-[10px] font-mono tracking-wider text-[#39352D] pb-0.5 border-b border-[#766E5F]/20">
            <span className="font-bold text-[#201E19]">EDITION Nº 001</span>
            <div className="flex items-center gap-1.5">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
              </span>
              <span className="font-bold text-[#201E19] text-[9px]">LIVE WIRE</span>
            </div>
          </div>
          <div className="rule-oxford my-0.5" />
          <h1 className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#201E19]">
            THE DIGITAL TIMES
          </h1>
          <p className="text-[8.5px] sm:text-[9.5px] tracking-[0.2em] uppercase font-serif text-[#39352D] font-semibold mt-0.5">
            THE STORIES SHAPING THE DIGITAL WORLD
          </p>
          <div className="rule-oxford my-0.5" />
        </div>

        {/* Central Auth Docket (Authentic Broadsheet Newspaper Style - No Scroll on Desktop) */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto py-0.5 sm:py-1 flex flex-col justify-center">
          <div className="border-2 border-[#766E5F] bg-[#EFE8D5] p-3 sm:p-4 shadow-[4px_4px_0px_#766E5F] relative">
            {/* Broadsheet Docket Folio Header */}
            <div className="flex items-center justify-between pb-1 sm:pb-1.5 mb-2 sm:mb-2.5 border-b-2 border-[#766E5F] text-[8.5px] sm:text-[9px] font-mono tracking-widest uppercase">
              <div className="flex items-center gap-1.5 font-bold text-[#201E19]">
                <span className="w-1.5 h-1.5 bg-[#9F3028] inline-block"></span>
                <span>{authMode === "signin" ? "DISPATCH REGISTRY • SUBSCRIBER ACCESS" : "DISPATCH REGISTRY • NEW READER PROFILE"}</span>
              </div>
              <span className="stamp-classified text-[8.5px] py-0 px-1.5">
                {authMode === "signin" ? "PRESS PASS" : "ENROLLMENT"}
              </span>
            </div>

            {/* ── 1. SIGN IN VIEW ────────────────────────────────────────── */}
            {authMode === "signin" && (
              <form
                onSubmit={handleSignInSubmit}
                className="space-y-2 sm:space-y-2.5 animate-in fade-in duration-300"
              >
                <div>
                  <div className="flex items-baseline justify-between">
                    <h2 className="font-serif font-black text-lg sm:text-xl xl:text-2xl text-[#201E19] tracking-tight">
                      Welcome Back, Reader
                    </h2>
                    <span className="text-[8.5px] sm:text-[9px] font-mono font-bold text-[#9F3028] uppercase tracking-wider">
                      EDITION VOL. XXVI
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#39352D] font-serif italic mt-0.5">
                    Sign in to access your customized &ldquo;Your Times&rdquo; dispatch.
                  </p>
                  <div className="rule-oxford my-1.5" />
                </div>

                {/* Email Field */}
                <div>
                  <label className="block text-[9.5px] sm:text-[10px] font-mono font-bold text-[#201E19] uppercase tracking-wider mb-0.5">
                    § CORRESPONDENT EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="alex@email.com"
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      className="w-full bg-[#EFE8D5] focus:bg-white border-2 border-[#766E5F] pl-8 pr-2.5 py-1.5 sm:py-2 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#201E19] shadow-[2px_2px_0px_#766E5F] transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-[9.5px] sm:text-[10px] font-mono font-bold text-[#201E19] uppercase tracking-wider mb-0.5">
                    § CIPHER PASSCODE
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      className="w-full bg-[#EFE8D5] focus:bg-white border-2 border-[#766E5F] pl-8 pr-8 py-1.5 sm:py-2 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#201E19] shadow-[2px_2px_0px_#766E5F] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#201E19] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forget Password */}
                <div className="flex items-center justify-between text-[10px] sm:text-[10.5px] font-mono text-[#39352D] pt-0.5">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-3.5 h-3.5 rounded-none border-2 border-[#766E5F] text-[#201E19] accent-[#201E19] cursor-pointer"
                    />
                    <span className="font-semibold uppercase tracking-wider text-[9.5px] sm:text-[10px]">Remember this station</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => alert("Dispatch Passcode Recovery: Please check your registered email or contact your editorial administrator to reset your credentials.")}
                    className="text-[9.5px] sm:text-[10px] text-[#9F3028] hover:text-[#201E19] font-mono font-bold uppercase tracking-wider underline underline-offset-2 cursor-pointer"
                  >
                    Forget Password?
                  </button>
                </div>

                {/* Submit Sign In Button */}
                <div className="pt-0.5 sm:pt-1">
                  <button
                    type="submit"
                    disabled={isAuthPending}
                    className="w-full bg-[#201E19] hover:bg-[#9F3028] disabled:bg-[#333333] disabled:cursor-not-allowed text-[#EFE8D5] text-xs font-bold py-2 sm:py-2.5 px-3 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 border-2 border-[#766E5F] shadow-[3px_3px_0px_#766E5F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#766E5F] font-mono tracking-[0.14em] uppercase"
                  >
                    {isAuthPending ? (
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>AUTHENTICATING CIPHER...</span>
                      </span>
                    ) : (
                      <>
                        <span>SIGN IN &amp; OPEN YOUR TIMES</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Link to Create Account Form */}
                <div className="pt-2 text-center border-t border-[#766E5F]/15 mt-2">
                  <p className="text-[10px] sm:text-[10.5px] font-mono text-[#39352D]">
                    Don&apos;t have an account?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("signup")}
                      className="text-[#201E19] hover:text-[#9F3028] font-bold underline underline-offset-2 cursor-pointer uppercase tracking-wider transition-colors ml-1 inline-flex items-center gap-1"
                    >
                      <span>Create Account</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </p>
                </div>
              </form>
            )}

            {/* ── 2. SIGN UP VIEW ────────────────────────────────────────── */}
            {authMode === "signup" && (
              <form
                onSubmit={handleSignUpSubmit}
                className="space-y-1.5 sm:space-y-2 animate-in fade-in duration-300"
              >
                <div>
                  <div className="flex items-baseline justify-between">
                    <h2 className="font-serif font-black text-lg sm:text-xl xl:text-2xl text-[#201E19] tracking-tight">
                      Create Reader Profile
                    </h2>
                    <span className="text-[8.5px] sm:text-[9px] font-mono font-bold text-[#9F3028] uppercase tracking-wider">
                      NEW DISPATCH
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-[#39352D] font-serif italic mt-0.5">
                    Subscribe to receive tailored real-time algorithmic editions.
                  </p>
                  <div className="rule-oxford my-1 sm:my-1.5" />
                </div>

                {/* Full Name Field */}
                <div>
                  <label className="block text-[9px] sm:text-[9.5px] font-mono font-bold text-[#201E19] uppercase tracking-wider mb-0.5">
                    § CORRESPONDENT FULL NAME
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      required
                      placeholder="e.g. Alex Morgan"
                      value={signUpName}
                      onChange={(e) => setSignUpName(e.target.value)}
                      className="w-full bg-[#EFE8D5] focus:bg-white border-2 border-[#766E5F] pl-8 pr-2.5 py-1 sm:py-1.5 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#201E19] shadow-[2px_2px_0px_#766E5F] transition-all"
                    />
                  </div>
                </div>

                {/* Email Address Field */}
                <div>
                  <label className="block text-[9px] sm:text-[9.5px] font-mono font-bold text-[#201E19] uppercase tracking-wider mb-0.5">
                    § TELEGRAPH EMAIL ADDRESS
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      required
                      placeholder="alex@email.com"
                      value={signUpEmail}
                      onChange={(e) => setSignUpEmail(e.target.value)}
                      className="w-full bg-[#EFE8D5] focus:bg-white border-2 border-[#766E5F] pl-8 pr-2.5 py-1 sm:py-1.5 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#201E19] shadow-[2px_2px_0px_#766E5F] transition-all"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label className="block text-[9px] sm:text-[9.5px] font-mono font-bold text-[#201E19] uppercase tracking-wider mb-0.5">
                    § ASSIGN CIPHER PASSCODE
                  </label>
                  <div className="relative">
                    <Lock className="w-3.5 h-3.5 text-[#39352D] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="At least 6 characters"
                      value={signUpPassword}
                      onChange={(e) => setSignUpPassword(e.target.value)}
                      className="w-full bg-[#EFE8D5] focus:bg-white border-2 border-[#766E5F] pl-8 pr-8 py-1 sm:py-1.5 text-xs font-mono text-[#201E19] placeholder-[#888888] focus:outline-none focus:ring-1 focus:ring-[#201E19] shadow-[2px_2px_0px_#766E5F] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#666666] hover:text-[#201E19] cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>

                {/* Preferred Topics Selector */}
                <div>
                  <label className="block text-[9px] sm:text-[9.5px] font-mono font-bold text-[#201E19] uppercase tracking-wider mb-0.5">
                    § SELECT EDITORIAL BEATS:
                  </label>
                  <div className="flex flex-wrap gap-1 p-1 bg-[#DFD5BC]/60 border border-[#766E5F]/30">
                    {availableTopics.map((topic) => {
                      const isSelected = selectedTopics.includes(topic);
                      return (
                        <button
                          type="button"
                          key={topic}
                          onClick={() => toggleTopic(topic)}
                          className={`text-[8px] sm:text-[8.5px] font-mono font-bold px-1.5 py-0.5 transition-all cursor-pointer border flex items-center gap-0.5 uppercase tracking-wider ${
                            isSelected
                              ? "bg-[#201E19] text-[#EFE8D5] border-[#766E5F] shadow-[1px_1px_0px_#766E5F]"
                              : "bg-[#EFE8D5] text-[#39352D] border-[#766E5F]/30 hover:bg-[#D7CCB2] hover:text-[#201E19]"
                          }`}
                        >
                          {isSelected && <Check className="w-2 h-2 text-emerald-400 stroke-[3]" />}
                          <span>{topic}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Sign Up Button */}
                <div className="pt-0.5 sm:pt-1">
                  <button
                    type="submit"
                    disabled={isAuthPending}
                    className="w-full bg-[#201E19] hover:bg-[#9F3028] disabled:bg-[#333333] disabled:cursor-not-allowed text-[#EFE8D5] text-xs font-bold py-2 sm:py-2.5 px-3 transition-all duration-150 cursor-pointer flex items-center justify-center gap-2 border-2 border-[#766E5F] shadow-[3px_3px_0px_#766E5F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#766E5F] font-mono tracking-[0.14em] uppercase"
                  >
                    {isAuthPending ? (
                      <span className="inline-flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>ENROLLING SUBSCRIBER...</span>
                      </span>
                    ) : (
                      <>
                        <span>COMPLETE REGISTRATION &amp; ENTER</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                {/* Link to Sign In Form */}
                <div className="pt-2 text-center border-t border-[#766E5F]/15 mt-2">
                  <p className="text-[10px] sm:text-[10.5px] font-mono text-[#39352D]">
                    Already registered reader?{" "}
                    <button
                      type="button"
                      onClick={() => setAuthMode("signin")}
                      className="text-[#201E19] hover:text-[#9F3028] font-bold underline underline-offset-2 cursor-pointer uppercase tracking-wider transition-colors ml-1 inline-flex items-center gap-1"
                    >
                      <span>Sign In</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </p>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Bottom Imprint Footer */}
        <div className="shrink-0 w-full text-center pt-1.5 pb-0.5 text-[8.5px] sm:text-[9px] font-mono text-[#777777] border-t border-[#766E5F]/10 mt-auto">
          <div className="flex items-center justify-center gap-2 mb-0.5">
            <span>THE DIGITAL TIMES CO.</span>
            <span>•</span>
            <span>SOVEREIGN ARCHIVE</span>
            <span>•</span>
            <span>EST. 2026</span>
          </div>
          <p className="text-[8px] sm:text-[8.5px] text-[#888888]">
            Encrypted authentication with local client-side memory. No intrusive tracking.
          </p>
        </div>
      </div>
    </div>
  );
}
