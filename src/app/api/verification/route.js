import { NextResponse } from "next/server";
import { getBackendApiUrl } from "@/utils/backendUrl";

export async function GET(request) {
  const backendUrl = getBackendApiUrl();
  const authHeader = request.headers.get("authorization");

  try {
    const res = await fetch(`${backendUrl}/verification`, {
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      cache: "no-store",
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, status: "unverified", message: err.message },
      { status: 503 }
    );
  }
}

export async function POST(request) {
  const backendUrl = getBackendApiUrl();
  const authHeader = request.headers.get("authorization");

  try {
    const body = await request.json();
    const res = await fetch(`${backendUrl}/verification`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to submit verification request." },
      { status: 503 }
    );
  }
}
