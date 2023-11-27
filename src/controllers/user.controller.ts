import { Request, Response } from 'express';
import { Types, isObjectIdOrHexString } from 'mongoose';
import {
  INotification,
  IStandardObject,
  PaginationOptions,
  RequestExtended,
} from 'src/interfaces';
import {
  changeUserPassword,
  deleteOne,
  findAll,
  findById,
  findOne,
  followOne,
  getFollowers,
  getFollowing,
  unFollowOne,
  updateOne,
  verifyUserEmail,
} from 'src/services/user.service';
import { handleHttpError } from 'src/utils';
import * as notificationService from 'src/services/notification.service';

/**
 * Get all users.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getUsers = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  const { username, name, excludeCurrentUser, limit, page } = req.query;
  const filter: IStandardObject = {};

  if (username) {
    filter.username = { $regex: username as string, $options: 'i' };
  }

  if (name) {
    filter.$or = [
      { firstName: { $regex: name as string, $options: 'i' } },
      { lastName: { $regex: name as string, $options: 'i' } },
    ];
  }

  if (excludeCurrentUser) {
    filter._id = { $ne: new Types.ObjectId(req.id) };
  }

  const paginationOptions: PaginationOptions = {
    limit: Number(limit) || 10,
    page: Number(page) || 1,
  };

  const users = await findAll(filter, paginationOptions);
  res.send(users);
};

/**
 * Get a user.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const isObjectId = isObjectIdOrHexString(id);
    const user = isObjectId
      ? await findById(id)
      : await findOne({ username: id });

    res.send(user);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Update a user.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const updateUser = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const responseUser = await updateOne(id, req.body);

    res.send(responseUser);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Delete a user.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const deleteUser = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const responseUser = await deleteOne(id);

    res.send(responseUser);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Verify user email.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const verifyEmail = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const responseUser = await verifyUserEmail(id);

    res.send(responseUser);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Change user password.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const changePassword = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    const responseUser = await changeUserPassword(id, password);

    res.send(responseUser);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Follow user.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const followUser = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id: followerId } = req;
    const { id: userId } = req.params;

    const responseUser = await followOne(userId, followerId as string);

    const notification: INotification = {
      note: 'Te ha seguido.',
      recipient: new Types.ObjectId(userId),
      sender: new Types.ObjectId(followerId as string),
      hasRead: false,
    };

    await notificationService.createOne(notification);

    res.send(responseUser);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Unfollow user.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const unFollowUser = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id: followerId } = req;
    const { id: userId } = req.params;

    const responseUser = await unFollowOne(userId, followerId as string);

    res.send(responseUser);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Get user followers.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getUserFollowers = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, limit, page } = req.query;
    const filter: IStandardObject = {};

    if (username) {
      filter.username = { $regex: username as string, $options: 'i' };
    }

    const paginationOptions: PaginationOptions = {
      limit: Number(limit) || 10,
      page: Number(page) || 1,
    };
    const responseUser = await getFollowers(id, filter, paginationOptions);

    res.send(responseUser);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Get all the accounts that the user follows.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getUsersFollowing = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { username, limit, page } = req.query;
    const filter: IStandardObject = {};

    if (username) {
      filter.username = { $regex: username as string, $options: 'i' };
    }

    const paginationOptions: PaginationOptions = {
      limit: Number(limit) || 10,
      page: Number(page) || 1,
    };

    const responseUser = await getFollowing(id, filter, paginationOptions);

    res.send(responseUser);
  } catch (error) {
    handleHttpError(res, error);
  }
};
