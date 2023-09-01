import { Request, Response } from 'express';
import { sendConfirmationEmail } from 'src/services/email.service';
import { HttpError, handleHttpError } from 'src/utils';

/**
 * Sends a confirmation email.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const confirmEmail = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { recipient } = req.body;

    await sendConfirmationEmail(recipient);
    res.send({ message: 'Email enviado' });
  } catch (error) {
    const httpError =
      error instanceof HttpError
        ? error
        : new HttpError('Ha ocurrido un error al enviar el email', 500);

    handleHttpError(res, httpError);
  }
};
