import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const endpoint = `${BACKEND_API_URL}/notifications/unread-count`;

    const res = await fetch(endpoint, {
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, unreadCount: 0, error: err.message },
      { status: 500 }
    );
  }
}
