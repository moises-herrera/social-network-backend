import { NextFunction, Response } from 'express';
import { IArticleDocument, RequestExtended, Role } from 'src/interfaces';
import * as articleService from 'src/services/article.service';
import * as userService from 'src/services/user.service';
import * as commentService from 'src/services/comment.service';
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
  try {
    const token = req.headers.authorization?.split(' ').pop() || '';

    if (!token) {
      throw new HttpError('No token provided.', 401);
    }

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
    const user = await userService.findById(id as string);

    if (!user) {
      throw new HttpError('User not found.', 404);
    }

    if (user.role !== Role.Admin) {
      throw new HttpError('User is not an admin.', 403);
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
    const user = await userService.findById(currentUserId as string);

    if (!user) {
      throw new HttpError('User not found.', 404);
    }

    if (user.role !== Role.Admin && currentUserId !== id) {
      throw new HttpError('You do not have permissions.', 403);
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
 * Validate article permissions.
 *
 * @param req The request object.
 * @param res The response object.
 * @param next The next function.
 */
export const validateArticlePermissions = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    id: currentUserId,
    params: { id: articleId },
  } = req;

  try {
    const user = await userService.findById(currentUserId as string);

    if (!user) {
      throw new HttpError('User not found.', 404);
    }

    const article = await articleService.findById(articleId as string);

    if (!article) {
      throw new HttpError('Article not found.', 404);
    }

    if (
      user.role !== Role.Admin &&
      currentUserId !== article.userId.toString()
    ) {
      throw new HttpError('You do not have permissions.', 403);
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
 * Validate comment permissions.
 *
 * @param req The request object.
 * @param res The response object.
 * @param next The next function.
 */
export const validateCommentPermissions = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    id: currentUserId,
    params: { id: commentId },
    method,
  } = req;

  try {
    const user = await userService.findById(currentUserId as string);

    if (!user) {
      throw new HttpError('User not found.', 404);
    }

    const comment = await commentService.findById(commentId as string);

    if (!comment) {
      throw new HttpError('Comment not found.', 404);
    }

    const hasSelfPermissions =
      user.role === Role.Admin || currentUserId === comment.userId.toString();
    let article: IArticleDocument | null = null;

    if (method === 'DELETE') {
      article = await articleService.findById(comment.articleId.toString());

      if (!article) {
        throw new HttpError('Article not found.', 404);
      }
    }

    const isOwner = article && currentUserId === article.userId.toString();

    if (!hasSelfPermissions && !isOwner) {
      throw new HttpError('You do not have permissions.', 403);
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
