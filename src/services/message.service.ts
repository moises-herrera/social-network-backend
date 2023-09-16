import { Types } from 'mongoose';
import {
  PaginatedResponse,
  IMessageDocument,
  PaginationOptions,
  IStandardObject,
  IMessage,
  IStandardResponse,
} from 'src/interfaces';
import { Message } from 'src/models';
import { HttpError } from 'src/utils';

/**
 * Find all messages of a conversation.
 *
 * @param conversationId The conversation id.
 * @param paginationOptions The pagination options.
 * @returns The messages.
 */
export const findAll = async (
  conversationId: string,
  paginationOptions?: PaginationOptions
): Promise<PaginatedResponse<IMessageDocument>> => {
  const { page = 1, limit = 10 } = paginationOptions || {};

  const messageResults = await Message.aggregate<{
    messages: IMessageDocument[];
    resultsCount: [{ count: number }];
  }>([
    {
      $match: {
        conversation: new Types.ObjectId(conversationId),
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $facet: {
        messages: [
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
        ],
        resultsCount: [
          {
            $count: 'count',
          },
        ],
      },
    },
  ]);

  const { messages, resultsCount } = messageResults[0];

  const response: PaginatedResponse<IMessageDocument> = {
    data: messages,
    resultsCount: resultsCount[0]?.count || 0,
    page,
    total: resultsCount[0]?.count || 0,
  };

  return response;
};

/**
 * Find a message.
 *
 * @param filter The filter.
 * @returns The message.
 */
export const findOne = async (
  filter: IStandardObject = {}
): Promise<IMessageDocument | null> => {
  const message = await Message.findOne(filter);
  return message;
};

/**
 * Find a message by id.
 *
 * @param id The message id.
 * @returns The message.
 */
export const findById = async (
  id: string
): Promise<IMessageDocument | null> => {
  const message = await findOne({ _id: id });
  return message;
};

/**
 * Create a message.
 *
 * @param message The message data.
 * @returns The message created.
 */
export const createOne = async (
  message: IMessage
): Promise<IStandardResponse<IMessageDocument>> => {
  const messageCreated = await Message.create(message);

  const response: IStandardResponse<IMessageDocument> = {
    message: 'Mensaje creado correctamente',
    data: messageCreated,
  };

  return response;
};

/**
 * Update a message by id.
 *
 * @param id The message id.
 * @param message The message data.
 * @returns The message updated.
 */
export const updateOne = async (
  id: string,
  message: IMessage
): Promise<IStandardResponse<IMessageDocument>> => {
  const messageUpdated = await Message.findByIdAndUpdate(id, message, {
    new: true,
  });

  if (!messageUpdated) {
    throw new HttpError('Mensaje no encontrado', 404);
  }

  const response: IStandardResponse<IMessageDocument> = {
    message: 'Mensaje actualizado correctamente',
    data: messageUpdated,
  };

  return response;
};

/**
 * Delete a message by id.
 *
 * @param id The message id.
 * @returns A standard response.
 */
export const deleteOne = async (id: string): Promise<IStandardResponse> => {
  const messageDeleted = await Message.findByIdAndDelete(id);

  if (!messageDeleted) {
    throw new HttpError('Mensaje no encontrado', 404);
  }

  const response: IStandardResponse = {
    message: 'Mensaje eliminado correctamente',
  };

  return response;
};
