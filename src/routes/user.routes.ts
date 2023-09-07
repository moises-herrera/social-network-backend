import { Router } from 'express';
import { check } from 'express-validator';
import {
  changePassword,
  deleteUser,
  followUser,
  getUser,
  getUsers,
  updateUser,
  verifyEmail,
} from 'src/controllers/user.controller';
import {
  validateAdminRole,
  validateFields,
  validateJwt,
  validateUserSelfPermissions,
} from 'src/middleware';

const router = Router();

/**
 * Get all users.
 */
router.get('/', validateJwt, getUsers);

/**
 * Get a user.
 */
router.get('/:id', validateJwt, getUser);

/**
 * Update a user.
 */
router.put(
  '/:id',
  [
    validateJwt,
    validateUserSelfPermissions,
    check('firstName', 'First name is required').not().isEmpty(),
    check('lastName', 'Last name is required').not().isEmpty(),
    check('username', 'User name is required').not().isEmpty(),
    check('email', 'Email is required').isEmail(),
    validateFields,
  ],
  updateUser
);

/**
 * Delete a user.
 */
router.delete('/:id', [validateJwt, validateAdminRole], deleteUser);

/**
 * Verify user email.
 */
router.post('/:id/verify-email', validateJwt, verifyEmail);

/**
 * Change user password.
 */
router.post('/:id/password', validateJwt, changePassword);

/**
 * Follow user.
 */
router.post('/:id/follow', validateJwt, followUser);

export { router };
