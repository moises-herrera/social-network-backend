import { Router } from 'express';
import { check } from 'express-validator';
import {
  createConversation,
  deleteConversation,
  getConversation,
  getConversations,
  updateConversation,
} from 'src/controllers/conversation.controller';
import { validateAdminRole, validateJwt } from 'src/middleware';

const router = Router();

/**
 * Get all conversations of a user.
 */
router.get('/', validateJwt, getConversations);

/**
 * Get a conversation by id.
 */
router.get('/:id', validateJwt, getConversation);

/**
 * Create a conversation.
 */
router.post(
  '/',
  [
    validateJwt,
    check('participants', 'Participants are required').isArray({
      min: 2,
      max: 10,
    }),
  ],
  createConversation
);

/**
 * Update a conversation.
 */
router.put('/:id', [
  validateJwt,
  validateAdminRole,
  check('participants', 'Participants are required').isArray({
    min: 2,
    max: 10,
  }),
  updateConversation,
]);

/**
 * Delete a conversation.
 */
router.delete('/:id', [validateJwt, validateAdminRole], deleteConversation);

export { router };
