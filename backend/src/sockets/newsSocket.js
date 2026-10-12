const setupNewsSocket = (socket, io) => {
  socket.on("subscribe:desk", (desk) => {
    if (!desk) return;
    const room = `desk:${desk.toLowerCase()}`;
    socket.join(room);
  });

  socket.on("unsubscribe:desk", (desk) => {
    if (!desk) return;
    const room = `desk:${desk.toLowerCase()}`;
    socket.leave(room);
  });
};

module.exports = {
  setupNewsSocket,
};
