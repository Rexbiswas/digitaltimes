"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import {
  Home,
  Newspaper,
  Bookmark,
  History,
  Users,
  Bell,
  Settings,
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  Filter,
  Plus,
  Clock,
  Calendar,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Radio,
  Check,
  X,
  Sparkles,
  RefreshCw,
  LogOut,
  UserCheck,
  Eye,
  Layers,
  ArrowRight,
  Camera,
  Trash2
} from "lucide-react";
import { dashboardRecommendedStories, breakingHeadlines } from "@/data/newspaperData";
import CalendarDateSelector from "./CalendarDateSelector";

export default function YourTimesDashboard({
  user,
  onLogout,
  onOpenArticle,
  onSaveClipping,
  isSaved,
  savedClippings = [],
  clippings = [],
  onNavigateToBroadsheet,
  onOpenSearchModal,
  onUpdateUser,
}) {
  const safeClippings = Array.isArray(savedClippings)
    ? savedClippings
    : Array.isArray(clippings)
    ? clippings
    : [];

  const checkIsSaved = (id) => {
    if (typeof isSaved === "function") return isSaved(id);
    return safeClippings.some((item) => item?.id === id);
  };

  const [currentUser, setCurrentUser] = useState(
    user
      ? { ...user, avatar: null }
      : {
          name: "Alex",
          email: "alex@email.com",
          avatar: null,
          role: "Pro Reader"
        }
  );
  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    setCurrentUser(
      user
        ? { ...user, avatar: null }
        : {
            name: "Alex",
            email: "alex@email.com",
            avatar: null,
            role: "Pro Reader"
          }
    );
  }

  // Sidebar dynamic collapse state (persisted in localStorage + Ctrl+B shortcut)
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("times_sidebar_collapsed");
        if (saved !== null) return saved === "true";
      } catch (e) {}
    }
    return false;
  });

  const setSidebarCollapsedAndSave = (val) => {
    setIsSidebarCollapsed(val);
    try {
      localStorage.setItem("times_sidebar_collapsed", String(val));
    } catch (e) {}
  };

  const toggleSidebar = () => {
    setIsSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem("times_sidebar_collapsed", String(next));
      } catch (e) {}
      return next;
    });
  };

  // Keyboard shortcut Ctrl+B or Cmd+B to toggle sidebar dynamically
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Helper to get monogram initials for Name Avatar
  const getInitials = (name) => {
    if (!name) return "DT";
    const clean = name.trim().replace(/@.*/, "");
    const parts = clean.split(/[\s._-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  // Client mount state to prevent SSR hydration mismatches
  const [isMounted, setIsMounted] = useState(false);
  const [realTime, setRealTime] = useState(null);
  const [liveTicks, setLiveTicks] = useState(0);

  // Active Category Pill Filter (Default: "AI" as in user screenshot)
  const [activeCategory, setActiveCategory] = useState("ALL");

  // Calendar Date Selector State (e.g. "2026-10-05" for today, or null for all dates)
  const [selectedDate, setSelectedDate] = useState("2026-10-05");

  // Sorting and Additional Filtering State
  const [sortBy, setSortBy] = useState("latest"); // "latest", "quickest", "indepth", "alphabetical", "desk"
  const [readTimeFilter, setReadTimeFilter] = useState("all"); // "all", "short", "long"
  const [savedOnlyFilter, setSavedOnlyFilter] = useState(false);

  const availableDates = [
    "2026-10-05",
    "2026-10-04",
    "2026-10-03",
    "2026-10-02",
    "2026-10-01",
    "2026-09-30",
    "2026-09-29"
  ];

  // Navigation Sidebar Active Tab
  const [activeTab, setActiveTab] = useState("yourtimes"); // "home", "yourtimes", "bookmarks", "history", "following", "notifications", "settings"

  // Topics State
  const [userTopics, setUserTopics] = useState(
    currentUser.topics && currentUser.topics.length > 0
      ? currentUser.topics
      : [
          "Artificial Intelligence",
          "Startups",
          "Cybersecurity",
          "Web Development",
          "Technology"
        ]
  );

  // Modals
  const [isCustomizeOpen, setIsCustomizeOpen] = useState(false);
  const [isManageTopicsOpen, setIsManageTopicsOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [newTopicInput, setNewTopicInput] = useState("");
  const [headerSearchQuery, setHeaderSearchQuery] = useState("");

  // Reading history state
  const [readingHistory, setReadingHistory] = useState([]);

  // Live Notifications simulation
  const [liveNotifications, setLiveNotifications] = useState([
    {
      id: 1,
      title: "Breaking: Autonomous reasoning model passes formal logic theorem proof",
      time: "2 MIN AGO",
      desk: "AI",
      unread: true
    },
    {
      id: 2,
      title: "Market Alert: Global compute futures index advances +3.4%",
      time: "18 MIN AGO",
      desk: "BUSINESS",
      unread: true
    },
    {
      id: 3,
      title: "Dispatch: New browser local inference specification ratified by W3C",
      time: "45 MIN AGO",
      desk: "WEB",
      unread: false
    }
  ]);

  // Available topics for Customize modal
  const allAvailableInterests = [
    "Artificial Intelligence",
    "Web Development",
    "Startups & VC",
    "Cybersecurity",
    "Editorial Design",
    "Gaming & Simulation",
    "Quantum Computing",
    "Deep Tech",
    "BioComputing",
    "Internet Culture",
    "Markets & Compute"
  ];
  const [selectedInterests, setSelectedInterests] = useState([
    "Artificial Intelligence",
    "Startups & VC",
    "Cybersecurity",
    "Web Development",
    "Editorial Design"
  ]);

  // Real-Time Interval: sets realTime on client mount and ticks every 1 second
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    setRealTime(new Date());
    const timer = setInterval(() => {
      setRealTime(new Date());
      setLiveTicks((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);


  // Load history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem("times_reading_history");
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setReadingHistory(parsed);
        }
      }
    } catch (e) {}
  }, []);

  const safeReadingHistory = Array.isArray(readingHistory) ? readingHistory : [];

  const handleArticleClick = (story) => {
    if (!story) return;
    const currentHist = Array.isArray(readingHistory) ? readingHistory : [];
    // Add to reading history
    const updatedHistory = [
      story,
      ...currentHist.filter((item) => item?.id !== story.id)
    ].slice(0, 20);
    setReadingHistory(updatedHistory);
    try {
      localStorage.setItem("times_reading_history", JSON.stringify(updatedHistory));
    } catch (e) {}

    onOpenArticle?.(story);
  };


  // Category pills for the "YOUR TIMES" tab
  const categoryPills = ["All", "AI", "Web", "Startups", "Security", "Design", "Gaming"];

  // Selected date human-readable label
  const selectedDateLabel = useMemo(() => {
    if (!selectedDate) return "ALL EDITIONS";
    const parts = selectedDate.split("-");
    if (parts.length === 3) {
      const monthNames = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
      ];
      const m = monthNames[parseInt(parts[1], 10) - 1];
      const d = parseInt(parts[2], 10);
      const y = parts[0];
      if (selectedDate === "2026-10-05") {
        return `TODAY • ${m} ${d}, ${y}`;
      }
      return `${m} ${d}, ${y}`;
    }
    return selectedDate;
  }, [selectedDate]);

  // Filter & sort recommended stories by selected calendar edition date, category, filters, and sort order
  const filteredStories = useMemo(() => {
    let pool = [...dashboardRecommendedStories];

    // 1. Filter by selected date
    if (selectedDate) {
      const matchingDate = pool.filter((s) => s.dateIso === selectedDate);
      if (matchingDate.length > 0) {
        pool = matchingDate;
      } else {
        // If user selected an archival date without pre-defined recommended story:
        const parts = selectedDate.split("-");
        const monthNames = [
          "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
          "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
        ];
        const dateDisplay = parts.length === 3
          ? `${monthNames[parseInt(parts[1], 10) - 1]} ${parseInt(parts[2], 10)}, ${parts[0]}`
          : selectedDate;

        pool = [
          {
            id: `archive-${selectedDate}-dispatch`,
            headline: `Archival Wire Dispatch: Historical Broadsheet Edition for ${dateDisplay}`,
            desk: activeCategory === "All" ? "AI" : activeCategory,
            minutesAgo: 60,
            image: "/images/hero_editorial.jpg",
            author: "By EDITORIAL ARCHIVE BUREAU",
            readTime: "4 MIN READ",
            date: dateDisplay,
            dateIso: selectedDate,
            topic: "Archive Edition",
            deck: `Archival records retrieved from the permanent Zurich Digital Vault cataloged for ${dateDisplay}. Verified cryptographic proof attached.`,
            leadParagraph: `The Digital Times archival record for ${dateDisplay} documents the operational milestones, peer compute networks, and regulatory decisions recorded during this cycle.`,
            bodyParagraphs: [
              "Every teletype transmission and investigative wire from this period is preserved in the cold storage data vault with continuous post-quantum signatures.",
              "Readers can review the recorded findings or jump back to today's live breaking coverage."
            ]
          },
          ...dashboardRecommendedStories.slice(0, 2)
        ];
      }
    }

    // 2. Filter by active category
    if (activeCategory !== "All") {
      const byCategory = pool.filter((s) => s.desk?.toLowerCase() === activeCategory.toLowerCase());
      if (byCategory.length > 0) {
        pool = byCategory;
      }
    }

    // 3. Filter by read time
    if (readTimeFilter === "short") {
      pool = pool.filter((s) => {
        const mins = parseInt(s.readTime, 10) || 4;
        return mins <= 4;
      });
    } else if (readTimeFilter === "long") {
      pool = pool.filter((s) => {
        const mins = parseInt(s.readTime, 10) || 5;
        return mins >= 5;
      });
    }

    // 4. Filter by saved only
    if (savedOnlyFilter) {
      pool = pool.filter((s) => checkIsSaved(s.id));
    }

    // 5. Apply sorting
    const sorted = [...pool].sort((a, b) => {
      if (sortBy === "latest") {
        return (a.minutesAgo || 10) - (b.minutesAgo || 10);
      }
      if (sortBy === "quickest") {
        const aMins = parseInt(a.readTime, 10) || 5;
        const bMins = parseInt(b.readTime, 10) || 5;
        return aMins - bMins;
      }
      if (sortBy === "indepth") {
        const aMins = parseInt(a.readTime, 10) || 5;
        const bMins = parseInt(b.readTime, 10) || 5;
        return bMins - aMins;
      }
      if (sortBy === "alphabetical") {
        return (a.headline || "").localeCompare(b.headline || "");
      }
      if (sortBy === "desk") {
        return (a.desk || "").localeCompare(b.desk || "");
      }
      return 0;
    });

    return sorted;
  }, [selectedDate, activeCategory, readTimeFilter, savedOnlyFilter, sortBy, safeClippings, isSaved]);

  // Stories to show in Recommended section
  const recommendedCards =
    Array.isArray(filteredStories) && filteredStories.length > 0
      ? filteredStories
      : [];



  // Calculate dynamic minutes ago based on baseline (SSR-safe)
  const getDynamicTimeAgo = (baseMinutes) => {
    if (!isMounted) {
      if (baseMinutes === 60) return "1 HOUR AGO";
      return `${baseMinutes} MIN AGO`;
    }
    const elapsed = baseMinutes + Math.floor(liveTicks / 60);
    if (elapsed < 1) return "JUST NOW";
    if (elapsed < 60) return `${elapsed} MIN AGO`;
    const hours = Math.floor(elapsed / 60);
    return hours === 1 ? "1 HOUR AGO" : `${hours} HOURS AGO`;
  };

  const handleAddTopic = () => {
    if (newTopicInput.trim() && !userTopics.includes(newTopicInput.trim())) {
      setUserTopics([...userTopics, newTopicInput.trim()]);
      setNewTopicInput("");
    }
  };

  const handleRemoveTopic = (topicToRemove) => {
    setUserTopics(userTopics.filter((t) => t !== topicToRemove));
  };

  const toggleInterest = (interest) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  return (
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#F2EEE5] text-[#111111] font-sans antialiased selection:bg-[#111111] selection:text-[#F2EEE5] flex flex-col">
      <header className="w-full bg-[#F2EEE5] border-b border-[#1A1A1A] select-none shrink-0 z-40 shadow-xs">
        {/* Mobile & Small Tablet Header (< md): Clean 2-row editorial layout with uncompromised centered Masthead */}
        <div className="md:hidden px-3 pt-2 pb-1.5 flex flex-col gap-1.5">
          {/* Row 1: Live Badge & Date Selector on Left | Search & Profile on Right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="bg-[#A71919] text-[#F2EEE5] text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-sm tracking-wider flex items-center gap-1 shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>LIVE</span>
              </div>

              <CalendarDateSelector
                selectedDate={selectedDate}
                onSelectDate={setSelectedDate}
                availableDates={availableDates}
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => onOpenSearchModal && onOpenSearchModal()}
                className="p-1.5 text-[#111111] hover:bg-[#E4DDD0] rounded-full transition-colors cursor-pointer flex items-center justify-center"
                title="Search"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-[#111111]" />
              </button>

              <button
                onClick={() => setIsLoginOpen(true)}
                className="relative rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs flex items-center justify-center group"
                aria-label={`Profile: ${currentUser.name}`}
                title={currentUser.name}
              >
                <div className="w-7 h-7 rounded-full border border-[#1A1A1A] ring-1 ring-[#C5A059]/40 bg-[#111111] flex items-center justify-center text-[#F2EEE5] select-none shadow-xs">
                  <span className="text-[10px] font-serif font-bold tracking-wider">
                    {getInitials(currentUser.name)}
                  </span>
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#F2EEE5]" />
              </button>
            </div>
          </div>

          {/* Row 2: Grand Masthead Centered & Never Truncated */}
          <div className="text-center cursor-pointer border-t border-[#1A1A1A]/10 pt-1" onClick={() => setActiveTab("yourtimes")}>
            <h1 className="font-masthead text-2xl xs:text-3xl text-[#111111] font-normal select-none hover:opacity-90 transition-opacity leading-none tracking-tight">
              The Digital Times
            </h1>
          </div>
        </div>

        {/* Desktop Header (>= md): Classic 1-row layout */}
        <div className="hidden md:flex max-w-[1440px] mx-auto px-6 py-2.5 items-center justify-between gap-4">
          {/* Left Brand Badge & Calendar Date Selector */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="bg-[#A71919] text-[#F2EEE5] text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm tracking-wider flex items-center gap-1 shadow-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span>LIVE</span>
            </div>

            {/* Calendar Date Picker: User can select which date's news they want to see */}
            <CalendarDateSelector
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
              availableDates={availableDates}
            />
          </div>

          {/* Center Grand Masthead Title */}
          <div className="text-center cursor-pointer min-w-0" onClick={() => setActiveTab("yourtimes")}>
            <h1 className="font-masthead text-2xl md:text-3xl lg:text-4xl text-[#111111] font-normal select-none hover:opacity-90 transition-opacity leading-none">
              The Digital Times
            </h1>
          </div>

          {/* Right Utility: Search & Login */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Icon Button */}
            <button
              onClick={() => onOpenSearchModal && onOpenSearchModal()}
              className="p-2 text-[#111111] hover:bg-[#E4DDD0] rounded-full transition-colors cursor-pointer flex items-center justify-center"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-[#111111]" />
            </button>

            {/* Profile Avatar Button (Avatar only) */}
            <button
              onClick={() => setIsLoginOpen(true)}
              className="relative rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs flex items-center justify-center group"
              aria-label={`Profile: ${currentUser.name}`}
              title={currentUser.name}
            >
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border-2 border-[#1A1A1A] ring-1 ring-[#C5A059]/40 bg-[#111111] flex items-center justify-center text-[#F2EEE5] group-hover:bg-[#2A2A2A] transition-colors select-none shadow-xs">
                <span className="text-xs font-serif font-bold tracking-wider">
                  {getInitials(currentUser.name)}
                </span>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#F2EEE5]" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 w-full max-w-[1440px] mx-auto px-3 sm:px-6 flex flex-col md:flex-row gap-4 md:gap-8 md:overflow-hidden min-h-0">
        {/* ── LEFT SIDEBAR (100% Permanently Fixed, Never moves or slides under header) ── */}
        <aside
          className={`w-full ${
            isSidebarCollapsed ? "md:w-16 lg:w-20 md:overflow-visible" : "md:w-64 md:overflow-y-auto"
          } shrink-0 md:h-full no-scrollbar pt-3 md:pt-4 pb-4 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] relative z-30`}
        >
          {/* Inner Fixed Column */}
          <div className="w-full flex flex-col gap-3">

            {/* Mobile Horizontal Navigation Pills Bar (Only on mobile screens) */}
            <div className="md:hidden w-full overflow-x-auto no-scrollbar scrollbar-none py-1">
              <div className="flex items-center gap-1.5 min-w-max">
                <button
                  onClick={() => setActiveTab("yourtimes")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "yourtimes"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "bg-[#FAF7F0] border border-[#1A1A1A]/20 text-[#333333] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>Your Times</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab("home");
                    onNavigateToBroadsheet?.("frontpage");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "home"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "bg-[#FAF7F0] border border-[#1A1A1A]/20 text-[#333333] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => setActiveTab("bookmarks")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "bookmarks"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "bg-[#FAF7F0] border border-[#1A1A1A]/20 text-[#333333] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Bookmarks</span>
                  {safeClippings.length > 0 && (
                    <span className="bg-[#A71919] text-[#F2EEE5] text-[9px] font-bold px-1.5 rounded-full">
                      {safeClippings.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "history"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "bg-[#FAF7F0] border border-[#1A1A1A]/20 text-[#333333] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>History</span>
                  {safeReadingHistory.length > 0 && (
                    <span className="text-[10px] opacity-70">({safeReadingHistory.length})</span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("following")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "following"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "bg-[#FAF7F0] border border-[#1A1A1A]/20 text-[#333333] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Following</span>
                </button>

                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "notifications"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "bg-[#FAF7F0] border border-[#1A1A1A]/20 text-[#333333] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Alerts</span>
                  {liveNotifications.filter((n) => n.unread).length > 0 && (
                    <span className="bg-[#A71919] text-[#F2EEE5] text-[9px] font-bold px-1.5 rounded-full">
                      {liveNotifications.filter((n) => n.unread).length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "settings"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "bg-[#FAF7F0] border border-[#1A1A1A]/20 text-[#333333] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* Desktop Navigation: COLLAPSED MODE (Single Unified Dock Capsule) */}
            {isSidebarCollapsed ? (
              <div className="hidden md:flex flex-col items-center gap-1.5 bg-[#FAF7F0] border border-[#1A1A1A]/15 rounded-2xl p-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)] select-none">
                {/* 1. Avatar with Initials / Photo (Click to expand side panel) */}
                <div
                  onClick={() => setSidebarCollapsedAndSave(false)}
                  className="relative w-10 h-10 shrink-0 cursor-pointer group shadow-xs"
                  aria-label="Expand side panel (Ctrl+B)"
                >
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#1A1A1A] ring-2 ring-[#C5A059]/30 ring-offset-2 ring-offset-[#FAF7F0] bg-[#111111] relative flex items-center justify-center">
                    <span className="font-serif font-bold text-xs text-[#F2EEE5] select-none tracking-wider">
                      {getInitials(currentUser.name)}
                    </span>
                  </div>
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#111111] text-[#F2EEE5] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Expand Side Panel</span>
                    <span className="text-[10px] font-mono text-[#999999] bg-[#222222] px-1.5 py-0.5 rounded">Ctrl+B</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111111]" />
                  </div>
                </div>

                {/* Hairline Divider */}
                <div className="w-6 h-[1px] bg-[#1A1A1A]/15 my-0.5" />

                {/* 2. Navigation Icon Stack */}
                {/* Home */}
                <button
                  onClick={() => {
                    setActiveTab("home");
                    onNavigateToBroadsheet?.("frontpage");
                  }}
                  aria-label="Home Broadsheet (Front Page)"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "home"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "text-[#555555] hover:bg-[#1A1A1A]/10 hover:text-[#111111]"
                  }`}
                >
                  <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#111111] text-[#F2EEE5] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Home Broadsheet</span>
                    <span className="text-[10px] font-mono opacity-70 bg-[#333333] px-1.5 py-0.5 rounded">Front Page</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111111]" />
                  </div>
                </button>

                {/* Your Times */}
                <button
                  onClick={() => setActiveTab("yourtimes")}
                  aria-label="Your Times Feed"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "yourtimes"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "text-[#555555] hover:bg-[#1A1A1A]/10 hover:text-[#111111]"
                  }`}
                >
                  <Newspaper className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#111111] text-[#F2EEE5] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Your Times Feed</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111111]" />
                  </div>
                </button>

                {/* Bookmarks */}
                <button
                  onClick={() => setActiveTab("bookmarks")}
                  aria-label={`Bookmarks (${safeClippings.length})`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "bookmarks"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "text-[#555555] hover:bg-[#1A1A1A]/10 hover:text-[#111111]"
                  }`}
                >
                  <Bookmark className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {safeClippings.length > 0 && (
                    <span className="absolute top-1 right-1 bg-[#A71919] text-[#F2EEE5] text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {safeClippings.length}
                    </span>
                  )}
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#111111] text-[#F2EEE5] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Bookmarks</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#A71919] text-[#F2EEE5]">
                      {safeClippings.length} saved
                    </span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111111]" />
                  </div>
                </button>

                {/* Reading History */}
                <button
                  onClick={() => setActiveTab("history")}
                  aria-label={`Reading History (${safeReadingHistory.length})`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "history"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "text-[#555555] hover:bg-[#1A1A1A]/10 hover:text-[#111111]"
                  }`}
                >
                  <History className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {safeReadingHistory.length > 0 && (
                    <span className="absolute top-1 right-1 text-[8px] font-mono bg-[#1A1A1A]/20 text-[#111111] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {safeReadingHistory.length}
                    </span>
                  )}
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#111111] text-[#F2EEE5] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Reading History</span>
                    <span className="text-[10px] font-mono text-[#999999]">{safeReadingHistory.length} read</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111111]" />
                  </div>
                </button>

                {/* Following */}
                <button
                  onClick={() => setActiveTab("following")}
                  aria-label="Following"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "following"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "text-[#555555] hover:bg-[#1A1A1A]/10 hover:text-[#111111]"
                  }`}
                >
                  <Users className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#111111] text-[#F2EEE5] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Following</span>
                    <span className="text-[10px] font-mono text-[#999999]">Topics & Authors</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111111]" />
                  </div>
                </button>

                {/* Notifications */}
                <button
                  onClick={() => setActiveTab("notifications")}
                  aria-label={`Notifications (${liveNotifications.filter((n) => n.unread).length})`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "notifications"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "text-[#555555] hover:bg-[#1A1A1A]/10 hover:text-[#111111]"
                  }`}
                >
                  <Bell className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {liveNotifications.filter((n) => n.unread).length > 0 && (
                    <span className="absolute top-1 right-1 bg-[#A71919] text-[#F2EEE5] text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                      {liveNotifications.filter((n) => n.unread).length}
                    </span>
                  )}
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#111111] text-[#F2EEE5] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Live Alerts</span>
                    {liveNotifications.filter((n) => n.unread).length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#A71919] text-[#F2EEE5]">
                        {liveNotifications.filter((n) => n.unread).length} new
                      </span>
                    )}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111111]" />
                  </div>
                </button>

                {/* Settings */}
                <button
                  onClick={() => setActiveTab("settings")}
                  aria-label="Settings"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "settings"
                      ? "bg-[#111111] text-[#F2EEE5] shadow-xs"
                      : "text-[#555555] hover:bg-[#1A1A1A]/10 hover:text-[#111111]"
                  }`}
                >
                  <Settings className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#111111] text-[#F2EEE5] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Preferences</span>
                    <span className="text-[10px] font-mono text-[#999999]">Account & Topics</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111111]" />
                  </div>
                </button>

                {/* Hairline Divider */}
                <div className="w-6 h-[1px] bg-[#1A1A1A]/15 my-0.5" />

                {/* Live Beacon Indicator */}
                <div className="py-1 relative group cursor-default" aria-label="Real-time newsroom feed active">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#111111] text-[#F2EEE5] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Newsroom Live</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111111]" />
                  </div>
                </div>
              </div>
            ) : (
              /* Desktop Navigation: EXPANDED MODE (Luxury Broadsheet Architecture) */
              <div className="hidden md:flex flex-col gap-3">
                {/* 1. User Profile Card */}
                <div className="bg-[#FAF7F0] border border-[#1A1A1A]/15 rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative">
                  {/* Avatar (Click to collapse side panel) */}
                  <div
                    onClick={() => setSidebarCollapsedAndSave(true)}
                    className="relative w-11 h-11 shrink-0 cursor-pointer group shadow-xs"
                    aria-label="Collapse side panel (Ctrl+B)"
                  >
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#1A1A1A] ring-2 ring-[#C5A059]/30 ring-offset-2 ring-offset-[#FAF7F0] bg-[#111111] relative flex items-center justify-center">
                      <span className="font-serif font-bold text-sm text-[#F2EEE5] select-none tracking-wider">
                        {getInitials(currentUser.name)}
                      </span>
                    </div>
                    <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#111111] text-[#F2EEE5] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                      <span className="font-semibold">Collapse Side Panel</span>
                      <span className="text-[10px] font-mono text-[#999999] bg-[#222222] px-1.5 py-0.5 rounded">Ctrl+B</span>
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111111]" />
                    </div>
                  </div>

                  {/* User Details */}
                  <div className="overflow-hidden pr-2 min-w-0 flex-1">
                    <span className="text-[10px] text-[#666666] block leading-tight font-serif italic">
                      Welcome back,
                    </span>
                    <h2 className="font-serif font-bold text-sm text-[#111111] leading-tight truncate">
                      {currentUser.name}
                    </h2>
                    <span className="text-[10px] text-[#777777] font-mono truncate block">
                      {currentUser.email}
                    </span>
                    <div className="flex items-center gap-2 mt-1 text-[10px] font-mono text-[#666666]">
                      <span className="text-[#888888] font-mono text-[9px] uppercase tracking-wider">
                        {currentUser.role || "Pro Reader"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Navigation Menu Dock */}
                <nav className="flex flex-col gap-1.5 bg-[#FAF7F0] border border-[#1A1A1A]/15 rounded-2xl p-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-sm font-medium">
                  {/* Home */}
                  <button
                    onClick={() => {
                      setActiveTab("home");
                      onNavigateToBroadsheet?.("frontpage");
                    }}
                    title="Home (Broadsheet Edition)"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group relative hover:translate-x-0.5 ${
                      activeTab === "home"
                        ? "bg-[#111111] text-[#F2EEE5] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#444444] hover:bg-[#1A1A1A]/5 hover:text-[#111111]"
                    }`}
                  >
                    <Home className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Home</span>
                    <span className="ml-auto text-[10px] font-mono opacity-70 bg-[#1A1A1A]/10 px-1.5 py-0.5 rounded text-[#111111]">
                      Broadsheet
                    </span>
                  </button>

                  {/* Your Times */}
                  <button
                    onClick={() => setActiveTab("yourtimes")}
                    title="Your Times Feed"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group relative hover:translate-x-0.5 ${
                      activeTab === "yourtimes"
                        ? "bg-[#111111] text-[#F2EEE5] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#444444] hover:bg-[#1A1A1A]/5 hover:text-[#111111]"
                    }`}
                  >
                    <Newspaper className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Your Times</span>
                    <span className="ml-auto flex items-center gap-1.5">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                    </span>
                  </button>

                  {/* Bookmarks */}
                  <button
                    onClick={() => setActiveTab("bookmarks")}
                    title={`Bookmarks (${safeClippings.length})`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group relative hover:translate-x-0.5 ${
                      activeTab === "bookmarks"
                        ? "bg-[#111111] text-[#F2EEE5] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#444444] hover:bg-[#1A1A1A]/5 hover:text-[#111111]"
                    }`}
                  >
                    <Bookmark className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Bookmarks</span>
                    {safeClippings.length > 0 && (
                      <span className="ml-auto bg-[#A71919] text-[#F2EEE5] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                        {safeClippings.length}
                      </span>
                    )}
                  </button>

                  {/* History */}
                  <button
                    onClick={() => setActiveTab("history")}
                    title={`Reading History (${safeReadingHistory.length})`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group relative hover:translate-x-0.5 ${
                      activeTab === "history"
                        ? "bg-[#111111] text-[#F2EEE5] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#444444] hover:bg-[#1A1A1A]/5 hover:text-[#111111]"
                    }`}
                  >
                    <History className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Reading History</span>
                    {safeReadingHistory.length > 0 && (
                      <span className="ml-auto text-[10px] font-mono text-[#777777]">
                        {safeReadingHistory.length}
                      </span>
                    )}
                  </button>

                  {/* Following */}
                  <button
                    onClick={() => setActiveTab("following")}
                    title="Following"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group relative hover:translate-x-0.5 ${
                      activeTab === "following"
                        ? "bg-[#111111] text-[#F2EEE5] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#444444] hover:bg-[#1A1A1A]/5 hover:text-[#111111]"
                    }`}
                  >
                    <Users className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Following</span>
                  </button>

                  {/* Notifications */}
                  <button
                    onClick={() => setActiveTab("notifications")}
                    title={`Notifications (${liveNotifications.filter((n) => n.unread).length})`}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group relative hover:translate-x-0.5 ${
                      activeTab === "notifications"
                        ? "bg-[#111111] text-[#F2EEE5] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#444444] hover:bg-[#1A1A1A]/5 hover:text-[#111111]"
                    }`}
                  >
                    <Bell className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Notifications</span>
                    {liveNotifications.filter((n) => n.unread).length > 0 && (
                      <span className="ml-auto bg-[#A71919] text-[#F2EEE5] text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
                        {liveNotifications.filter((n) => n.unread).length}
                      </span>
                    )}
                  </button>

                  {/* Settings */}
                  <button
                    onClick={() => setActiveTab("settings")}
                    title="Settings"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group relative hover:translate-x-0.5 ${
                      activeTab === "settings"
                        ? "bg-[#111111] text-[#F2EEE5] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#444444] hover:bg-[#1A1A1A]/5 hover:text-[#111111]"
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Settings</span>
                  </button>
                </nav>

                {/* 3. Bottom Telemetry */}
                <div className="px-3 py-2 border-t border-[#1A1A1A]/10 text-[10px] font-mono text-[#777777] flex items-center justify-between select-none">
                  <span className="flex items-center gap-1.5">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                    </span>
                    <span>DESK LIVE</span>
                  </span>
                  <span className="text-[#999999]">EDITION 2026</span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* ── RIGHT MAIN CONTENT AREA (Independently Smoothly Scrollable) ── */}
        <main className="flex-1 min-w-0 md:h-full md:overflow-y-auto no-scrollbar md:scrollbar-thin pt-3 md:pt-4 pb-16 flex flex-col gap-8">
          {/* TAB 1: YOUR TIMES (The Core Dashboard from Screenshot) */}
          {activeTab === "yourtimes" && (
            <>
              {/* Header: Title, Match Count & Customize Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1A1A1A]/15 pb-4">
                <div>
                  <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#111111] tracking-tight mb-1">
                    YOUR TIMES
                  </h2>
                  <p className="text-xs font-mono text-[#666666] tracking-wider uppercase">
                    12 STORIES MATCHED TO YOUR INTERESTS
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCustomizeOpen(true)}
                    className="border border-[#1A1A1A]/30 bg-[#FAF7F0] hover:bg-[#EAE4D6] text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Customize</span>
                  </button>

                  <button
                    onClick={() => onNavigateToBroadsheet?.("frontpage")}
                    className="border border-[#1A1A1A] bg-[#111111] hover:bg-[#2A2A2A] text-[#F2EEE5] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
                    title="Open Full Cinematic Broadsheet"
                  >
                    <span>Full Broadsheet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 py-2 overflow-visible">
                {categoryPills.map((pill) => {
                  const isActive = activeCategory.toLowerCase() === pill.toLowerCase();
                  return (
                    <button
                      key={pill}
                      type="button"
                      onClick={() => setActiveCategory(pill)}
                      className={`filter-pill${isActive ? " active" : ""}`}
                    >
                      {pill}
                    </button>
                  );
                })}
              </div>

              {/* ── Section: "Recommended for you" ────────────────── */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#111111]">
                    Recommended for you
                  </h3>
                  <button
                    onClick={() => setActiveCategory("All")}
                    className="text-xs font-mono font-semibold text-[#111111] hover:text-[#A71919] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View all</span>
                    <span>→</span>
                  </button>
                </div>

                {/* ── Sort & Filter Controls Bar ────────────────── */}
                <div className="bg-[#FAF7F0] border border-[#1A1A1A]/15 rounded-xl p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
                  {/* Left: Active Date & Status Tag */}
                  <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
                    <div className="flex items-center gap-1.5 bg-[#EFEAE0] border border-[#1A1A1A]/20 px-2.5 py-1 rounded-lg font-bold text-[#111111]">
                      <Calendar className="w-3.5 h-3.5 text-[#A71919]" />
                      <span className="uppercase">{selectedDate ? selectedDateLabel : "ALL OCTOBER EDITIONS"}</span>
                    </div>

                    <span className="text-[#555555] font-semibold text-[11px]">
                      • {recommendedCards.length} {recommendedCards.length === 1 ? "story" : "stories"}
                    </span>

                    {/* Filter Active Tags */}
                    {activeCategory !== "All" && (
                      <span className="bg-[#111111] text-[#F2EEE5] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        Desk: {activeCategory}
                        <button type="button" onClick={() => setActiveCategory("All")} className="hover:text-red-300 cursor-pointer">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}

                    {readTimeFilter !== "all" && (
                      <span className="bg-[#111111] text-[#F2EEE5] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        {readTimeFilter === "short" ? "Quick (<5m)" : "In-Depth (5m+)"}
                        <button type="button" onClick={() => setReadTimeFilter("all")} className="hover:text-red-300 cursor-pointer">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}

                    {savedOnlyFilter && (
                      <span className="bg-[#A71919] text-[#F2EEE5] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        Bookmarked Only
                        <button type="button" onClick={() => setSavedOnlyFilter(false)} className="hover:text-amber-200 cursor-pointer">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}

                    {selectedDate && (
                      <button
                        type="button"
                        onClick={() => setSelectedDate(null)}
                        className="text-[10px] font-bold text-[#A71919] hover:underline uppercase cursor-pointer"
                      >
                        Reset Date
                      </button>
                    )}
                  </div>

                  {/* Right: Sort and Quick Filter Selectors */}
                  <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
                    {/* Read Time Filter Pills */}
                    <div className="flex items-center border border-[#1A1A1A]/20 rounded-lg overflow-hidden bg-[#EFEAE0]/80">
                      <button
                        type="button"
                        onClick={() => setReadTimeFilter("all")}
                        className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                          readTimeFilter === "all" ? "bg-[#111111] text-[#F2EEE5]" : "text-[#555555] hover:text-[#111111]"
                        }`}
                        title="Show all lengths"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setReadTimeFilter("short")}
                        className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer border-l border-[#1A1A1A]/15 ${
                          readTimeFilter === "short" ? "bg-[#111111] text-[#F2EEE5]" : "text-[#555555] hover:text-[#111111]"
                        }`}
                        title="Short reads under 5 minutes"
                      >
                        &lt; 5m
                      </button>
                      <button
                        type="button"
                        onClick={() => setReadTimeFilter("long")}
                        className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer border-l border-[#1A1A1A]/15 ${
                          readTimeFilter === "long" ? "bg-[#111111] text-[#F2EEE5]" : "text-[#555555] hover:text-[#111111]"
                        }`}
                        title="In-depth reads 5 minutes or longer"
                      >
                        5m+
                      </button>
                    </div>

                    {/* Bookmarked Filter Button */}
                    <button
                      type="button"
                      onClick={() => setSavedOnlyFilter((prev) => !prev)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                        savedOnlyFilter
                          ? "bg-[#A71919] text-[#F2EEE5] border-[#A71919] shadow-2xs"
                          : "bg-[#EFEAE0] hover:bg-[#E4DDD0] border-[#1A1A1A]/20 text-[#444444]"
                      }`}
                      title="Filter only saved bookmarks"
                    >
                      <Bookmark className={`w-3 h-3 ${savedOnlyFilter ? "fill-white" : ""}`} />
                      <span className="hidden xs:inline">Saved</span>
                    </button>

                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-1 bg-[#EFEAE0] border border-[#1A1A1A]/20 px-2 py-1 rounded-lg">
                      <ArrowUpDown className="w-3 h-3 text-[#A71919] shrink-0" />
                      <span className="text-[10px] text-[#777777] uppercase font-bold shrink-0">SORT:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent font-bold text-xs text-[#111111] outline-hidden cursor-pointer tracking-tight"
                        aria-label="Sort news articles"
                      >
                        <option value="latest">Latest First</option>
                        <option value="quickest">Quickest Read</option>
                        <option value="indepth">In-Depth First</option>
                        <option value="alphabetical">Headline (A–Z)</option>
                        <option value="desk">By Desk</option>
                      </select>
                    </div>
                  </div>
                </div>

                {recommendedCards.length === 0 ? (
                  <div className="bg-[#FAF7F0] border-2 border-dashed border-[#1A1A1A]/20 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
                    <Filter className="w-8 h-8 text-[#A71919]/60" />
                    <h4 className="font-serif font-bold text-lg text-[#111111]">No stories matched these filters</h4>
                    <p className="text-xs font-mono text-[#666666] max-w-md">
                      Try resetting the read-time or category filters to view other stories available for this October edition.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveCategory("All");
                        setReadTimeFilter("all");
                        setSavedOnlyFilter(false);
                      }}
                      className="mt-2 text-xs font-mono font-bold bg-[#111111] text-[#F2EEE5] px-3 py-1.5 rounded-lg cursor-pointer hover:bg-[#222222]"
                    >
                      Clear Filters
                    </button>
                  </div>
                ) : (
                /* Responsive Cards Grid: 1 col on mobile, 2 cols on tablet, 3 cols on desktop */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                  {recommendedCards.map((story) => (
                    <article
                      key={story.id}
                      onClick={() => handleArticleClick(story)}
                      className="group bg-[#FAF7F0] border border-[#1A1A1A]/20 rounded-xl overflow-hidden hover:border-[#1A1A1A] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col"
                    >
                      {/* Image Container */}
                      <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#ECE6D8]">
                        <Image
                          src={story.image || "/images/hero_editorial.jpg"}
                          alt={story.headline}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Bookmark Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSaveClipping(story);
                          }}
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-[#111111]/70 hover:bg-[#111111] text-white backdrop-blur-xs transition-colors cursor-pointer"
                          title="Save story"
                        >
                          <Bookmark
                            className={`w-3.5 h-3.5 ${
                              isSaved(story.id) ? "fill-[#A71919] text-[#A71919]" : ""
                            }`}
                          />
                        </button>
                      </div>

                      {/* Content Body */}
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <div>
                          <h4 className="font-serif font-bold text-lg sm:text-xl text-[#111111] leading-snug line-clamp-2 group-hover:text-[#A71919] transition-colors">
                            {story.headline}
                          </h4>
                        </div>

                        {/* Metadata Row: Category & Publication Date */}
                        <div className="mt-3 pt-3 border-t border-[#1A1A1A]/10 flex items-center justify-between text-[11px] font-mono text-[#555555]">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-[#111111] uppercase tracking-wider">
                              {story.desk}
                            </span>
                            <span>•</span>
                            <span
                              suppressHydrationWarning
                              className="text-[#A71919] font-semibold"
                            >
                              {story.date || getDynamicTimeAgo(story.minutesAgo || 15)}
                            </span>
                          </div>

                          <span className="text-[10px] text-[#777777]">
                            {story.readTime}
                          </span>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
                )}
              </section>

              {/* ── Section: "Your Topics" ────────────────────────── */}
              <section className="flex flex-col gap-3 pt-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#111111]">
                    Your Topics
                  </h3>
                  <button
                    onClick={() => setIsManageTopicsOpen(true)}
                    className="text-xs font-mono font-semibold text-[#111111] hover:text-[#A71919] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>Manage</span>
                    <span>→</span>
                  </button>
                </div>

                {/* Topics Tag Pills Row */}
                <div className="flex flex-wrap items-center gap-2">
                  {userTopics.map((topic) => (
                    <button
                      key={topic}
                      type="button"
                      onClick={() => {
                        // Filter by topic or highlight
                        if (topic.includes("Intelligence")) setActiveCategory("AI");
                        else if (topic.includes("Startups")) setActiveCategory("Startups");
                        else if (topic.includes("Web")) setActiveCategory("Web");
                        else if (topic.includes("Security")) setActiveCategory("Security");
                        else setActiveCategory("All");
                      }}
                      style={{
                        backgroundColor: "#FAF7F0",
                        color: "#222222",
                        border: "1.5px solid rgba(26, 26, 26, 0.25)",
                        height: "36px",
                        padding: "0 18px",
                        borderRadius: "9999px",
                      }}
                      className="text-xs font-sans font-semibold hover:border-[#111111] hover:bg-[#EAE4D6] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0 select-none justify-center"
                    >
                      <span className="leading-none">{topic}</span>
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => setIsManageTopicsOpen(true)}
                    style={{
                      height: "36px",
                      padding: "0 16px",
                      borderRadius: "9999px",
                    }}
                    className="text-xs font-sans font-semibold border border-dashed border-[#1A1A1A]/40 text-[#555555] hover:text-[#111111] hover:border-[#111111] transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Topic</span>
                  </button>
                </div>
              </section>

              {/* Real-Time Live Breaking News Wire Bar */}
              <section className="bg-[#FAF7F0] border border-[#1A1A1A]/20 rounded-xl p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-[#A71919]">
                  <span className="w-2 h-2 rounded-full bg-[#A71919] animate-ping" />
                  <span>LIVE REASONING DISPATCH FEED</span>
                  <span className="text-[#777777] font-normal ml-auto">
                    UPDATED REAL-TIME
                  </span>
                </div>
                <div className="space-y-2">
                  {breakingHeadlines.slice(0, 3).map((headline, idx) => (
                    <div
                      key={idx}
                      onClick={() => onOpenSearchModal?.()}
                      className="flex items-start gap-2 text-xs font-mono text-[#222222] hover:text-[#A71919] cursor-pointer transition-colors p-1 rounded hover:bg-[#ECE6D8]"
                    >
                      <span className="text-[#A71919] font-bold shrink-0">[{idx + 1}]</span>
                      <p className="line-clamp-1">{headline}</p>
                      <span className="ml-auto text-[10px] text-[#777777] shrink-0">
                        {idx === 0 ? "JUST NOW" : idx === 1 ? "4M AGO" : "12M AGO"}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

          {/* TAB 2: BOOKMARKS */}
          {activeTab === "bookmarks" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-[#1A1A1A]/15 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-3xl text-[#111111]">Your Saved Bookmarks</h2>
                  <p className="text-xs font-mono text-[#666666] uppercase mt-1">
                    {safeClippings.length} ARTICLES SAVED IN YOUR SCRAPBOOK
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("yourtimes")}
                  className="text-xs font-mono underline hover:text-[#A71919] cursor-pointer"
                >
                  ← Back to Dashboard
                </button>
              </div>

              {safeClippings.length === 0 ? (
                <div className="bg-[#FAF7F0] border border-dashed border-[#1A1A1A]/30 rounded-xl p-8 text-center">
                  <Bookmark className="w-8 h-8 text-[#888888] mx-auto mb-2 opacity-50" />
                  <p className="font-serif text-lg text-[#333333]">No saved clippings yet</p>
                  <p className="text-xs text-[#777777] font-mono mt-1">
                    Click the bookmark icon on any story to save it here for offline reading.
                  </p>
                  <button
                    onClick={() => setActiveTab("yourtimes")}
                    className="mt-4 bg-[#111111] text-[#F2EEE5] px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#2A2A2A] cursor-pointer"
                  >
                    Browse Stories
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {safeClippings.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => handleArticleClick(item)}
                      className="bg-[#FAF7F0] border border-[#1A1A1A]/20 rounded-xl p-4 hover:border-[#1A1A1A] cursor-pointer transition-all flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-[#666666] mb-1">
                          <span className="font-bold text-[#111111]">{item.desk || "FEATURE"}</span>
                          <span>{item.readTime || "4 MIN"}</span>
                        </div>
                        <h4 className="font-serif font-bold text-lg text-[#111111] hover:text-[#A71919]">
                          {item.headline}
                        </h4>
                        <p className="text-xs text-[#555555] line-clamp-2 mt-1">
                          {item.deck || item.snippet}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#1A1A1A]/10 text-xs font-mono">
                        <span className="text-[#777777]">{item.date || "RECENT"}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSaveClipping(item);
                          }}
                          className="text-[#A71919] hover:underline cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: READING HISTORY */}
          {activeTab === "history" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-[#1A1A1A]/15 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-3xl text-[#111111]">Reading History</h2>
                  <p className="text-xs font-mono text-[#666666] uppercase mt-1">
                    Recently viewed broadsheets and dispatches
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("yourtimes")}
                  className="text-xs font-mono underline hover:text-[#A71919] cursor-pointer"
                >
                  ← Back to Dashboard
                </button>
              </div>

              {safeReadingHistory.length === 0 ? (
                <div className="bg-[#FAF7F0] border border-dashed border-[#1A1A1A]/30 rounded-xl p-8 text-center">
                  <History className="w-8 h-8 text-[#888888] mx-auto mb-2 opacity-50" />
                  <p className="font-serif text-lg text-[#333333]">No reading history recorded</p>
                  <p className="text-xs text-[#777777] font-mono mt-1">
                    Articles you open will automatically appear in your reading trail.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {safeReadingHistory.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => handleArticleClick(item)}
                      className="bg-[#FAF7F0] border border-[#1A1A1A]/20 rounded-xl p-4 hover:border-[#1A1A1A] cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <span className="text-[10px] font-mono text-[#A71919] font-bold uppercase">
                          {item.desk || "DESK"}
                        </span>
                        <h4 className="font-serif font-bold text-base text-[#111111] hover:text-[#A71919]">
                          {item.headline}
                        </h4>
                      </div>
                      <span className="text-xs font-mono text-[#777777] shrink-0">
                        {item.readTime || "5 MIN"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: FOLLOWING */}
          {activeTab === "following" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-[#1A1A1A]/15 pb-3">
                <h2 className="font-serif font-bold text-3xl text-[#111111]">Followed Desks & Journalists</h2>
                <p className="text-xs font-mono text-[#666666] uppercase mt-1">
                  Custom feeds curated by you
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { name: "Dr. Elena Rostova", desk: "AI & Computational Logic", followers: "42.8k" },
                  { name: "Devon Reid", desk: "W3C Architecture & Systems", followers: "31.2k" },
                  { name: "Vikram Malhotra", desk: "Deep Tech & Silicon Foundries", followers: "18.5k" },
                  { name: "Eleanor Sterling", desk: "Editorial Design & Typography", followers: "24.1k" },
                ].map((person, idx) => (
                  <div
                    key={idx}
                    className="bg-[#FAF7F0] border border-[#1A1A1A]/20 rounded-xl p-4 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="font-serif font-bold text-base text-[#111111]">{person.name}</h4>
                      <p className="text-xs text-[#666666] font-mono">{person.desk}</p>
                      <span className="text-[10px] text-[#888888] font-mono mt-1 block">
                        {person.followers} subscribers
                      </span>
                    </div>
                    <button className="bg-[#111111] text-[#F2EEE5] text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer">
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Following</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-[#1A1A1A]/15 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-3xl text-[#111111]">Live Notifications</h2>
                  <p className="text-xs font-mono text-[#666666] uppercase mt-1">
                    Real-time alerts, market triggers and newsroom dispatches
                  </p>
                </div>
                <button
                  onClick={() =>
                    setLiveNotifications(liveNotifications.map((n) => ({ ...n, unread: false })))
                  }
                  className="text-xs font-mono text-[#A71919] hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>

              <div className="space-y-3">
                {liveNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`bg-[#FAF7F0] border rounded-xl p-4 flex items-start justify-between gap-4 transition-colors ${
                      notif.unread ? "border-[#A71919]/50 bg-[#FBF6EE]" : "border-[#1A1A1A]/20"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`p-2 rounded-lg ${notif.unread ? "bg-[#A71919] text-white" : "bg-[#111111]/10 text-[#111111]"}`}>
                        <Bell className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono font-bold uppercase bg-[#111111] text-white px-1.5 py-0.2 rounded">
                            {notif.desk}
                          </span>
                          <span className="text-[11px] font-mono text-[#777777]">{notif.time}</span>
                        </div>
                        <p className="text-sm font-serif font-semibold text-[#111111]">{notif.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === "settings" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-[#1A1A1A]/15 pb-3">
                <h2 className="font-serif font-bold text-3xl text-[#111111]">Reader Settings</h2>
                <p className="text-xs font-mono text-[#666666] uppercase mt-1">
                  Personalize your newspaper layout, frequency, and telemetry
                </p>
              </div>

              <div className="bg-[#FAF7F0] border border-[#1A1A1A]/20 rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]/10">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#111111]">Real-Time Feed Updates</h4>
                    <p className="text-xs text-[#666666] font-mono mt-0.5">
                      Stream live market indicators and teletype bulletins continuously
                    </p>
                  </div>
                  <span className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                    Enabled
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-[#1A1A1A]/10">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#111111]">Default View On Launch</h4>
                    <p className="text-xs text-[#666666] font-mono mt-0.5">
                      Open &ldquo;Your Times&rdquo; personalized dashboard when first visiting
                    </p>
                  </div>
                  <span className="bg-[#111111] text-white text-xs px-2.5 py-1 rounded-full font-bold">
                    Your Times
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#111111]">Audio Dispatch Synthesizer</h4>
                    <p className="text-xs text-[#666666] font-mono mt-0.5">
                      High-fidelity acoustic speech reading for news articles
                    </p>
                  </div>
                  <span className="bg-[#111111]/10 text-[#111111] text-xs px-2.5 py-1 rounded-full font-bold">
                    Ready
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          3. INTERACTIVE MODALS
         ───────────────────────────────────────────────────────────── */}
      {/* Customize Interests Modal */}
      {isCustomizeOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCustomizeOpen(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-[#1A1A1A]/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif font-bold text-2xl text-[#111111] mb-1">
              Customize Your Times
            </h3>
            <p className="text-xs font-mono text-[#666666] mb-4">
              Select interests to shape your real-time algorithm and curated editions.
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              {allAvailableInterests.map((interest) => {
                const isSelected = selectedInterests.includes(interest);
                return (
                  <button
                    key={interest}
                    onClick={() => toggleInterest(interest)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#111111] text-[#F2EEE5]"
                        : "bg-[#ECE6D8] text-[#444444] hover:bg-[#E0D8C8]"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 text-emerald-400" />}
                    <span>{interest}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsCustomizeOpen(false)}
                className="bg-[#111111] text-[#F2EEE5] text-xs font-semibold px-5 py-2 rounded-lg hover:bg-[#2A2A2A] cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Topics Modal */}
      {isManageTopicsOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setIsManageTopicsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-[#1A1A1A]/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif font-bold text-2xl text-[#111111] mb-1">
              Manage Your Topics
            </h3>
            <p className="text-xs font-mono text-[#666666] mb-4">
              Add or remove subjects to tune your recommendation feed.
            </p>

            <div className="flex gap-2 mb-4">
              <input
                type="text"
                placeholder="New topic name..."
                value={newTopicInput}
                onChange={(e) => setNewTopicInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddTopic();
                }}
                className="bg-[#ECE6D8] border border-[#1A1A1A]/30 rounded-lg px-3 py-1.5 text-xs flex-1 focus:outline-none focus:border-[#111111]"
              />
              <button
                onClick={handleAddTopic}
                className="bg-[#111111] text-[#F2EEE5] text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-[#2A2A2A] cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {userTopics.map((topic) => (
                <div
                  key={topic}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#ECE6D8] text-xs font-mono"
                >
                  <span>{topic}</span>
                  <button
                    onClick={() => handleRemoveTopic(topic)}
                    className="text-[#A71919] hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsManageTopicsOpen(false)}
              className="w-full bg-[#111111] text-[#F2EEE5] text-xs font-semibold py-2 rounded-lg hover:bg-[#2A2A2A] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* User Login Profile Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-50 bg-[#111111]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FAF7F0] border-2 border-[#1A1A1A] rounded-xl max-w-sm w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-[#1A1A1A]/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-16 h-16 rounded-full mx-auto mb-3 border-2 border-[#1A1A1A] ring-2 ring-[#C5A059]/40 ring-offset-2 ring-offset-[#FAF7F0] bg-[#111111] flex items-center justify-center shadow-md">
              <span className="font-serif font-bold text-2xl text-[#F2EEE5] select-none tracking-widest">
                {getInitials(currentUser.name)}
              </span>
            </div>

            <h3 className="font-serif font-bold text-xl text-[#111111]">{currentUser.name}</h3>
            <p className="text-xs font-mono text-[#666666] mb-1">{currentUser.email}</p>
            <span className="inline-block bg-[#111111] text-[#F2EEE5] text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase mb-4">
              {currentUser.role || "PRO SUBSCRIBER"} • {currentUser.edition || "EDITION #001"}
            </span>

            <div className="border-t border-[#1A1A1A]/15 pt-3 space-y-2 text-left text-xs font-mono">
              <div className="flex justify-between py-1 border-b border-[#1A1A1A]/10">
                <span className="text-[#666666]">Subscription</span>
                <span className="font-bold text-[#111111]">Annual Broadsheet</span>
              </div>
              <div className="flex justify-between py-1 border-b border-[#1A1A1A]/10">
                <span className="text-[#666666]">Clippings Saved</span>
                <span className="font-bold text-[#111111]">{safeClippings.length}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2 mt-5">
              <button
                onClick={() => {
                  setIsLoginOpen(false);
                  onLogout?.();
                }}
                className="w-full border border-[#A71919] text-[#A71919] hover:bg-[#A71919] hover:text-[#F2EEE5] text-xs font-semibold py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out / Switch Account</span>
              </button>

              <button
                onClick={() => setIsLoginOpen(false)}
                className="w-full bg-[#111111] text-[#F2EEE5] text-xs font-semibold py-2 rounded-lg hover:bg-[#2A2A2A] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
