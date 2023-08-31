import { Router } from 'express';
import { check } from 'express-validator';
import {
  createArticle,
  deleteArticle,
  getArticle,
  getArticles,
  updateArticle,
} from 'src/controllers/article.controller';
import { validateJwt, validateArticlePermissions } from 'src/middleware';

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
    check('description', 'Content is required').not().isEmpty(),
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
    check('description', 'Content is required').not().isEmpty(),
  ],
  updateArticle
);

/**
 * Delete an article.
 */
router.delete('/:id', [validateJwt, validateArticlePermissions], deleteArticle);

export { router };
