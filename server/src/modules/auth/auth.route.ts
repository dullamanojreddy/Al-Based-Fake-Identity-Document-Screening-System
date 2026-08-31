import { Router } from 'express';
import { login, register, verifyToken, listFaculty } from './auth.controller.js';
import { authenticateJWT } from '../../middleware/auth.js';

const router = Router();

/**
 * Auth Routes
 * 
 * POST   /api/v1/auth/login     - Faculty login (returns JWT)
 * POST   /api/v1/auth/register  - Create new faculty account (admin only)
 * GET    /api/v1/auth/verify    - Verify JWT token validity
 * GET    /api/v1/auth/faculty   - List all faculty (admin only)
 */
router.post('/login', login);
router.post('/register', register);
router.get('/verify', verifyToken);
router.get('/faculty', authenticateJWT, listFaculty);

export default router;