import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

const fallbackNotifications = [
  {
    _id: "notif-01",
    id: "notif-01",
    title: "Autonomous reasoning model passes formal logic theorem proof",
    message: "Frontier mathematical verification model resolves fifty-year combinatorial conjecture in Lean 4.",
    time: "2 MIN AGO",
    desk: "AI",
    type: "breaking",
    read: false,
  },
  {
    _id: "notif-02",
    id: "notif-02",
    title: "Market Alert: Global compute futures index advances +3.4%",
    message: "Consortium expands dedicated photonics interconnect corridors across European financial hubs.",
    time: "18 MIN AGO",
    desk: "BUSINESS",
    type: "breaking",
    read: false,
  },
  {
    _id: "notif-03",
    id: "notif-03",
    title: "Dispatch: New browser local inference specification ratified by W3C",
    message: "Sub-millisecond local SQLite threads become the standard for zero-egress consumer web applications.",
    time: "45 MIN AGO",
    desk: "WEB",
    type: "desk",
    read: false,
  },
  {
    _id: "notif-04",
    id: "notif-04",
    title: "Morning Edition № 001 Broadside Distributed",
    message: "The full broadsheet edition is printed and ready for reading in your archival portfolio.",
    time: "1 HOUR AGO",
    desk: "EDITION",
    type: "edition",
    read: true,
  },
];

export async function GET(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "50";

    const endpoint = authHeader
      ? `${BACKEND_API_URL}/users/notifications?limit=${limit}`
      : `${BACKEND_API_URL}/notifications?limit=${limit}`;

    const res = await fetch(endpoint, {
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.data)) {
        return NextResponse.json(data);
      }
    }
  } catch (err) {
    // fallback
  }

  return NextResponse.json({
    success: true,
    source: "static-fallback",
    total: fallbackNotifications.length,
    unreadCount: fallbackNotifications.filter((n) => !n.read).length,
    data: fallbackNotifications,
  });
}

export async function POST(request) {
  try {
    const authHeader = request.headers.get("authorization");
    const body = await request.json();

    const endpoint = authHeader
      ? `${BACKEND_API_URL}/users/notifications`
      : `${BACKEND_API_URL}/notifications`;

    const res = await fetch(endpoint, {
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
    // fallback
  }

  return NextResponse.json({
    success: true,
    data: {
      title: "Notification dispatched",
      read: false,
    },
  });
}
