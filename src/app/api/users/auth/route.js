import { NextResponse } from "next/server";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "http://localhost:5000/api";

// Password regex: minimum 8 characters, at least one uppercase letter, one lowercase letter, and one number
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&#^~_.\-+=[\]{}()]{8,}$/;

// In-memory mock store for offline dev fallback
const mockUsersDb = new Map([
  [
    "alex@email.com",
    {
      id: "usr-guest-alex",
      name: "Alex Morgan",
      email: "alex@email.com",
      password: "Password123!",
      role: "Pro Reader",
      preferences: {
        topics: ["AI", "Web Development", "Startups"],
        theme: "morning",
      },
    },
  ],
  [
    "rexbiswas1@gmail.com",
    {
      id: "6acc6a4b03c94647f3cc41b6",
      name: "rexbiswas1",
      email: "rexbiswas1@gmail.com",
      password: "Password123!",
      role: "reader",
      preferences: {
        topics: ["AI", "Web Development", "Startups"],
        theme: "morning",
      },
    },
  ],
]);

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password, name, action = "login", topics } = body || {};

    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { success: false, message: "A valid telegraph email address is required." },
        { status: 400 }
      );
    }

    try {
      const res = await fetch(`${BACKEND_API_URL}/users/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        return NextResponse.json(data);
      } else {
        // Pass through client validation / authentication errors from backend
        return NextResponse.json(
          {
            success: false,
            code: data.code || (res.status === 404 ? "USER_NOT_FOUND" : res.status === 409 ? "USER_ALREADY_EXISTS" : "AUTH_ERROR"),
            message: data.message || "Authentication request failed.",
          },
          { status: res.status }
        );
      }
    } catch (err) {
      // Backend server unavailable; proceed to local resilient mock fallback
    }

    const cleanEmail = email.trim().toLowerCase();

    // ─────────────────────────────────────────────────────────────
    // FALLBACK 1. SIGNUP FLOW (For new users)
    // ─────────────────────────────────────────────────────────────
    if (action === "signup") {
      if (mockUsersDb.has(cleanEmail)) {
        return NextResponse.json(
          {
            success: false,
            code: "USER_ALREADY_EXISTS",
            message: "A reader profile with this email already exists. Please sign in instead.",
          },
          { status: 409 }
        );
      }

      if (!password || password.length < 8) {
        return NextResponse.json(
          {
            success: false,
            code: "PASSWORD_TOO_SHORT",
            message: "Cipher passcode must contain at least 8 characters.",
          },
          { status: 400 }
        );
      }

      if (!PASSWORD_REGEX.test(password)) {
        return NextResponse.json(
          {
            success: false,
            code: "PASSWORD_INVALID_REGEX",
            message: "Passcode must be at least 8 characters and include at least one uppercase letter, one lowercase letter, and one number.",
          },
          { status: 400 }
        );
      }

      const normalizedName = name?.trim() || cleanEmail.split("@")[0] || "Reader";
      const newMockUser = {
        id: "usr-" + Math.random().toString(36).substring(2, 9),
        name: normalizedName,
        email: cleanEmail,
        password: password,
        role: "Subscriber",
        preferences: {
          topics: topics || ["AI", "Web Development", "Startups"],
          theme: "morning",
        },
      };

      mockUsersDb.set(cleanEmail, newMockUser);

      return NextResponse.json(
        {
          success: true,
          message: "Reader profile enrolled successfully. You may now sign in with your cipher passcode.",
          user: {
            id: newMockUser.id,
            name: newMockUser.name,
            email: newMockUser.email,
            role: newMockUser.role,
          },
        },
        { status: 201 }
      );
    }

    // ─────────────────────────────────────────────────────────────
    // FALLBACK 2. FORGOT PASSWORD FLOW
    // ─────────────────────────────────────────────────────────────
    if (action === "forgot-password") {
      if (!mockUsersDb.has(cleanEmail)) {
        return NextResponse.json(
          {
            success: false,
            code: "USER_NOT_FOUND",
            message: "No subscriber profile found with this telegraph email. Please check your address or sign up.",
          },
          { status: 404 }
        );
      }
      const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
      const existingUser = mockUsersDb.get(cleanEmail);
      existingUser.resetCode = resetCode;
      existingUser.resetCodeExpires = Date.now() + 15 * 60 * 1000;
      return NextResponse.json({
        success: true,
        message: `A 6-digit verification code has been dispatched to ${cleanEmail}. Please check your email inbox and enter the code below.`,
        email: cleanEmail,
        expiresInMinutes: 15,
      });
    }

    // ─────────────────────────────────────────────────────────────
    // FALLBACK 3. RESET PASSWORD FLOW
    // ─────────────────────────────────────────────────────────────
    if (action === "reset-password") {
      const { resetCode, newPassword } = body || {};
      if (!mockUsersDb.has(cleanEmail)) {
        return NextResponse.json(
          { success: false, code: "USER_NOT_FOUND", message: "No subscriber profile found with this email." },
          { status: 404 }
        );
      }
      const existingUser = mockUsersDb.get(cleanEmail);
      if (!existingUser.resetCode || existingUser.resetCode !== String(resetCode).trim()) {
        return NextResponse.json(
          { success: false, code: "INVALID_RESET_CODE", message: "Invalid recovery cipher code." },
          { status: 400 }
        );
      }
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json(
          { success: false, code: "PASSWORD_TOO_SHORT", message: "Passcode must contain at least 8 characters." },
          { status: 400 }
        );
      }
      if (!PASSWORD_REGEX.test(newPassword)) {
        return NextResponse.json(
          { success: false, code: "PASSWORD_INVALID_REGEX", message: "Passcode must meet the 8+ char uppercase, lowercase, and number rules." },
          { status: 400 }
        );
      }
      existingUser.password = newPassword;
      delete existingUser.resetCode;
      delete existingUser.resetCodeExpires;
      return NextResponse.json({
        success: true,
        message: "Cipher passcode successfully reset. You may now sign in with your new passcode.",
      });
    }

    // ─────────────────────────────────────────────────────────────
    // FALLBACK 4. SIGNIN FLOW (For existing users)
    // ─────────────────────────────────────────────────────────────
    if (!mockUsersDb.has(cleanEmail)) {
      return NextResponse.json(
        {
          success: false,
          code: "USER_NOT_FOUND",
          message: "No subscriber profile found with this telegraph email. Please sign up first.",
        },
        { status: 404 }
      );
    }

    const existingUser = mockUsersDb.get(cleanEmail);
    if (existingUser.password && password && existingUser.password !== password) {
      return NextResponse.json(
        {
          success: false,
          code: "INVALID_CREDENTIALS",
          message: "Invalid cipher passcode. Please check your credentials.",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      token: "times_mock_jwt_token_local",
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role || "Pro Reader",
        preferences: existingUser.preferences || {
          topics: ["AI", "Web Development", "Startups"],
          theme: "morning",
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Invalid request payload." },
      { status: 400 }
    );
  }
}


