import { Request, Response } from 'express';
import { RequestExtended } from 'src/interfaces';
import {
  changeUserPassword,
  deleteOne,
  findAll,
  findById,
  followOne,
  unFollowOne,
  updateOne,
  verifyUserEmail,
} from 'src/services/user.service';
import { handleHttpError } from 'src/utils';

/**
 * Get all users.
 *
 * @param _req The request object.
 * @param res The response object.
 */
export const getUsers = async (_req: Request, res: Response): Promise<void> => {
  const users = await findAll();
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
    const user = await findById(id);

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

    const avatarBuffer = req.file?.buffer;
    const responseUser = await updateOne(id, req.body, avatarBuffer as Buffer);

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
