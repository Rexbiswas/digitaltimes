import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";

    const res = await fetch(`${BACKEND_API_URL}/users/history?limit=${limit}`, {
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Backend offline fallback
  }

  return NextResponse.json({
    success: true,
    source: "local-fallback",
    total: 0,
    data: [],
  });
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    const res = await fetch(`${BACKEND_API_URL}/users/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // Backend offline fallback
  }

  // Graceful fallback echo
  return NextResponse.json({
    success: true,
    source: "local-fallback",
    data: {
      headline: "Saved Dispatch",
      readAt: new Date().toISOString(),
    },
  });
}

export async function DELETE(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get("articleId");

    const endpoint = articleId
      ? `${BACKEND_API_URL}/users/history/${articleId}`
      : `${BACKEND_API_URL}/users/history`;

    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
      },
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
    message: "History cleared (fallback)",
  });
}
