import { Types } from 'mongoose';
import {
  INotification,
  INotificationDocument,
  IStandardObject,
  IStandardResponse,
  PaginatedResponse,
  PaginationOptions,
} from 'src/interfaces';
import { Notification } from 'src/models';
import { HttpError } from 'src/utils';

/**
 * Find all notifications of a user.
 *
 * @param userId The user id.
 * @param paginationOptions The pagination options.
 * @returns The notifications.
 */
export const findAll = async (
  userId: string,
  paginationOptions?: PaginationOptions
): Promise<PaginatedResponse<INotificationDocument>> => {
  const { page = 1, limit = 10 } = paginationOptions || {};

  const notificationResults = await Notification.aggregate<{
    notifications: INotificationDocument[];
    resultsCount: [{ count: number }];
  }>([
    {
      $match: {
        recipient: new Types.ObjectId(userId),
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $facet: {
        notifications: [
          {
            $skip: (page - 1) * limit,
          },
          {
            $limit: limit,
          },
          {
            $sort: { createdAt: 1 },
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

  const { notifications, resultsCount } = notificationResults[0];

  await Notification.populate(notifications, {
    path: 'sender',
    select: 'username avatar',
  });

  const response: PaginatedResponse<INotificationDocument> = {
    data: notifications,
    resultsCount: resultsCount[0]?.count || 0,
    page,
    total: resultsCount[0]?.count || 0,
  };

  return response;
};

/**
 * Create a notification.
 *
 * @param notification The notification to create.
 * @returns The created notification.
 */
export const createOne = async (
  notification: Partial<INotification>
): Promise<IStandardResponse<INotificationDocument>> => {
  const notificationCreated = await Notification.create(notification);

  const response: IStandardResponse<INotificationDocument> = {
    message: 'Notificación creada con éxito.',
    data: notificationCreated,
  };

  return response;
};

/**
 * Update a notification.
 *
 * @param id The notification id.
 * @param notification The notification to update.
 * @returns The updated notification.
 */
export const updateOne = async (
  id: string,
  notification: Partial<INotification>
): Promise<IStandardResponse<INotificationDocument>> => {
  const notificationUpdated = await Notification.findByIdAndUpdate(
    id,
    notification,
    { new: true }
  );

  if (!notificationUpdated) {
    throw new HttpError('Notificación no encontrada', 404);
  }

  const response: IStandardResponse<INotificationDocument> = {
    message: 'Notificación actualizada con éxito.',
    data: notificationUpdated,
  };

  return response;
};

/**
 * Delete a notification.
 *
 * @param filter The filter.
 * @returns A standard response.
 */
export const deleteOne = async (
  filter: IStandardObject
): Promise<IStandardResponse> => {
  const notificationDeleted = await Notification.findOneAndDelete(filter);

  if (!notificationDeleted) {
    throw new HttpError('Notificación no encontrada', 404);
  }

  const response: IStandardResponse = {
    message: 'Notificación eliminada con éxito.',
  };

  return response;
};
