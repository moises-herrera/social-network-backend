import { Response } from 'express';
import { HttpError } from '.';
import { IStandardResponse } from 'src/interfaces';

/**
 * Handle HTTP errors.
 *
 * @param res The response object.
 * @param error The error object.
 */
export const handleHttpError = (res: Response, error: unknown): void => {
  console.log(error);

  const httpError =
    error instanceof HttpError
      ? error
      : new HttpError('Ha ocurrido un error', 500);

  res.status(httpError.statusCode).json(<IStandardResponse>{
    message: httpError.message,
  });
};
