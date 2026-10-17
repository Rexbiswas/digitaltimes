import { NextResponse } from "next/server";
import { getBackendApiUrl } from "@/utils/backendUrl";

export async function DELETE(request, { params }) {
  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const backendUrl = getBackendApiUrl();
  const authHeader = request.headers.get("authorization");

  try {
    const res = await fetch(`${backendUrl}/follows/${encodeURIComponent(id)}?${searchParams.toString()}`, {
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
      { success: false, message: err.message || "Failed to unfollow target." },
      { status: 503 }
    );
  }
}
