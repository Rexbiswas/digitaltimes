import { NextResponse } from "next/server";
import { allArticles, leadStory } from "@/data/newspaperData";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const desk = searchParams.get("desk");
  const query = searchParams.get("q");

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
    total: filtered.length,
    articles: filtered,
    leadStory: leadStory,
    timestamp: new Date().toISOString(),
  });
}
