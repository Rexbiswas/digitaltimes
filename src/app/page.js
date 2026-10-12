"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import SmoothScrollProvider from "@/components/SmoothScrollProvider";
import EditorialCursor from "@/components/EditorialCursor";
import Masthead from "@/components/Masthead";
import NavigationStrip from "@/components/NavigationStrip";
import BreakingTicker from "@/components/BreakingTicker";
import ScrollProgress from "@/components/motion/ScrollProgress";
import SectionTransition from "@/components/motion/SectionTransition";

// Cinematic Newspaper Scenes
import HeroScene from "@/components/newspaper/HeroScene";
import FrontPageScene from "@/components/newspaper/FrontPageScene";
import AiScene from "@/components/newspaper/AiScene";
import WebScene from "@/components/newspaper/WebScene";
import StartupScene from "@/components/newspaper/StartupScene";
import DesignScene from "@/components/newspaper/DesignScene";
import SecurityScene from "@/components/newspaper/SecurityScene";
import GamingScene from "@/components/newspaper/GamingScene";
import CultureScene from "@/components/newspaper/CultureScene";
import BusinessScene from "@/components/newspaper/BusinessScene";
import FutureScene from "@/components/newspaper/FutureScene";

// Modals, Drawers, Toasters & Footer
import ArticleModal from "@/components/ArticleModal";
import ClippingsDrawer from "@/components/ClippingsDrawer";
import SearchModal from "@/components/SearchModal";
import NewspaperFooter from "@/components/NewspaperFooter";
import NewsroomUpdateToast from "@/components/NewsroomUpdateToast";
import YourTimesDashboard from "@/components/YourTimesDashboard";
import EditorialAuthScreen from "@/components/EditorialAuthScreen";
import EditorialToaster from "@/components/EditorialToaster";
import { ToastProvider, useToast } from "@/context/ToastContext";
import EditionSkeleton from "@/components/skeletons/EditionSkeleton";
import { sanitizeArticle } from "@/utils/articlePresenter";

import { allArticles, leadStory } from "@/data/newspaperData";

export default function Home() {
  return (
    <ToastProvider>
      <EditorialBroadsheetMain />
    </ToastProvider>
  );
}

function EditorialBroadsheetMain() {
  const router = useRouter();
  const { toast } = useToast();

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [viewMode, setViewMode] = useState("dashboard"); // "dashboard" | "broadsheet"
  const [activeDesk, setActiveDesk] = useState("frontpage");
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [isClippingsOpen, setIsClippingsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [clippings, setClippings] = useState([]);
  const [paperTheme, setPaperTheme] = useState("morning"); // morning, sepia, evening
  const [typeScale, setTypeScale] = useState("standard"); // compact, standard, broadsheet
  const [liveArticles, setLiveArticles] = useState(allArticles);
  const [liveLeadStory, setLiveLeadStory] = useState(leadStory);
  const [liveHeadlines, setLiveHeadlines] = useState([]);

  // Fetch fresh live news from NewsAPI/Backend when broadsheet opens
  useEffect(() => {
    async function loadBroadsheetNews() {
      try {
        const res = await fetch("/api/articles?limit=50", { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (json.articles && json.articles.length > 0) {
            const cleanArticles = json.articles.map(sanitizeArticle);
            setLiveArticles(cleanArticles);
            if (json.leadStory) {
              setLiveLeadStory(sanitizeArticle(json.leadStory));
            }
            const headlines = cleanArticles.slice(0, 10).map((a) => (a.headline || a.title).toUpperCase());
            if (headlines.length > 0) {
              setLiveHeadlines(headlines);
            }
          }
        }
      } catch (e) {}
    }
    loadBroadsheetNews();
  }, []);

  // Desk-filtered articles computed from liveArticles
  const frontPageArticles = useMemo(
    () => liveArticles.filter((a) => a.id !== liveLeadStory?.id),
    [liveArticles, liveLeadStory]
  );

  const filterByDesk = (deskKeywords) => {
    return liveArticles.filter((a) => {
      const d = (a.desk || a.category || "").toUpperCase();
      return deskKeywords.some((k) => d.includes(k));
    });
  };

  const aiArticles = useMemo(
    () => filterByDesk(["AI", "ARTIFICIAL"]),
    [liveArticles]
  );
  const webArticles = useMemo(
    () => filterByDesk(["WEB", "SYSTEM", "BROWSER"]),
    [liveArticles]
  );
  const startupArticles = useMemo(
    () => filterByDesk(["STARTUP", "CAPITAL", "VENTURE"]),
    [liveArticles]
  );
  const designArticles = useMemo(
    () => filterByDesk(["DESIGN", "TYPOGRAPH", "INTERFACE"]),
    [liveArticles]
  );
  const securityArticles = useMemo(
    () => filterByDesk(["SECUR", "CYBER", "VULNERABIL"]),
    [liveArticles]
  );
  const gamingArticles = useMemo(
    () => filterByDesk(["GAME", "GAMING", "SIMULATION"]),
    [liveArticles]
  );
  const cultureArticles = useMemo(
    () => filterByDesk(["CULTURE", "INTERNET", "ARTIFACT"]),
    [liveArticles]
  );
  const businessArticles = useMemo(
    () => filterByDesk(["BUSINESS", "MARKET", "FINANCE", "ECONOM"]),
    [liveArticles]
  );
  const futureArticles = useMemo(
    () => filterByDesk(["FUTURE", "QUANTUM", "SCIENCE"]),
    [liveArticles]
  );

  // Check saved authentication and clippings after client mount to prevent SSR hydration errors
  useEffect(() => {
    try {
      const savedUser = localStorage.getItem("times_user_session");
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed.avatar) {
          parsed.avatar = null;
          localStorage.setItem("times_user_session", JSON.stringify(parsed));
        }
        setCurrentUser(parsed);
      }
    } catch (e) {}
    try {
      const savedClippings = localStorage.getItem("times_clippings");
      if (savedClippings) {
        const parsed = JSON.parse(savedClippings);
        if (Array.isArray(parsed)) {
          setClippings(parsed);
        }
      }
    } catch (e) {}
    setIsAuthLoaded(true);
  }, []);

  // Live real-time notification monitor to dispatch toaster updates
  useEffect(() => {
    let isMounted = true;
    const checkLiveNotifications = async () => {
      try {
        const token = typeof window !== "undefined" ? localStorage.getItem("times_auth_token") : null;
        const res = await fetch("/api/notifications?unreadOnly=true&limit=3", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.success && Array.isArray(data.data) && data.data.length > 0) {
            const latest = data.data[0];
            const shownKey = `dt_shown_${latest._id || latest.id}`;
            if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem(shownKey)) {
              sessionStorage.setItem(shownKey, "true");
              toast?.notification?.(latest, (story) => {
                handleOpenStory(story || {
                  id: latest.articleId || latest.id,
                  headline: latest.title,
                  deck: latest.message,
                  desk: latest.desk,
                });
              });
            }
          }
        }
      } catch (e) {}
    };

    const timer = setTimeout(checkLiveNotifications, 6000);
    const interval = setInterval(checkLiveNotifications, 25000);
    return () => {
      isMounted = false;
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [toast]);

  const handleUserLogin = (user) => {
    const cleanUser = { ...user, avatar: null };
    setCurrentUser(cleanUser);
    try {
      localStorage.setItem("times_user_session", JSON.stringify(cleanUser));
    } catch (e) {}
    setViewMode("dashboard");
  };

  const handleUserLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("times_user_session");
      localStorage.removeItem("times_auth_token");
    } catch (e) {}
    setViewMode("dashboard");
  };

  // Centralized Story Opener: Sets modal, tracks reading history (local & API), and shows toaster
  const handleOpenStory = (story) => {
    if (!story) return;
    setSelectedArticle(story);

    const storyId = story.id || story._id || story.slug;

    // 1. Sync locally
    try {
      const current = JSON.parse(localStorage.getItem("times_reading_history") || "[]");
      const updated = [
        story,
        ...current.filter((item) => (item?.id || item?._id || item?.slug) !== storyId),
      ].slice(0, 30);
      localStorage.setItem("times_reading_history", JSON.stringify(updated));
    } catch (e) {}

    // 2. Sync to Backend Reading History API
    const token = typeof window !== "undefined" ? localStorage.getItem("times_auth_token") : null;
    fetch("/api/users/history", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        articleId: storyId,
        headline: story.headline || story.title,
        deck: story.deck || story.description,
        desk: story.desk,
        author: story.author,
        readTime: story.readTime,
        image: story.image,
        readPercentage: 100,
        readDurationSeconds: 25,
      }),
    }).catch(() => {});

    // 3. Toaster feedback
    toast?.history?.(story);
  };

  // Detect initial hash on mount and scroll to desk
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#", "");
      if (hash) {
        setViewMode("broadsheet");
        setTimeout(() => {
          if (window.__lenis) {
            window.__lenis.scrollTo(`#${hash}`, { offset: -60, duration: 1.0 });
          } else {
            const el = document.getElementById(hash);
            if (el) el.scrollIntoView({ behavior: "smooth" });
          }
          setActiveDesk(hash);
        }, 500);
      }
    }
  }, []);

  // Update active desk based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 180
      ) {
        setActiveDesk("future");
        return;
      }

      const deskIds = [
        "frontpage",
        "ai",
        "web",
        "startups",
        "design",
        "security",
        "gaming",
        "culture",
        "business",
        "future",
      ];

      const scrollPos = window.scrollY + 100;

      for (let i = deskIds.length - 1; i >= 0; i--) {
        const el = document.getElementById(deskIds[i]);
        if (el) {
          const top = el.getBoundingClientRect().top + window.scrollY;
          if (top <= scrollPos) {
            setActiveDesk(deskIds[i]);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const saveClipping = (article) => {
    let willBeSaved = false;
    setClippings((prev) => {
      const exists = prev.some((item) => item.id === article.id);
      willBeSaved = !exists;
      let updated;
      if (exists) {
        updated = prev.filter((item) => item.id !== article.id);
      } else {
        updated = [article, ...prev];
      }
      try {
        localStorage.setItem("times_clippings", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });

    toast?.clipping?.(article, willBeSaved);
  };

  const removeClipping = (id) => {
    setClippings((prev) => {
      const updated = prev.filter((item) => item.id !== id);
      try {
        localStorage.setItem("times_clippings", JSON.stringify(updated));
      } catch (e) {}
      return updated;
    });
  };

  const isSaved = (id) => clippings.some((item) => item.id === id);

  const cycleTheme = () => {
    if (paperTheme === "morning") setPaperTheme("sepia");
    else if (paperTheme === "sepia") setPaperTheme("evening");
    else setPaperTheme("morning");
  };

  const cycleTypeScale = () => {
    if (typeScale === "standard") setTypeScale("broadsheet");
    else if (typeScale === "broadsheet") setTypeScale("compact");
    else setTypeScale("standard");
  };

  const scrollToDesk = (deskId) => {
    setActiveDesk(deskId);
    const element = document.getElementById(deskId);
    if (element) {
      if (typeof window !== "undefined" && window.__lenis) {
        window.__lenis.scrollTo(element, { duration: 1.0 });
      } else {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  const handleAudioEdition = () => {
    handleOpenStory(liveLeadStory || leadStory);
  };

  const handleSelectStoryFromTicker = (headline) => {
    const pool = [...liveArticles, ...allArticles];
    const found = pool.find((a) =>
      (a.headline || a.title || "")
        ?.toLowerCase()
        .includes(headline.toLowerCase().slice(0, 20))
    );
    if (found) {
      handleOpenStory(found);
    } else {
      handleOpenStory(liveLeadStory || leadStory);
    }
  };

  // Dynamic Theme Variables
  const themeClass =
    paperTheme === "sepia"
      ? "bg-[#EAE0CD] text-[#191612]"
      : paperTheme === "evening"
      ? "bg-[#171614] text-[#E0DACB]"
      : "bg-[#E8DFC8] text-[#201E19]";

  const scaleClass =
    typeScale === "broadsheet"
      ? "text-[17px]"
      : typeScale === "compact"
      ? "text-[14px]"
      : "text-[15px]";

  const isAuthScreen = isAuthLoaded && !currentUser && viewMode !== "broadsheet";

  return (
    <div
      className={`${
        isAuthScreen ? "min-h-screen lg:h-screen lg:max-h-screen overflow-y-auto lg:overflow-hidden" : "min-h-screen"
      } paper-texture-bg transition-colors duration-300 ${themeClass} ${scaleClass}`}
    >
      {/* Subtle Editorial Cursor */}
      <EditorialCursor />

      {!isAuthLoaded ? (
        <EditionSkeleton />
      ) : !currentUser && viewMode !== "broadsheet" ? (
        <EditorialAuthScreen
          onLogin={handleUserLogin}
          onBrowseGuest={() => setViewMode("broadsheet")}
          leadStory={liveLeadStory}
          articles={liveArticles}
        />
      ) : viewMode === "dashboard" ? (
        <YourTimesDashboard
          user={currentUser}
          onLogout={handleUserLogout}
          onOpenArticle={handleOpenStory}
          onSaveClipping={saveClipping}
          isSaved={isSaved}
          savedClippings={clippings}
          clippings={clippings}
          onNavigateToBroadsheet={(deskId) => {
            setViewMode("broadsheet");
            if (deskId) {
              setTimeout(() => scrollToDesk(deskId), 300);
            }
          }}
          onOpenSearchModal={() => router.push("/search")}
          onUpdateUser={(updatedUser) => {
            setCurrentUser(updatedUser);
            try {
              localStorage.setItem("times_user_session", JSON.stringify(updatedUser));
            } catch (e) {}
          }}
        />
      ) : (
        <SmoothScrollProvider>
          <div>
            {/* Newspaper Folio Scroll Progress */}
            <ScrollProgress activeDesk={activeDesk} />

            {/* Grand Masthead */}
            <Masthead
              onOpenDashboard={() => {
                if (currentUser) {
                  setViewMode("dashboard");
                } else {
                  setViewMode("auth");
                }
              }}
              onOpenSearch={() => router.push("/search")}
              onOpenClippings={() => setIsClippingsOpen(true)}
              clippingCount={clippings.length}
              onToggleTheme={cycleTheme}
              currentTheme={paperTheme}
              typeScale={typeScale}
              onCycleTypeScale={cycleTypeScale}
              onAudioEdition={handleAudioEdition}
            />

            {/* Thin Section Index Navigation Strip */}
            <NavigationStrip
              activeDesk={activeDesk}
              onSelectDesk={scrollToDesk}
            />

            {/* Breaking News Press Teletype */}
            <BreakingTicker
              onSelectStory={handleSelectStoryFromTicker}
              headlines={liveHeadlines}
            />

            {/* 1. Cinematic Hero Scene (0% to 100% Pinned Image & Split Headline Choreography) */}
            <HeroScene
              onOpenStory={handleOpenStory}
              story={liveLeadStory}
            />

            {/* Transition: Hero -> Front Page */}
            <SectionTransition
              fromSection="HERO DISPATCH"
              toSection="FRONT PAGE BROADSHEET"
              pageNumber="01"
              targetId="frontpage"
            />

            {/* 2. Front Page Scene (Morphing 3-Column Broadsheet Grid) */}
            <FrontPageScene
              onOpenStory={handleOpenStory}
              onSaveClipping={saveClipping}
              isSaved={isSaved}
              lead={liveLeadStory}
              articles={frontPageArticles}
            />

            {/* Transition: Front Page -> AI */}
            <SectionTransition
              fromSection="FRONT PAGE"
              toSection="THE AI DESK"
              pageNumber="02"
              targetId="ai"
            />

            {/* 3. The AI Desk Scene (Pinned Header, Benchmark Table, Pull Quote) */}
            <AiScene
              onOpenStory={handleOpenStory}
              articles={aiArticles}
            />

            {/* Transition: AI -> Web */}
            <SectionTransition
              fromSection="THE AI DESK"
              toSection="THE WEB DESK"
              pageNumber="03"
              targetId="web"
            />

            {/* 4. The Web Desk Scene (Technical Broadsheet, RFC Code Etching Float, Telemetry) */}
            <WebScene
              onOpenStory={handleOpenStory}
              articles={webArticles}
            />

            {/* Transition: Web -> Startups */}
            <SectionTransition
              fromSection="THE WEB DESK"
              toSection="STARTUPS & CAPITAL"
              pageNumber="04"
              targetId="startups"
            />

            {/* 5. The Startup & Business Desk Scene ($140M Animated Counter, Ledger, ASCII Chart) */}
            <StartupScene
              onOpenStory={handleOpenStory}
              articles={startupArticles}
            />

            {/* Transition: Startups -> Design */}
            <SectionTransition
              fromSection="STARTUPS"
              toSection="EDITORIAL DESIGN"
              pageNumber="05"
              targetId="design"
            />

            {/* 6. Editorial Design Desk Scene (Magazine Composition, Multi-Speed Collage Parallax) */}
            <DesignScene
              onOpenStory={handleOpenStory}
              articles={designArticles}
            />

            {/* Transition: Design -> Security */}
            <SectionTransition
              fromSection="EDITORIAL DESIGN"
              toSection="CYBERSECURITY"
              pageNumber="06"
              targetId="security"
            />

            {/* 7. Cybersecurity Desk Scene (Dark Newsprint, Slow Photo Parallax, Zero-Day Matrix) */}
            <SecurityScene
              onOpenStory={handleOpenStory}
              articles={securityArticles}
            />

            {/* Transition: Security -> Gaming */}
            <SectionTransition
              fromSection="CYBERSECURITY"
              toSection="GAMING & SIMULATION"
              pageNumber="07"
              targetId="gaming"
            />

            {/* 8. Gaming & Simulation Scene (Cinematic Crop Mask, 120 FPS Telemetry, Critic Score) */}
            <GamingScene
              onOpenStory={handleOpenStory}
              articles={gamingArticles}
            />

            {/* Transition: Gaming -> Culture */}
            <SectionTransition
              fromSection="GAMING"
              toSection="INTERNET CULTURE"
              pageNumber="08"
              targetId="culture"
            />

            {/* 9. Culture, Classifieds & Cryptic Crossword Scene */}
            <CultureScene
              onOpenStory={handleOpenStory}
              articles={cultureArticles}
            />

            {/* Transition: Culture -> Business */}
            <SectionTransition
              fromSection="INTERNET CULTURE"
              toSection="BUSINESS & MARKETS"
              pageNumber="09"
              targetId="business"
            />

            {/* 10. Business & Markets Scene (Commodity Standards, Reserve Indicators) */}
            <BusinessScene
              onOpenStory={handleOpenStory}
              articles={businessArticles}
            />

            {/* Transition: Business -> Future */}
            <SectionTransition
              fromSection="BUSINESS"
              toSection="DEEP FUTURE"
              pageNumber="10"
              targetId="future"
            />

            {/* 11. Deep Future Scene (Pinned Expanding Quantum Lab Photo & Horizon Milestones) */}
            <FutureScene
              onOpenStory={handleOpenStory}
              articles={futureArticles}
            />

            {/* Grand Broadsheet Imprint & Footer */}
            <NewspaperFooter onSelectDesk={scrollToDesk} />

            {/* Floating button to jump back to Your Times Dashboard */}
            <div className="fixed bottom-3 right-3 sm:bottom-6 sm:right-6 z-30">
              <button
                onClick={() => {
                  setViewMode("dashboard");
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="bg-[#201E19]/95 text-[#E8DFC8] hover:bg-[#2A2A2A] text-[10.5px] sm:text-xs font-serif font-bold px-3 py-1.5 sm:px-4 sm:py-2.5 rounded-full shadow-2xl border border-[#E8DFC8]/30 flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                title="Return to Your Times Dashboard"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="hidden sm:inline">← Your Times Dashboard</span>
                <span className="sm:hidden">← Dashboard</span>
              </button>
            </div>
          </div>
        </SmoothScrollProvider>
      )}

      {/* Full Broadsheet Article Reader Modal */}
      <ArticleModal
        article={selectedArticle}
        onClose={() => setSelectedArticle(null)}
        onSaveClipping={saveClipping}
        isSaved={isSaved}
      />

      {/* Saved Clippings Scrapbook Drawer */}
      <ClippingsDrawer
        isOpen={isClippingsOpen}
        onClose={() => setIsClippingsOpen(false)}
        clippings={clippings}
        onOpenStory={handleOpenStory}
        onRemoveClipping={removeClipping}
      />

      {/* Archive Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        onOpenStory={handleOpenStory}
      />

      {/* Authentic Dynamic Newsroom Update Toast (Connected to /api/newsroom) */}
      <NewsroomUpdateToast
        enabled={!isAuthScreen}
        onOpenArticle={handleOpenStory}
        onRefreshEdition={() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      />

      {/* Editorial Broadsheet Action Toaster */}
      <EditorialToaster onOpenStory={handleOpenStory} />
    </div>
  );
}
