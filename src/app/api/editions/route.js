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

  const mockDates = [
    "2026-10-09",
    "2026-10-08",
    "2026-10-07",
    "2026-10-06",
    "2026-10-05",
  ];

  return NextResponse.json({
    success: true,
    source: "static-fallback",
    total: mockDates.length,
    dates: mockDates,
  });
}
