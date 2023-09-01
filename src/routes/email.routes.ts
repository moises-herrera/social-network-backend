import { Router } from 'express';
import { confirmEmail, resetPassword } from 'src/controllers/email.controller';

const router = Router();

/**
 * Route to send a confirmation email.
 */
router.post('/confirm-email', confirmEmail);

/**
 * Route to send a reset password email.
 */
router.post('/reset-password', resetPassword);

export { router };
