import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const endpoint = `${BACKEND_API_URL}/notifications/stream`;

    const backendRes = await fetch(endpoint, {
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    return new Response(backendRes.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
      },
    });
  } catch (err) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
