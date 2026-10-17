"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  UserCheck,
  Plus,
  Calendar,
  ShieldCheck,
  Newspaper,
  Trash2,
  MoreVertical,
  Ban,
  Unlock,
  AlertTriangle,
  Lock,
} from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import {
  fetchUserProfileApi,
  fetchUserFollowersApi,
  fetchUserFollowingApi,
  followTargetApi,
  unfollowTargetApi,
  blockUserApi,
  unblockUserApi,
} from "../services/api";

export default function UserProfileModal({
  isOpen,
  onClose,
  usernameOrId,
  currentUser,
  onFollowToggle,
  onDeleteUser,
  onBlockToggle,
}) {
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "followers" | "following"
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isMutating, setIsMutating] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [hasBlockedYou, setHasBlockedYou] = useState(false);
  const [showActionMenu, setShowActionMenu] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  useEffect(() => {
    if (!isOpen || !usernameOrId) return;

    let mounted = true;
    setIsLoading(true);
    setActiveTab("overview");
    setShowActionMenu(false);
    setShowBlockConfirm(false);
    setActionError(null);
    setActionSuccess(null);

    async function loadData() {
      try {
        const data = await fetchUserProfileApi(usernameOrId);
        if (mounted && data) {
          setProfile(data);
          setIsFollowing(!!data.isFollowing);
          setFollowerCount(data.followerCount || 0);
          setFollowingCount(data.followingCount || 0);
          setIsBlocked(!!data.isBlocked);
          setHasBlockedYou(!!data.hasBlockedYou);
        }
      } catch (err) {
        console.error("Failed to load user profile:", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      mounted = false;
    };
  }, [isOpen, usernameOrId]);

  // Load followers or following when switching tabs
  useEffect(() => {
    if (!isOpen || !profile || isBlocked || hasBlockedYou) return;

    let mounted = true;
    if (activeTab === "followers") {
      setIsLoadingList(true);
      fetchUserFollowersApi(profile.id || profile._id)
        .then((res) => {
          if (mounted && res?.success) setFollowers(res.data || []);
        })
        .finally(() => {
          if (mounted) setIsLoadingList(false);
        });
    } else if (activeTab === "following") {
      setIsLoadingList(true);
      fetchUserFollowingApi(profile.id || profile._id)
        .then((res) => {
          if (mounted && res?.success) setFollowing(res.data || []);
        })
        .finally(() => {
          if (mounted) setIsLoadingList(false);
        });
    }

    return () => {
      mounted = false;
    };
  }, [activeTab, isOpen, profile, isBlocked, hasBlockedYou]);

  if (!isOpen) return null;

  const isSelf =
    currentUser &&
    profile &&
    (currentUser.id === profile.id ||
      currentUser.id === profile._id ||
      currentUser._id === profile.id ||
      currentUser._id === profile._id ||
      currentUser.username === profile.username);

  const isOfficial =
    profile &&
    (profile.accountType === "official_brand" ||
      profile.username === "thedigitaltimes");

  const handleToggleFollow = async () => {
    if (!profile || isMutating || isSelf || isBlocked || hasBlockedYou) return;

    setIsMutating(true);
    setActionError(null);
    const newStatus = !isFollowing;
    setIsFollowing(newStatus);
    setFollowerCount((prev) => (newStatus ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (newStatus) {
        const res = await followTargetApi({
          targetType: "user",
          targetId: profile.id || profile._id,
          targetName: profile.name,
        });
        if (res?.error) {
          throw new Error(res.error);
        }
      } else {
        const res = await unfollowTargetApi(profile.id || profile._id, "user");
        if (res?.error) {
          throw new Error(res.error);
        }
      }
      if (onFollowToggle) {
        onFollowToggle(profile, newStatus);
      }
    } catch (err) {
      // Revert on failure
      setIsFollowing(!newStatus);
      setFollowerCount((prev) => (!newStatus ? prev + 1 : Math.max(0, prev - 1)));
      setActionError(err.message || "Failed to update subscription status.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleBlockUser = async () => {
    if (!profile || isMutating || isSelf || isOfficial) return;
    setIsMutating(true);
    setActionError(null);

    try {
      const res = await blockUserApi(profile.id || profile._id);
      if (res?.error) {
        throw new Error(res.error);
      }

      setIsBlocked(true);
      setIsFollowing(false);
      setShowBlockConfirm(false);
      setShowActionMenu(false);
      setActionSuccess(`Subscriber @${profile.username} has been blocked.`);

      if (onBlockToggle) {
        onBlockToggle(profile, true);
      }
      if (onFollowToggle) {
        onFollowToggle(profile, false);
      }
    } catch (err) {
      setActionError(err.message || "Unable to block account. Please retry.");
    } finally {
      setIsMutating(false);
    }
  };

  const handleUnblockUser = async () => {
    if (!profile || isMutating || isSelf) return;
    setIsMutating(true);
    setActionError(null);

    try {
      const res = await unblockUserApi(profile.id || profile._id);
      if (res?.error) {
        throw new Error(res.error);
      }

      setIsBlocked(false);
      setShowActionMenu(false);
      setActionSuccess(`Subscriber @${profile.username} has been unblocked.`);

      if (onBlockToggle) {
        onBlockToggle(profile, false);
      }
    } catch (err) {
      setActionError(err.message || "Unable to unblock account. Please retry.");
    } finally {
      setIsMutating(false);
    }
  };

  const formattedDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : "Archive Record";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#E8DFC8] border-2 border-[#201E19] shadow-2xl rounded-lg overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => {
          e.stopPropagation();
          setShowActionMenu(false);
        }}
      >
        {/* Vintage Top Broadsheet Header */}
        <div className="bg-[#201E19] text-[#E8DFC8] px-5 py-3 flex items-center justify-between border-b border-[#766E5F]">
          <div className="flex items-center gap-2">
            <Newspaper className="w-4 h-4 text-[#C2A649]" />
            <span className="font-mono text-xs uppercase tracking-widest font-semibold text-[#DFD6BD]">
              Subscriber Registry Dossier
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-[#DFD6BD] hover:text-white p-1 rounded transition-colors cursor-pointer"
            aria-label="Close Profile"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div className="p-8 flex flex-col items-center justify-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[#DFD6BD] border border-[#766E5F]/30 animate-pulse" />
            <div className="w-48 h-5 bg-[#DFD6BD] rounded animate-pulse" />
            <div className="w-32 h-4 bg-[#DFD6BD] rounded animate-pulse" />
          </div>
        ) : !profile ? (
          <div className="p-8 text-center text-[#555555]">
            <p className="font-serif text-lg text-[#201E19]">Subscriber Not Found</p>
            <p className="text-xs font-mono mt-1">This record does not exist in the broadsheet database.</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto">
            {/* Action Feedback Messages */}
            {actionError && (
              <div className="bg-[#9F3028]/10 border-b border-[#9F3028]/30 px-4 py-2 text-xs font-mono text-[#9F3028] flex items-center justify-between">
                <span>{actionError}</span>
                <button
                  type="button"
                  onClick={() => setActionError(null)}
                  className="text-[#9F3028] font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}
            {actionSuccess && (
              <div className="bg-emerald-900/10 border-b border-emerald-800/30 px-4 py-2 text-xs font-mono text-emerald-800 flex items-center justify-between">
                <span>{actionSuccess}</span>
                <button
                  type="button"
                  onClick={() => setActionSuccess(null)}
                  className="text-emerald-800 font-bold ml-2 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Profile Overview Card */}
            <div className="p-6 border-b border-[#766E5F]/20 bg-[#EFE8D5]">
              <div className="flex items-start gap-4">
                {/* Monogram / Avatar */}
                <div className="w-16 h-16 rounded-full bg-[#201E19] text-[#E8DFC8] border-2 border-[#C2A649] flex items-center justify-center font-serif text-2xl font-bold shrink-0 shadow-sm">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    profile.name.charAt(0).toUpperCase()
                  )}
                </div>

                {/* Profile Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h3 className="font-serif font-bold text-xl text-[#201E19] truncate">
                      {profile.name}
                    </h3>
                    {profile.isVerified && (
                      <VerifiedBadge
                        category={
                          profile.verification?.category ||
                          (profile.accountType === "official_brand" ? "publication" : "journalist")
                        }
                        size="md"
                      />
                    )}
                  </div>

                  <p className="text-xs font-mono text-[#666666]">
                    @{profile.username}
                  </p>

                  {/* Account Type Badge */}
                  <div className="mt-2 flex items-center gap-2 flex-wrap">
                    {profile.accountType === "official_brand" ? (
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#C2A649]/20 text-[#8C7326] border border-[#C2A649]/40">
                        Official Brand Account
                      </span>
                    ) : profile.accountType === "journalist" || profile.verification?.category === "journalist" ? (
                      <span className="text-[10px] font-mono uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#201E19] text-[#E8DFC8]">
                        Staff Correspondent
                      </span>
                    ) : (
                      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-[#DFD6BD] text-[#39352D] border border-[#766E5F]/30">
                        Subscriber
                      </span>
                    )}

                    {profile.organization && (
                      <span className="text-[10px] font-mono text-[#777777]">
                        • {profile.organization}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="mt-4 text-xs font-sans text-[#39352D] leading-relaxed italic bg-[#E8DFC8]/60 p-3 rounded border border-[#766E5F]/15">
                {profile.bio || "No telegraph bio published yet by this broadsheet subscriber."}
              </div>

              {/* Stats & Actions */}
              <div className="mt-4 pt-4 border-t border-[#766E5F]/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs font-mono">
                  <button
                    onClick={() => setActiveTab("followers")}
                    disabled={isBlocked || hasBlockedYou}
                    className="hover:underline cursor-pointer text-left disabled:opacity-50 disabled:no-underline"
                  >
                    <span className="font-bold text-[#201E19] text-sm block">
                      {followerCount}
                    </span>
                    <span className="text-[#666666] text-[10px] uppercase">Followers</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("following")}
                    disabled={isBlocked || hasBlockedYou}
                    className="hover:underline cursor-pointer text-left disabled:opacity-50 disabled:no-underline"
                  >
                    <span className="font-bold text-[#201E19] text-sm block">
                      {followingCount}
                    </span>
                    <span className="text-[#666666] text-[10px] uppercase">Following</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {!isSelf && !isBlocked && !hasBlockedYou && (
                    <button
                      type="button"
                      onClick={handleToggleFollow}
                      disabled={isMutating}
                      className={`text-xs px-4 py-2 rounded font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                        isFollowing
                          ? "bg-[#201E19] text-[#E8DFC8] hover:bg-[#9F3028]"
                          : "border-2 border-[#201E19] bg-transparent text-[#201E19] hover:bg-[#201E19] hover:text-[#E8DFC8]"
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
                  )}

                  {/* Actions Dropdown (Three-dot Instagram style) */}
                  {!isSelf && (
                    <div className="relative">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowActionMenu(!showActionMenu);
                        }}
                        className="p-2 border border-[#766E5F]/40 rounded hover:bg-[#DFD6BD] text-[#201E19] transition-all cursor-pointer"
                        title="Subscriber dossier options"
                        aria-label="Profile Options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {showActionMenu && (
                        <div
                          className="absolute right-0 bottom-full mb-1 w-48 bg-[#E8DFC8] border border-[#201E19] rounded shadow-xl z-20 py-1 text-xs font-mono"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {isBlocked ? (
                            <button
                              type="button"
                              onClick={() => {
                                setShowActionMenu(false);
                                handleUnblockUser();
                              }}
                              className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#DFD6BD] text-[#201E19] cursor-pointer"
                            >
                              <Unlock className="w-3.5 h-3.5 text-[#201E19]" />
                              <span>Unblock @{profile.username}</span>
                            </button>
                          ) : isOfficial ? (
                            <div className="px-3 py-2 flex items-center gap-2 text-[#766E5F] text-[11px]">
                              <Lock className="w-3.5 h-3.5" />
                              <span>Official account cannot be blocked</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => {
                                setShowActionMenu(false);
                                setShowBlockConfirm(true);
                              }}
                              className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#9F3028]/10 text-[#9F3028] cursor-pointer"
                            >
                              <Ban className="w-3.5 h-3.5" />
                              <span>Block user</span>
                            </button>
                          )}

                          {!isOfficial && onDeleteUser && (
                            <button
                              type="button"
                              onClick={() => {
                                setShowActionMenu(false);
                                onDeleteUser(profile);
                              }}
                              className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[#9F3028]/10 text-[#9F3028] border-t border-[#766E5F]/20 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Delete account</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Status Notice if Blocked */}
              {isBlocked && (
                <div className="mt-3 p-2.5 bg-[#9F3028]/10 border border-[#9F3028]/30 rounded text-xs font-mono text-[#9F3028] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Ban className="w-4 h-4 shrink-0" />
                    <span>You have blocked this subscriber. Interactions are severed.</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleUnblockUser}
                    disabled={isMutating}
                    className="font-bold underline uppercase text-[10px] ml-2 hover:text-[#201E19] cursor-pointer"
                  >
                    Unblock
                  </button>
                </div>
              )}

              {hasBlockedYou && !isBlocked && (
                <div className="mt-3 p-2.5 bg-[#201E19]/10 border border-[#766E5F]/30 rounded text-xs font-mono text-[#555555] flex items-center gap-2">
                  <Ban className="w-4 h-4 text-[#766E5F] shrink-0" />
                  <span>This subscriber has restricted profile interactions.</span>
                </div>
              )}

              {/* Registration Date */}
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[#777777]">
                <Calendar className="w-3 h-3" />
                <span>Enrolled in Registry: {formattedDate}</span>
              </div>
            </div>

            {/* Sub-Tabs: Overview vs Followers vs Following */}
            {!isBlocked && !hasBlockedYou && (
              <>
                <div className="flex border-b border-[#766E5F]/20 bg-[#DFD6BD] text-xs font-mono">
                  <button
                    onClick={() => setActiveTab("overview")}
                    className={`flex-1 py-2 text-center uppercase tracking-wider font-bold transition-all cursor-pointer ${
                      activeTab === "overview"
                        ? "bg-[#E8DFC8] border-b-2 border-[#201E19] text-[#201E19]"
                        : "text-[#555555] hover:text-[#201E19]"
                    }`}
                  >
                    Overview
                  </button>
                  <button
                    onClick={() => setActiveTab("followers")}
                    className={`flex-1 py-2 text-center uppercase tracking-wider font-bold transition-all cursor-pointer ${
                      activeTab === "followers"
                        ? "bg-[#E8DFC8] border-b-2 border-[#201E19] text-[#201E19]"
                        : "text-[#555555] hover:text-[#201E19]"
                    }`}
                  >
                    Followers ({followerCount})
                  </button>
                  <button
                    onClick={() => setActiveTab("following")}
                    className={`flex-1 py-2 text-center uppercase tracking-wider font-bold transition-all cursor-pointer ${
                      activeTab === "following"
                        ? "bg-[#E8DFC8] border-b-2 border-[#201E19] text-[#201E19]"
                        : "text-[#555555] hover:text-[#201E19]"
                    }`}
                  >
                    Following ({followingCount})
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="p-4">
                  {activeTab === "overview" && (
                    <div className="space-y-3">
                      <div className="border border-[#766E5F]/20 rounded p-3 bg-[#EFE8D5]">
                        <div className="flex items-center gap-2 mb-1">
                          <ShieldCheck className="w-4 h-4 text-[#8C7326]" />
                          <span className="font-serif font-bold text-sm text-[#201E19]">
                            Broadsheet Verification Status
                          </span>
                        </div>
                        <p className="text-xs text-[#555555]">
                          {profile.isVerified
                            ? `Official verified ${profile.verification?.category || profile.accountType} credentials issued by The Digital Times Editorial Board.`
                            : "Unverified subscriber account. Standard editorial reading privileges."}
                        </p>
                      </div>

                      {profile.desk && (
                        <div className="border border-[#766E5F]/20 rounded p-3 bg-[#EFE8D5]">
                          <span className="font-mono text-[10px] text-[#777777] uppercase block mb-0.5">
                            Editorial Desk Assignment
                          </span>
                          <span className="font-serif font-bold text-sm text-[#201E19]">
                            {profile.desk.toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  {(activeTab === "followers" || activeTab === "following") && (
                    <div className="space-y-2">
                      {isLoadingList ? (
                        <div className="space-y-2">
                          {[1, 2, 3].map((n) => (
                            <div key={n} className="h-12 bg-[#DFD6BD] rounded animate-pulse" />
                          ))}
                        </div>
                      ) : (activeTab === "followers" ? followers : following).length === 0 ? (
                        <div className="text-center py-6 text-[#777777] font-mono text-xs">
                          No {activeTab} recorded yet in registry.
                        </div>
                      ) : (
                        (activeTab === "followers" ? followers : following).map((u) => (
                          <div
                            key={u.id || u._id}
                            className="flex items-center justify-between p-2.5 bg-[#EFE8D5] rounded border border-[#766E5F]/15 hover:border-[#766E5F]/40 transition-all"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div className="w-8 h-8 rounded-full bg-[#201E19] text-[#E8DFC8] flex items-center justify-center font-serif text-xs font-bold shrink-0">
                                {u.avatar ? (
                                  <img src={u.avatar} alt={u.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                  u.name.charAt(0).toUpperCase()
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="font-serif font-bold text-xs text-[#201E19] truncate">
                                    {u.name}
                                  </span>
                                  {u.isVerified && (
                                    <VerifiedBadge
                                      category={u.accountType === "official_brand" ? "publication" : "journalist"}
                                      size="sm"
                                    />
                                  )}
                                </div>
                                <span className="text-[10px] font-mono text-[#666666] block truncate">
                                  @{u.username}
                                </span>
                              </div>
                            </div>

                            {currentUser &&
                              currentUser.id !== u.id &&
                              currentUser.id !== u._id && (
                                <span className="text-[10px] font-mono uppercase text-[#777777] border border-[#766E5F]/30 px-2 py-0.5 rounded">
                                  {u.accountType}
                                </span>
                              )}
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

        {/* Vintage Block Confirmation Modal */}
        {showBlockConfirm && profile && (
          <div
            className="absolute inset-0 z-30 bg-black/70 flex items-center justify-center p-6"
            onClick={(e) => {
              e.stopPropagation();
              setShowBlockConfirm(false);
            }}
          >
            <div
              className="bg-[#E8DFC8] border-2 border-[#9F3028] rounded-lg p-5 max-w-sm w-full shadow-2xl text-[#201E19]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 text-[#9F3028] mb-3">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <h4 className="font-serif font-bold text-base">
                  Block @{profile.username}?
                </h4>
              </div>

              <p className="text-xs font-sans text-[#39352D] leading-relaxed mb-4">
                Blocking will sever existing follow connections between both accounts. They will no longer be able to discover your profile, read your dispatches, or send notifications. They will not be informed that you blocked them.
              </p>

              <div className="flex items-center justify-end gap-3 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setShowBlockConfirm(false)}
                  disabled={isMutating}
                  className="px-3 py-1.5 border border-[#766E5F]/40 rounded hover:bg-[#DFD6BD] text-[#201E19] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBlockUser}
                  disabled={isMutating}
                  className="px-3 py-1.5 bg-[#9F3028] text-[#E8DFC8] font-bold rounded hover:bg-[#7D2620] cursor-pointer flex items-center gap-1.5"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>{isMutating ? "Blocking..." : "Confirm Block"}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
