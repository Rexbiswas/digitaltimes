import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    const endpoint = `${BACKEND_API_URL}/notifications/${encodeURIComponent(id)}/read`;

    const res = await fetch(endpoint, {
      method: "PATCH",
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
      },
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

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");
    const endpoint = `${BACKEND_API_URL}/notifications/${encodeURIComponent(id)}`;

    const res = await fetch(endpoint, {
      method: "DELETE",
      headers: {
        ...(authHeader ? { authorization: authHeader } : {}),
      },
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
