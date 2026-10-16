import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const endpoint = `${BACKEND_API_URL}/notifications?${searchParams.toString()}`;

    const res = await fetch(endpoint, {
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    const errData = await res.json().catch(() => ({}));
    return NextResponse.json(
      { success: false, data: [], unreadCount: 0, message: errData.message || "Failed to fetch notifications" },
      { status: res.status }
    );
  } catch (err) {
    return NextResponse.json(
      { success: false, data: [], unreadCount: 0, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    const endpoint = `${BACKEND_API_URL}/notifications`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
