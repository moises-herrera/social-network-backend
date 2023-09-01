import { NextFunction, Request, Response } from 'express';
import { validationResult } from 'express-validator';

/**
 * Validate the fields of a request.
 *
 * @param req The request object.
 * @param res The response object.
 * @param next The next function.
 * @returns A response with the errors if there are any.
 */
export const validateFields = (
  req: Request,
  res: Response,
  next: NextFunction
): void | Response<any, Record<string, any>> => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.mapped(),
    });
  }

  return next();
};
