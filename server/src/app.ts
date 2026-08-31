import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import hpp from 'hpp';
import path from 'path';
import { env } from './config/env';
import { requestIdMiddleware } from './middleware/requestId';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { logger } from './middleware/logger';
import { generalLimiter } from './middleware/rateLimiter';

// Import routes
import healthRoutes from './routes/health';
import screeningRoutes from './modules/screening/screening.route';
import authRoutes from './modules/auth/auth.route';

const app = express();

// Trust proxy for correct IP detection behind Nginx/Render/Railway
app.set('trust proxy', 1);

// ==============================
// Security Middleware
// ==============================

// Helmet with strict defaults
app.use(helmet());

// CORS - support array of origins
const corsOrigins = env.CORS_ORIGIN.split(',').map(o => o.trim());
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || corsOrigins.includes(origin) || corsOrigins.includes('*')) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
}));

// HPP protection against HTTP parameter pollution
app.use(hpp());

// Compression for large responses
app.use(compression());

// ==============================
// Request Parsing
// ==============================
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// ==============================
// Request ID & Logging
// ==============================
app.use(requestIdMiddleware);

// Morgan logging with Winston stream
app.use(morgan(':method :url :status :res[content-length] - :response-time ms', {
  stream: {
    write: (message: string) => {
      logger.info(message.trim());
    },
  },
}));

// ==============================
// Health Check (BEFORE rate limiter)
// ==============================
app.use(`${env.API_PREFIX}/health`, healthRoutes);

// ==============================
// Rate Limiting (AFTER health)
// ==============================
app.use(generalLimiter);

// ==============================
// API Routes
// ==============================
app.use(`${env.API_PREFIX}/screening`, screeningRoutes);
app.use(`${env.API_PREFIX}/auth`, authRoutes);

// ==============================
// Error Handling
// ==============================
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
