import { Request, Response } from 'express';
import { Types } from 'mongoose';
import { IMessage, PaginationOptions, RequestExtended } from 'src/interfaces';
import {
  createOne,
  deleteOne,
  findAll,
  updateOne,
} from 'src/services/message.service';
import { handleHttpError } from 'src/utils';

/**
 * Get all the messages of a conversation.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getMessages = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { conversationId } = req.params;
  const { page, limit } = req.query;

  const paginationOptions: PaginationOptions = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  };

  const messages = await findAll(conversationId, paginationOptions);

  res.send(messages);
};

/**
 * Create a message.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const createMessage = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const { id } = req;

    const message = await createOne({
      content,
      sender: new Types.ObjectId(id as string),
      conversation: new Types.ObjectId(conversationId),
    } as IMessage);

    res.send(message);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Update a message.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const updateMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    const message = await updateOne(id, {
      content,
    });

    res.send(message);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Delete a message.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const deleteMessage = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const response = await deleteOne(id);

    res.send(response);
  } catch (error) {
    handleHttpError(res, error);
  }
};
