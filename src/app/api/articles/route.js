import { NextResponse } from "next/server";
import { sanitizeArticle } from "@/utils/articlePresenter";
import { getBackendApiUrl } from "@/utils/backendUrl";
import { allArticles, leadStory } from "@/data/newspaperData";

const BACKEND_API_URL = getBackendApiUrl();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const desk = searchParams.get("desk");
  const query = searchParams.get("q");

  try {
    const params = new URLSearchParams();
    if (desk) params.append("desk", desk);
    if (query) params.append("q", query);
    params.append("limit", searchParams.get("limit") || "50");

    const endpoint = query
      ? `${BACKEND_API_URL}/articles/search?${params.toString()}`
      : `${BACKEND_API_URL}/articles?${params.toString()}`;

    const res = await fetch(endpoint, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        const cleanArticles = data.data.map(sanitizeArticle);
        return NextResponse.json({
          status: "ok",
          source: "backend-live",
          total: cleanArticles.length,
          articles: cleanArticles,
          leadStory: cleanArticles[0] || null,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn("Backend fetch failed, utilizing broadsheet editorial archive fallback:", err.message);
  }

  // Resilient fallback: Never leave the broadsheet empty on Vercel
  let fallbackPool = [...allArticles];
  if (desk) {
    const cleanDesk = desk.toLowerCase().trim();
    const filtered = fallbackPool.filter((a) => {
      const d = (a.desk || a.category || "").toLowerCase();
      return d.includes(cleanDesk);
    });
    if (filtered.length > 0) {
      fallbackPool = filtered;
    }
  }
  if (query) {
    const q = query.toLowerCase().trim();
    const matched = fallbackPool.filter((a) => {
      return (
        (a.title || "").toLowerCase().includes(q) ||
        (a.headline || "").toLowerCase().includes(q) ||
        (a.deck || "").toLowerCase().includes(q) ||
        (a.description || "").toLowerCase().includes(q)
      );
    });
    if (matched.length > 0) {
      fallbackPool = matched;
    }
  }

  const cleanFallback = fallbackPool.map(sanitizeArticle);
  return NextResponse.json({
    status: "ok",
    source: "broadsheet-archive-fallback",
    total: cleanFallback.length,
    articles: cleanFallback,
    leadStory: cleanFallback[0] || sanitizeArticle(leadStory),
    timestamp: new Date().toISOString(),
  });
}
