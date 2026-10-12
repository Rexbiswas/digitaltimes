import { NextResponse } from "next/server";
import { allArticles, leadStory } from "@/data/newspaperData";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function GET(request, { params }) {
  const { date } = await params;

  try {
    const res = await fetch(`${BACKEND_API_URL}/editions/date/${date}`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const json = await res.json();
      if (json.success && json.data) {
        return NextResponse.json({
          status: "ok",
          source: "backend-live",
          edition: json.data,
          timestamp: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    // fallback
  }

  // Fallback
  const d = new Date(date);
  const displayDate = isNaN(d.getTime())
    ? date
    : d
        .toLocaleDateString("en-US", {
          weekday: "long",
          month: "long",
          day: "numeric",
          year: "numeric",
        })
        .toUpperCase();

  const mockEdition = {
    date,
    displayDate,
    status: "archived",
    leadArticle: leadStory,
    articles: allArticles,
    desks: {
      frontpage: allArticles.slice(0, 5),
      ai: allArticles.filter((a) => (a.desk || "").toLowerCase() === "ai"),
      web: allArticles.filter((a) => (a.desk || "").toLowerCase() === "web"),
      startups: allArticles.filter((a) => (a.desk || "").toLowerCase() === "startups"),
      design: allArticles.filter((a) => (a.desk || "").toLowerCase() === "design"),
      security: allArticles.filter((a) => (a.desk || "").toLowerCase() === "security"),
      technology: allArticles.filter((a) => (a.desk || "").toLowerCase() === "technology"),
      gaming: allArticles.filter((a) => (a.desk || "").toLowerCase() === "gaming"),
      culture: allArticles.filter((a) => (a.desk || "").toLowerCase() === "culture"),
      business: allArticles.filter((a) => (a.desk || "").toLowerCase() === "business"),
      future: allArticles.filter((a) => (a.desk || "").toLowerCase() === "future"),
    },
    metadata: {
      vol: "VOL. 01 • ARCHIVAL BROADSHEET",
      circulation: "1,840,290 BROADSHEETS",
      weather: "HISTORIC ARCHIVE DISPATCH • BAROMETER 1014 hPa",
    },
  };

  return NextResponse.json({
    status: "ok",
    source: "static-fallback",
    edition: mockEdition,
    timestamp: new Date().toISOString(),
  });
}
