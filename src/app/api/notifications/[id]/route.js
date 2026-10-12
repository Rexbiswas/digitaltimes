import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");

    const endpoint = authHeader
      ? `${BACKEND_API_URL}/users/notifications/${id}/read`
      : `${BACKEND_API_URL}/notifications/${id}/read`;

    const res = await fetch(endpoint, {
      method: "PATCH",
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
    data: { id: "notif-read", read: true },
  });
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const authHeader = request.headers.get("authorization");

    const endpoint = authHeader
      ? `${BACKEND_API_URL}/users/notifications/${id}`
      : `${BACKEND_API_URL}/notifications/${id}`;

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
    message: "Notification dismissed",
  });
}
