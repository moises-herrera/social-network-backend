import { Response } from 'express';
import { Types } from 'mongoose';
import { PaginationOptions, RequestExtended } from 'src/interfaces';
import {
  createOne,
  deleteOne,
  findAll,
  updateOne,
} from 'src/services/notification.service';
import { handleHttpError } from 'src/utils';

/**
 * Get all notifications of the current user.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getNotifications = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req;
    const { limit, page } = req.query;
    const paginationOptions: PaginationOptions = {
      limit: Number(limit) || 10,
      page: Number(page) || 1,
    };

    const responseNotifications = await findAll(
      userId as string,
      paginationOptions
    );

    res.send(responseNotifications);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Create a notification.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const createNotification = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req;
    const notification = await createOne({ ...req.body, sender: userId });

    res.send(notification);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Update a notification.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const updateNotification = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const response = await updateOne(id, req.body);

    res.send(response);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Delete a notification.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const deleteNotification = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const response = await deleteOne({
      _id: new Types.ObjectId(id),
    });

    res.send(response);
  } catch (error) {
    handleHttpError(res, error);
  }
};
