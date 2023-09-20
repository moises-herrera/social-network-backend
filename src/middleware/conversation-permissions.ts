import { NextFunction, Response } from 'express';
import { RequestExtended, Role } from 'src/interfaces';
import { HttpError, handleHttpError } from 'src/utils';
import * as userService from 'src/services/user.service';
import * as conversationService from 'src/services/conversation.service';
import * as messageService from 'src/services/message.service';
import { Types } from 'mongoose';

/**
 * Validate conversation permissions.
 *
 * @param req The request object.
 * @param res The response object.
 * @param next The next function.
 */
export const validateConversationPermissions = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      id: currentUserId,
      params: { conversationId },
    } = req;

    const conversation = await conversationService.findOne({
      _id: conversationId,
      participants: new Types.ObjectId(currentUserId),
    });

    if (!conversation) {
      throw new HttpError('No tiene permisos', 403);
    }

    next();
  } catch (error) {
    return handleHttpError(res, error);
  }
};

/**
 * Validate message permissions.
 *
 * @param req The request object.
 * @param res The response object.
 * @param next The next function.
 */
export const validateMessagePermissions = async (
  req: RequestExtended,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      id: currentUserId,
      params: { id },
    } = req;

    const user = await userService.findById(currentUserId as string);

    if (!user) {
      throw new HttpError('Usuario no encontrado', 404);
    }

    const message = await messageService.findById(id);

    if (!message) {
      throw new HttpError('Mensaje no encontrado', 404);
    }

    const hasSelfPermissions =
      user.role === Role.Admin || currentUserId === message.sender.toString();

    if (!hasSelfPermissions) {
      throw new HttpError('No tiene permisos', 403);
    }

    next();
  } catch (error) {
    return handleHttpError(res, error);
  }
};
