import { NextResponse } from "next/server";
import { getBackendApiUrl } from "@/utils/backendUrl";

export async function GET(request, { params }) {
  const { id } = await params;
  const backendUrl = getBackendApiUrl();
  const authHeader = request.headers.get("authorization");

  try {
    const res = await fetch(`${backendUrl}/users/${encodeURIComponent(id)}/following`, {
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
      { success: false, data: [], message: err.message || "Failed to retrieve following." },
      { status: 503 }
    );
  }
}
