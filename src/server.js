import express from 'express';
import db from './config/database.js';
import env from './config/env.js';
import logger from './config/logger.js';

// Initialize Express app
const app = express();
app.use(express.json());

// Start server
const startServer = async () => {
  try {
    await db.initializeDatabase();
    const port = env.SERVER_PORT || 3000;
    app.listen(port, () => {
      logger.info(`Server started on port ${port}`);
    });
  } catch (error) {
    logger.error({ error }, 'Failed to start server');
  }
};

startServer();