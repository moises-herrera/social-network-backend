import { Router } from 'express';
import { check } from 'express-validator';
import {
  createNotification,
  getNotifications,
} from 'src/controllers/notification.controller';
import { validateFields, validateJwt } from 'src/middleware';

const router = Router();

/**
 * Get all notifications of the current user.
 */
router.get('/', validateJwt, getNotifications);

/**
 * Create a notification.
 */
router.post(
  '/',
  [
    validateJwt,
    check('note', 'Note is required').not().isEmpty(),
    check('recipient', 'Recipient is required').not().isEmpty(),
    check('sender', 'Sender is required').not().isEmpty(),
    validateFields,
  ],
  createNotification
);

/**
 * Update a notification.
 */
router.put(
  '/:id',
  [validateJwt, check('hasRead', 'hasRead is required').not().isEmpty()],
  validateFields
);
