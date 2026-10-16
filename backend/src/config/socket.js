const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const env = require("./env");

let io = null;

const initSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: [
        env.FRONTEND_URL,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
      ],
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Server-side Authentication Handshake Middleware
  io.use((socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        (socket.handshake.headers?.authorization &&
          socket.handshake.headers.authorization.split(" ")[1]);

      if (token) {
        try {
          const decoded = jwt.verify(token, env.JWT_SECRET);
          socket.userId = decoded.id ? decoded.id.toString() : null;
        } catch (tokenErr) {
          // Token expired or invalid: continue as unauthenticated guest reader
          socket.userId = null;
        }
      } else {
        socket.userId = null;
      }
      next();
    } catch (err) {
      next();
    }
  });

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id} (User: ${socket.userId || "Guest"})`);

    // Automatically join authorized user room if token was validated
    if (socket.userId) {
      const userRoom = `user:${socket.userId}`;
      socket.join(userRoom);
      console.log(`[Socket] Authorized user joined private room: ${userRoom}`);
    }

    // Explicit room authorization for user subscriptions
    socket.on("join:user", (requestedUserId) => {
      if (socket.userId && socket.userId === requestedUserId) {
        socket.join(`user:${requestedUserId}`);
        console.log(`[Socket] ${socket.id} confirmed authorized user room: user:${requestedUserId}`);
      } else {
        console.warn(`[Socket] Unauthorized room join attempt rejected for ${socket.id} -> user:${requestedUserId}`);
      }
    });

    // Public room subscriptions
    socket.on("join:edition", (editionDate) => {
      if (editionDate && typeof editionDate === "string") {
        const room = `edition:${editionDate}`;
        socket.join(room);
        console.log(`[Socket] ${socket.id} joined room: ${room}`);
      }
    });

    socket.on("join:desk", (deskName) => {
      if (deskName && typeof deskName === "string") {
        const room = `desk:${deskName.toLowerCase()}`;
        socket.join(room);
        console.log(`[Socket] ${socket.id} joined room: ${room}`);
      }
    });

    socket.on("join:breaking", () => {
      socket.join("breaking-news");
      console.log(`[Socket] ${socket.id} joined room: breaking-news`);
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Client disconnected: ${socket.id}`);
    });
  });

  return io;
};

const getIO = () => {
  return io;
};

// Documented, versioned event payload builder
const createEventPayload = (eventType, data) => ({
  version: "1.0",
  event: eventType,
  timestamp: new Date().toISOString(),
  data,
});

// Emitters
const emitNewArticle = (article) => {
  if (!io) return;

  const payload = createEventPayload("NEW_ARTICLE", article);

  // Broadcast to edition room
  if (article.editionDate) {
    io.to(`edition:${article.editionDate}`).emit("NEW_ARTICLE", payload);
  }

  // Broadcast to desk room
  if (article.desk) {
    io.to(`desk:${article.desk.toLowerCase()}`).emit("NEW_ARTICLE", payload);
  }

  // Broadcast to all active newsroom readers for toast updates
  io.emit("NEW_ARTICLE", payload);
  io.emit("NEW_DISPATCH", article); // Legacy compatibility

  // If breaking news, emit to breaking channel
  if (article.breaking) {
    const breakingPayload = createEventPayload("BREAKING_NEWS", article);
    io.to("breaking-news").emit("BREAKING_NEWS", breakingPayload);
    io.emit("BREAKING_NEWS", breakingPayload);
  }
};

const emitBreakingNews = (article) => {
  if (!io) return;
  const payload = createEventPayload("BREAKING_NEWS", article);
  io.to("breaking-news").emit("BREAKING_NEWS", payload);
  io.emit("BREAKING_NEWS", payload);
};

const emitEditionUpdated = (edition) => {
  if (!io) return;
  const payload = createEventPayload("EDITION_UPDATED", edition);
  if (edition.date) {
    io.to(`edition:${edition.date}`).emit("EDITION_UPDATED", payload);
  }
  io.emit("EDITION_UPDATED", payload);
};

const notificationEmitter = require("../services/notificationEmitter");

const emitNotification = (notification) => {
  try {
    notificationEmitter.emit("notification", notification);
  } catch (e) {}

  if (!io) return;

  const payload = createEventPayload("NEW_NOTIFICATION", notification);
  const targetId = notification.recipient
    ? (notification.recipient._id || notification.recipient).toString()
    : notification.user
    ? (notification.user._id || notification.user).toString()
    : null;

  if (targetId) {
    // Deliver exclusively to authenticated user's private room
    const targetRoom = `user:${targetId}`;
    io.to(targetRoom).emit("notification:new", notification);
    io.to(targetRoom).emit("NEW_NOTIFICATION", payload);
  } else {
    // Global broadcast notification (for breaking broadsheet news)
    io.emit("notification:new", notification);
    io.emit("NEW_NOTIFICATION", payload);
  }
};

const emitFollowUpdated = (userId, followData) => {
  if (!io || !userId) return;
  const payload = createEventPayload("FOLLOW_UPDATED", followData);
  io.to(`user:${userId.toString()}`).emit("FOLLOW_UPDATED", payload);
};

const emitNewVideo = (videoData) => {
  if (!io) return;
  const payload = createEventPayload("NEW_VIDEO", videoData);
  io.emit("NEW_VIDEO", payload);
};

module.exports = {
  initSocket,
  getIO,
  emitNewArticle,
  emitBreakingNews,
  emitEditionUpdated,
  emitNotification,
  emitFollowUpdated,
  emitNewVideo,
};
