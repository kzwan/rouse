import pino from 'pino';
import env from './env.js';

// Define log level type for type safety
type LogLevel = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace' | 'silent';

const logLevel = env.LOG_LEVEL as LogLevel;

// Configure logger options
const options: pino.LoggerOptions = {
  level: logLevel,
  timestamp: () => `,"time":"${new Date().toISOString()}"`,
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },

  // Add service name and env to all logs
  base: {
    service: 'rouse',
    env: env.NODE_ENV || 'development'
  }
};

// Add pretty printing in development
// if (env.NODE_ENV === 'development') {
//   options.transport = {
//     target: 'pino-pretty',
//     options: {
//       colorize: true,
//       translateTime: 'SYS:standard',
//       ignore: 'pid,hostname'
//     }
//   };
// }

// Create the logger
const logger = pino.default(options);

// Log environment on startup
logger.info({
  NODE_ENV: env.NODE_ENV || 'development',
  SERVER_PORT: env.SERVER_PORT,
}, 'Logger initialized!');

export default logger;