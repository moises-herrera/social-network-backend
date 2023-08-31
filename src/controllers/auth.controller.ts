import { Request, Response } from 'express';
import { createOne } from 'src/services/user.service';
import { handleHttpError, HttpError } from 'src/utils';

/**
 * Register a user.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const responseUser = await createOne(req.body);
    res.send(responseUser);
  } catch (error) {
    const httpError =
      error instanceof HttpError
        ? error
        : new HttpError('Internal server error.', 500);

    handleHttpError(res, httpError);
  }
};
