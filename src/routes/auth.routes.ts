import { Router } from 'express';
import { register } from '../controllers/auth.controller';

const router = Router();

/**
 * Register a new user.
 */
router.post('/register', register);

export { router };
