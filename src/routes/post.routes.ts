import { Router } from 'express';
import { check } from 'express-validator';
import multer from 'multer';
import {
  createPost,
  deletePost,
  getPost,
  getPosts,
  likePost,
  updatePost,
} from 'src/controllers/post.controller';
import {
  validateJwt,
  validatePostPermissions,
  validateFields,
} from 'src/middleware';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

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
    upload.single('image'),
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
    upload.single('image'),
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
router.post('/:id', validateJwt, likePost);

export { router };
