const { Server } = require("socket.io");
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

  io.on("connection", (socket) => {
    console.log(`[Socket] Client connected: ${socket.id}`);

    // Allow clients to join edition rooms (e.g., 'edition:2026-10-07')
    socket.on("join:edition", (editionDate) => {
      const room = `edition:${editionDate}`;
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room: ${room}`);
    });

    // Allow clients to join specific desk rooms (e.g., 'desk:ai')
    socket.on("join:desk", (deskName) => {
      const room = `desk:${deskName.toLowerCase()}`;
      socket.join(room);
      console.log(`[Socket] ${socket.id} joined room: ${room}`);
    });

    // Allow clients to join breaking news room
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

// Emitters for new articles and breaking dispatches
const emitNewArticle = (article) => {
  if (!io) return;

  // Broadcast to global edition room
  if (article.editionDate) {
    io.to(`edition:${article.editionDate}`).emit("NEW_ARTICLE", article);
  }

  // Broadcast to desk-specific room
  if (article.desk) {
    io.to(`desk:${article.desk.toLowerCase()}`).emit("NEW_ARTICLE", article);
  }

  // Global dispatch for newsroom toast
  io.emit("NEW_DISPATCH", article);

  // If breaking, broadcast to breaking-news room and global
  if (article.breaking) {
    io.to("breaking-news").emit("BREAKING_NEWS", article);
    io.emit("BREAKING_NEWS", article);
  }
};

const emitBreakingNews = (article) => {
  if (!io) return;
  io.emit("BREAKING_NEWS", article);
};

const emitNotification = (notification) => {
  if (!io) return;
  io.emit("NOTIFICATION", notification);
  io.emit("notification:new", notification);
};

module.exports = {
  initSocket,
  getIO,
  emitNewArticle,
  emitBreakingNews,
  emitNotification,
};
