import { NextResponse } from "next/server";
import { allArticles, leadStory } from "@/data/newspaperData";
import { sanitizeArticle } from "@/utils/articlePresenter";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const desk = searchParams.get("desk");
  const query = searchParams.get("q");

  // Attempt to fetch fresh articles from backend server
  try {
    const params = new URLSearchParams();
    if (desk) params.append("desk", desk);
    if (query) params.append("q", query);
    params.append("limit", "50");

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
          leadStory: cleanArticles[0] || leadStory,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    // Fall back to local broadsheet catalog
  }

  // Fallback to static mock articles
  let filtered = [...allArticles];

  if (desk) {
    filtered = filtered.filter(
      (a) => a.desk?.toLowerCase() === desk.toLowerCase()
    );
  }

  if (query) {
    const q = query.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.headline?.toLowerCase().includes(q) ||
        a.deck?.toLowerCase().includes(q) ||
        a.author?.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({
    status: "ok",
    source: "static-fallback",
    total: filtered.length,
    articles: filtered,
    leadStory: leadStory,
    timestamp: new Date().toISOString(),
  });
}

