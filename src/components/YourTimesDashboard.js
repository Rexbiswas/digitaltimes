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
  Trash2,
  Play,
} from "lucide-react";
import { breakingHeadlines } from "@/data/newspaperData";
import CalendarDateSelector from "./CalendarDateSelector";
import { ArticleCardSkeleton, VideoCardSkeleton, SkeletonBlock } from "./skeletons";
import { useToast } from "@/context/ToastContext";
import { cleanEditorialText } from "@/utils/articlePresenter";
import VerifiedBadge from "./VerifiedBadge";
import VerificationModal from "./VerificationModal";
import UserProfileModal from "./UserProfileModal";
import AccountProfileModal from "./AccountProfileModal";
import {
  fetchJournalistsApi,
  fetchUserFollowsApi,
  followTargetApi,
  unfollowTargetApi,
  discoverUsersApi,
  fetchUserProfileApi,
  fetchUserFollowersApi,
  fetchUserFollowingApi,
  deleteUserApi,
  fetchPersonalizedFeedApi,
  fetchNotificationsApi,
  fetchUnreadCountApi,
  markNotificationReadApi,
  markAllNotificationsReadApi,
  deleteNotificationApi,
  fetchVerificationStatusApi,
} from "@/services/api";
import { initFrontendSocket, getFrontendSocket } from "@/services/socket";

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

  // Calendar Date Selector State (null for Live Updated News by default, or specific date string for archives)
  const [selectedDate, setSelectedDate] = useState(null);

  // Sorting and Additional Filtering State
  const [sortBy, setSortBy] = useState("latest"); // "latest", "quickest", "indepth", "alphabetical", "desk"
  const [readTimeFilter, setReadTimeFilter] = useState("all"); // "all", "short", "long"
  const [savedOnlyFilter, setSavedOnlyFilter] = useState(false);
  // Edition Scope filter: "all" (Updated News First, then Previous News), "updated" (Updated Only), "previous" (Previous Only)
  const [editionScope, setEditionScope] = useState("all");

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

  // Persistent Real Notifications
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);

  // Real Social Following & Instagram-Style Discovery State
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [isLoadingDiscover, setIsLoadingDiscover] = useState(false);
  const [socialSearchQuery, setSocialSearchQuery] = useState("");
  const [userFollows, setUserFollows] = useState({ desks: [], journalists: [], users: [] });
  const [userFollowersList, setUserFollowersList] = useState([]);
  const [isLoadingFollowers, setIsLoadingFollowers] = useState(false);
  const [isLoadingFollows, setIsLoadingFollows] = useState(false);
  const [followingTabFilter, setFollowingTabFilter] = useState("discover"); // "discover" | "following" | "followers" | "desks"
  const [selectedProfileUsername, setSelectedProfileUsername] = useState(null);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Press Verification State
  const [isVerificationOpen, setIsVerificationOpen] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);

  // Real-time broadsheet wire updates counter
  const [newDispatchesCount, setNewDispatchesCount] = useState(0);

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


  const { toast } = useToast();

  // Load Reading History from API (with localStorage fallback)
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      const token = typeof window !== "undefined" ? localStorage.getItem("times_auth_token") : null;
      try {
        const res = await fetch("/api/users/history?limit=50", {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data) && json.data.length > 0) {
            setReadingHistory(json.data);
            return;
          }
        }
      } catch (err) {}

      // Fallback to localStorage
      try {
        const savedHistory = localStorage.getItem("times_reading_history");
        if (savedHistory && isMounted) {
          const parsed = JSON.parse(savedHistory);
          if (Array.isArray(parsed)) {
            setReadingHistory(parsed);
          }
        }
      } catch (e) {}
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // LOAD REAL DATA: NOTIFICATIONS, JOURNALISTS, FOLLOWS & VERIFICATION
  // ─────────────────────────────────────────────────────────────
  const loadNotifications = async () => {
    try {
      const res = await fetchNotificationsApi({ limit: 50 });
      if (res && res.success && Array.isArray(res.data)) {
        setLiveNotifications(res.data);
        setUnreadNotificationsCount(res.unreadCount || res.data.filter((n) => !n.read).length);
      }
    } catch (e) {}
  };

  const loadDiscoverUsers = async (query = socialSearchQuery) => {
    setIsLoadingDiscover(true);
    try {
      const res = await discoverUsersApi({ q: query, limit: 50 });
      if (res && res.success && Array.isArray(res.data)) {
        setDiscoverUsers(res.data);
      }
    } catch (e) {
      console.error("Failed to load discover users:", e);
    } finally {
      setIsLoadingDiscover(false);
    }
  };

  const loadUserFollows = async () => {
    setIsLoadingFollows(true);
    try {
      const res = await fetchUserFollowsApi({ limit: 100 });
      if (res && res.success) {
        setUserFollows({
          desks: Array.isArray(res.desks) ? res.desks : [],
          journalists: Array.isArray(res.journalists) ? res.journalists : [],
          users: Array.isArray(res.users) ? res.users : [],
        });
      }
    } catch (e) {} finally {
      setIsLoadingFollows(false);
    }
  };

  const loadUserFollowers = async () => {
    if (!user?.id && !user?._id) return;
    setIsLoadingFollowers(true);
    try {
      const res = await fetchUserFollowersApi(user.id || user._id);
      if (res && res.success && Array.isArray(res.data)) {
        setUserFollowersList(res.data);
      }
    } catch (e) {} finally {
      setIsLoadingFollowers(false);
    }
  };

  const loadVerificationStatus = async () => {
    try {
      const res = await fetchVerificationStatusApi();
      if (res && res.success) {
        setVerificationStatus(res);
      }
    } catch (e) {}
  };

  // Debounced search for social discovery
  useEffect(() => {
    const timer = setTimeout(() => {
      loadDiscoverUsers(socialSearchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [socialSearchQuery]);

  useEffect(() => {
    let isMounted = true;
    loadNotifications();
    loadDiscoverUsers("");
    loadUserFollows();
    loadUserFollowers();
    loadVerificationStatus();

    // ─────────────────────────────────────────────────────────────
    // REAL-TIME SOCKET.IO CLIENT SUBSCRIPTIONS
    // ─────────────────────────────────────────────────────────────
    const socket = initFrontendSocket();

    if (socket) {
      const handleNewArticle = (payload) => {
        if (!isMounted) return;
        setNewDispatchesCount((prev) => prev + 1);
      };

      const handleNewNotification = (payload) => {
        if (!isMounted) return;
        const notif = payload?.data || payload;
        if (notif) {
          setLiveNotifications((prev) => [notif, ...prev]);
          setUnreadNotificationsCount((prev) => prev + 1);
          toast?.success?.("Broadsheet Alert", notif.title || "New editorial notification received.");
        }
      };

      const handleFollowUpdated = (payload) => {
        if (!isMounted) return;
        loadUserFollows();
        loadUserFollowers();
        loadDiscoverUsers(socialSearchQuery);
      };

      socket.on("NEW_ARTICLE", handleNewArticle);
      socket.on("NEW_NOTIFICATION", handleNewNotification);
      socket.on("notification:new", handleNewNotification);
      socket.on("FOLLOW_UPDATED", handleFollowUpdated);

      return () => {
        isMounted = false;
        socket.off("NEW_ARTICLE", handleNewArticle);
        socket.off("NEW_NOTIFICATION", handleNewNotification);
        socket.off("notification:new", handleNewNotification);
        socket.off("FOLLOW_UPDATED", handleFollowUpdated);
      };
    }

    return () => {
      isMounted = false;
    };
  }, []);

  // Instagram-style user follow toggle handler
  const handleToggleFollowUser = async (targetUser) => {
    const targetUserId = targetUser.id || targetUser._id;
    const isCurrentlyFollowing =
      targetUser.isFollowing ||
      userFollows.users?.some(
        (f) =>
          f.targetId === targetUserId ||
          f.username?.toLowerCase() === targetUser.username?.toLowerCase()
      );

    // Optimistic UI updates
    setDiscoverUsers((prev) =>
      prev.map((u) => {
        const uId = u.id || u._id;
        if (uId === targetUserId || u.username === targetUser.username) {
          const count = u.followerCount || 0;
          return {
            ...u,
            isFollowing: !isCurrentlyFollowing,
            followerCount: isCurrentlyFollowing ? Math.max(0, count - 1) : count + 1,
          };
        }
        return u;
      })
    );

    if (isCurrentlyFollowing) {
      const res = await unfollowTargetApi(targetUserId, "user");
      if (res && res.success) {
        toast?.success?.("Unfollowed", `No longer following @${targetUser.username}.`);
        setUserFollows((prev) => ({
          ...prev,
          users: (prev.users || []).filter((f) => f.targetId !== targetUserId),
        }));
      } else {
        toast?.error?.("Action Failed", res?.message || "Could not unfollow account.");
        loadDiscoverUsers();
        loadUserFollows();
      }
    } else {
      const res = await followTargetApi({
        targetType: "user",
        targetId: targetUserId,
        targetName: targetUser.name,
      });
      if (res && res.success) {
        toast?.success?.("Following Subscriber", `Now following @${targetUser.username}.`);
        loadUserFollows();
      } else {
        toast?.error?.("Action Failed", res?.message || "Could not follow account.");
        loadDiscoverUsers();
        loadUserFollows();
      }
    }
  };

  const handleOpenUserProfile = (usernameOrId) => {
    setSelectedProfileUsername(usernameOrId);
    setIsProfileModalOpen(true);
  };

  const handleDeleteUser = async (targetUser) => {
    if (!targetUser) return;
    const isBrand = targetUser.accountType === "official_brand" || targetUser.username === "thedigitaltimes";
    if (isBrand) {
      toast?.error?.("Protected Account", "The official broadsheet brand account cannot be deleted.");
      return;
    }

    const targetId = targetUser.id || targetUser._id || targetUser.username;
    const isSelf = user?.id === targetId || user?._id === targetId || user?.username === targetUser.username;

    const confirmMsg = isSelf
      ? `Are you sure you want to permanently delete your account (@${targetUser.username})? This action cannot be undone.`
      : `Are you sure you want to permanently delete subscriber @${targetUser.username} from the database?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }

    try {
      const res = await deleteUserApi(targetId);
      if (res && res.success) {
        toast?.success?.("Account Deleted", `Removed @${targetUser.username} from broadsheet registry.`);
        if (isSelf) {
          onLogout?.();
        } else {
          loadDiscoverUsers();
          loadUserFollows();
          if (followingTabFilter === "followers") {
            loadUserFollowers();
          }
        }
      } else {
        toast?.error?.("Delete Failed", res?.message || "Could not delete user account.");
      }
    } catch (e) {
      toast?.error?.("Error", e.message || "Failed to delete account.");
    }
  };

  const handleToggleFollowDesk = async (deskId, deskLabel) => {
    const isCurrentlyFollowing = userFollows.desks.some(
      (f) => f.targetId.toLowerCase() === deskId.toLowerCase()
    );

    if (isCurrentlyFollowing) {
      const res = await unfollowTargetApi(deskId.toLowerCase(), "desk");
      if (res && res.success) {
        toast?.success?.("Unfollowed Desk", `No longer following ${deskLabel}.`);
        setUserFollows((prev) => ({
          ...prev,
          desks: prev.desks.filter(
            (f) => f.targetId.toLowerCase() !== deskId.toLowerCase()
          ),
        }));
      }
    } else {
      const res = await followTargetApi({
        targetType: "desk",
        targetId: deskId.toLowerCase(),
        targetName: deskLabel,
        targetDesk: deskId.toUpperCase(),
      });
      if (res && res.success) {
        toast?.success?.("Following Desk", `Custom feed updated with ${deskLabel} dispatches.`);
        loadUserFollows();
      }
    }
  };

  const handleRefreshNewDispatches = () => {
    loadLiveArticles(false);
    setNewDispatchesCount(0);
    toast?.success?.("Wire Refreshed", "Loaded latest incoming broadsheet dispatches.");
  };

  const safeReadingHistory = Array.isArray(readingHistory) ? readingHistory : [];

  const handleArticleClick = (story) => {
    if (!story) return;
    const currentHist = Array.isArray(readingHistory) ? readingHistory : [];
    const storyId = story.id || story._id || story.articleCustomId;
    const updatedHistory = [
      story,
      ...currentHist.filter((item) => (item?.id || item?._id || item?.articleCustomId) !== storyId)
    ].slice(0, 30);
    setReadingHistory(updatedHistory);
    try {
      localStorage.setItem("times_reading_history", JSON.stringify(updatedHistory));
    } catch (e) {}

    // Async record to backend reading history API
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

    toast?.history?.(story);
    onOpenArticle?.(story);
  };

  const handleRemoveHistoryItem = async (e, item) => {
    e.stopPropagation();
    const itemId = item.id || item._id || item.articleCustomId;
    setReadingHistory((prev) =>
      prev.filter((h) => (h.id || h._id || h.articleCustomId) !== itemId)
    );
    try {
      const current = JSON.parse(localStorage.getItem("times_reading_history") || "[]");
      const filtered = current.filter((h) => (h.id || h._id) !== itemId);
      localStorage.setItem("times_reading_history", JSON.stringify(filtered));
    } catch (err) {}

    const token = typeof window !== "undefined" ? localStorage.getItem("times_auth_token") : null;
    try {
      await fetch(`/api/users/history?articleId=${encodeURIComponent(itemId)}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {}

    toast?.success?.("Record Removed", "Article removed from your reading history.");
  };

  const handleClearAllHistory = async () => {
    setReadingHistory([]);
    try {
      localStorage.removeItem("times_reading_history");
    } catch (e) {}

    const token = typeof window !== "undefined" ? localStorage.getItem("times_auth_token") : null;
    try {
      await fetch("/api/users/history", {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {}

    toast?.success?.("History Cleared", "All reading history has been cleared from your archives.");
  };

  const handleMarkNotificationRead = async (e, notif) => {
    e?.stopPropagation?.();
    const id = notif._id || notif.id;
    setLiveNotifications((prev) =>
      prev.map((n) => ((n._id || n.id) === id ? { ...n, read: true, unread: false } : n))
    );
    const token = typeof window !== "undefined" ? localStorage.getItem("times_auth_token") : null;
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {}
  };

  const handleMarkAllNotificationsRead = async () => {
    setLiveNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true, unread: false }))
    );
    const token = typeof window !== "undefined" ? localStorage.getItem("times_auth_token") : null;
    try {
      await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {}
    toast?.success?.("Notifications Cleared", "All dispatches marked as read.");
  };

  const handleDismissNotification = async (e, notif) => {
    e?.stopPropagation?.();
    const id = notif._id || notif.id;
    setLiveNotifications((prev) => prev.filter((n) => (n._id || n.id) !== id));
    const token = typeof window !== "undefined" ? localStorage.getItem("times_auth_token") : null;
    try {
      await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch (err) {}
    toast?.success?.("Notification Dismissed", "Alert removed from your feed.");
  };

  const handleOpenNotificationStory = (notif) => {
    handleMarkNotificationRead(null, notif);
    const story = notif.story || {
      id: notif.articleId || notif.id,
      headline: notif.title,
      deck: notif.message,
      desk: notif.desk,
    };
    handleArticleClick(story);
  };

  // Live stories loaded dynamically from NewsAPI / backend server
  const [liveStories, setLiveStories] = useState([]);
  const [isLoadingArticles, setIsLoadingArticles] = useState(true);
  const [isSyncingWire, setIsSyncingWire] = useState(false);
  const [wireError, setWireError] = useState(null);

  // Helper to map API article into broadsheet story format
  const mapApiArticle = (item, idx) => ({
    id: item._id || item.id || `live-${idx}`,
    headline: item.headline || item.title,
    desk: (item.desk || item.category || "TECHNOLOGY").toUpperCase(),
    minutesAgo: Math.max(
      1,
      Math.floor((Date.now() - new Date(item.publishedAt || Date.now()).getTime()) / 60000)
    ),
    image: item.urlToImage || item.image || "/window.svg",
    urlToImage: item.urlToImage || item.image || "/window.svg",
    author:
      item.author ||
      (item.sourceName ? `By ${item.sourceName.toUpperCase()}` : "By THE DIGITAL TIMES WIRE"),
    readTime: item.readTime || "4 MIN READ",
    date: item.publishedAt
      ? new Date(item.publishedAt)
          .toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
          .toUpperCase()
      : "TODAY",
    dateIso:
      item.editionDate ||
      (item.publishedAt ? item.publishedAt.split("T")[0] : new Date().toISOString().split("T")[0]),
    topic: item.category || item.desk || "Technology",
    deck: cleanEditorialText(item.deck || item.description, item.headline || item.title),
    leadParagraph: cleanEditorialText(item.leadParagraph || item.deck || item.description, item.headline || item.title),
    bodyParagraphs:
      Array.isArray(item.bodyParagraphs) && item.bodyParagraphs.length > 0
        ? item.bodyParagraphs
            .map((p) => cleanEditorialText(p, item.headline || item.title))
            .filter((p) => p && !/^(comments?|read more)$/i.test(p.trim()))
        : [cleanEditorialText(item.leadParagraph || item.deck || item.description, item.headline || item.title)],
    video: item.video || null,
    videoCaption: item.videoCaption || null,
    videoType: item.videoType || "embed",
    imageCaption: item.imageCaption || null,
    imageCredit: item.imageCredit || null,
    verified: item.verified || false,
    verificationCategory: item.verificationCategory || null,
  });

  const loadLiveArticles = async (isBackground = false) => {
    if (isBackground) {
      setIsSyncingWire(true);
    } else {
      setIsLoadingArticles(true);
    }
    setWireError(null);

    try {
      // First attempt to load personalized feed
      const feedRes = await fetchPersonalizedFeedApi({
        desk: activeCategory && activeCategory !== "ALL" ? activeCategory : undefined,
        limit: 50,
      });

      if (feedRes && feedRes.success && Array.isArray(feedRes.data) && feedRes.data.length > 0) {
        const mapped = feedRes.data.map(mapApiArticle);
        setLiveStories(mapped);
        return;
      }

      // Fallback to /api/articles
      const res = await fetch("/api/articles?limit=50", { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Wire status: HTTP ${res.status}`);
      }
      const json = await res.json();
      if (json.articles && json.articles.length > 0) {
        const mapped = json.articles.map(mapApiArticle);
        setLiveStories(mapped);
      } else if (json.articles && json.articles.length === 0) {
        setLiveStories([]);
      }
    } catch (err) {
      console.warn("Could not load live articles:", err);
      setWireError("Telegraph transmission failed to receive incoming dispatches. Check backend connection.");
    } finally {
      if (isBackground) {
        setIsSyncingWire(false);
      } else {
        setIsLoadingArticles(false);
      }
    }
  };

  // Initial load of live articles
  useEffect(() => {
    loadLiveArticles(false);
  }, []);

  // Fetch archival edition if selectedDate changes
  useEffect(() => {
    if (!selectedDate || selectedDate === "latest") return;
    let isMounted = true;
    const fetchArchiveDate = async () => {
      setIsLoadingArticles(true);
      setWireError(null);
      try {
        const res = await fetch(`/api/editions/${selectedDate}`, { cache: "no-store" });
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && json.data?.articles) {
            if (json.data.articles.length > 0) {
              const mapped = json.data.articles.map(mapApiArticle);
              setLiveStories(mapped);
            } else {
              setLiveStories([]);
            }
          }
        }
      } catch (e) {
        if (isMounted) setWireError(`Archive wire failed for date ${selectedDate}`);
      } finally {
        if (isMounted) setIsLoadingArticles(false);
      }
    };
    fetchArchiveDate();
    return () => {
      isMounted = false;
    };
  }, [selectedDate]);

  // Automatic background wire synchronization (every 60s without full-page loader)
  useEffect(() => {
    let isMounted = true;
    const autoSyncWire = async () => {
      try {
        await loadLiveArticles(true);
        await fetch("http://localhost:5000/api/admin/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).catch(() => {});
        if (isMounted) {
          await loadLiveArticles(true);
        }
      } catch (e) {}
    };

    const interval = setInterval(autoSyncWire, 60000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  // Video stories pool for Telegraphic Video Wire (16:9 aspect ratio)
  const videoStories = useMemo(() => {
    const list = (liveStories || []).filter((s) => s.video || s.videoType);
    if (list.length > 0) return list;
    return (liveStories || []).slice(0, 3);
  }, [liveStories]);

  // Category pills for the "YOUR TIMES" tab
  const categoryPills = ["All", "AI", "Web", "Startups", "Security", "Design", "Gaming"];

  // Available dates for edition selection: dynamically extracted from stories and real-time dates
  const availableDates = useMemo(() => {
    const set = new Set();

    // Dynamically collect unique edition dates from all current stories
    if (Array.isArray(liveStories)) {
      liveStories.forEach((s) => {
        if (s.dateIso && /^\d{4}-\d{2}-\d{2}$/.test(s.dateIso)) {
          set.add(s.dateIso);
        } else if (s.publishedAt) {
          const iso = new Date(s.publishedAt).toISOString().split("T")[0];
          if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
            set.add(iso);
          }
        }
      });
    }

    // Fallback: if no stories present, dynamically generate the past 7 calendar days
    if (set.size === 0) {
      const now = new Date();
      for (let i = 0; i < 7; i++) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        set.add(d.toISOString().split("T")[0]);
      }
    }

    // Sort descending (most recent edition date first)
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [liveStories]);

  // Latest date available in the active edition pool (dynamically resolved)
  const latestEditionDate = useMemo(() => {
    if (availableDates && availableDates.length > 0) {
      return availableDates[0];
    }
    return new Date().toISOString().split("T")[0];
  }, [availableDates]);

  // Format date helper for section headers
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return "UPDATED NEWS";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const monthNames = [
        "JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE",
        "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"
      ];
      const m = monthNames[parseInt(parts[1], 10) - 1];
      const d = parseInt(parts[2], 10);
      const y = parts[0];
      return `${m} ${d}, ${y}`;
    }
    return dateStr;
  };

  // Selected date human-readable label: returns "UPDATED NEWS" when live, or formatted archive date
  const selectedDateLabel = useMemo(() => {
    if (!selectedDate || selectedDate === "latest") return "UPDATED NEWS";
    return formatDisplayDate(selectedDate);
  }, [selectedDate]);

  // Calculate reliable absolute chronological timestamp for any story
  const getStoryTimestamp = (s) => {
    if (!s) return 0;
    if (s.publishedAt) {
      const t = new Date(s.publishedAt).getTime();
      if (!isNaN(t)) return t;
    }
    if (s.dateIso && /^\d{4}-\d{2}-\d{2}$/.test(s.dateIso)) {
      const parts = s.dateIso.split("-");
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const base = new Date(Date.UTC(year, month, day, 23, 59, 59)).getTime();
      const mins = typeof s.minutesAgo === "number" ? s.minutesAgo : 0;
      return base - (mins * 60000);
    }
    if (s.date && typeof s.date === "string") {
      const parsed = Date.parse(s.date);
      if (!isNaN(parsed)) return parsed;
    }
    return 0;
  };

  // Filter & sort recommended stories by selected calendar edition date, category, filters, and sort order
  const filteredStories = useMemo(() => {
    let pool = [...liveStories];

    // 1. Filter by selected date
    if (selectedDate) {
      const matchingDate = pool.filter((s) => s.dateIso === selectedDate);
      if (matchingDate.length > 0) {
        pool = matchingDate;
      } else {
        const dateDisplay = formatDisplayDate(selectedDate);
        pool = [
          {
            id: `archive-${selectedDate}-dispatch`,
            headline: `Archival Wire Dispatch: Historical Broadsheet Edition for ${dateDisplay}`,
            desk: activeCategory && activeCategory.toLowerCase() !== "all" ? activeCategory : "AI",
            minutesAgo: 60,
            image: "/window.svg",
            urlToImage: "/window.svg",
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
          ...liveStories.slice(0, 2)
        ];
      }
    }

    // 2. Filter by active category
    if (activeCategory && activeCategory.toLowerCase() !== "all") {
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

    // 5. Apply sorting (Chronological: Updated news first, then previous news)
    const sorted = [...pool].sort((a, b) => {
      if (sortBy === "latest") {
        const tsA = getStoryTimestamp(a);
        const tsB = getStoryTimestamp(b);
        if (tsA !== tsB) return tsB - tsA; // Newest / updated first
        return (a.minutesAgo || 0) - (b.minutesAgo || 0);
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
  }, [selectedDate, activeCategory, readTimeFilter, savedOnlyFilter, sortBy, safeClippings, isSaved, liveStories]);

  // Partition filtered stories into Updated News (today / latest edition) and Previous News (earlier editions)
  const { updatedNewsStories, previousNewsStories } = useMemo(() => {
    if (selectedDate) {
      return { updatedNewsStories: filteredStories, previousNewsStories: [] };
    }

    const updated = [];
    const previous = [];

    filteredStories.forEach((s) => {
      const isLatest = s.dateIso === latestEditionDate || s.date === "TODAY";
      if (isLatest) {
        updated.push(s);
      } else {
        previous.push(s);
      }
    });

    return { updatedNewsStories: updated, previousNewsStories: previous };
  }, [filteredStories, selectedDate, latestEditionDate]);

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
    <div className="min-h-screen md:h-screen md:overflow-hidden bg-[#E8DFC8] text-[#201E19] font-sans antialiased selection:bg-[#201E19] selection:text-[#E8DFC8] flex flex-col">
      <header className="w-full bg-[#E8DFC8] border-b border-[#766E5F] select-none shrink-0 z-40 shadow-xs">
        {/* Mobile & Small Tablet Header (< md): Clean 2-row editorial layout with uncompromised centered Masthead */}
        <div className="md:hidden px-3 pt-2 pb-1.5 flex flex-col gap-1.5">
          {/* Row 1: Live Badge & Date Selector on Left | Search & Profile on Right */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="bg-[#9F3028] text-[#E8DFC8] text-[9px] font-bold font-mono px-1.5 py-0.5 rounded-sm tracking-wider flex items-center gap-1 shadow-xs">
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
                className="p-1.5 text-[#201E19] hover:bg-[#D7CCB2] rounded-full transition-colors cursor-pointer flex items-center justify-center"
                title="Search"
                aria-label="Search"
              >
                <Search className="w-4 h-4 text-[#201E19]" />
              </button>

              <button
                onClick={() => setIsLoginOpen(true)}
                className="relative rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs flex items-center justify-center group"
                aria-label={`Profile: ${currentUser.name}`}
                title={currentUser.name}
              >
                <div className="w-7 h-7 rounded-full border border-[#766E5F] ring-1 ring-[#C5A059]/40 bg-[#201E19] flex items-center justify-center text-[#E8DFC8] select-none shadow-xs">
                  <span className="text-[10px] font-serif font-bold tracking-wider">
                    {getInitials(currentUser.name)}
                  </span>
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-[#E8DFC8]" />
              </button>
            </div>
          </div>

          {/* Row 2: Grand Masthead Centered & Never Truncated */}
          <div className="text-center cursor-pointer border-t border-[#766E5F]/10 pt-1" onClick={() => setActiveTab("yourtimes")}>
            <h1 className="font-masthead text-2xl xs:text-3xl text-[#201E19] font-normal select-none hover:opacity-90 transition-opacity leading-none tracking-tight">
              The Digital Times
            </h1>
          </div>
        </div>

        {/* Desktop Header (>= md): Classic 1-row layout */}
        <div className="hidden md:flex max-w-[1440px] mx-auto px-6 py-2.5 items-center justify-between gap-4">
          {/* Left Brand Badge & Calendar Date Selector */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="bg-[#9F3028] text-[#E8DFC8] text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm tracking-wider flex items-center gap-1 shadow-xs">
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
            <h1 className="font-masthead text-2xl md:text-3xl lg:text-4xl text-[#201E19] font-normal select-none hover:opacity-90 transition-opacity leading-none">
              The Digital Times
            </h1>
          </div>

          {/* Right Utility: Search & Login */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Search Icon Button */}
            <button
              onClick={() => onOpenSearchModal && onOpenSearchModal()}
              className="p-2 text-[#201E19] hover:bg-[#D7CCB2] rounded-full transition-colors cursor-pointer flex items-center justify-center"
              title="Search"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-[#201E19]" />
            </button>

            {/* Profile Avatar Button (Avatar only) */}
            <button
              onClick={() => setIsLoginOpen(true)}
              className="relative rounded-full transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-xs flex items-center justify-center group"
              aria-label={`Profile: ${currentUser.name}`}
              title={currentUser.name}
            >
              <div className="w-8 h-8 lg:w-9 lg:h-9 rounded-full border-2 border-[#766E5F] ring-1 ring-[#C5A059]/40 bg-[#201E19] flex items-center justify-center text-[#E8DFC8] group-hover:bg-[#2A2A2A] transition-colors select-none shadow-xs">
                <span className="text-xs font-serif font-bold tracking-wider">
                  {getInitials(currentUser.name)}
                </span>
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-[#E8DFC8]" />
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
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "bg-[#EFE8D5] border border-[#766E5F]/20 text-[#39352D] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <Newspaper className="w-3.5 h-3.5" />
                  <span>Your Times</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab("home");
                    onNavigateToBroadsheet?.("masthead");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "home"
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "bg-[#EFE8D5] border border-[#766E5F]/20 text-[#39352D] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>Home</span>
                </button>

                <button
                  onClick={() => setActiveTab("bookmarks")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "bookmarks"
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "bg-[#EFE8D5] border border-[#766E5F]/20 text-[#39352D] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>Bookmarks</span>
                  {safeClippings.length > 0 && (
                    <span className="bg-[#9F3028] text-[#E8DFC8] text-[9px] font-bold px-1.5 rounded-full">
                      {safeClippings.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("history")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "history"
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "bg-[#EFE8D5] border border-[#766E5F]/20 text-[#39352D] hover:bg-[#EAE4D6]"
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
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "bg-[#EFE8D5] border border-[#766E5F]/20 text-[#39352D] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>Following</span>
                </button>

                <button
                  onClick={() => setActiveTab("notifications")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "notifications"
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "bg-[#EFE8D5] border border-[#766E5F]/20 text-[#39352D] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span>Alerts</span>
                  {liveNotifications.filter((n) => n.unread).length > 0 && (
                    <span className="bg-[#9F3028] text-[#E8DFC8] text-[9px] font-bold px-1.5 rounded-full">
                      {liveNotifications.filter((n) => n.unread).length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab("settings")}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                    activeTab === "settings"
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "bg-[#EFE8D5] border border-[#766E5F]/20 text-[#39352D] hover:bg-[#EAE4D6]"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  <span>Settings</span>
                </button>
              </div>
            </div>

            {/* Desktop Navigation: COLLAPSED MODE (Single Unified Dock Capsule) */}
            {isSidebarCollapsed ? (
              <div className="hidden md:flex flex-col items-center gap-1.5 bg-[#EFE8D5] border border-[#766E5F]/15 rounded-2xl p-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)] select-none">
                {/* 1. Avatar with Initials / Photo (Click to expand side panel) */}
                <div
                  onClick={() => setSidebarCollapsedAndSave(false)}
                  className="relative w-10 h-10 shrink-0 cursor-pointer group shadow-xs"
                  aria-label="Expand side panel (Ctrl+B)"
                >
                  <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#766E5F] ring-2 ring-[#C5A059]/30 ring-offset-2 ring-offset-[#EFE8D5] bg-[#201E19] relative flex items-center justify-center">
                    <span className="font-serif font-bold text-xs text-[#E8DFC8] select-none tracking-wider">
                      {getInitials(currentUser.name)}
                    </span>
                  </div>
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#201E19] text-[#E8DFC8] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Expand Side Panel</span>
                    <span className="text-[10px] font-mono text-[#999999] bg-[#222222] px-1.5 py-0.5 rounded">Ctrl+B</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#766E5F]" />
                  </div>
                </div>

                {/* Hairline Divider */}
                <div className="w-6 h-[1px] bg-[#766E5F]/15 my-0.5" />

                {/* 2. Navigation Icon Stack */}
                {/* Home */}
                <button
                  onClick={() => {
                    setActiveTab("home");
                    onNavigateToBroadsheet?.("masthead");
                  }}
                  aria-label="Home Broadsheet (Front Page)"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "home"
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "text-[#39352D] hover:bg-[#766E5F]/10 hover:text-[#201E19]"
                  }`}
                >
                  <Home className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#201E19] text-[#E8DFC8] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Home Broadsheet</span>
                    <span className="text-[10px] font-mono opacity-70 bg-[#333333] px-1.5 py-0.5 rounded">Front Page</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#766E5F]" />
                  </div>
                </button>

                {/* Your Times */}
                <button
                  onClick={() => setActiveTab("yourtimes")}
                  aria-label="Your Times Feed"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "yourtimes"
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "text-[#39352D] hover:bg-[#766E5F]/10 hover:text-[#201E19]"
                  }`}
                >
                  <Newspaper className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-400" />
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#201E19] text-[#E8DFC8] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Your Times Feed</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#766E5F]" />
                  </div>
                </button>

                {/* Bookmarks */}
                <button
                  onClick={() => setActiveTab("bookmarks")}
                  aria-label={`Bookmarks (${safeClippings.length})`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "bookmarks"
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "text-[#39352D] hover:bg-[#766E5F]/10 hover:text-[#201E19]"
                  }`}
                >
                  <Bookmark className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {safeClippings.length > 0 && (
                    <span className="absolute top-1 right-1 bg-[#9F3028] text-[#E8DFC8] text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {safeClippings.length}
                    </span>
                  )}
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#201E19] text-[#E8DFC8] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Bookmarks</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#9F3028] text-[#E8DFC8]">
                      {safeClippings.length} saved
                    </span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#766E5F]" />
                  </div>
                </button>

                {/* Reading History */}
                <button
                  onClick={() => setActiveTab("history")}
                  aria-label={`Reading History (${safeReadingHistory.length})`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "history"
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "text-[#39352D] hover:bg-[#766E5F]/10 hover:text-[#201E19]"
                  }`}
                >
                  <History className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {safeReadingHistory.length > 0 && (
                    <span className="absolute top-1 right-1 text-[8px] font-mono bg-[#766E5F]/20 text-[#201E19] w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {safeReadingHistory.length}
                    </span>
                  )}
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#201E19] text-[#E8DFC8] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Reading History</span>
                    <span className="text-[10px] font-mono text-[#999999]">{safeReadingHistory.length} read</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#766E5F]" />
                  </div>
                </button>

                {/* Following */}
                <button
                  onClick={() => setActiveTab("following")}
                  aria-label="Following"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "following"
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "text-[#39352D] hover:bg-[#766E5F]/10 hover:text-[#201E19]"
                  }`}
                >
                  <Users className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#201E19] text-[#E8DFC8] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Following</span>
                    <span className="text-[10px] font-mono text-[#999999]">Topics & Authors</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#766E5F]" />
                  </div>
                </button>

                {/* Notifications */}
                <button
                  onClick={() => setActiveTab("notifications")}
                  aria-label={`Notifications (${liveNotifications.filter((n) => n.unread).length})`}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "notifications"
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "text-[#39352D] hover:bg-[#766E5F]/10 hover:text-[#201E19]"
                  }`}
                >
                  <Bell className="w-4 h-4 transition-transform group-hover:scale-110" />
                  {liveNotifications.filter((n) => n.unread).length > 0 && (
                    <span className="absolute top-1 right-1 bg-[#9F3028] text-[#E8DFC8] text-[8px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center animate-pulse">
                      {liveNotifications.filter((n) => n.unread).length}
                    </span>
                  )}
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#201E19] text-[#E8DFC8] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Live Alerts</span>
                    {liveNotifications.filter((n) => n.unread).length > 0 && (
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-[#9F3028] text-[#E8DFC8]">
                        {liveNotifications.filter((n) => n.unread).length} new
                      </span>
                    )}
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#766E5F]" />
                  </div>
                </button>

                {/* Settings */}
                <button
                  onClick={() => setActiveTab("settings")}
                  aria-label="Settings"
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer group relative ${
                    activeTab === "settings"
                      ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                      : "text-[#39352D] hover:bg-[#766E5F]/10 hover:text-[#201E19]"
                  }`}
                >
                  <Settings className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#201E19] text-[#E8DFC8] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Preferences</span>
                    <span className="text-[10px] font-mono text-[#999999]">Account & Topics</span>
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#766E5F]" />
                  </div>
                </button>

                {/* Hairline Divider */}
                <div className="w-6 h-[1px] bg-[#766E5F]/15 my-0.5" />

                {/* Live Beacon Indicator */}
                <div className="py-1 relative group cursor-default" aria-label="Real-time newsroom feed active">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#201E19] text-[#E8DFC8] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                    <span className="font-semibold">Newsroom Live</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#766E5F]" />
                  </div>
                </div>
              </div>
            ) : (
              /* Desktop Navigation: EXPANDED MODE (Luxury Broadsheet Architecture) */
              <div className="hidden md:flex flex-col gap-3">
                {/* 1. User Profile Card */}
                <div className="bg-[#EFE8D5] border border-[#766E5F]/15 rounded-2xl p-3.5 flex items-center gap-3 shadow-[0_4px_20px_rgba(0,0,0,0.03)] relative">
                  {/* Avatar (Click to collapse side panel) */}
                  <div
                    onClick={() => setSidebarCollapsedAndSave(true)}
                    className="relative w-11 h-11 shrink-0 cursor-pointer group shadow-xs"
                    aria-label="Collapse side panel (Ctrl+B)"
                  >
                    <div className="w-full h-full rounded-full overflow-hidden border-2 border-[#766E5F] ring-2 ring-[#C5A059]/30 ring-offset-2 ring-offset-[#EFE8D5] bg-[#201E19] relative flex items-center justify-center">
                      <span className="font-serif font-bold text-sm text-[#E8DFC8] select-none tracking-wider">
                        {getInitials(currentUser.name)}
                      </span>
                    </div>
                    <div className="hidden md:flex absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 bg-[#201E19] text-[#E8DFC8] text-xs font-serif rounded-lg shadow-2xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none translate-x-1 group-hover:translate-x-0 transition-all duration-150 z-50 items-center gap-2 border border-[#333333]">
                      <span className="font-semibold">Collapse Side Panel</span>
                      <span className="text-[10px] font-mono text-[#999999] bg-[#222222] px-1.5 py-0.5 rounded">Ctrl+B</span>
                      <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#766E5F]" />
                    </div>
                  </div>

                  {/* User Details */}
                  <div
                    onClick={() => setIsLoginOpen(true)}
                    className="overflow-hidden pr-2 min-w-0 flex-1 cursor-pointer group hover:opacity-90 transition-opacity"
                    title="Open Broadsheet Account Dossier"
                  >
                    <span className="text-[10px] text-[#666666] block leading-tight font-serif italic">
                      Welcome back,
                    </span>
                    <div className="flex items-center gap-1.5 min-w-0">
                      <h2 className="font-serif font-bold text-sm text-[#201E19] leading-tight truncate">
                        {currentUser.name}
                      </h2>
                      {(currentUser.verification?.status === "verified" || verificationStatus?.status === "verified") && (
                        <VerifiedBadge
                          category={currentUser.verification?.category || verificationStatus?.category || "journalist"}
                          size="sm"
                        />
                      )}
                    </div>
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
                <nav className="flex flex-col gap-1.5 bg-[#EFE8D5] border border-[#766E5F]/15 rounded-2xl p-2 shadow-[0_4px_20px_rgba(0,0,0,0.03)] text-sm font-medium">
                  {/* Home */}
                  <button
                    onClick={() => {
                      setActiveTab("home");
                      onNavigateToBroadsheet?.("masthead");
                    }}
                    title="Home (Broadsheet Edition)"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group relative hover:translate-x-0.5 ${
                      activeTab === "home"
                        ? "bg-[#201E19] text-[#E8DFC8] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#39352D] hover:bg-[#766E5F]/5 hover:text-[#201E19]"
                    }`}
                  >
                    <Home className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Home</span>
                    <span className="ml-auto text-[10px] font-mono opacity-70 bg-[#766E5F]/10 px-1.5 py-0.5 rounded text-[#201E19]">
                      Broadsheet
                    </span>
                  </button>

                  {/* Your Times */}
                  <button
                    onClick={() => setActiveTab("yourtimes")}
                    title="Your Times Feed"
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all duration-200 cursor-pointer group relative hover:translate-x-0.5 ${
                      activeTab === "yourtimes"
                        ? "bg-[#201E19] text-[#E8DFC8] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#39352D] hover:bg-[#766E5F]/5 hover:text-[#201E19]"
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
                        ? "bg-[#201E19] text-[#E8DFC8] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#39352D] hover:bg-[#766E5F]/5 hover:text-[#201E19]"
                    }`}
                  >
                    <Bookmark className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Bookmarks</span>
                    {safeClippings.length > 0 && (
                      <span className="ml-auto bg-[#9F3028] text-[#E8DFC8] text-[10px] font-bold px-1.5 py-0.2 rounded-full">
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
                        ? "bg-[#201E19] text-[#E8DFC8] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#39352D] hover:bg-[#766E5F]/5 hover:text-[#201E19]"
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
                        ? "bg-[#201E19] text-[#E8DFC8] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#39352D] hover:bg-[#766E5F]/5 hover:text-[#201E19]"
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
                        ? "bg-[#201E19] text-[#E8DFC8] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#39352D] hover:bg-[#766E5F]/5 hover:text-[#201E19]"
                    }`}
                  >
                    <Bell className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Notifications</span>
                    {liveNotifications.filter((n) => n.unread).length > 0 && (
                      <span className="ml-auto bg-[#9F3028] text-[#E8DFC8] text-[10px] font-bold px-1.5 py-0.2 rounded-full animate-pulse">
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
                        ? "bg-[#201E19] text-[#E8DFC8] font-semibold shadow-md shadow-black/10 scale-[1.01]"
                        : "text-[#39352D] hover:bg-[#766E5F]/5 hover:text-[#201E19]"
                    }`}
                  >
                    <Settings className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" />
                    <span className="truncate">Settings</span>
                  </button>
                </nav>

                {/* 3. Bottom Telemetry */}
                <div className="px-3 py-2 border-t border-[#766E5F]/10 text-[10px] font-mono text-[#777777] flex items-center justify-between select-none">
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
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#766E5F]/15 pb-4">
                <div>
                  <h2 className="font-serif font-bold text-3xl sm:text-4xl text-[#201E19] tracking-tight mb-1">
                    YOUR TIMES
                  </h2>
                  <p className="text-xs font-mono text-[#666666] tracking-wider uppercase">
                    12 STORIES MATCHED TO YOUR INTERESTS
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsCustomizeOpen(true)}
                    className="border border-[#766E5F]/30 bg-[#EFE8D5] hover:bg-[#EAE4D6] text-xs font-semibold px-4 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Customize</span>
                  </button>

                  <button
                    onClick={() => onNavigateToBroadsheet?.("masthead")}
                    className="border border-[#766E5F] bg-[#201E19] hover:bg-[#2A2A2A] text-[#E8DFC8] text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-xs"
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

              {/* ── Subtle Real-Time Dispatch Alert (Non-intrusive) ── */}
              {newDispatchesCount > 0 && (
                <div className="bg-[#201E19] text-[#E8DFC8] border border-[#766E5F]/50 px-4 py-3 rounded-xl flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-2.5">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                    </span>
                    <span className="font-serif font-bold text-sm tracking-wide">
                      {newDispatchesCount} new {newDispatchesCount === 1 ? "dispatch" : "dispatches"} published to wire
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRefreshNewDispatches}
                    className="px-3.5 py-1 bg-[#E8DFC8] text-[#201E19] text-xs font-mono font-bold uppercase rounded-md hover:bg-[#DFD6BD] transition-colors cursor-pointer shadow-xs"
                  >
                    View Updates ↑
                  </button>
                </div>
              )}

              {/* ── Section: "Recommended for you" ────────────────── */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#201E19]">
                    Recommended for you
                  </h3>
                  <button
                    onClick={() => setActiveCategory("All")}
                    className="text-xs font-mono font-semibold text-[#201E19] hover:text-[#9F3028] flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <span>View all</span>
                    <span>→</span>
                  </button>
                </div>

                {/* ── Sort & Filter Controls Bar ────────────────── */}
                <div className="bg-[#EFE8D5] border border-[#766E5F]/15 rounded-xl p-3 sm:p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-2xs">
                  {/* Left: Active Date & Status Tag */}
                  <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
                    <div className="flex items-center gap-1.5 bg-[#EFEAE0] border border-[#766E5F]/20 px-2.5 py-1 rounded-lg font-bold text-[#201E19]">
                      <Calendar className="w-3.5 h-3.5 text-[#9F3028]" />
                      <span className="uppercase">{selectedDate ? selectedDateLabel : "ALL EDITIONS"}</span>
                    </div>

                    <span className="text-[#39352D] font-semibold text-[11px]">
                      • {recommendedCards.length} {recommendedCards.length === 1 ? "story" : "stories"}
                    </span>

                    {/* Filter Active Tags */}
                    {activeCategory && activeCategory.toLowerCase() !== "all" && (
                      <span className="bg-[#201E19] text-[#E8DFC8] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        Desk: {activeCategory}
                        <button type="button" onClick={() => setActiveCategory("All")} className="hover:text-red-300 cursor-pointer">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}

                    {readTimeFilter !== "all" && (
                      <span className="bg-[#201E19] text-[#E8DFC8] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        {readTimeFilter === "short" ? "Quick (<5m)" : "In-Depth (5m+)"}
                        <button type="button" onClick={() => setReadTimeFilter("all")} className="hover:text-red-300 cursor-pointer">
                          <X className="w-2.5 h-2.5" />
                        </button>
                      </span>
                    )}

                    {savedOnlyFilter && (
                      <span className="bg-[#9F3028] text-[#E8DFC8] text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
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
                        className="text-[10px] font-bold text-[#9F3028] hover:underline uppercase cursor-pointer"
                        title="Return to Live Updated News"
                      >
                        ← Back to Updated News
                      </button>
                    )}

                    {isSyncingWire && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#DFD5BC]/60 border border-[#766E5F]/30 text-[10px] font-mono font-bold text-[#201E19] uppercase tracking-wider rounded-xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#9F3028] animate-ping" />
                        <span>LIVE WIRE · UPDATING EDITION</span>
                      </div>
                    )}
                  </div>

                  {/* Right: Sort and Quick Filter Selectors */}
                  <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
                    {/* Edition Scope Selector: Updated First / Updated Only / Previous Only */}
                    {!selectedDate && (
                      <div className="flex items-center border border-[#766E5F]/20 rounded-lg overflow-hidden bg-[#EFEAE0]/80">
                        <button
                          type="button"
                          onClick={() => setEditionScope("all")}
                          className={`px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                            editionScope === "all" ? "bg-[#201E19] text-[#E8DFC8]" : "text-[#39352D] hover:text-[#201E19]"
                          }`}
                          title="Show updated news first, then previous news"
                        >
                          Updated 1st
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditionScope("updated")}
                          className={`px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer border-l border-[#766E5F]/15 ${
                            editionScope === "updated" ? "bg-[#9F3028] text-[#E8DFC8]" : "text-[#39352D] hover:text-[#201E19]"
                          }`}
                          title="Show only updated news"
                        >
                          ● Updated
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditionScope("previous")}
                          className={`px-2.5 py-1 text-[11px] font-bold transition-colors cursor-pointer border-l border-[#766E5F]/15 ${
                            editionScope === "previous" ? "bg-[#201E19] text-[#E8DFC8]" : "text-[#39352D] hover:text-[#201E19]"
                          }`}
                          title="Show only previous news"
                        >
                          Previous
                        </button>
                      </div>
                    )}

                    {/* Read Time Filter Pills */}
                    <div className="flex items-center border border-[#766E5F]/20 rounded-lg overflow-hidden bg-[#EFEAE0]/80">
                      <button
                        type="button"
                        onClick={() => setReadTimeFilter("all")}
                        className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer ${
                          readTimeFilter === "all" ? "bg-[#201E19] text-[#E8DFC8]" : "text-[#39352D] hover:text-[#201E19]"
                        }`}
                        title="Show all lengths"
                      >
                        All
                      </button>
                      <button
                        type="button"
                        onClick={() => setReadTimeFilter("short")}
                        className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer border-l border-[#766E5F]/15 ${
                          readTimeFilter === "short" ? "bg-[#201E19] text-[#E8DFC8]" : "text-[#39352D] hover:text-[#201E19]"
                        }`}
                        title="Short reads under 5 minutes"
                      >
                        &lt; 5m
                      </button>
                      <button
                        type="button"
                        onClick={() => setReadTimeFilter("long")}
                        className={`px-2 py-1 text-[11px] font-bold transition-colors cursor-pointer border-l border-[#766E5F]/15 ${
                          readTimeFilter === "long" ? "bg-[#201E19] text-[#E8DFC8]" : "text-[#39352D] hover:text-[#201E19]"
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
                          ? "bg-[#9F3028] text-[#E8DFC8] border-[#9F3028] shadow-2xs"
                          : "bg-[#EFEAE0] hover:bg-[#D7CCB2] border-[#766E5F]/20 text-[#39352D]"
                      }`}
                      title="Filter only saved bookmarks"
                    >
                      <Bookmark className={`w-3 h-3 ${savedOnlyFilter ? "fill-white" : ""}`} />
                      <span className="hidden xs:inline">Saved</span>
                    </button>

                    {/* Sort By Dropdown */}
                    <div className="flex items-center gap-1 bg-[#EFEAE0] border border-[#766E5F]/20 px-2 py-1 rounded-lg">
                      <ArrowUpDown className="w-3 h-3 text-[#9F3028] shrink-0" />
                      <span className="text-[10px] text-[#777777] uppercase font-bold shrink-0">SORT:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="bg-transparent font-bold text-xs text-[#201E19] outline-hidden cursor-pointer tracking-tight"
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

                {isLoadingArticles ? (
                  <ArticleCardSkeleton count={6} />
                ) : wireError ? (
                  <div className="bg-[#FAF7F0] border-2 border-dashed border-[#9F3028]/30 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-3">
                    <Radio className="w-8 h-8 text-[#9F3028]/60" />
                    <h4 className="font-serif font-bold text-lg text-[#201E19]">Telegraph Wire Interrupted</h4>
                    <p className="text-xs font-mono text-[#666666] max-w-md">{wireError}</p>
                    <button
                      onClick={() => loadLiveArticles(false)}
                      className="px-4 py-1.5 bg-[#201E19] text-[#E8DFC8] rounded-md text-xs font-mono font-bold hover:bg-[#9F3028] transition-colors cursor-pointer"
                    >
                      RETRY WIRE TRANSMISSION
                    </button>
                  </div>
                ) : recommendedCards.length === 0 ? (
                  <div className="bg-[#FAF7F0] border-2 border-dashed border-[#766E5F]/20 rounded-xl p-8 text-center flex flex-col items-center justify-center gap-2">
                    <Filter className="w-8 h-8 text-[#9F3028]/60" />
                    <h4 className="font-serif font-bold text-lg text-[#201E19]">No stories matched these filters</h4>
                    <p className="text-xs font-mono text-[#666666] max-w-md">
                      Try resetting the read-time or category filters to view other stories available for this edition.
                    </p>
                    <button
                      onClick={() => {
                        setActiveCategory("All");
                        setReadTimeFilter("all");
                        setSavedOnlyFilter(false);
                        setEditionScope("all");
                      }}
                      className="mt-2 text-xs font-mono font-bold text-[#9F3028] hover:underline cursor-pointer"
                    >
                      CLEAR EDITORIAL FILTERS
                    </button>
                  </div>
                ) : selectedDate ? (
                  /* Single Selected Archival Edition Grid */
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between border-b border-[#766E5F]/15 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#201E19] text-[#E8DFC8] text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm tracking-wider">
                          ARCHIVE EDITION
                        </span>
                        <h4 className="font-serif font-bold text-base sm:text-lg text-[#201E19]">
                          Edition for {selectedDateLabel}
                        </h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedDate(null)}
                        className="text-xs font-mono font-bold text-[#9F3028] hover:underline cursor-pointer"
                      >
                        ← Back to Updated News
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                      {recommendedCards.map((story) => (
                        <article
                          key={story.id}
                          onClick={() => handleArticleClick(story)}
                          className="group bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl overflow-hidden hover:border-[#766E5F] hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col relative"
                        >
                          <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#DFD5BC]">
                            <Image
                              src={story.urlToImage || story.image || "/window.svg"}
                              alt={story.headline}
                              fill
                              unoptimized
                              className="object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => {
                                e.currentTarget.srcset = "";
                                e.currentTarget.src = "/window.svg";
                              }}
                            />
                            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-xs bg-[#201E19]/85 text-[#E0D8C8] text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 backdrop-blur-xs border border-white/20 shadow-xs z-10 pointer-events-none">
                              <span>{story.date || "ARCHIVE"}</span>
                            </div>
                            {story.video && (
                              <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-xs bg-[#201E19]/85 text-[#E8DFC8] text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 backdrop-blur-xs border border-white/20 shadow-xs z-10 pointer-events-none">
                                <Play className="w-2.5 h-2.5 fill-[#9F3028] text-[#9F3028]" />
                                <span>VIDEO</span>
                              </div>
                            )}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSaveClipping(story);
                              }}
                              className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-[#201E19]/70 hover:bg-[#201E19] text-white backdrop-blur-xs transition-colors cursor-pointer z-10"
                              title="Save story"
                              aria-label="Save story"
                            >
                              <Bookmark className={`w-3.5 h-3.5 ${isSaved(story.id) ? "fill-[#9F3028] text-[#9F3028]" : ""}`} />
                            </button>
                          </div>
                          <div className="p-4 flex-1 flex flex-col justify-between">
                            <div>
                              <h4 className="font-serif font-bold text-lg sm:text-xl text-[#201E19] leading-snug line-clamp-2 group-hover:text-[#9F3028] transition-colors">
                                {story.headline}
                              </h4>
                            </div>
                            <div className="mt-3 pt-3 border-t border-[#766E5F]/10 flex items-center justify-between text-[11px] font-mono text-[#39352D]">
                              <div className="flex items-center gap-1.5">
                                <span className="font-bold text-[#201E19] uppercase tracking-wider">{story.desk}</span>
                                <span>•</span>
                                <span className="text-[#666666] font-semibold">{story.date}</span>
                              </div>
                              <span className="text-[10px] text-[#777777]">{story.readTime}</span>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  </div>
                ) : (
                  /* Dual Section: Updated News First, then Previous News */
                  <div className="flex flex-col gap-8">
                    {/* ── Section 1: UPDATED NEWS (Today / Latest Edition) ── */}
                    {(editionScope === "all" || editionScope === "updated") && updatedNewsStories.length > 0 && (
                      <div className="flex flex-col gap-3.5">
                        <div className="flex items-center justify-between border-b border-[#766E5F]/15 pb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="bg-[#9F3028] text-[#E8DFC8] text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm tracking-wider flex items-center gap-1 shadow-xs">
                              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                              <span>UPDATED NEWS</span>
                            </div>
                            <h4 className="font-serif font-bold text-base sm:text-lg text-[#201E19]">
                              Latest Dispatches
                            </h4>
                            <span className="text-xs font-mono text-[#666666] hidden xs:inline">
                              • {updatedNewsStories.length} {updatedNewsStories.length === 1 ? "story" : "stories"}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#9F3028] font-bold uppercase tracking-wider">
                            ● LIVE WIRE
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                          {updatedNewsStories.map((story) => (
                            <article
                              key={story.id}
                              onClick={() => handleArticleClick(story)}
                              className="group bg-[#EFE8D5] border-2 border-[#766E5F]/20 hover:border-[#9F3028] rounded-xl overflow-hidden hover:shadow-lg transition-all duration-200 cursor-pointer flex flex-col relative"
                            >
                              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#DFD5BC]">
                                <Image
                                  src={story.urlToImage || story.image || "/window.svg"}
                                  alt={story.headline}
                                  fill
                                  unoptimized
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    e.currentTarget.srcset = "";
                                    e.currentTarget.src = "/window.svg";
                                  }}
                                />
                                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-xs bg-[#9F3028] text-[#E8DFC8] text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 shadow-xs z-10 pointer-events-none">
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  <span>UPDATED</span>
                                </div>
                                {story.video && (
                                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-xs bg-[#201E19]/85 text-[#E8DFC8] text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 backdrop-blur-xs border border-white/20 shadow-xs z-10 pointer-events-none">
                                    <Play className="w-2.5 h-2.5 fill-[#9F3028] text-[#9F3028]" />
                                    <span>VIDEO</span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSaveClipping(story);
                                  }}
                                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-[#201E19]/70 hover:bg-[#201E19] text-white backdrop-blur-xs transition-colors cursor-pointer z-10"
                                  title="Save story"
                                  aria-label="Save story"
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${isSaved(story.id) ? "fill-[#9F3028] text-[#9F3028]" : ""}`} />
                                </button>
                              </div>
                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                  <h4 className="font-serif font-bold text-lg sm:text-xl text-[#201E19] leading-snug line-clamp-2 group-hover:text-[#9F3028] transition-colors">
                                    {story.headline}
                                  </h4>
                                </div>
                                <div className="mt-3 pt-3 border-t border-[#766E5F]/10 flex items-center justify-between text-[11px] font-mono text-[#39352D]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[#201E19] uppercase tracking-wider">{story.desk}</span>
                                    <span>•</span>
                                    <span suppressHydrationWarning className="text-[#9F3028] font-bold">
                                      {story.date || getDynamicTimeAgo(story.minutesAgo || 15)}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-[#777777]">{story.readTime}</span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* ── Editorial Broadsheet Divider Between Updated & Previous News ── */}
                    {editionScope === "all" && updatedNewsStories.length > 0 && previousNewsStories.length > 0 && (
                      <div className="relative py-2 flex items-center justify-center my-1">
                        <div className="w-full border-t border-[#766E5F]/20" />
                        <div className="absolute bg-[#E8DFC8] px-3.5 flex items-center gap-2 text-[10px] font-mono font-bold text-[#39352D] uppercase tracking-widest border border-[#766E5F]/15 rounded-full shadow-2xs py-1">
                          <Calendar className="w-3 h-3 text-[#9F3028]" />
                          <span>PREVIOUS NEWS &amp; EARLIER EDITIONS</span>
                        </div>
                      </div>
                    )}

                    {/* ── Section 2: PREVIOUS NEWS (Earlier Editions in Descending Order) ── */}
                    {(editionScope === "all" || editionScope === "previous") && previousNewsStories.length > 0 && (
                      <div className="flex flex-col gap-3.5">
                        <div className="flex items-center justify-between border-b border-[#766E5F]/15 pb-2">
                          <div className="flex items-center gap-2.5">
                            <div className="bg-[#201E19] text-[#E8DFC8] text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm tracking-wider flex items-center gap-1 shadow-xs">
                              <Calendar className="w-3 h-3 text-[#C5A059]" />
                              <span>PREVIOUS NEWS</span>
                            </div>
                            <h4 className="font-serif font-bold text-base sm:text-lg text-[#201E19]">
                              Earlier Dispatches &amp; Archives
                            </h4>
                            <span className="text-xs font-mono text-[#666666] hidden xs:inline">
                              • {previousNewsStories.length} {previousNewsStories.length === 1 ? "story" : "stories"}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider hidden sm:inline">
                            Chronological Archive
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                          {previousNewsStories.map((story) => (
                            <article
                              key={story.id}
                              onClick={() => handleArticleClick(story)}
                              className="group bg-[#EFE8D5] border border-[#766E5F]/20 hover:border-[#766E5F] rounded-xl overflow-hidden hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col relative"
                            >
                              <div className="relative aspect-[16/10] w-full overflow-hidden bg-[#DFD5BC]">
                                <Image
                                  src={story.urlToImage || story.image || "/window.svg"}
                                  alt={story.headline}
                                  fill
                                  unoptimized
                                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                                  onError={(e) => {
                                    e.currentTarget.srcset = "";
                                    e.currentTarget.src = "/window.svg";
                                  }}
                                />
                                <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-xs bg-[#201E19]/85 text-[#E0D8C8] text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 backdrop-blur-xs border border-white/20 shadow-xs z-10 pointer-events-none">
                                  <span>{story.date || "PREVIOUS"}</span>
                                </div>
                                {story.video && (
                                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-xs bg-[#201E19]/85 text-[#E8DFC8] text-[10px] font-mono font-bold tracking-wider flex items-center gap-1 backdrop-blur-xs border border-white/20 shadow-xs z-10 pointer-events-none">
                                    <Play className="w-2.5 h-2.5 fill-[#9F3028] text-[#9F3028]" />
                                    <span>VIDEO</span>
                                  </div>
                                )}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onSaveClipping(story);
                                  }}
                                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-[#201E19]/70 hover:bg-[#201E19] text-white backdrop-blur-xs transition-colors cursor-pointer z-10"
                                  title="Save story"
                                  aria-label="Save story"
                                >
                                  <Bookmark className={`w-3.5 h-3.5 ${isSaved(story.id) ? "fill-[#9F3028] text-[#9F3028]" : ""}`} />
                                </button>
                              </div>
                              <div className="p-4 flex-1 flex flex-col justify-between">
                                <div>
                                  <h4 className="font-serif font-bold text-lg sm:text-xl text-[#201E19] leading-snug line-clamp-2 group-hover:text-[#9F3028] transition-colors">
                                    {story.headline}
                                  </h4>
                                </div>
                                <div className="mt-3 pt-3 border-t border-[#766E5F]/10 flex items-center justify-between text-[11px] font-mono text-[#39352D]">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-[#201E19] uppercase tracking-wider">{story.desk}</span>
                                    <span>•</span>
                                    <span suppressHydrationWarning className="text-[#666666] font-semibold">
                                      {story.date || getDynamicTimeAgo(story.minutesAgo || 15)}
                                    </span>
                                  </div>
                                  <span className="text-[10px] text-[#777777]">{story.readTime}</span>
                                </div>
                              </div>
                            </article>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </section>

              {/* ── Section: Telegraphic Video Wire (16:9 Aspect Ratio YouTube Style) ── */}
              <section className="flex flex-col gap-3.5 pt-2">
                <div className="flex items-center justify-between border-b border-[#766E5F]/15 pb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-[#201E19] text-[#E8DFC8] text-[10px] font-bold font-mono px-2 py-0.5 rounded-sm tracking-wider flex items-center gap-1 shadow-xs">
                      <Play className="w-2.5 h-2.5 fill-[#9F3028] text-[#9F3028]" />
                      <span>VIDEO WIRE</span>
                    </div>
                    <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#201E19]">
                      Telegraphic Video Dispatches
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#777777] uppercase tracking-wider hidden sm:inline">
                    16:9 Broadsheet Reel
                  </span>
                </div>

                {isLoadingArticles ? (
                  <VideoCardSkeleton count={3} />
                ) : videoStories.length === 0 ? (
                  <div className="bg-[#FAF7F0] border border-dashed border-[#766E5F]/20 rounded-xl p-6 text-center text-xs font-mono text-[#666666]">
                    No video transmissions indexed for this edition.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {videoStories.slice(0, 3).map((story) => (
                      <article
                        key={story.id}
                        onClick={() => handleArticleClick(story)}
                        className="group bg-[#EFE8D5] border border-[#766E5F]/20 hover:border-[#9F3028] rounded-xl overflow-hidden hover:shadow-md transition-all cursor-pointer flex flex-col relative"
                      >
                        {/* 16:9 Aspect Ratio Video Thumbnail */}
                        <div className="relative aspect-video w-full overflow-hidden bg-[#DFD5BC]">
                          <Image
                            src={story.urlToImage || story.image || "/window.svg"}
                            alt={story.headline}
                            fill
                            unoptimized
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.currentTarget.srcset = "";
                              e.currentTarget.src = "/window.svg";
                            }}
                          />
                          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                            <div className="w-10 h-10 rounded-full bg-[#201E19]/80 border border-white/30 flex items-center justify-center text-[#E8DFC8] group-hover:scale-110 group-hover:bg-[#9F3028] transition-all shadow-md">
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            </div>
                          </div>
                          <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded-xs bg-black/80 text-white text-[10px] font-mono font-bold">
                            {story.readTime?.includes("MIN") ? story.readTime.replace("READ", "").trim() : "4:15"}
                          </div>
                        </div>

                        {/* YouTube Pattern Content Zone */}
                        <div className="p-3.5 flex-1 flex flex-col justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#201E19] text-[#E8DFC8] flex items-center justify-center font-mono text-xs font-bold shrink-0 border border-[#766E5F]/30">
                              {getInitials(story.author || "Digital Times")}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-serif font-bold text-base text-[#201E19] leading-snug line-clamp-2 group-hover:text-[#9F3028] transition-colors">
                                {story.headline}
                              </h4>
                              <div className="mt-1.5 text-[11px] font-mono text-[#666666]">
                                <span>{story.author || "THE DIGITAL TIMES WIRE"}</span>
                              </div>
                              <div className="text-[10px] font-mono text-[#777777] flex items-center gap-1.5 mt-0.5">
                                <span className="text-[#9F3028] font-bold">{story.desk}</span>
                                <span>•</span>
                                <span>{story.date || "TODAY"}</span>
                              </div>
                            </div>
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
                  <h3 className="font-serif font-bold text-xl sm:text-2xl text-[#201E19]">
                    Your Topics
                  </h3>
                  <button
                    onClick={() => setIsManageTopicsOpen(true)}
                    className="text-xs font-mono font-semibold text-[#201E19] hover:text-[#9F3028] flex items-center gap-1 transition-colors cursor-pointer"
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
                        backgroundColor: "#EFE8D5",
                        color: "#222222",
                        border: "1.5px solid rgba(118, 110, 95, 0.25)",
                        height: "36px",
                        padding: "0 18px",
                        borderRadius: "9999px",
                      }}
                      className="text-xs font-sans font-semibold hover:border-[#766E5F] hover:bg-[#EAE4D6] transition-colors cursor-pointer inline-flex items-center gap-1.5 shadow-xs shrink-0 select-none justify-center"
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
                    className="text-xs font-sans font-semibold border border-dashed border-[#766E5F]/40 text-[#39352D] hover:text-[#201E19] hover:border-[#766E5F] transition-colors cursor-pointer inline-flex items-center gap-1 shrink-0"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Topic</span>
                  </button>
                </div>
              </section>

              {/* Real-Time Live Breaking News Wire Bar */}
              <section className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-[#9F3028]">
                  <span className="w-2 h-2 rounded-full bg-[#9F3028] animate-ping" />
                  <span>LIVE REASONING DISPATCH FEED</span>
                  <span className="text-[#777777] font-normal ml-auto">
                    UPDATED REAL-TIME
                  </span>
                </div>
                <div className="space-y-2">
                  {((updatedNewsStories && updatedNewsStories.length > 0)
                    ? updatedNewsStories.slice(0, 3).map((s) => s.headline || s.title)
                    : (breakingHeadlines || []).slice(0, 3)
                  ).map((headline, idx) => (
                    <div
                      key={idx}
                      onClick={() => onOpenSearchModal?.()}
                      className="flex items-start gap-2 text-xs font-mono text-[#222222] hover:text-[#9F3028] cursor-pointer transition-colors p-1 rounded hover:bg-[#DFD5BC]"
                    >
                      <span className="text-[#9F3028] font-bold shrink-0">[{idx + 1}]</span>
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
              <div className="border-b border-[#766E5F]/15 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="font-serif font-bold text-3xl text-[#201E19]">Your Saved Bookmarks</h2>
                  <p className="text-xs font-mono text-[#666666] uppercase mt-1">
                    {safeClippings.length} ARTICLES SAVED IN YOUR SCRAPBOOK
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab("yourtimes")}
                  className="text-xs font-mono underline hover:text-[#9F3028] cursor-pointer"
                >
                  ← Back to Dashboard
                </button>
              </div>

              {safeClippings.length === 0 ? (
                <div className="bg-[#EFE8D5] border border-dashed border-[#766E5F]/30 rounded-xl p-8 text-center">
                  <Bookmark className="w-8 h-8 text-[#888888] mx-auto mb-2 opacity-50" />
                  <p className="font-serif text-lg text-[#39352D]">No saved clippings yet</p>
                  <p className="text-xs text-[#777777] font-mono mt-1">
                    Click the bookmark icon on any story to save it here for offline reading.
                  </p>
                  <button
                    onClick={() => setActiveTab("yourtimes")}
                    className="mt-4 bg-[#201E19] text-[#E8DFC8] px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#2A2A2A] cursor-pointer"
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
                      className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-4 hover:border-[#766E5F] cursor-pointer transition-all flex flex-col justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center justify-between text-xs font-mono text-[#666666] mb-1">
                          <span className="font-bold text-[#201E19]">{item.desk || "FEATURE"}</span>
                          <span>{item.readTime || "4 MIN"}</span>
                        </div>
                        <h4 className="font-serif font-bold text-lg text-[#201E19] hover:text-[#9F3028]">
                          {item.headline}
                        </h4>
                        <p className="text-xs text-[#39352D] line-clamp-2 mt-1">
                          {item.deck || item.snippet}
                        </p>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-[#766E5F]/10 text-xs font-mono">
                        <span className="text-[#777777]">{item.date || "RECENT"}</span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSaveClipping(item);
                          }}
                          className="text-[#9F3028] hover:underline cursor-pointer"
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
              <div className="border-b border-[#766E5F]/15 pb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif font-bold text-3xl text-[#201E19]">Reading History</h2>
                    <span className="text-xs font-mono font-bold bg-[#201E19] text-[#E8DFC8] px-2 py-0.5 rounded-full">
                      {safeReadingHistory.length}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-[#666666] uppercase mt-1">
                    Recently viewed broadsheets, dispatches, and cognitive trails
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {safeReadingHistory.length > 0 && (
                    <button
                      onClick={handleClearAllHistory}
                      className="text-xs font-mono text-[#9F3028] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Clear History</span>
                    </button>
                  )}
                  <button
                    onClick={() => setActiveTab("yourtimes")}
                    className="text-xs font-mono underline hover:text-[#9F3028] cursor-pointer"
                  >
                    ← Back to Dashboard
                  </button>
                </div>
              </div>

              {safeReadingHistory.length === 0 ? (
                <div className="bg-[#EFE8D5] border border-dashed border-[#766E5F]/30 rounded-xl p-8 text-center">
                  <History className="w-8 h-8 text-[#888888] mx-auto mb-2 opacity-50" />
                  <p className="font-serif text-lg text-[#39352D]">No reading history recorded</p>
                  <p className="text-xs text-[#777777] font-mono mt-1">
                    Articles you read across any broadsheet desk will automatically synchronize to your reading trail.
                  </p>
                  <button
                    onClick={() => setActiveTab("yourtimes")}
                    className="mt-4 bg-[#201E19] text-[#E8DFC8] px-4 py-1.5 rounded-lg text-xs font-semibold hover:bg-[#2A2A2A] cursor-pointer"
                  >
                    Browse Daily Editions
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {safeReadingHistory.map((item, idx) => (
                    <div
                      key={item._id || item.id || idx}
                      onClick={() => handleArticleClick(item)}
                      className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-4 hover:border-[#766E5F] hover:shadow-md cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-mono text-[#9F3028] font-bold uppercase">
                            {item.desk || "BROADSHEET"}
                          </span>
                          <span className="text-[#888888] text-[10px] font-mono">•</span>
                          <span className="text-[10px] font-mono bg-[#201E19]/10 text-[#39352D] px-1.5 py-0.2 rounded font-semibold">
                            {item.readPercentage ? `${item.readPercentage}% READ` : "COMPLETED"}
                          </span>
                          {item.readAt && (
                            <span className="text-[10px] font-mono text-[#777777]">
                              {new Date(item.readAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })}
                            </span>
                          )}
                        </div>
                        <h4 className="font-serif font-bold text-base text-[#201E19] group-hover:text-[#9F3028] transition-colors leading-snug">
                          {item.headline || item.title}
                        </h4>
                        {item.deck && (
                          <p className="text-xs text-[#666666] font-serif line-clamp-1 mt-0.5">
                            {item.deck}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                        <span className="text-xs font-mono text-[#777777]">
                          {item.readTime || "5 MIN"}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => handleRemoveHistoryItem(e, item)}
                          className="p-1.5 text-[#888888] hover:text-[#9F3028] hover:bg-[#9F3028]/10 rounded transition-colors cursor-pointer"
                          title="Remove from history"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SOCIAL FOLLOWING & DISCOVERY */}
          {activeTab === "following" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-[#766E5F]/15 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase bg-[#201E19] text-[#E8DFC8] px-2 py-0.5 rounded font-bold tracking-wider">
                      Social Registry
                    </span>
                    <h2 className="font-serif font-bold text-3xl text-[#201E19]">
                      Social Discovery & Following
                    </h2>
                  </div>
                  <p className="text-xs font-mono text-[#666666] uppercase mt-1">
                    Connect with fellow subscribers, editorial staff, and the official journal
                  </p>
                </div>

                {/* Sub-tabs: Discover | Following | Followers | Desks */}
                <div className="flex bg-[#DFD6BD] p-1 rounded-lg text-xs font-mono overflow-x-auto">
                  <button
                    onClick={() => setFollowingTabFilter("discover")}
                    className={`px-3 py-1.5 rounded-md font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      followingTabFilter === "discover"
                        ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                        : "text-[#39352D] hover:text-[#201E19]"
                    }`}
                  >
                    Discover ({discoverUsers.length})
                  </button>
                  <button
                    onClick={() => setFollowingTabFilter("following")}
                    className={`px-3 py-1.5 rounded-md font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      followingTabFilter === "following"
                        ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                        : "text-[#39352D] hover:text-[#201E19]"
                    }`}
                  >
                    Following ({userFollows.users?.length || 0})
                  </button>
                  <button
                    onClick={() => {
                      setFollowingTabFilter("followers");
                      loadUserFollowers();
                    }}
                    className={`px-3 py-1.5 rounded-md font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      followingTabFilter === "followers"
                        ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                        : "text-[#39352D] hover:text-[#201E19]"
                    }`}
                  >
                    Followers ({userFollowersList.length})
                  </button>
                  <button
                    onClick={() => setFollowingTabFilter("desks")}
                    className={`px-3 py-1.5 rounded-md font-bold uppercase transition-all cursor-pointer whitespace-nowrap ${
                      followingTabFilter === "desks"
                        ? "bg-[#201E19] text-[#E8DFC8] shadow-xs"
                        : "text-[#39352D] hover:text-[#201E19]"
                    }`}
                  >
                    Desks (10)
                  </button>
                </div>
              </div>

              {/* Sub-tab 1: DISCOVER SUBSCRIBERS & OFFICIAL ACCOUNTS */}
              {followingTabFilter === "discover" && (
                <div className="flex flex-col gap-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#766E5F]" />
                    <input
                      type="text"
                      value={socialSearchQuery}
                      onChange={(e) => setSocialSearchQuery(e.target.value)}
                      placeholder="Search broadsheet subscribers by @username or name..."
                      className="w-full bg-[#EFE8D5] border border-[#766E5F]/30 rounded-lg pl-10 pr-10 py-2.5 text-xs font-mono text-[#201E19] placeholder-[#766E5F] focus:outline-none focus:border-[#201E19] transition-colors"
                    />
                    {socialSearchQuery && (
                      <button
                        onClick={() => setSocialSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#766E5F] hover:text-[#201E19] cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {isLoadingDiscover ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3, 4].map((n) => (
                        <div key={n} className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-5 animate-pulse h-36" />
                      ))}
                    </div>
                  ) : discoverUsers.length === 0 ? (
                    <div className="bg-[#EFE8D5] border border-dashed border-[#766E5F]/30 rounded-xl p-8 text-center">
                      <Users className="w-8 h-8 text-[#888888] mx-auto mb-2 opacity-50" />
                      <p className="font-serif text-lg text-[#39352D]">No matching accounts found</p>
                      <p className="text-xs text-[#777777] font-mono mt-1">
                        Try searching for another @username or view all broadsheet accounts.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {discoverUsers.map((targetUser) => {
                        const targetUserId = targetUser.id || targetUser._id;
                        const isFollowing =
                          targetUser.isFollowing ||
                          userFollows.users?.some(
                            (f) =>
                              f.targetId === targetUserId ||
                              f.username?.toLowerCase() === targetUser.username?.toLowerCase()
                          );

                        const isOfficial =
                          targetUser.accountType === "official_brand" ||
                          targetUser.username?.toLowerCase() === "thedigitaltimes";

                        return (
                          <div
                            key={targetUserId || targetUser.username}
                            className={`bg-[#EFE8D5] border rounded-xl p-5 flex flex-col justify-between gap-4 transition-all relative overflow-hidden ${
                              isOfficial
                                ? "border-[#C2A649]/60 shadow-xs"
                                : "border-[#766E5F]/20 hover:border-[#766E5F]/50"
                            }`}
                          >
                            {/* Official Brand Header Strip */}
                            {isOfficial && (
                              <div className="absolute top-0 right-0 bg-[#C2A649]/20 border-b border-l border-[#C2A649]/40 text-[#8C7326] px-2.5 py-0.5 text-[9px] font-mono font-bold uppercase tracking-wider rounded-bl">
                                Official Newspaper Journal
                              </div>
                            )}

                            <div className="flex items-start gap-3.5">
                              {/* Avatar */}
                              <div
                                onClick={() => handleOpenUserProfile(targetUser.username)}
                                className="w-12 h-12 rounded-full bg-[#201E19] text-[#E8DFC8] border border-[#766E5F]/30 flex items-center justify-center font-serif text-lg font-bold shrink-0 cursor-pointer hover:opacity-85 transition-opacity"
                              >
                                {targetUser.avatar ? (
                                  <img
                                    src={targetUser.avatar}
                                    alt={targetUser.name}
                                    className="w-full h-full rounded-full object-cover"
                                  />
                                ) : (
                                  targetUser.name.charAt(0).toUpperCase()
                                )}
                              </div>

                              {/* Info */}
                              <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4
                                    onClick={() => handleOpenUserProfile(targetUser.username)}
                                    className="font-serif font-bold text-base text-[#201E19] hover:underline cursor-pointer truncate"
                                  >
                                    {targetUser.name}
                                  </h4>
                                  {targetUser.isVerified && (
                                    <VerifiedBadge
                                      category={isOfficial ? "publication" : targetUser.verification?.category || "journalist"}
                                      size="sm"
                                    />
                                  )}
                                </div>
                                <p className="text-xs text-[#666666] font-mono">
                                  @{targetUser.username}
                                </p>

                                <p className="text-[11px] text-[#555555] font-sans mt-1 line-clamp-2 italic">
                                  {targetUser.bio || "Registered subscriber of The Digital Times broadsheet."}
                                </p>
                              </div>
                            </div>

                            {/* Stats & Actions */}
                            <div className="flex items-center justify-between border-t border-[#766E5F]/15 pt-3 mt-1">
                              <div className="flex items-center gap-3 text-xs font-mono text-[#666666]">
                                <button
                                  type="button"
                                  onClick={() => handleOpenUserProfile(targetUser.username)}
                                  className="hover:underline cursor-pointer"
                                >
                                  <strong className="text-[#201E19] font-bold">
                                    {targetUser.followerCount || 0}
                                  </strong>{" "}
                                  followers
                                </button>
                                <span className="text-[#766E5F]/30">•</span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenUserProfile(targetUser.username)}
                                  className="hover:underline cursor-pointer"
                                >
                                  <strong className="text-[#201E19] font-bold">
                                    {targetUser.followingCount || 0}
                                  </strong>{" "}
                                  following
                                </button>
                              </div>

                              <div className="flex items-center gap-2">
                                {!isOfficial && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteUser(targetUser)}
                                    className="text-xs px-2.5 py-1.5 rounded-lg border border-[#9F3028]/40 text-[#9F3028] hover:bg-[#9F3028] hover:text-[#E8DFC8] font-mono transition-colors cursor-pointer flex items-center gap-1"
                                    title={`Delete @${targetUser.username} from database`}
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Delete</span>
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleToggleFollowUser(targetUser)}
                                  className={`text-xs px-3.5 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                                    isFollowing
                                      ? "bg-[#201E19] text-[#E8DFC8] hover:bg-[#9F3028]"
                                      : "border-2 border-[#201E19] text-[#201E19] hover:bg-[#201E19] hover:text-[#E8DFC8]"
                                  }`}
                                >
                                  {isFollowing ? (
                                    <>
                                      <UserCheck className="w-3.5 h-3.5" />
                                      <span>Following</span>
                                    </>
                                  ) : (
                                    <>
                                      <Plus className="w-3.5 h-3.5" />
                                      <span>Follow</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 2: ACCOUNTS YOU FOLLOW */}
              {followingTabFilter === "following" && (
                <div className="flex flex-col gap-4">
                  {userFollows.users?.length === 0 ? (
                    <div className="bg-[#EFE8D5] border border-dashed border-[#766E5F]/30 rounded-xl p-8 text-center">
                      <Users className="w-8 h-8 text-[#888888] mx-auto mb-2 opacity-50" />
                      <p className="font-serif text-lg text-[#39352D]">You are not following any subscribers yet</p>
                      <p className="text-xs text-[#777777] font-mono mt-1">
                        Explore the Discover tab to connect with broadsheet journalists, readers, and official dispatches.
                      </p>
                      <button
                        onClick={() => setFollowingTabFilter("discover")}
                        className="mt-4 px-4 py-2 bg-[#201E19] text-[#E8DFC8] text-xs font-semibold rounded-lg font-mono uppercase cursor-pointer hover:bg-[#333333]"
                      >
                        Discover Subscribers
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userFollows.users?.map((f) => (
                        <div
                          key={f._id || f.targetId}
                          className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-[#766E5F]/50 transition-all"
                        >
                          <div
                            onClick={() => handleOpenUserProfile(f.username || f.targetId)}
                            className="flex items-center gap-3 min-w-0 cursor-pointer"
                          >
                            <div className="w-10 h-10 rounded-full bg-[#201E19] text-[#E8DFC8] flex items-center justify-center font-serif text-base font-bold shrink-0">
                              {f.avatar ? (
                                <img src={f.avatar} alt={f.name || f.targetName} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                (f.name || f.targetName).charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-serif font-bold text-sm text-[#201E19] truncate">
                                  {f.name || f.targetName}
                                </h4>
                                {f.isVerified && (
                                  <VerifiedBadge category={f.accountType === "official_brand" ? "publication" : "journalist"} size="sm" />
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-[#666666] block truncate">
                                @{f.username || "subscriber"}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleToggleFollowUser({ id: f.targetId, _id: f.targetId, name: f.name || f.targetName, username: f.username, isFollowing: true })}
                            className="text-xs px-3 py-1.5 rounded-lg font-semibold bg-[#201E19] text-[#E8DFC8] hover:bg-[#9F3028] transition-colors cursor-pointer flex items-center gap-1 shrink-0"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Following</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 3: SUBSCRIBERS FOLLOWING YOU */}
              {followingTabFilter === "followers" && (
                <div className="flex flex-col gap-4">
                  {isLoadingFollowers ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[1, 2, 3].map((n) => (
                        <div key={n} className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-4 animate-pulse h-20" />
                      ))}
                    </div>
                  ) : userFollowersList.length === 0 ? (
                    <div className="bg-[#EFE8D5] border border-dashed border-[#766E5F]/30 rounded-xl p-8 text-center">
                      <Users className="w-8 h-8 text-[#888888] mx-auto mb-2 opacity-50" />
                      <p className="font-serif text-lg text-[#39352D]">No subscribers following you yet</p>
                      <p className="text-xs text-[#777777] font-mono mt-1">
                        When other readers follow your broadsheet activity, they will appear here.
                      </p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {userFollowersList.map((follower) => {
                        const isFollowingThem = userFollows.users?.some(
                          (f) => f.targetId === follower.id || f.targetId === follower._id
                        );

                        return (
                          <div
                            key={follower.id || follower._id}
                            className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-4 flex items-center justify-between gap-3 hover:border-[#766E5F]/50 transition-all"
                          >
                            <div
                              onClick={() => handleOpenUserProfile(follower.username)}
                              className="flex items-center gap-3 min-w-0 cursor-pointer"
                            >
                              <div className="w-10 h-10 rounded-full bg-[#201E19] text-[#E8DFC8] flex items-center justify-center font-serif text-base font-bold shrink-0">
                                {follower.avatar ? (
                                  <img src={follower.avatar} alt={follower.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  follower.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <h4 className="font-serif font-bold text-sm text-[#201E19] truncate">
                                    {follower.name}
                                  </h4>
                                  {follower.isVerified && (
                                    <VerifiedBadge category={follower.accountType === "official_brand" ? "publication" : "journalist"} size="sm" />
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-[#666666] block truncate">
                                  @{follower.username}
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleToggleFollowUser(follower)}
                              className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                                isFollowingThem
                                  ? "bg-[#201E19] text-[#E8DFC8] hover:bg-[#9F3028]"
                                  : "border border-[#201E19] text-[#201E19] hover:bg-[#201E19] hover:text-[#E8DFC8]"
                              }`}
                            >
                              {isFollowingThem ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>Following</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>Follow Back</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Sub-tab 4: EDITORIAL DESKS */}
              {followingTabFilter === "desks" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                    { id: "frontpage", label: "Front Page", desc: "Lead investigations and top editorial broadside dispatches" },
                    { id: "ai", label: "The AI Desk", desc: "Frontier reasoning, autonomous models & synthetic cognition" },
                    { id: "web", label: "Web Dev Desk", desc: "Local-first runtimes, WebAssembly, browser architecture" },
                    { id: "startups", label: "Startups Desk", desc: "Venture capital, seed rounds & autonomous founders" },
                    { id: "design", label: "Editorial Design Desk", desc: "Typography, broadsheet aesthetics & layout systems" },
                    { id: "security", label: "Security Desk", desc: "Cryptography, zero-day research & defensive meshes" },
                    { id: "gaming", label: "Gaming & Simulation Desk", desc: "Spatial engines, graphics pipelines & virtual physics" },
                    { id: "culture", label: "Internet Culture Desk", desc: "Network sociology, digital artifacts & computational philosophy" },
                    { id: "business", label: "Markets & Business Desk", desc: "Compute commodities, data vault financing & macroeconomics" },
                    { id: "future", label: "Future & Science Desk", desc: "Quantum links, biocomputing & frontier experimental physics" },
                  ].map((desk) => {
                    const isFollowing = userFollows.desks.some(
                      (f) => f.targetId.toLowerCase() === desk.id.toLowerCase()
                    );

                    return (
                      <div
                        key={desk.id}
                        className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-4 flex flex-col justify-between gap-3 hover:border-[#766E5F]/50 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold bg-[#201E19] text-[#E8DFC8] px-1.5 py-0.5 rounded">
                              DESK
                            </span>
                            <h4 className="font-serif font-bold text-base text-[#201E19]">{desk.label}</h4>
                          </div>
                          <p className="text-xs text-[#555555] font-sans mt-1">
                            {desk.desc}
                          </p>
                        </div>

                        <div className="flex items-center justify-between border-t border-[#766E5F]/15 pt-2">
                          <span className="text-[10px] text-[#777777] font-mono uppercase">
                            Broadsheet Section
                          </span>
                          <button
                            type="button"
                            onClick={() => handleToggleFollowDesk(desk.id, desk.label)}
                            className={`text-xs px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                              isFollowing
                                ? "bg-[#201E19] text-[#E8DFC8] hover:bg-[#9F3028]"
                                : "border border-[#201E19] text-[#201E19] hover:bg-[#201E19] hover:text-[#E8DFC8]"
                            }`}
                          >
                            {isFollowing ? (
                              <>
                                <Check className="w-3.5 h-3.5" />
                                <span>Subscribed</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3.5 h-3.5" />
                                <span>Follow Desk</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 5: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-[#766E5F]/15 pb-3 flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-serif font-bold text-3xl text-[#201E19]">Live Notifications</h2>
                    {liveNotifications.filter((n) => n.unread || !n.read).length > 0 && (
                      <span className="text-xs font-mono font-bold bg-[#9F3028] text-[#E8DFC8] px-2 py-0.5 rounded-full">
                        {liveNotifications.filter((n) => n.unread || !n.read).length} new
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-mono text-[#666666] uppercase mt-1">
                    Real-time alerts, market triggers and newsroom dispatches
                  </p>
                </div>
                <button
                  onClick={handleMarkAllNotificationsRead}
                  className="text-xs font-mono text-[#9F3028] hover:underline cursor-pointer"
                >
                  Mark all as read
                </button>
              </div>

              {liveNotifications.length === 0 ? (
                <div className="bg-[#EFE8D5] border border-dashed border-[#766E5F]/30 rounded-xl p-8 text-center">
                  <Bell className="w-8 h-8 text-[#888888] mx-auto mb-2 opacity-50" />
                  <p className="font-serif text-lg text-[#39352D]">No notifications right now</p>
                  <p className="text-xs text-[#777777] font-mono mt-1">
                    Editorial dispatches and breaking alerts will appear here as they are published.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {liveNotifications.map((notif) => {
                    const isUnread = notif.unread !== undefined ? notif.unread : !notif.read;
                    return (
                      <div
                        key={notif._id || notif.id}
                        className={`bg-[#EFE8D5] border rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors ${
                          isUnread ? "border-[#9F3028]/50 bg-[#FBF6EE]" : "border-[#766E5F]/20"
                        }`}
                      >
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div
                            className={`p-2 rounded-lg shrink-0 ${
                              isUnread ? "bg-[#9F3028] text-white" : "bg-[#201E19]/10 text-[#201E19]"
                            }`}
                          >
                            <Bell className="w-4 h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[10px] font-mono font-bold uppercase bg-[#201E19] text-white px-1.5 py-0.2 rounded">
                                {notif.desk || "NEWSROOM"}
                              </span>
                              <span className="text-[11px] font-mono text-[#777777]">{notif.time || "RECENT"}</span>
                              {isUnread && (
                                <span className="text-[9px] font-mono font-bold text-[#9F3028] uppercase tracking-wider">
                                  ● UNREAD
                                </span>
                              )}
                            </div>
                            <h4
                              onClick={() => handleOpenNotificationStory(notif)}
                              className="text-sm font-serif font-semibold text-[#201E19] hover:text-[#9F3028] transition-colors cursor-pointer"
                            >
                              {notif.title}
                            </h4>
                            {notif.message && (
                              <p className="text-xs text-[#666666] font-serif line-clamp-2 mt-0.5">
                                {notif.message}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                          <button
                            type="button"
                            onClick={() => handleOpenNotificationStory(notif)}
                            className="text-[11px] font-mono text-[#9F3028] hover:underline font-bold uppercase cursor-pointer"
                          >
                            Read
                          </button>
                          {isUnread && (
                            <button
                              type="button"
                              onClick={(e) => handleMarkNotificationRead(e, notif)}
                              className="text-[11px] font-mono text-[#39352D] hover:text-[#201E19] cursor-pointer"
                            >
                              Mark read
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={(e) => handleDismissNotification(e, notif)}
                            className="p-1 text-[#888888] hover:text-[#9F3028] cursor-pointer transition-colors"
                            title="Dismiss notification"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: SETTINGS */}
          {activeTab === "settings" && (
            <div className="flex flex-col gap-6">
              <div className="border-b border-[#766E5F]/15 pb-3">
                <h2 className="font-serif font-bold text-3xl text-[#201E19]">Reader Settings</h2>
                <p className="text-xs font-mono text-[#666666] uppercase mt-1">
                  Personalize your newspaper layout, frequency, and telemetry
                </p>
              </div>

              <div className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-6 space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#766E5F]/10">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#201E19]">Real-Time Feed Updates</h4>
                    <p className="text-xs text-[#666666] font-mono mt-0.5">
                      Stream live market indicators and teletype bulletins continuously
                    </p>
                  </div>
                  <span className="bg-emerald-600 text-white text-xs px-2.5 py-1 rounded-full font-bold">
                    Enabled
                  </span>
                </div>

                <div className="flex items-center justify-between pb-4 border-b border-[#766E5F]/10">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#201E19]">Default View On Launch</h4>
                    <p className="text-xs text-[#666666] font-mono mt-0.5">
                      Open &ldquo;Your Times&rdquo; personalized dashboard when first visiting
                    </p>
                  </div>
                  <span className="bg-[#201E19] text-white text-xs px-2.5 py-1 rounded-full font-bold">
                    Your Times
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-serif font-bold text-base text-[#201E19]">Audio Dispatch Synthesizer</h4>
                    <p className="text-xs text-[#666666] font-mono mt-0.5">
                      High-fidelity acoustic speech reading for news articles
                    </p>
                  </div>
                  <span className="bg-[#201E19]/10 text-[#201E19] text-xs px-2.5 py-1 rounded-full font-bold">
                    Ready
                  </span>
                </div>

                {/* Press Verification Card */}
                <div className="pt-4 border-t border-[#766E5F]/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-serif font-bold text-base text-[#201E19]">Editorial Broadside Verification</h4>
                      {verificationStatus?.status === "verified" ? (
                        <VerifiedBadge category={verificationStatus?.category || "journalist"} size="sm" showLabel={true} />
                      ) : verificationStatus?.status === "pending" ? (
                        <span className="text-[10px] font-mono font-bold bg-[#D4AF37]/20 text-[#856404] border border-[#D4AF37]/40 px-2 py-0.5 rounded">
                          PENDING EDITORIAL REVIEW
                        </span>
                      ) : verificationStatus?.status === "rejected" ? (
                        <span className="text-[10px] font-mono font-bold bg-[#9F3028]/15 text-[#9F3028] border border-[#9F3028]/30 px-2 py-0.5 rounded">
                          NOT APPROVED
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono font-bold bg-[#766E5F]/10 text-[#666666] px-2 py-0.5 rounded">
                          UNVERIFIED
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#666666] font-mono mt-0.5">
                      Accreditation for journalists, editors, and publishers across The Digital Times
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsVerificationOpen(true)}
                    className="px-4 py-2 bg-[#201E19] text-[#E8DFC8] text-xs font-mono uppercase font-bold tracking-wider hover:bg-[#39352D] rounded-lg transition-colors cursor-pointer"
                  >
                    {verificationStatus?.status === "verified"
                      ? "View Credentials"
                      : verificationStatus?.status === "pending"
                      ? "Review Application"
                      : "Request Verification"}
                  </button>
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
        <div className="fixed inset-0 z-50 bg-[#201E19]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#EFE8D5] border-2 border-[#766E5F] rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setIsCustomizeOpen(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-[#766E5F]/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif font-bold text-2xl text-[#201E19] mb-1">
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
                        ? "bg-[#201E19] text-[#E8DFC8]"
                        : "bg-[#DFD5BC] text-[#39352D] hover:bg-[#E0D8C8]"
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
                className="bg-[#201E19] text-[#E8DFC8] text-xs font-semibold px-5 py-2 rounded-lg hover:bg-[#2A2A2A] cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Topics Modal */}
      {isManageTopicsOpen && (
        <div className="fixed inset-0 z-50 bg-[#201E19]/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#EFE8D5] border-2 border-[#766E5F] rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative">
            <button
              onClick={() => setIsManageTopicsOpen(false)}
              className="absolute top-4 right-4 p-1 rounded hover:bg-[#766E5F]/10 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h3 className="font-serif font-bold text-2xl text-[#201E19] mb-1">
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
                className="bg-[#DFD5BC] border border-[#766E5F]/30 rounded-lg px-3 py-1.5 text-xs flex-1 focus:outline-none focus:border-[#766E5F]"
              />
              <button
                onClick={handleAddTopic}
                className="bg-[#201E19] text-[#E8DFC8] text-xs font-semibold px-4 py-1.5 rounded-lg hover:bg-[#2A2A2A] cursor-pointer"
              >
                Add
              </button>
            </div>

            <div className="space-y-2 mb-6 max-h-60 overflow-y-auto">
              {userTopics.map((topic) => (
                <div
                  key={topic}
                  className="flex items-center justify-between p-2 rounded-lg bg-[#DFD5BC] text-xs font-mono"
                >
                  <span>{topic}</span>
                  <button
                    onClick={() => handleRemoveTopic(topic)}
                    className="text-[#9F3028] hover:underline cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setIsManageTopicsOpen(false)}
              className="w-full bg-[#201E19] text-[#E8DFC8] text-xs font-semibold py-2 rounded-lg hover:bg-[#2A2A2A] cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Upgraded Instagram-Inspired Social Account Profile Dossier Modal */}
      <AccountProfileModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        user={currentUser}
        onLogout={onLogout}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setIsLoginOpen(false);
        }}
        onOpenArticle={onOpenArticle}
        onUpdateUser={(updated) => {
          if (onUpdateUser) onUpdateUser(updated);
          setCurrentUser((prev) => ({ ...prev, ...updated }));
        }}
        savedClippings={safeClippings}
        readingHistory={safeReadingHistory}
        unreadNotificationsCount={liveNotifications.filter((n) => n.unread).length}
        onFollowToggle={() => {
          loadDiscoverUsers();
          loadUserFollows();
        }}
      />

      {/* Editorial Press Verification Modal */}
      <VerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        onVerificationUpdated={loadVerificationStatus}
      />

      {/* Instagram-Style User Profile Dossier Modal */}
      <UserProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        usernameOrId={selectedProfileUsername}
        currentUser={user}
        onFollowToggle={() => {
          loadDiscoverUsers();
          loadUserFollows();
        }}
        onDeleteUser={(targetUser) => {
          setIsProfileModalOpen(false);
          handleDeleteUser(targetUser);
        }}
      />
    </div>
  );
}
