import { Router } from 'express';
import { check } from 'express-validator';
import {
  createArticle,
  deleteArticle,
  getArticle,
  getArticles,
  updateArticle,
} from 'src/controllers/article.controller';
import {
  validateJwt,
  validateArticlePermissions,
  validateFields,
} from 'src/middleware';

const router = Router();

/**
 * Get all articles.
 */
router.get('/', validateJwt, getArticles);

/**
 * Get an article.
 */
router.get('/:id', validateJwt, getArticle);

/**
 * Create an article.
 */
router.post(
  '/',
  [
    validateJwt,
    check('title', 'Title is required').not().isEmpty(),
    check('topic', 'Topic is required').not().isEmpty(),
    check('description', 'Content is required').not().isEmpty(),
    check('userId', 'User id is required').not().isEmpty(),
    validateFields,
  ],
  createArticle
);

/**
 * Update an article.
 */
router.put(
  '/:id',
  [
    validateJwt,
    validateArticlePermissions,
    check('title', 'Title is required').not().isEmpty(),
    check('topic', 'Topic is required').not().isEmpty(),
    check('description', 'Content is required').not().isEmpty(),
    check('userId', 'User id is required').not().isEmpty(),
    validateFields,
  ],
  updateArticle
);

/**
 * Delete an article.
 */
router.delete('/:id', [validateJwt, validateArticlePermissions], deleteArticle);

export { router };
