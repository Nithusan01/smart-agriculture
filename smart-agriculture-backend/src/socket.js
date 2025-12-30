// src/socket.js
let ioInstance = null;

function initSocket(io) {
  ioInstance = io;

  io.on('connection', (socket) => {
    console.log('🔌 New client connected:', socket.id);
    
    // Handle device subscription
    socket.on('subscribeDevice', (deviceId) => {
      if (deviceId) {
        socket.join(`device_${deviceId}`);
        console.log(`Client ${socket.id} subscribed to device ${deviceId}`);
        
        // Acknowledge subscription
        socket.emit('subscriptionConfirmed', { 
          deviceId, 
          message: `Subscribed to device ${deviceId}` 
        });
      }
    });

    // Handle device unsubscription
    socket.on('unsubscribeDevice', (deviceId) => {
      if (deviceId) {
        socket.leave(`device_${deviceId}`);
        console.log(`Client ${socket.id} unsubscribed from device ${deviceId}`);
      }
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`Client ${socket.id} disconnected. Reason: ${reason}`);
    });

    // Handle connection errors
    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  });
}

function emitSensorUpdate(deviceId, payload) {
  if (!ioInstance) {
    console.error('Socket.io instance not initialized');
    return;
  }
  
  ioInstance.to(`device_${deviceId}`).emit('sensorUpdate', payload);
  console.log(`📡 Emitted sensor update for device ${deviceId}:`, payload);
}

function getConnectedClientsCount() {
  return ioInstance ? ioInstance.engine.clientsCount : 0;
}

function getIoInstance() {
  return ioInstance;
}

module.exports = {
  initSocket,
  emitSensorUpdate,
  getConnectedClientsCount,
  getIoInstance
};