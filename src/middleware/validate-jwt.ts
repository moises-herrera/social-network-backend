import { NextFunction, Response } from 'express';
import { RequestExtended, Role } from 'src/interfaces';
import { findById } from 'src/services/user.service';
import { HttpError, handleHttpError, verifyToken } from 'src/utils';

/**
 * Validate a JWT token.
 *
 * @param req The request object.
 * @param res The response object.
 * @param next The next function.
 */
export const validateJwt = (
  req: RequestExtended,
  res: Response,
  next: NextFunction
): void => {
  const token = req.headers.authorization?.split(' ').pop() || '';

  if (!token) {
    const error = new HttpError('No token provided.', 401);
    return handleHttpError(res, error);
  }

  try {
    const { id } = verifyToken(token) as { id: string };
    req.id = id;

    next();
  } catch (error) {
    const httpError =
      error instanceof HttpError ? error : new HttpError('Invalid token.', 401);
    return handleHttpError(res, httpError);
  }
};

/**
 * Validate the role of a user.
 *
 * @param req The request object.
 * @param res The response object.
 * @param next The next function.
 */
export const validateAdminRole = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { id } = req;

  try {
    const user = await findById(id as string);

    if (!user) {
      const error = new HttpError('User not found.', 404);
      return handleHttpError(res, error);
    }

    if (user.role !== Role.Admin) {
      const error = new HttpError('User is not an admin.', 403);
      return handleHttpError(res, error);
    }

    next();
  } catch (error) {
    const httpError =
      error instanceof HttpError
        ? error
        : new HttpError('Internal server error', 500);
    return handleHttpError(res, httpError);
  }
};

/**
 * Validate the permissions of a user.
 * 
 * @param req The request object.
 * @param res The response object.
 * @param next The next function.
 */
export const validateUserSelfPermissions = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
) => {
  const {
    id: currentUserId,
    params: { id },
  } = req;

  try {
    const user = await findById(currentUserId as string);

    if (!user) {
      const error = new HttpError('User not found.', 404);
      return handleHttpError(res, error);
    }

    if (user.role !== Role.Admin && currentUserId !== id) {
      const error = new HttpError('You do not have permissions.', 403);
      return handleHttpError(res, error);
    }

    next();
  } catch (error) {
    const httpError =
      error instanceof HttpError
        ? error
        : new HttpError('Internal server error', 500);
    return handleHttpError(res, httpError);
  }
};
