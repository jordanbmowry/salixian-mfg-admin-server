import config from './config/config';
import app from './app';
import { createServer } from 'http';
import logger from './config/logger';

const server = createServer(app);

server.listen(config.port, () => {
  logger.info(`Listening on port ${config.port}!`);
});

server.on('error', (error) => {
  logger.error(`Server error: ${error.message}`);
  process.exit(1);
});

// Graceful shutdown
const shutdown = () => {
  logger.info('Shutting down server...');
  server.close((err) => {
    if (err) {
      logger.error(`Error during shutdown: ${err.message}`);
      process.exit(1);
    }
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
