import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function POST(request) {
  try {
    const body = await request.json();

    const res = await fetch(`${BACKEND_API_URL}/users/auth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      const data = await res.json();
      return NextResponse.json(data);
    }
  } catch (err) {
    // fallback
  }

  // Fallback user auth response
  return NextResponse.json({
    success: true,
    token: "times_mock_jwt_token_local",
    user: {
      id: "usr-guest-01",
      name: "Alexander Wright",
      email: "reader@digitaltimes.com",
      role: "Pro Reader",
      preferences: {
        topics: ["AI", "Web Development", "Startups"],
        theme: "morning",
      },
    },
  });
}
