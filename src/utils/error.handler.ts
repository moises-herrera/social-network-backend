import { Response } from 'express';
import { HttpError } from '.';

/**
 * Handle HTTP errors
 *
 * @param res The response object.
 * @param error The error object.
 * @param errorRaw The raw error.
 */
export const handleHttpError = (res: Response, error: HttpError) => {
  console.log(error);
  res.status(error.statusCode).json({
    message: error.message,
  });
};
