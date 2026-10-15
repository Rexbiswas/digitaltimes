"use client";

import React, { useState, useEffect } from "react";
import { X, UserCheck, Plus, Users, Calendar, ShieldCheck, Newspaper, ExternalLink, Trash2 } from "lucide-react";
import VerifiedBadge from "./VerifiedBadge";
import { fetchUserProfileApi, fetchUserFollowersApi, fetchUserFollowingApi, followTargetApi, unfollowTargetApi } from "../services/api";

export default function UserProfileModal({
  isOpen,
  onClose,
  usernameOrId,
  currentUser,
  onFollowToggle,
  onDeleteUser,
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

  useEffect(() => {
    if (!isOpen || !usernameOrId) return;

    let mounted = true;
    setIsLoading(true);
    setActiveTab("overview");

    async function loadData() {
      try {
        const data = await fetchUserProfileApi(usernameOrId);
        if (mounted && data) {
          setProfile(data);
          setIsFollowing(!!data.isFollowing);
          setFollowerCount(data.followerCount || 0);
          setFollowingCount(data.followingCount || 0);
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
    if (!isOpen || !profile) return;

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
  }, [activeTab, isOpen, profile]);

  if (!isOpen) return null;

  const isSelf = currentUser && profile && (currentUser.id === profile.id || currentUser.id === profile._id || currentUser.username === profile.username);
  const isOfficial = profile && (profile.accountType === "official_brand" || profile.username === "thedigitaltimes");

  const handleToggleFollow = async () => {
    if (!profile || isMutating || isSelf) return;

    setIsMutating(true);
    const newStatus = !isFollowing;
    setIsFollowing(newStatus);
    setFollowerCount((prev) => (newStatus ? prev + 1 : Math.max(0, prev - 1)));

    try {
      if (newStatus) {
        await followTargetApi({
          targetType: "user",
          targetId: profile.id || profile._id,
          targetName: profile.name,
        });
      } else {
        await unfollowTargetApi(profile.id || profile._id, "user");
      }
      if (onFollowToggle) {
        onFollowToggle(profile, newStatus);
      }
    } catch (err) {
      // Revert on failure
      setIsFollowing(!newStatus);
      setFollowerCount((prev) => (!newStatus ? prev + 1 : Math.max(0, prev - 1)));
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
        onClick={(e) => e.stopPropagation()}
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
                        category={profile.verification?.category || (profile.accountType === "official_brand" ? "publication" : "journalist")}
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
                    className="hover:underline cursor-pointer text-left"
                  >
                    <span className="font-bold text-[#201E19] text-sm block">
                      {followerCount}
                    </span>
                    <span className="text-[#666666] text-[10px] uppercase">Followers</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("following")}
                    className="hover:underline cursor-pointer text-left"
                  >
                    <span className="font-bold text-[#201E19] text-sm block">
                      {followingCount}
                    </span>
                    <span className="text-[#666666] text-[10px] uppercase">Following</span>
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  {!isOfficial && onDeleteUser && (
                    <button
                      type="button"
                      onClick={() => onDeleteUser(profile)}
                      className="text-xs px-3 py-2 rounded font-semibold flex items-center gap-1.5 transition-all cursor-pointer border border-[#9F3028]/40 text-[#9F3028] hover:bg-[#9F3028] hover:text-[#E8DFC8]"
                      title="Permanently Delete Subscriber Account from Database"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  )}

                  {!isSelf && (
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
                </div>
              </div>

              {/* Registration Date */}
              <div className="mt-3 flex items-center gap-1.5 text-[10px] font-mono text-[#777777]">
                <Calendar className="w-3 h-3" />
                <span>Enrolled in Registry: {formattedDate}</span>
              </div>
            </div>

            {/* Sub-Tabs: Overview vs Followers vs Following */}
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
                                <VerifiedBadge category={u.accountType === "official_brand" ? "publication" : "journalist"} size="sm" />
                              )}
                            </div>
                            <span className="text-[10px] font-mono text-[#666666] block truncate">
                              @{u.username}
                            </span>
                          </div>
                        </div>

                        {currentUser && currentUser.id !== u.id && currentUser.id !== u._id && (
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
          </div>
        )}
      </div>
    </div>
  );
}
