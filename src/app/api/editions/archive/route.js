import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_API_URL}/editions/archive`, {
      cache: "no-store",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const json = await res.json();
      return NextResponse.json(json);
    }
  } catch (err) {
    // fallback
  }

  // Fallback dates
  const mockDates = [
    "2026-10-09",
    "2026-10-08",
    "2026-10-07",
    "2026-10-06",
    "2026-10-05",
    "2026-10-04",
    "2026-10-03",
  ];

  return NextResponse.json({
    success: true,
    source: "static-fallback",
    total: mockDates.length,
    dates: mockDates,
    data: mockDates.map((d, i) => ({
      date: d,
      displayDate: new Date(d).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      }).toUpperCase(),
      status: i === 0 ? "live" : "archived",
      vol: `VOL. 01 • NO. 00${i + 1}`,
      circulation: "1,840,290 BROADSHEETS",
      weather: "GLOBAL NETWORK: 24°C / 75°F • VISIBILITY OPTIMAL",
      totalArticles: 15,
    })),
  });
}
