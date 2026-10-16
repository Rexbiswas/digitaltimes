"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, UserCheck, Plus, Users, Calendar, ShieldCheck, Newspaper, AlertCircle, RefreshCw } from "lucide-react";
import { fetchUserProfileApi, followTargetApi, unfollowTargetApi } from "@/services/api";
import VerifiedBadge from "@/components/VerifiedBadge";

export default function UserProfilePage({ params }) {
  const unwrappedParams = use(params);
  const rawUsername = unwrappedParams?.username || "";
  const username = decodeURIComponent(rawUsername).replace(/^@/, "");

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isMutating, setIsMutating] = useState(false);

  const loadProfile = async () => {
    if (!username) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchUserProfileApi(username);
      if (data && data.success !== false) {
        setProfile(data);
        setIsFollowing(!!data.isFollowing);
        setFollowerCount(data.followerCount || 0);
        setFollowingCount(data.followingCount || 0);
      } else {
        setError(data?.message || "Subscriber not found in registry.");
      }
    } catch (err) {
      setError("Unable to retrieve subscriber profile record.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [username]);

  const handleToggleFollow = async () => {
    if (!profile || isMutating) return;
    setIsMutating(true);
    const targetUserId = profile.id || profile._id;

    if (isFollowing) {
      // Optimistic update
      setIsFollowing(false);
      setFollowerCount((prev) => Math.max(0, prev - 1));
      const res = await unfollowTargetApi(targetUserId, "user");
      if (!res || !res.success) {
        setIsFollowing(true);
        setFollowerCount((prev) => prev + 1);
      }
    } else {
      // Optimistic update
      setIsFollowing(true);
      setFollowerCount((prev) => prev + 1);
      const res = await followTargetApi({
        targetType: "user",
        targetId: targetUserId,
        targetName: profile.name,
      });
      if (!res || !res.success) {
        setIsFollowing(false);
        setFollowerCount((prev) => Math.max(0, prev - 1));
      }
    }
    setIsMutating(false);
  };

  const getInitials = (name) => {
    if (!name) return "DT";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#FAF7F0] text-[#201E19] font-sans flex flex-col">
      {/* Broadsheet Top Bar */}
      <header className="border-b-2 border-[#201E19] bg-[#EFE8D5] px-4 py-3 sticky top-0 z-30 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[#201E19] hover:text-[#9F3028] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Broadsheet</span>
          </Link>

          <span className="font-serif font-black text-sm tracking-tight uppercase hidden sm:inline">
            The Digital Times • Subscriber Dossier
          </span>

          <span className="text-[10px] font-mono text-[#777777] uppercase">
            REGISTRY 2026
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto p-4 sm:p-8 flex-1">
        {isLoading ? (
          <div className="bg-[#EFE8D5] border border-[#766E5F]/20 rounded-2xl p-8 max-w-xl mx-auto animate-pulse space-y-4 text-center">
            <div className="w-20 h-20 rounded-full bg-[#766E5F]/20 mx-auto" />
            <div className="h-6 bg-[#766E5F]/20 rounded w-1/2 mx-auto" />
            <div className="h-4 bg-[#766E5F]/15 rounded w-1/3 mx-auto" />
            <div className="h-16 bg-[#766E5F]/10 rounded w-full" />
          </div>
        ) : error ? (
          <div className="bg-[#EFE8D5] border border-[#9F3028]/30 rounded-2xl p-8 max-w-md mx-auto text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#9F3028]/10 text-[#9F3028] flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif font-bold text-xl text-[#201E19]">Record Not Found</h2>
            <p className="text-xs font-mono text-[#666666]">{error}</p>
            <button
              onClick={loadProfile}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#201E19] text-[#E8DFC8] rounded-lg text-xs font-mono font-bold hover:bg-[#333333] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Registry</span>
            </button>
          </div>
        ) : profile ? (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Profile Dossier Header */}
            <div className="bg-[#EFE8D5] border-2 border-[#766E5F]/25 rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left">
                {/* Monogram / Avatar */}
                <div className="w-24 h-24 rounded-full bg-[#201E19] text-[#E8DFC8] flex items-center justify-center font-serif text-3xl font-bold border-2 border-[#766E5F]/30 shrink-0 overflow-hidden shadow-md">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{getInitials(profile.name)}</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h1 className="font-serif font-black text-2xl sm:text-3xl text-[#201E19]">
                      {profile.name}
                    </h1>
                    {profile.isVerified && (
                      <VerifiedBadge
                        category={profile.accountType === "official_brand" ? "publication" : "journalist"}
                        size="md"
                      />
                    )}
                  </div>

                  <p className="text-sm font-mono text-[#666666] mt-0.5">
                    @{profile.username}
                  </p>

                  {profile.accountType === "official_brand" && (
                    <span className="inline-block mt-1.5 text-[10px] font-mono font-bold uppercase bg-[#9F3028] text-white px-2 py-0.5 rounded">
                      Official Brand Account
                    </span>
                  )}

                  {profile.bio && (
                    <p className="text-sm font-serif text-[#39352D] mt-3 leading-relaxed">
                      {profile.bio}
                    </p>
                  )}

                  {/* Followers & Following Stats */}
                  <div className="flex items-center justify-center sm:justify-start gap-6 mt-4 pt-4 border-t border-[#766E5F]/20 text-xs font-mono">
                    <div>
                      <strong className="text-base text-[#201E19] font-bold block sm:inline mr-1">
                        {followerCount}
                      </strong>
                      <span className="text-[#666666] uppercase">Followers</span>
                    </div>
                    <div>
                      <strong className="text-base text-[#201E19] font-bold block sm:inline mr-1">
                        {followingCount}
                      </strong>
                      <span className="text-[#666666] uppercase">Following</span>
                    </div>
                  </div>

                  {/* Interactive Follow Toggle Button */}
                  <div className="mt-5">
                    <button
                      type="button"
                      disabled={isMutating}
                      onClick={handleToggleFollow}
                      className={`inline-flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-mono font-bold uppercase transition-all shadow-xs cursor-pointer ${
                        isFollowing
                          ? "bg-[#201E19] text-[#E8DFC8] hover:bg-[#9F3028]"
                          : "bg-[#9F3028] text-white hover:bg-[#7D261E]"
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>Follow Subscriber</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
