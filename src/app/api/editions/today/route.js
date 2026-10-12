import { NextResponse } from "next/server";
import { allArticles, leadStory } from "@/data/newspaperData";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_API_URL}/editions/today`, {
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
    // fallback to static mock edition
  }

  // Construct fallback mock edition from static broadsheet data
  const today = new Date();
  const dateStr = today.toISOString().split("T")[0];
  const displayDate = today
    .toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  const mockEdition = {
    date: dateStr,
    displayDate,
    status: "live",
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
      vol: "VOL. 01 • NO. 001",
      circulation: "1,840,290 BROADSHEETS",
      weather: "GLOBAL NETWORK: 24°C / 75°F • BAROMETER 1014 hPa • VISIBILITY OPTIMAL",
    },
  };

  return NextResponse.json({
    status: "ok",
    source: "static-fallback",
    edition: mockEdition,
    timestamp: new Date().toISOString(),
  });
}
