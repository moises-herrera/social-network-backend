import { Router } from 'express';
import { confirmEmail } from 'src/controllers/email.controller';

const router = Router();

/**
 * Route to send a confirmation email.
 */
router.post('/confirm-email', confirmEmail);

export { router };
