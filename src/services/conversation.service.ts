import { Types } from 'mongoose';
import {
  ConversationExtended,
  IConversation,
  IConversationDocument,
  IStandardObject,
  IStandardResponse,
  PaginatedResponse,
  PaginationOptions,
} from 'src/interfaces';
import { Conversation } from 'src/models';
import { HttpError } from 'src/utils';
import * as messageService from 'src/services/message.service';

/**
 * Find all conversations of a user.
 *
 * @param userId The user id.
 * @param paginationOptions The pagination options.
 * @returns The conversations.
 */
export const findAll = async (
  userId: string,
  participantsNameFilter: string = '',
  paginationOptions?: PaginationOptions
): Promise<PaginatedResponse<IConversationDocument>> => {
  const { page = 1, limit = 10 } = paginationOptions || {};

  const conversationsResult = await Conversation.aggregate<{
    conversations: IConversationDocument[];
    resultsCount: [{ count: number }];
  }>([
    {
      $match: {
        participants: new Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: 'messages',
        let: { conversationId: '$_id' },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ['$conversation', '$$conversationId'],
              },
            },
          },
          {
            $sort: { createdAt: -1 },
          },
          {
            $limit: 1,
          },
        ],
        as: 'lastMessage',
      },
    },
    {
      $addFields: {
        lastMessage: {
          $arrayElemAt: ['$lastMessage', 0],
        },
      },
    },
    {
      $lookup: {
        from: 'users',
        let: { participants: '$participants' },
        pipeline: [
          {
            $project: {
              _id: 1,
              fullName: {
                $concat: ['$firstName', ' ', '$lastName'],
              },
              avatar: 1,
            },
          },
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $ne: ['$_id', new Types.ObjectId(userId)],
                  },
                  {
                    $in: ['$_id', '$$participants'],
                  },
                ],
              },
            },
          },
        ],
        as: 'participants',
      },
    },
    {
      $addFields: {
        participants: {
          $map: {
            input: '$participants',
            as: 'participant',
            in: {
              _id: '$$participant._id',
              fullName: '$$participant.fullName',
              avatar: '$$participant.avatar',
            },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        participants: 1,
        lastMessage: 1,
        updatedAt: 1,
      },
    },
    {
      $sort: { updatedAt: -1 },
    },
    {
      $facet: {
        conversations: [
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

  let { conversations, resultsCount } = conversationsResult[0];

  if (participantsNameFilter) {
    conversations = conversations.filter((conversation) => {
      const participants = (conversation.participants as any).map(
        (participant: { fullName: any }) => participant.fullName
      );

      return participants.some((participant: any) =>
        participant.toLowerCase().includes(participantsNameFilter.toLowerCase())
      );
    });
  }

  const response: PaginatedResponse<IConversationDocument> = {
    data: conversations,
    resultsCount: resultsCount[0]?.count || 0,
    page,
    total: resultsCount[0]?.count || 0,
  };

  return response;
};

/**
 * Find a conversation.
 *
 * @param id The conversation id.
 * @param include The fields to include.
 * @returns The conversation.
 */
export const findOne = async (
  filter: IStandardObject = {},
  include: string = ''
): Promise<IConversationDocument | null> => {
  const conversation = await Conversation.findById(filter).populate(include);

  if (!conversation) {
    throw new HttpError('Conversación no encontrada', 404);
  }

  return conversation;
};

/**
 * Find a conversation by id.
 *
 * @param id The conversation id.
 * @param include The fields to include.
 * @returns The conversation found.
 */
export const findById = async (
  id: string,
  include: string = ''
): Promise<IConversationDocument | null> => {
  const post = await findOne({ _id: id }, include);
  return post;
};

/**
 * Create a new conversation.
 *
 * @param conversation Conversation extended data.
 * @returns The created conversation.
 */
export const createOne = async (
  conversation: ConversationExtended
): Promise<IStandardResponse<IConversation>> => {
  const { participants, message } = conversation;

  const conversationCreated = await Conversation.create({
    participants,
  });

  await messageService.createOne({
    ...message,
    conversation: conversationCreated._id,
  });

  const response: IStandardResponse<IConversation> = {
    message: 'Conversación creada correctamente',
    data: conversationCreated,
  };

  return response;
};

/**
 * Update a conversation by id.
 *
 * @param id The conversation id.
 * @param conversation The conversation data.
 * @returns The updated conversation.
 */
export const updateOne = async (
  id: string,
  conversation: IConversation
): Promise<IStandardResponse<IConversation>> => {
  const conversationUpdated = await Conversation.findByIdAndUpdate(
    id,
    conversation,
    { new: true }
  );

  if (!conversationUpdated) {
    throw new HttpError('Conversación no encontrada', 404);
  }

  const response: IStandardResponse<IConversation> = {
    message: 'Conversación actualizada correctamente',
    data: conversationUpdated,
  };

  return response;
};

/**
 * Delete a conversation by id.
 *
 * @param id The conversation id.
 * @returns A standard response.
 */
export const deleteOne = async (
  id: string
): Promise<IStandardResponse<IConversation>> => {
  const conversationDeleted = await Conversation.findByIdAndDelete(id);

  if (!conversationDeleted) {
    throw new HttpError('Conversación no encontrada', 404);
  }

  const response: IStandardResponse<IConversation> = {
    message: 'Conversación eliminada correctamente',
  };

  return response;
};
