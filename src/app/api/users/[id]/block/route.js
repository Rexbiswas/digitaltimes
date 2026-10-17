import { NextResponse } from "next/server";
import { getBackendApiUrl } from "@/utils/backendUrl";

export async function POST(request, { params }) {
  const { id } = await params;
  const backendUrl = getBackendApiUrl();
  const authHeader = request.headers.get("authorization");

  try {
    const res = await fetch(`${backendUrl}/users/${encodeURIComponent(id)}/block`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to block account." },
      { status: 503 }
    );
  }
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const backendUrl = getBackendApiUrl();
  const authHeader = request.headers.get("authorization");

  try {
    const res = await fetch(`${backendUrl}/users/${encodeURIComponent(id)}/block`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...(authHeader ? { Authorization: authHeader } : {}),
      },
    });

    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { success: false, message: err.message || "Failed to unblock account." },
      { status: 503 }
    );
  }
}
