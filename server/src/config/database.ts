import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../middleware/logger.js';

/**
 * Establishes connection to MongoDB.
 * This function is called once at server startup.
 */
export async function connectDB(): Promise<void> {
  const uri = env.MONGODB_URI;

  if (!uri) {
    logger.error('MONGODB_URI is not configured. Set it in .env');
    return;
  }

  try {
    mongoose.set('strictQuery', true);

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });

    logger.info(`✅ MongoDB Connected: ${mongoose.connection.host}`);
  } catch (error: any) {
    logger.error('❌ MongoDB connection failed:', error.message);
    // Don't crash the server — allow fallback to JSON storage
    logger.warn('⚠️ Running without MongoDB persistence. Some features may be limited.');
  }

  mongoose.connection.on('error', (err) => {
    logger.error('MongoDB runtime error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    logger.warn('MongoDB disconnected');
  });
}

