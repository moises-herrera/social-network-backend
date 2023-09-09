import { Request, Response } from 'express';
import { IStandardObject, RequestExtended } from 'src/interfaces';
import {
  createOne,
  deleteOne,
  findAll,
  findById,
  likeOne,
  updateOne,
} from 'src/services/post.service';
import * as userService from 'src/services/user.service';
import { handleHttpError } from 'src/utils';

/**
 * Get all posts.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getPosts = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  const { id: currentUserId } = req;
  const { following, suggested, userId, search } = req.query;
  const filter: IStandardObject = {};

  if (following) {
    const followingUsers = await userService.getFollowing(
      currentUserId as string
    );
    filter.user = { $in: followingUsers };
  } else if (suggested) {
    const users = await userService.findAll({
      _id: { $ne: currentUserId },
      sort: { followers: -1 },
    });
    filter.user = users.length > 0 ? { $in: users } : { $ne: currentUserId };
  } else if (userId) {
    filter.user = userId;
  } else if (search) {
    filter.topic = { $regex: search, $options: 'i' };
  }

  const posts = await findAll(filter, 'user');
  res.send(posts);
};

/**
 * Get a post.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = await findById(id, 'user');

    res.send(post);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Create a post.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const createPost = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req;
    const postData = { ...req.body, user: userId };
    const imageBuffer = req.file?.buffer;

    const post = await createOne(postData, imageBuffer);

    res.send(post);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Update a post.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const updatePost = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { id: userId } = req;
    const postData = { ...req.body, user: userId };
    const imageBuffer = req.file?.buffer;
    const responsePost = await updateOne(id, postData, imageBuffer);

    res.send(responsePost);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Delete a post.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const deletePost = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const responsePost = await deleteOne(id);

    res.send(responsePost);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Like a post.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const likePost = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id: userId } = req;
    const { id: postId } = req.params;

    const responsePost = await likeOne(postId, userId as string);

    res.send(responsePost);
  } catch (error) {
    handleHttpError(res, error);
  }
};
