const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { cache: "no-store" });
    if (!res.ok) return { success: false, database: "disconnected" };
    return await res.json();
  } catch (err) {
    return { success: false, database: "disconnected", error: err.message };
  }
}

export async function fetchTodayEdition() {
  try {
    const res = await fetch(`${API_BASE}/editions/today`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    return null;
  }
}

export async function fetchEditionCalendar() {
  try {
    const res = await fetch(`${API_BASE}/editions/calendar`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    return [];
  }
}

export async function fetchEditionArchive() {
  try {
    const res = await fetch(`${API_BASE}/editions/archive`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success ? json.data : [];
  } catch (err) {
    return [];
  }
}

export async function fetchEditionByDate(date) {
  try {
    const res = await fetch(`${API_BASE}/editions/${date}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    return null;
  }
}

export async function fetchArticleByIdOrSlug(idOrSlug) {
  try {
    const res = await fetch(`${API_BASE}/articles/${idOrSlug}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    return null;
  }
}

export async function searchArticlesApi(query = "", desk = "", tab = "ALL") {
  try {
    const params = new URLSearchParams();
    if (query) params.append("q", query);
    if (desk) params.append("desk", desk);
    if (tab) params.append("tab", tab);

    const res = await fetch(`${API_BASE}/articles/search?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    return null;
  }
}

export async function fetchLiveDispatches() {
  try {
    const res = await fetch(`${API_BASE}/newsroom/live`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json : null;
  } catch (err) {
    return null;
  }
}

export async function fetchTrendingArticles() {
  try {
    const res = await fetch(`${API_BASE}/trending`, {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.data : null;
  } catch (err) {
    return null;
  }
}

export async function fetchLatestArticles({ limit = 40, desk, sort = "-publishedAt" } = {}) {
  try {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    if (desk) params.append("desk", desk);
    if (sort) params.append("sort", sort);

    const res = await fetch(`${API_BASE}/articles?${params.toString()}`, {
      cache: "no-store",
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.success && Array.isArray(json.data) ? json.data : [];
  } catch (err) {
    return [];
  }
}

export async function triggerIngestApi() {
  try {
    const res = await fetch(`${API_BASE}/admin/ingest`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return { success: false };
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

export async function triggerIngestionRun() {
  try {
    const res = await fetch(`${API_BASE}/ingestion/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    });
    if (!res.ok) return { success: false };
    return await res.json();
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Helper: Read JWT auth header
function getAuthHeaders() {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("times_auth_token");
    if (token) {
      return {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      };
    }
  }
  return { "Content-Type": "application/json" };
}

// ─────────────────────────────────────────────────────────────
// SOCIAL FOLLOWING APIS
// ─────────────────────────────────────────────────────────────
export async function fetchJournalistsApi() {
  try {
    const res = await fetch(`${API_BASE}/journalists`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return { success: false, data: [] };
    return await res.json();
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function fetchJournalistFollowersApi(id) {
  try {
    const res = await fetch(`${API_BASE}/journalists/${encodeURIComponent(id)}/followers`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchDeskFollowersApi(desk) {
  try {
    const res = await fetch(`${API_BASE}/desks/${encodeURIComponent(desk)}/followers`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    return null;
  }
}

export async function fetchUserFollowsApi({ targetType, page = 1, limit = 50 } = {}) {
  try {
    const params = new URLSearchParams();
    if (targetType) params.append("targetType", targetType);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const res = await fetch(`${API_BASE}/follows?${params.toString()}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return { success: false, data: [], desks: [], journalists: [] };
    return await res.json();
  } catch (err) {
    return { success: false, data: [], desks: [], journalists: [] };
  }
}

export async function discoverUsersApi({ q = "", page = 1, limit = 20 } = {}) {
  try {
    const params = new URLSearchParams();
    if (q) params.append("q", q);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const res = await fetch(`${API_BASE}/users/discover?${params.toString()}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return { success: false, data: [] };
    return await res.json();
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function fetchCurrentUserProfileApi() {
  try {
    const res = await fetch(`${API_BASE}/users/profile`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.user : null;
  } catch (err) {
    return null;
  }
}

export async function updateCurrentUserProfileApi(payload) {
  try {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchUserProfileApi(usernameOrId) {
  try {
    const res = await fetch(`${API_BASE}/users/profile/${encodeURIComponent(usernameOrId)}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success ? json.user : null;
  } catch (err) {
    return null;
  }
}

export async function fetchUserFollowersApi(id) {
  try {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}/followers`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return { success: false, data: [] };
    return await res.json();
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function fetchUserFollowingApi(id) {
  try {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(id)}/following`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return { success: false, data: [] };
    return await res.json();
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function deleteUserApi(idOrUsername) {
  try {
    const res = await fetch(`${API_BASE}/users/${encodeURIComponent(idOrUsername)}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function followTargetApi(payload) {
  try {
    const res = await fetch(`${API_BASE}/follows`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function unfollowTargetApi(id, targetType) {
  try {
    const query = targetType ? `?targetType=${encodeURIComponent(targetType)}` : "";
    const res = await fetch(`${API_BASE}/follows/${encodeURIComponent(id)}${query}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// PERSONALIZED NEWS FEED APIS
// ─────────────────────────────────────────────────────────────
export async function fetchPersonalizedFeedApi({ desk, cursor, limit = 20 } = {}) {
  try {
    const params = new URLSearchParams();
    if (desk && desk !== "ALL") params.append("desk", desk);
    if (cursor) params.append("cursor", cursor);
    if (limit) params.append("limit", limit.toString());

    const res = await fetch(`${API_BASE}/feed?${params.toString()}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return { success: false, data: [], hasMore: false };
    return await res.json();
  } catch (err) {
    return { success: false, data: [], hasMore: false };
  }
}

// ─────────────────────────────────────────────────────────────
// PERSISTENT NOTIFICATIONS APIS
// ─────────────────────────────────────────────────────────────
export async function fetchNotificationsApi({ unreadOnly = false, limit = 50 } = {}) {
  try {
    const params = new URLSearchParams();
    if (unreadOnly) params.append("unreadOnly", "true");
    params.append("limit", limit.toString());

    const res = await fetch(`${API_BASE}/notifications?${params.toString()}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return { success: false, data: [], unreadCount: 0 };
    return await res.json();
  } catch (err) {
    return { success: false, data: [], unreadCount: 0 };
  }
}

export async function fetchUnreadCountApi() {
  try {
    const res = await fetch(`${API_BASE}/notifications/unread-count`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return { success: false, unreadCount: 0 };
    return await res.json();
  } catch (err) {
    return { success: false, unreadCount: 0 };
  }
}

export async function markNotificationReadApi(id) {
  try {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function markAllNotificationsReadApi() {
  try {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: "PATCH",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function deleteNotificationApi(id) {
  try {
    const res = await fetch(`${API_BASE}/notifications/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

// ─────────────────────────────────────────────────────────────
// PROFILE VERIFICATION APIS
// ─────────────────────────────────────────────────────────────
export async function submitVerificationRequestApi(payload) {
  try {
    const res = await fetch(`${API_BASE}/verification/request`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function fetchVerificationStatusApi() {
  try {
    const res = await fetch(`${API_BASE}/verification/status`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return { success: false, status: "unverified" };
    return await res.json();
  } catch (err) {
    return { success: false, status: "unverified" };
  }
}

export async function fetchVerificationRequestsAdminApi({ status = "pending", page = 1, limit = 20 } = {}) {
  try {
    const params = new URLSearchParams();
    if (status) params.append("status", status);
    params.append("page", page.toString());
    params.append("limit", limit.toString());

    const res = await fetch(`${API_BASE}/verification/requests?${params.toString()}`, {
      headers: getAuthHeaders(),
      cache: "no-store",
    });
    if (!res.ok) return { success: false, data: [] };
    return await res.json();
  } catch (err) {
    return { success: false, data: [] };
  }
}

export async function approveVerificationAdminApi(id, { reviewerNotes } = {}) {
  try {
    const res = await fetch(`${API_BASE}/verification/requests/${id}/approve`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reviewerNotes }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function rejectVerificationAdminApi(id, { rejectionReason, reviewerNotes } = {}) {
  try {
    const res = await fetch(`${API_BASE}/verification/requests/${id}/reject`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ rejectionReason, reviewerNotes }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}

export async function revokeVerificationAdminApi(userId, { reason } = {}) {
  try {
    const res = await fetch(`${API_BASE}/verification/revoke/${userId}`, {
      method: "PATCH",
      headers: getAuthHeaders(),
      body: JSON.stringify({ reason }),
    });
    return await res.json();
  } catch (err) {
    return { success: false, message: err.message };
  }
}


