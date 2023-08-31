import { Router } from 'express';
import { login, register } from 'src/controllers/auth.controller';

const router = Router();

/**
 * Register a new user.
 */
router.post('/register', register);

/**
 * Login a user.
 */
router.post('/login', login);

export { router };
