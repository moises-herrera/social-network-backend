import { Router } from 'express';
import { check } from 'express-validator';
import {
  createPost,
  deletePost,
  getPost,
  getPostLikes,
  getPosts,
  likePost,
  unlikePost,
  updatePost,
} from 'src/controllers/post.controller';
import {
  validateJwt,
  validatePostPermissions,
  validateFields,
} from 'src/middleware';

const router = Router();

/**
 * Get all posts.
 */
router.get('/', validateJwt, getPosts);

/**
 * Get a post.
 */
router.get('/:id', validateJwt, getPost);

/**
 * Create a post.
 */
router.post(
  '/',
  [
    validateJwt,
    check('title', 'Title is required').not().isEmpty(),
    check('topic', 'Topic is required').not().isEmpty(),
    check('description', 'Content is required').not().isEmpty(),
    validateFields,
  ],
  createPost
);

/**
 * Update a post.
 */
router.put(
  '/:id',
  [
    validateJwt,
    validatePostPermissions,
    check('title', 'Title is required').not().isEmpty(),
    check('topic', 'Topic is required').not().isEmpty(),
    check('description', 'Content is required').not().isEmpty(),
    validateFields,
  ],
  updatePost
);

/**
 * Delete a post.
 */
router.delete('/:id', [validateJwt, validatePostPermissions], deletePost);

/**
 * Like a post.
 */
router.post('/:id/like', validateJwt, likePost);

/**
 * Remove like from a post.
 */
router.post('/:id/unlike', validateJwt, unlikePost);

/**
 * Get post likes.
 */
router.get('/:id/like', validateJwt, getPostLikes);

export { router };
