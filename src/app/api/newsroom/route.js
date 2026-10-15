import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_API_URL}/newsroom/live`, {
      cache: "no-store",
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.dispatches)) {
        return NextResponse.json(json);
      }
    }
  } catch (err) {}

  return NextResponse.json({
    status: "ok",
    hasNewDispatches: false,
    newCount: 0,
    dispatches: [],
    timestamp: new Date().toISOString(),
  });
}
