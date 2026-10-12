const setupEditionSocket = (socket, io) => {
  socket.on("subscribe:edition", (editionDate) => {
    if (!editionDate) return;
    const room = `edition:${editionDate}`;
    socket.join(room);
  });

  socket.on("unsubscribe:edition", (editionDate) => {
    if (!editionDate) return;
    const room = `edition:${editionDate}`;
    socket.leave(room);
  });
};

module.exports = {
  setupEditionSocket,
};
