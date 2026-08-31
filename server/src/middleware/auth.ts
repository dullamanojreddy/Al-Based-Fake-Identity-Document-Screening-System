import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './errorHandler.js';
import { logger } from './logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'evalai-jwt-secret-key-change-in-production';

/**
 * Express middleware that validates JWT tokens from the Authorization header.
 * 
 * Usage:
 *   import { authenticateJWT } from '../middleware/auth.js';
 *   router.get('/protected', authenticateJWT, handler);
 * 
 * The decoded user payload is attached to req.user if authentication succeeds.
 */
export const authenticateJWT = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError('Authentication required. Please provide a valid JWT token.', 401);
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    throw new AppError('Invalid authorization header format. Use: Bearer <token>', 401);
  }

  const token = parts[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    (req as any).user = decoded;
    next();
  } catch (error: any) {
    logger.warn('JWT verification failed', { error: error.message });

    if (error.name === 'TokenExpiredError') {
      throw new AppError('Your session has expired. Please log in again.', 401);
    }

    throw new AppError('Invalid or malformed authentication token.', 401);
  }
};

