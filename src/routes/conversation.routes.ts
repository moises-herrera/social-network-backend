import { Router } from 'express';
import { check } from 'express-validator';
import {
  createConversation,
  deleteConversation,
  getConversation,
  getConversations,
  updateConversation,
} from 'src/controllers/conversation.controller';
import {
  createMessage,
  deleteMessage,
  getMessages,
  updateMessage,
} from 'src/controllers/message.controller';
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

/**
 * Get all messages of a conversation.
 */
router.get('/:conversationId/messages', validateJwt, getMessages);

/**
 * Create a message.
 */
router.post(
  '/:conversationId/messages',
  [validateJwt, check('content', 'Content is required').notEmpty()],
  createMessage
);

/**
 * Update a message.
 */
router.put(
  '/:conversationId/messages',
  [validateJwt, check('content', 'Content is required').notEmpty()],
  updateMessage
);

/**
 * Delete a message.
 */
router.delete('/:conversationId/messages', validateJwt, deleteMessage);

export { router };
