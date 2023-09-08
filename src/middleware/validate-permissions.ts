import { NextFunction, Response } from 'express';
import { IPostDocument, RequestExtended, Role } from 'src/interfaces';
import * as postService from 'src/services/post.service';
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
      throw new HttpError('Sin autorización', 401);
    }

    const { id } = verifyToken(token) as { id: string };
    req.id = id;

    next();
  } catch (error) {
    const httpError =
      error instanceof HttpError ? error : new HttpError('Token invalido', 401);
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
      throw new HttpError('Usuario no encontrado', 404);
    }

    if (user.role !== Role.Admin) {
      throw new HttpError('Debe ser administrador', 403);
    }

    next();
  } catch (error) {
    return handleHttpError(res, error);
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
      throw new HttpError('Usuario no encontrado', 404);
    }

    if (user.role !== Role.Admin && currentUserId !== id) {
      throw new HttpError('No tiene permisos', 403);
    }

    next();
  } catch (error) {
    return handleHttpError(res, error);
  }
};

/**
 * Validate post permissions.
 *
 * @param req The request object.
 * @param res The response object.
 * @param next The next function.
 */
export const validatePostPermissions = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const {
    id: currentUserId,
    params: { id: postId },
  } = req;

  try {
    const user = await userService.findById(currentUserId as string);

    if (!user) {
      throw new HttpError('Usuario no encontrado', 404);
    }

    const post = await postService.findById(postId as string);

    if (!post) {
      throw new HttpError('Post no encontrado', 404);
    }

    if (user.role !== Role.Admin && currentUserId !== post.user.toString()) {
      throw new HttpError('No tiene permisos', 403);
    }

    next();
  } catch (error) {
    return handleHttpError(res, error);
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
      throw new HttpError('Usuario no encontrado', 404);
    }

    const comment = await commentService.findById(commentId as string);

    if (!comment) {
      throw new HttpError('Comentario no encontrado', 404);
    }

    const hasSelfPermissions =
      user.role === Role.Admin || currentUserId === comment.userId.toString();
    let post: IPostDocument | null = null;

    if (method === 'DELETE') {
      post = await postService.findById(comment.postId.toString());

      if (!post) {
        throw new HttpError('Post no encontrado', 404);
      }
    }

    const isOwner = post && currentUserId === post.user.toString();

    if (!hasSelfPermissions && !isOwner) {
      throw new HttpError('No tiene permisos', 403);
    }

    next();
  } catch (error) {
    return handleHttpError(res, error);
  }
};
