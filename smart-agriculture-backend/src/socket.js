// src/socket.js
let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('Socket connected', socket.id);

    socket.on('subscribeDevice', (deviceId) => {
      if (deviceId) {
        socket.join(deviceId);
        console.log(socket.id, 'joined', deviceId);
      }
    });

    socket.on('unsubscribeDevice', (deviceId) => {
      if (deviceId) socket.leave(deviceId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected', socket.id);
    });
  });
}

function emitSensorUpdate(deviceId, payload) {
  if (!ioInstance) return;
  ioInstance.to(deviceId).emit('sensorUpdate', payload);
}

module.exports = { initSocket, emitSensorUpdate };
