"use client";

import { io } from "socket.io-client";

let socketInstance = null;

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL ||
  (process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "")
    : "http://localhost:5000");

/**
 * Initializes or returns the existing Socket.IO singleton instance
 */
export function initFrontendSocket() {
  if (typeof window === "undefined") return null;

  if (socketInstance && socketInstance.connected) {
    return socketInstance;
  }

  const token = localStorage.getItem("times_auth_token");

  socketInstance = io(SOCKET_URL, {
    auth: {
      token: token || null,
    },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });

  socketInstance.on("connect", () => {
    console.log(`[Broadsheet Real-Time] Connected to Digital Times dispatch mesh (ID: ${socketInstance.id})`);

    // Auto-join breaking news room
    socketInstance.emit("join:breaking");

    // If authenticated, confirm user room
    const savedUserStr = localStorage.getItem("times_auth_user");
    if (savedUserStr) {
      try {
        const u = JSON.parse(savedUserStr);
        if (u.id || u._id) {
          socketInstance.emit("join:user", (u.id || u._id).toString());
        }
      } catch (e) {}
    }
  });

  socketInstance.on("disconnect", (reason) => {
    console.log(`[Broadsheet Real-Time] Disconnected: ${reason}`);
  });

  socketInstance.on("reconnect", (attemptNumber) => {
    console.log(`[Broadsheet Real-Time] Reconnected on attempt ${attemptNumber}`);
  });

  socketInstance.on("connect_error", (error) => {
    console.warn(`[Broadsheet Real-Time] Connection error:`, error.message);
  });

  return socketInstance;
}

export function getFrontendSocket() {
  if (!socketInstance) {
    return initFrontendSocket();
  }
  return socketInstance;
}

export function joinDeskRoom(deskName) {
  const socket = getFrontendSocket();
  if (socket && deskName) {
    socket.emit("join:desk", deskName.toLowerCase());
  }
}

export function joinEditionRoom(editionDate) {
  const socket = getFrontendSocket();
  if (socket && editionDate) {
    socket.emit("join:edition", editionDate);
  }
}

export function disconnectFrontendSocket() {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}
