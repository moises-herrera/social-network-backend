import { Router } from 'express';
import { check } from 'express-validator';
import multer from 'multer';
import {
  changePassword,
  deleteUser,
  followUser,
  getUser,
  getUserFollowers,
  getUsers,
  getUsersFollowing,
  unFollowUser,
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
const upload = multer({ storage: multer.memoryStorage() });

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
    upload.single('avatar'),
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

/**
 * Unfollow user.
 */
router.post('/:id/unfollow', validateJwt, unFollowUser);

/**
 * Get user followers.
 */
router.get('/:id/followers', validateJwt, getUserFollowers);

/**
 * Get user following.
 */
router.get('/:id/following', validateJwt, getUsersFollowing);

export { router };
