import { Router } from 'express';
import { check } from 'express-validator';
import {
  createComment,
  deleteComment,
  getComment,
  getComments,
  updateComment,
} from 'src/controllers/comment.controller';
import { validateJwt, validateCommentPermissions } from 'src/middleware';

const router = Router();

/**
 * Get all comments.
 */
router.get('/', validateJwt, getComments);

/**
 * Get a comment.
 */
router.get('/:id', validateJwt, getComment);

/**
 * Create a comment.
 */
router.post(
  '/',
  [validateJwt, check('content', 'Content is required').not().isEmpty()],
  createComment
);

/**
 * Update a comment.
 */
router.put(
  '/:id',
  [
    validateJwt,
    validateCommentPermissions,
    check('title', 'Title is required').not().isEmpty(),
  ],
  updateComment
);

/**
 * Delete a comment.
 */
router.delete('/:id', [validateJwt, validateCommentPermissions], deleteComment);

export { router };
