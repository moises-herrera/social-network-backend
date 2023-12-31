import { Response } from 'express';
import { Types } from 'mongoose';
import { io } from 'src/config';
import { PaginationOptions, RequestExtended } from 'src/interfaces';
import {
  createOne,
  deleteOne,
  findAll,
  findOne,
  updateOne,
} from 'src/services/conversation.service';
import { handleHttpError } from 'src/utils';

/**
 * Get all conversations.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getConversations = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  const { id } = req;
  const { search, page, limit } = req.query;

  const paginationOptions: PaginationOptions = {
    page: Number(page) || 1,
    limit: Number(limit) || 10,
  };

  const response = await findAll(
    id as string,
    search as string,
    paginationOptions
  );

  res.send(response);
};

/**
 * Get a conversation.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getConversation = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req;
    const { id } = req.params;

    const conversation = await findOne({
      _id: id,
      participants: new Types.ObjectId(userId),
    });

    res.send(conversation);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Create a conversation.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const createConversation = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req;
    const response = await createOne(id as string, req.body);

    response.data?.participants.forEach((participant) => {
      if (participant._id.toString() !== id) {
        io.to(participant._id.toString()).emit('new-chat', response.data);
      }
    });

    res.send(response);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Update a conversation.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const updateConversation = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const response = await updateOne(id as string, req.body);
    res.send(response);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Delete a conversation.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const deleteConversation = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const response = await deleteOne(id as string);
    res.send(response);
  } catch (error) {
    handleHttpError(res, error);
  }
};
