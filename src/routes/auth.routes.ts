import { Router } from 'express';
import { check } from 'express-validator';
import {
  login,
  register,
  validateToken,
} from 'src/controllers/auth.controller';
import { validateFields, validateJwt } from 'src/middleware';

const router = Router();

/**
 * Register a new user.
 */
router.post(
  '/register',
  [
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('username', 'User name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
    validateFields,
  ],
  register
);

/**
 * Login a user.
 */
router.post(
  '/login',
  [
    check('email', 'Email is required').isEmail(),
    check('password', 'Password is required').not().isEmpty(),
    validateFields,
  ],
  login
);

/**
 * Validate a JWT token.
 */
router.get('/renew-token', validateJwt, validateToken);

export { router };
