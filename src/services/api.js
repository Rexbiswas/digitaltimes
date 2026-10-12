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

