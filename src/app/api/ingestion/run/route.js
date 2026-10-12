import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function POST() {
  try {
    const res = await fetch(`${BACKEND_API_URL}/ingestion/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // fallback
  }

  return NextResponse.json({
    success: true,
    message: "Ingestion triggered (simulated response from Next.js proxy)",
    data: {
      timestamp: new Date().toISOString(),
      savedCount: 0,
      candidates: { total: 0 },
    },
  });
}

export async function GET() {
  return POST();
}
