import { NextResponse } from "next/server";
import { sanitizeArticle } from "@/utils/articlePresenter";
import { getBackendApiUrl } from "@/utils/backendUrl";

const BACKEND_API_URL = getBackendApiUrl();

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const desk = searchParams.get("desk");
  const query = searchParams.get("q");

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
      if (data.success && Array.isArray(data.data)) {
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

    return NextResponse.json(
      {
        status: "empty",
        source: "backend-live",
        total: 0,
        articles: [],
        leadStory: null,
        message: "No dispatches found in the active archive for this query.",
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "error",
        source: "backend-offline",
        message: "Broadsheet backend archive is currently unavailable. Please check connection and retry.",
        total: 0,
        articles: [],
        leadStory: null,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
