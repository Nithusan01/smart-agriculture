const {server}  = require("./app")
const {testConnection,syncDatabase} = require("./config/db")
require('dotenv').config();
const PORT = process.env.PORT || 5000;

// Start server
  server.listen(PORT, async () => {
  await testConnection();
  await syncDatabase();
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🔗 HTTP URL: http://localhost:${PORT}`);
  console.log(`🔌 WebSocket URL: ws://localhost:${PORT}`);
  console.log(`📡 Socket.io path: /socket.io/`);
});
// Handle graceful shutdown
const gracefulShutdown = () => {
  console.log('\n👋 Received shutdown signal, closing server gracefully...');
  server.close(() => {
    console.log('✅ HTTP server closed');
    process.exit(0);
  });
  
  // Force close after 10 seconds
  setTimeout(() => {
    console.error('❌ Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});