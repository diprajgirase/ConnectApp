import http from 'http';
import { app } from './app';
import logger from './config/logger';
import SocketService from './services/socket.service';

const PORT = process.env.PORT || 3000;

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO service
const socketService = new SocketService(server);

// Start server
server.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
