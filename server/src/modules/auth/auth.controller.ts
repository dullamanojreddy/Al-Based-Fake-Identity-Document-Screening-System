import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../../middleware/logger.js';
import { AppError } from '../../middleware/errorHandler.js';
import { Faculty, IFaculty } from './faculty.model.js';

const JWT_SECRET = process.env.JWT_SECRET || 'evalai-jwt-secret-key-change-in-production';

/**
 * Seeds the default admin faculty if no faculty exist in the database.
 * Ensures there's always at least one login account available.
 */
async function seedDefaultFaculty(): Promise<void> {
  try {
    const count = await Faculty.countDocuments();
    if (count === 0) {
      const defaultAdmin = new Faculty({
        email: 'admin@university.edu',
        passwordHash: 'admin123', // Will be hashed by pre-save hook
        name: 'Faculty Admin',
        department: 'Computer Science',
        role: 'admin',
      });
      await defaultAdmin.save();
      logger.info('Default admin faculty seeded', { email: 'admin@university.edu' });
    }
  } catch (error: any) {
    logger.error('Failed to seed default faculty', { error: error.message });
  }
}

// Run seed on import
seedDefaultFaculty();

/**
 * POST /api/v1/auth/login
 * Authenticates faculty user against MongoDB and returns JWT token.
 * 
 * Request body:
 *   { email: string, password: string }
 * 
 * Response:
 *   { success: true, token: string, user: { email: string, name: string, role: string } }
 */
export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      throw new AppError('Email and password are required', 400);
    }

    logger.info('Login attempt', { email });

    // Find faculty in MongoDB
    const faculty = await Faculty.findOne({ email: email.toLowerCase().trim() });

    if (!faculty) {
      logger.warn('Login failed: unknown user', { email });
      throw new AppError('Invalid credentials', 401);
    }

    // Check if account is active
    if (!faculty.isActive) {
      logger.warn('Login failed: account deactivated', { email });
      throw new AppError('Account has been deactivated. Contact administrator.', 403);
    }

    // Verify password
    const isMatch = await faculty.comparePassword(password);
    if (!isMatch) {
      logger.warn('Login failed: wrong password', { email });
      throw new AppError('Invalid credentials', 401);
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: faculty._id.toString(),
        email: faculty.email,
        name: faculty.name,
        role: faculty.role,
        department: faculty.department,
      },
      JWT_SECRET,
      { expiresIn: '8h' }
    );

    logger.info('Login successful', { email, userId: faculty._id.toString(), role: faculty.role });

    res.json({
      success: true,
      token,
      user: {
        email: faculty.email,
        name: faculty.name,
        role: faculty.role,
        department: faculty.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/auth/register
 * Creates a new faculty account.
 * 
 * Request body:
 *   { email: string, password: string, name: string, department?: string }
 * 
 * Response:
 *   { success: true, message: string, user: { email, name, role } }
 * 
 * Notes:
 * - Only existing admins can create new faculty accounts (requires auth header)
 * - First account created when DB is empty automatically becomes admin
 */
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password, name, department } = req.body;

    if (!email || !password || !name) {
      throw new AppError('Email, password, and name are required', 400);
    }

    if (password.length < 6) {
      throw new AppError('Password must be at least 6 characters', 400);
    }

    // Check if email already exists
    const existing = await Faculty.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      throw new AppError('A faculty account with this email already exists', 409);
    }

    // Determine role: first user is admin, rest are faculty
    const count = await Faculty.countDocuments();
    const role = count === 0 ? 'admin' : 'faculty';

    // Create faculty
    const faculty = new Faculty({
      email: email.toLowerCase().trim(),
      passwordHash: password, // Will be hashed by pre-save hook
      name: name.trim(),
      department: department?.trim() || 'Computer Science',
      role,
    });

    await faculty.save();

    logger.info('Faculty account created', { email, role });

    res.status(201).json({
      success: true,
      message: 'Faculty account created successfully',
      user: {
        email: faculty.email,
        name: faculty.name,
        role: faculty.role,
        department: faculty.department,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/auth/verify
 * Verifies a JWT token is still valid.
 * 
 * Headers:
 *   Authorization: Bearer <token>
 * 
 * Response:
 *   { success: true, valid: boolean, user?: object }
 */
export const verifyToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.json({ success: true, valid: false });
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);

    res.json({
      success: true,
      valid: true,
      user: decoded,
    });
  } catch (error) {
    res.json({ success: true, valid: false });
  }
};

/**
 * GET /api/v1/auth/faculty
 * Lists all faculty (admin only).
 * 
 * Response:
 *   { success: true, faculty: array }
 */
export const listFaculty = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const facultyList = await Faculty.find({}, { passwordHash: 0, __v: 0 }).sort({ createdAt: -1 });
    res.json({
      success: true,
      faculty: facultyList,
    });
  } catch (error) {
    next(error);
  }
};