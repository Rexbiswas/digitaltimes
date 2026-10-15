"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  UserCheck,
  Plus,
  Users,
  Calendar,
  Bookmark,
  History,
  Bell,
  Settings,
  LogOut,
  Newspaper,
  ShieldCheck,
  ArrowLeft,
  Search,
  ExternalLink,
  Edit3,
  Check,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import {
  fetchCurrentUserProfileApi,
  updateCurrentUserProfileApi,
  fetchUserFollowersApi,
  fetchUserFollowsApi,
  followTargetApi,
  unfollowTargetApi,
} from "../services/api";
import { getFrontendSocket } from "../services/socket";

// The 10 Official Broadsheet Editorial Desks
const EDITORIAL_DESKS = [
  { id: "frontpage", label: "Front Page", desc: "Lead investigations & breaking dispatches" },
  { id: "ai", label: "The AI Desk", desc: "Frontier reasoning, autonomous models & cognition" },
  { id: "web", label: "Web Dev Desk", desc: "Local-first runtimes, WebAssembly, browser architecture" },
  { id: "startups", label: "Startups Desk", desc: "Venture capital, seed rounds & autonomous founders" },
  { id: "design", label: "Editorial Design Desk", desc: "Typography, broadsheet aesthetics & layout systems" },
  { id: "security", label: "Security Desk", desc: "Cryptography, zero-day research & defensive meshes" },
  { id: "gaming", label: "Gaming & Simulation Desk", desc: "Spatial engines, graphics pipelines & virtual physics" },
  { id: "culture", label: "Internet Culture Desk", desc: "Network sociology & computational philosophy" },
  { id: "business", label: "Markets & Business Desk", desc: "Compute commodities, data vault financing & macro" },
  { id: "future", label: "Future & Science Desk", desc: "Quantum links, biocomputing & experimental physics" },
];

export default function AccountProfileModal({
  isOpen,
  onClose,
  user,
  onLogout,
  onNavigateTab,
  onOpenArticle,
  onUpdateUser,
  savedClippings = [],
  readingHistory = [],
  unreadNotificationsCount = 0,
  onFollowToggle,
}) {
  const [activeView, setActiveView] = useState("overview"); // "overview" | "followers" | "following" | "desks" | "edit_bio"
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Sub-lists state
  const [followersList, setFollowersList] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [deskSubscriptions, setDeskSubscriptions] = useState([]);
  const [isLoadingSublist, setIsLoadingSublist] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Bio Editing State
  const [bioInput, setBioInput] = useState("");
  const [isSavingBio, setIsSavingBio] = useState(false);

  // Helper for user initials monogram
  const getInitials = (name) => {
    if (!name) return "DT";
    const clean = name.trim().replace(/@.*/, "");
    const parts = clean.split(/[\s._-]+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return clean.slice(0, 2).toUpperCase();
  };

  // Authoritative load of authenticated profile data from backend
  const loadProfile = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const data = await fetchCurrentUserProfileApi();
      if (data) {
        setProfileData(data);
        setBioInput(data.bio || "");
        if (Array.isArray(data.deskSubscriptions)) {
          setDeskSubscriptions(data.deskSubscriptions.map((d) => d.id || d.targetId));
        }
      }
    } catch (err) {
      console.error("Failed to load user profile:", err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  // Initial load when modal opens
  useEffect(() => {
    if (!isOpen) return;
    setActiveView("overview");
    setSearchQuery("");
    loadProfile(true);
  }, [isOpen, loadProfile]);

  // Real-time socket sync
  useEffect(() => {
    if (!isOpen) return;
    const socket = getFrontendSocket();
    if (!socket) return;

    const handleFollowUpdated = () => {
      loadProfile(false);
    };

    socket.on("FOLLOW_UPDATED", handleFollowUpdated);
    socket.on("NOTIFICATION_RECEIVED", handleFollowUpdated);

    return () => {
      socket.off("FOLLOW_UPDATED", handleFollowUpdated);
      socket.off("NOTIFICATION_RECEIVED", handleFollowUpdated);
    };
  }, [isOpen, loadProfile]);

  // Load sub-lists when switching tabs
  useEffect(() => {
    if (!isOpen) return;

    if (activeView === "followers") {
      setIsLoadingSublist(true);
      const userId = profileData?._id || profileData?.id || user?.id || user?._id;
      if (userId) {
        fetchUserFollowersApi(userId)
          .then((res) => {
            if (res && res.data) {
              setFollowersList(res.data);
            }
          })
          .catch(console.error)
          .finally(() => setIsLoadingSublist(false));
      } else {
        setIsLoadingSublist(false);
      }
    } else if (activeView === "following") {
      setIsLoadingSublist(true);
      fetchUserFollowsApi({ targetType: "user" })
        .then((res) => {
          if (res && (res.users || res.data)) {
            setFollowingList(res.users || res.data);
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingSublist(false));
    } else if (activeView === "desks") {
      setIsLoadingSublist(true);
      fetchUserFollowsApi({ targetType: "desk" })
        .then((res) => {
          if (res && (res.desks || res.data)) {
            const deskItems = res.desks || res.data;
            setDeskSubscriptions(deskItems.map((d) => (d.targetId || d.id || "").toLowerCase()));
          }
        })
        .catch(console.error)
        .finally(() => setIsLoadingSublist(false));
    }
  }, [activeView, isOpen, profileData, user]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        if (activeView !== "overview") {
          setActiveView("overview");
        } else {
          onClose();
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, activeView, onClose]);

  if (!isOpen) return null;

  // Resolved user metrics from authoritative backend response with fallbacks
  const currentUser = profileData || user || {};
  const isOfficial =
    currentUser.accountType === "official_brand" ||
    currentUser.username?.toLowerCase() === "thedigitaltimes";

  const isVerified =
    isOfficial ||
    currentUser.isVerified === true ||
    currentUser.verification?.status === "verified";

  const followerCount = profileData?.followerCount ?? 0;
  const followingCount = profileData?.followingCount ?? 0;
  const deskCount =
    profileData?.deskSubscriptionsCount ??
    (deskSubscriptions?.length || (profileData?.deskSubscriptions?.length ?? 0));
  const clippingsCount =
    profileData?.savedClippingsCount ?? savedClippings?.length ?? 0;
  const readCount =
    profileData?.readingHistoryCount ?? readingHistory?.length ?? 0;
  const unreadAlerts =
    profileData?.unreadNotificationsCount ?? unreadNotificationsCount ?? 0;

  // Account creation date formatting
  const formattedCreationDate = currentUser.createdAt
    ? new Date(currentUser.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "October 2026";

  // Subscription Details
  const subscriptionPlan =
    currentUser.subscription?.plan || "Annual Broadsheet";
  const subscriptionStatus =
    currentUser.subscription?.status || "Active";
  const renewsDate = currentUser.subscription?.renewsAt
    ? new Date(currentUser.subscription.renewsAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  // Toggle follow on a user inside the followers/following list
  const handleToggleFollowUser = async (targetUser) => {
    const targetUserId = targetUser.id || targetUser._id || targetUser.targetId;
    const isCurrentlyFollowing = targetUser.isFollowing;

    // Optimistic UI updates
    setFollowingList((prev) =>
      isCurrentlyFollowing
        ? prev.filter((u) => (u.id || u._id || u.targetId) !== targetUserId)
        : [...prev, { ...targetUser, isFollowing: true }]
    );

    setFollowersList((prev) =>
      prev.map((u) => {
        if ((u.id || u._id || u.targetId) === targetUserId) {
          return { ...u, isFollowing: !isCurrentlyFollowing };
        }
        return u;
      })
    );

    try {
      if (isCurrentlyFollowing) {
        await unfollowTargetApi(targetUserId, "user");
      } else {
        await followTargetApi({
          targetType: "user",
          targetId: targetUserId,
          targetName: targetUser.name || targetUser.targetName,
        });
      }
      loadProfile(false);
      onFollowToggle?.();
    } catch (e) {
      console.error("Follow toggle failed:", e);
      loadProfile(false);
    }
  };

  // Toggle desk subscription
  const handleToggleDeskSubscription = async (desk) => {
    const isSubscribed = deskSubscriptions.includes(desk.id.toLowerCase());

    // Optimistic UI
    setDeskSubscriptions((prev) =>
      isSubscribed
        ? prev.filter((id) => id !== desk.id.toLowerCase())
        : [...prev, desk.id.toLowerCase()]
    );

    try {
      if (isSubscribed) {
        await unfollowTargetApi(desk.id.toLowerCase(), "desk");
      } else {
        await followTargetApi({
          targetType: "desk",
          targetId: desk.id.toLowerCase(),
          targetName: desk.label,
          targetDesk: desk.id.toUpperCase(),
        });
      }
      loadProfile(false);
      onFollowToggle?.();
    } catch (e) {
      console.error("Failed to toggle desk subscription:", e);
      loadProfile(false);
    }
  };

  // Save updated bio
  const handleSaveBio = async () => {
    setIsSavingBio(true);
    try {
      const res = await updateCurrentUserProfileApi({ bio: bioInput.trim() });
      if (res && res.success) {
        setProfileData((prev) => ({ ...prev, bio: bioInput.trim() }));
        onUpdateUser?.({ bio: bioInput.trim() });
        setActiveView("overview");
      }
    } catch (err) {
      console.error("Failed to save bio:", err);
    } finally {
      setIsSavingBio(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#201E19]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#E8DFC8] border-2 border-[#201E19] shadow-2xl rounded-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="account-panel-title"
      >
        {/* ── Broadsheet Top Editorial Header Bar ── */}
        <div className="bg-[#201E19] text-[#E8DFC8] px-5 py-3 flex items-center justify-between border-b border-[#766E5F] shrink-0">
          <div className="flex items-center gap-2">
            {activeView !== "overview" ? (
              <button
                type="button"
                onClick={() => setActiveView("overview")}
                className="text-[#DFD6BD] hover:text-white flex items-center gap-1 text-xs font-mono font-semibold transition-colors cursor-pointer mr-1"
                aria-label="Back to Account Overview"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Overview</span>
              </button>
            ) : (
              <Newspaper className="w-4 h-4 text-[#C2A649]" />
            )}
            <h2
              id="account-panel-title"
              className="font-mono text-xs uppercase tracking-widest font-semibold text-[#DFD6BD]"
            >
              {activeView === "overview" && "Broadsheet Account Dossier"}
              {activeView === "followers" && "Subscriber Followers"}
              {activeView === "following" && "Accounts You Follow"}
              {activeView === "desks" && "Editorial Desk Subscriptions"}
              {activeView === "edit_bio" && "Edit Broadsheet Bio"}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => loadProfile(false)}
              disabled={isRefreshing}
              className={`text-[#DFD6BD] hover:text-white p-1 rounded transition-colors cursor-pointer ${
                isRefreshing ? "animate-spin" : ""
              }`}
              title="Refresh Registry Data"
              aria-label="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-[#DFD6BD] hover:text-white p-1 rounded transition-colors cursor-pointer"
              aria-label="Close Account Panel"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Scrollable Body Area ── */}
        <div className="p-5 overflow-y-auto no-scrollbar flex-1 bg-[#E8DFC8]">
          {/* ─────────────────────────────────────────────────── */}
          {/* VIEW 1: OVERVIEW (The Core Instagram-Style Panel) */}
          {/* ─────────────────────────────────────────────────── */}
          {activeView === "overview" && (
            <div className="flex flex-col gap-4 text-center">
              {/* Profile Header Block */}
              <div className="flex flex-col items-center">
                {/* Vintage Circular Avatar with Double Ring */}
                <div className="relative w-20 h-20 rounded-full border-2 border-[#766E5F] ring-2 ring-[#C5A059]/40 ring-offset-2 ring-offset-[#E8DFC8] bg-[#201E19] flex items-center justify-center shadow-md mb-2 overflow-hidden">
                  {currentUser.avatar ? (
                    <img
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="font-serif font-bold text-2xl text-[#E8DFC8] select-none tracking-widest">
                      {getInitials(currentUser.name)}
                    </span>
                  )}
                </div>

                {/* Display Name + Verified Badge */}
                <div className="flex items-center justify-center gap-1.5 flex-wrap">
                  <h3 className="font-serif font-bold text-xl text-[#201E19] leading-tight">
                    {currentUser.name}
                  </h3>
                  {isVerified && (
                    <VerifiedBadge
                      category={isOfficial ? "publication" : "journalist"}
                      size="sm"
                    />
                  )}
                </div>

                {/* Unique Username & Email */}
                <div className="flex items-center justify-center gap-1.5 text-xs font-mono text-[#666666] mt-0.5">
                  <span className="font-semibold text-[#201E19]">
                    @{currentUser.username || "subscriber"}
                  </span>
                  <span>•</span>
                  <span>{currentUser.email}</span>
                </div>

                {/* Account Type Pill */}
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="inline-block bg-[#201E19] text-[#E8DFC8] text-[9px] font-mono px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-xs">
                    {isOfficial
                      ? "Official Brand Account"
                      : currentUser.accountType === "journalist"
                      ? "Staff Journalist"
                      : currentUser.role === "editor"
                      ? "Editor Desk"
                      : "Registered Reader"}
                  </span>
                  <span className="text-[10px] font-mono text-[#766E5F] italic">
                    Member since {formattedCreationDate}
                  </span>
                </div>

                {/* Bio Snippet (Interactive click to edit) */}
                <div
                  onClick={() => setActiveView("edit_bio")}
                  className="mt-3 w-full text-xs font-sans text-[#39352D] leading-relaxed italic bg-[#EFE8D5] hover:bg-[#EAE4D6] p-2.5 rounded-xl border border-[#766E5F]/20 cursor-pointer transition-colors text-left flex items-start justify-between gap-2 group"
                  title="Click to update your broadsheet bio"
                >
                  <p className="line-clamp-2">
                    {currentUser.bio || "No telegraph bio published yet. Click to write your broadsheet dispatch."}
                  </p>
                  <Edit3 className="w-3.5 h-3.5 text-[#766E5F] opacity-50 group-hover:opacity-100 shrink-0 mt-0.5" />
                </div>
              </div>

              {/* ───────────────────────────────────────────────── */}
              {/* SOCIAL STATISTICS BAR (3 Interactive Instagram Stats) */}
              {/* ───────────────────────────────────────────────── */}
              <div className="grid grid-cols-3 gap-2 bg-[#EFE8D5] border border-[#766E5F]/25 rounded-xl p-2.5 shadow-xs">
                {/* Stat 1: Followers */}
                <button
                  type="button"
                  onClick={() => setActiveView("followers")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-[#E8DFC8] transition-colors cursor-pointer group"
                >
                  <span className="font-serif font-bold text-lg text-[#201E19] group-hover:text-[#9F3028] transition-colors">
                    {isLoading ? "—" : followerCount}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] font-semibold flex items-center gap-1">
                    <Users className="w-2.5 h-2.5" />
                    <span>Followers</span>
                  </span>
                </button>

                {/* Stat 2: Following */}
                <button
                  type="button"
                  onClick={() => setActiveView("following")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-[#E8DFC8] transition-colors cursor-pointer border-x border-[#766E5F]/20 group"
                >
                  <span className="font-serif font-bold text-lg text-[#201E19] group-hover:text-[#9F3028] transition-colors">
                    {isLoading ? "—" : followingCount}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] font-semibold flex items-center gap-1">
                    <UserCheck className="w-2.5 h-2.5" />
                    <span>Following</span>
                  </span>
                </button>

                {/* Stat 3: Editorial Subscriptions */}
                <button
                  type="button"
                  onClick={() => setActiveView("desks")}
                  className="flex flex-col items-center justify-center p-2 rounded-lg hover:bg-[#E8DFC8] transition-colors cursor-pointer group"
                >
                  <span className="font-serif font-bold text-lg text-[#201E19] group-hover:text-[#9F3028] transition-colors">
                    {isLoading ? "—" : deskCount}
                  </span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#666666] font-semibold flex items-center gap-1">
                    <Newspaper className="w-2.5 h-2.5" />
                    <span>Desks</span>
                  </span>
                </button>
              </div>

              {/* ───────────────────────────────────────────────── */}
              {/* ACCOUNT TELEMETRY & ACTIVITY METRICS */}
              {/* ───────────────────────────────────────────────── */}
              <div className="border-t border-[#766E5F]/20 pt-3 flex flex-col gap-2 text-left text-xs font-mono">
                {/* Membership / Subscription Plan */}
                <div className="flex items-center justify-between py-1.5 border-b border-[#766E5F]/15">
                  <span className="text-[#666666] flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#C2A649]" />
                    <span>Membership</span>
                  </span>
                  <div className="text-right">
                    <span className="font-bold text-[#201E19] block">
                      {subscriptionPlan}
                    </span>
                    {renewsDate && (
                      <span className="text-[9px] text-[#777777] block">
                        Renews {renewsDate}
                      </span>
                    )}
                  </div>
                </div>

                {/* Clippings Saved */}
                <div
                  onClick={() => onNavigateTab?.("bookmarks")}
                  className="flex items-center justify-between py-1.5 border-b border-[#766E5F]/15 hover:bg-[#EFE8D5] px-1 rounded transition-colors cursor-pointer group"
                >
                  <span className="text-[#666666] flex items-center gap-1.5 group-hover:text-[#201E19]">
                    <Bookmark className="w-3.5 h-3.5 text-[#9F3028]" />
                    <span>Saved Clippings</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[#201E19] text-sm">
                      {clippingsCount}
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#777777] group-hover:text-[#201E19]" />
                  </div>
                </div>

                {/* Reading History Activity */}
                <div
                  onClick={() => onNavigateTab?.("history")}
                  className="flex items-center justify-between py-1.5 border-b border-[#766E5F]/15 hover:bg-[#EFE8D5] px-1 rounded transition-colors cursor-pointer group"
                >
                  <span className="text-[#666666] flex items-center gap-1.5 group-hover:text-[#201E19]">
                    <History className="w-3.5 h-3.5 text-[#39352D]" />
                    <span>Reading Activity</span>
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="font-bold text-[#201E19] text-sm">
                      {readCount} read
                    </span>
                    <ExternalLink className="w-3 h-3 text-[#777777] group-hover:text-[#201E19]" />
                  </div>
                </div>

                {/* Notification Telemetry */}
                <div
                  onClick={() => onNavigateTab?.("notifications")}
                  className="flex items-center justify-between py-1.5 border-b border-[#766E5F]/15 hover:bg-[#EFE8D5] px-1 rounded transition-colors cursor-pointer group"
                >
                  <span className="text-[#666666] flex items-center gap-1.5 group-hover:text-[#201E19]">
                    <Bell className="w-3.5 h-3.5 text-[#C2A649]" />
                    <span>Telegraph Wire Alerts</span>
                  </span>
                  <div className="flex items-center gap-1">
                    {unreadAlerts > 0 ? (
                      <span className="bg-[#9F3028] text-[#E8DFC8] text-[9px] font-bold px-2 py-0.5 rounded-full">
                        {unreadAlerts} new
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#777777]">Up to date</span>
                    )}
                    <ExternalLink className="w-3 h-3 text-[#777777] group-hover:text-[#201E19]" />
                  </div>
                </div>

                {/* Account Preferences Shortcut */}
                <div
                  onClick={() => onNavigateTab?.("settings")}
                  className="flex items-center justify-between py-1.5 hover:bg-[#EFE8D5] px-1 rounded transition-colors cursor-pointer group"
                >
                  <span className="text-[#666666] flex items-center gap-1.5 group-hover:text-[#201E19]">
                    <Settings className="w-3.5 h-3.5 text-[#39352D]" />
                    <span>Preferences & Security</span>
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#777777] group-hover:text-[#201E19]" />
                </div>
              </div>

              {/* ───────────────────────────────────────────────── */}
              {/* MODAL BOTTOM ACTIONS */}
              {/* ───────────────────────────────────────────────── */}
              <div className="flex flex-col gap-2 mt-2 pt-2 border-t border-[#766E5F]/20">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout?.();
                  }}
                  className="w-full border border-[#9F3028] text-[#9F3028] hover:bg-[#9F3028] hover:text-[#E8DFC8] text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 font-mono uppercase tracking-wider shadow-xs"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out / Switch Account</span>
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full bg-[#201E19] text-[#E8DFC8] hover:bg-[#2A2A2A] text-xs font-semibold py-2.5 rounded-xl transition-colors cursor-pointer font-mono uppercase tracking-wider shadow-xs"
                >
                  Close Dossier
                </button>
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────── */}
          {/* VIEW 2: FOLLOWERS SUB-VIEW */}
          {/* ─────────────────────────────────────────────────── */}
          {activeView === "followers" && (
            <div className="flex flex-col gap-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#766E5F]" />
                <input
                  type="text"
                  placeholder="Search followers by name or @username..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#EFE8D5] border border-[#766E5F]/30 rounded-lg text-[#201E19] focus:outline-none focus:border-[#201E19] font-mono"
                />
              </div>

              {isLoadingSublist ? (
                <div className="space-y-2 py-4">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-14 bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : followersList.length === 0 ? (
                <div className="bg-[#EFE8D5] border border-dashed border-[#766E5F]/30 rounded-xl p-6 text-center">
                  <Users className="w-8 h-8 text-[#888888] mx-auto mb-2 opacity-50" />
                  <p className="font-serif text-base text-[#39352D]">No subscribers following you yet</p>
                  <p className="text-xs text-[#777777] font-mono mt-1">
                    When other broadsheet readers connect with your dispatches, they will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[55vh] overflow-y-auto no-scrollbar">
                  {followersList
                    .filter((f) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      return (
                        f.name?.toLowerCase().includes(q) ||
                        f.username?.toLowerCase().includes(q)
                      );
                    })
                    .map((follower) => {
                      return (
                        <div
                          key={follower.id || follower._id}
                          className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-[#766E5F]/50 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[#201E19] text-[#E8DFC8] flex items-center justify-center font-serif text-xs font-bold shrink-0">
                              {follower.avatar ? (
                                <img
                                  src={follower.avatar}
                                  alt={follower.name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                (follower.name || "S").charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0 text-left">
                              <div className="flex items-center gap-1">
                                <span className="font-serif font-bold text-xs text-[#201E19] truncate">
                                  {follower.name}
                                </span>
                                {follower.isVerified && (
                                  <VerifiedBadge category="journalist" size="sm" />
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
                            className={`text-[11px] px-3 py-1 rounded-md font-semibold font-mono flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                              follower.isFollowing
                                ? "bg-[#201E19] text-[#E8DFC8] hover:bg-[#9F3028]"
                                : "border border-[#201E19] text-[#201E19] hover:bg-[#201E19] hover:text-[#E8DFC8]"
                            }`}
                          >
                            {follower.isFollowing ? (
                              <>
                                <UserCheck className="w-3 h-3" />
                                <span>Following</span>
                              </>
                            ) : (
                              <>
                                <Plus className="w-3 h-3" />
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

          {/* ─────────────────────────────────────────────────── */}
          {/* VIEW 3: FOLLOWING SUB-VIEW */}
          {/* ─────────────────────────────────────────────────── */}
          {activeView === "following" && (
            <div className="flex flex-col gap-3">
              {/* Search Box */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#766E5F]" />
                <input
                  type="text"
                  placeholder="Search accounts you follow..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#EFE8D5] border border-[#766E5F]/30 rounded-lg text-[#201E19] focus:outline-none focus:border-[#201E19] font-mono"
                />
              </div>

              {isLoadingSublist ? (
                <div className="space-y-2 py-4">
                  {[1, 2, 3].map((n) => (
                    <div
                      key={n}
                      className="h-14 bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
              ) : followingList.length === 0 ? (
                <div className="bg-[#EFE8D5] border border-dashed border-[#766E5F]/30 rounded-xl p-6 text-center">
                  <UserCheck className="w-8 h-8 text-[#888888] mx-auto mb-2 opacity-50" />
                  <p className="font-serif text-base text-[#39352D]">You are not following any subscribers yet</p>
                  <p className="text-xs text-[#777777] font-mono mt-1">
                    Discover broadsheet readers and journalists on the Following page.
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-[55vh] overflow-y-auto no-scrollbar">
                  {followingList
                    .filter((f) => {
                      if (!searchQuery) return true;
                      const q = searchQuery.toLowerCase();
                      const name = f.name || f.targetName || "";
                      const username = f.username || "";
                      return (
                        name.toLowerCase().includes(q) ||
                        username.toLowerCase().includes(q)
                      );
                    })
                    .map((item) => {
                      const name = item.name || item.targetName;
                      const username = item.username || "subscriber";
                      return (
                        <div
                          key={item.id || item._id || item.targetId}
                          className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-[#766E5F]/50 transition-all"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-[#201E19] text-[#E8DFC8] flex items-center justify-center font-serif text-xs font-bold shrink-0">
                              {item.avatar ? (
                                <img
                                  src={item.avatar}
                                  alt={name}
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                (name || "S").charAt(0).toUpperCase()
                              )}
                            </div>
                            <div className="min-w-0 text-left">
                              <div className="flex items-center gap-1">
                                <span className="font-serif font-bold text-xs text-[#201E19] truncate">
                                  {name}
                                </span>
                                {item.isVerified && (
                                  <VerifiedBadge category="journalist" size="sm" />
                                )}
                              </div>
                              <span className="text-[10px] font-mono text-[#666666] block truncate">
                                @{username}
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              handleToggleFollowUser({
                                ...item,
                                id: item.targetId || item.id || item._id,
                                isFollowing: true,
                              })
                            }
                            className="text-[11px] px-3 py-1 rounded-md font-semibold font-mono bg-[#201E19] text-[#E8DFC8] hover:bg-[#9F3028] transition-colors cursor-pointer shrink-0 flex items-center gap-1"
                          >
                            <UserCheck className="w-3 h-3" />
                            <span>Following</span>
                          </button>
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}

          {/* ─────────────────────────────────────────────────── */}
          {/* VIEW 4: EDITORIAL DESKS SUB-VIEW */}
          {/* ─────────────────────────────────────────────────── */}
          {activeView === "desks" && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[#555555] font-serif italic text-left">
                Subscribe to broadsheet newsroom desks to curate your personal dispatch wire.
              </p>

              <div className="space-y-2 max-h-[55vh] overflow-y-auto no-scrollbar">
                {EDITORIAL_DESKS.map((desk) => {
                  const isSubscribed = deskSubscriptions.includes(desk.id.toLowerCase());

                  return (
                    <div
                      key={desk.id}
                      className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-xl p-3 flex items-center justify-between gap-3 hover:border-[#766E5F]/50 transition-all text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-serif font-bold text-xs text-[#201E19]">
                            {desk.label}
                          </h4>
                          {isSubscribed && (
                            <span className="text-[9px] font-mono bg-[#201E19] text-[#E8DFC8] px-1.5 py-0.2 rounded font-bold uppercase">
                              Subscribed
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-[#666666] font-mono mt-0.5 line-clamp-1">
                          {desk.desc}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleToggleDeskSubscription(desk)}
                        className={`text-[11px] px-3 py-1 rounded-md font-semibold font-mono flex items-center gap-1 transition-colors cursor-pointer shrink-0 ${
                          isSubscribed
                            ? "bg-[#201E19] text-[#E8DFC8] hover:bg-[#9F3028]"
                            : "border border-[#201E19] text-[#201E19] hover:bg-[#201E19] hover:text-[#E8DFC8]"
                        }`}
                      >
                        {isSubscribed ? (
                          <>
                            <Check className="w-3 h-3" />
                            <span>Active</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            <span>Subscribe</span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ─────────────────────────────────────────────────── */}
          {/* VIEW 5: EDIT BIO SUB-VIEW */}
          {/* ─────────────────────────────────────────────────── */}
          {activeView === "edit_bio" && (
            <div className="flex flex-col gap-3 text-left">
              <label className="text-xs font-mono font-bold uppercase text-[#201E19] tracking-wider">
                Telegraph Bio
              </label>
              <textarea
                value={bioInput}
                onChange={(e) => setBioInput(e.target.value)}
                maxLength={300}
                rows={4}
                placeholder="Write your broadsheet editorial bio or reading interests..."
                className="w-full p-3 text-xs bg-[#EFE8D5] border border-[#766E5F]/40 rounded-xl text-[#201E19] focus:outline-none focus:border-[#201E19] font-sans leading-relaxed"
              />
              <div className="flex items-center justify-between text-[10px] font-mono text-[#777777]">
                <span>Max 300 characters</span>
                <span>{bioInput.length} / 300</span>
              </div>

              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  disabled={isSavingBio}
                  onClick={handleSaveBio}
                  className="flex-1 bg-[#201E19] text-[#E8DFC8] hover:bg-[#333333] text-xs font-semibold font-mono uppercase tracking-wider py-2 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5 shadow-xs"
                >
                  {isSavingBio ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Dispatch</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveView("overview")}
                  className="px-4 py-2 bg-[#EFE8D5] border border-[#766E5F]/30 text-[#39352D] hover:bg-[#EAE4D6] text-xs font-mono font-semibold uppercase tracking-wider rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
