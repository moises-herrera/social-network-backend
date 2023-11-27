import { Request, Response } from 'express';
import {
  INotification,
  IStandardObject,
  RequestExtended,
} from 'src/interfaces';
import {
  createOne,
  deleteOne,
  findAllWithUser,
  findWithUser,
  updateOne,
} from 'src/services/comment.service';
import { handleHttpError } from 'src/utils';
import * as postService from 'src/services/post.service';
import * as notificationService from 'src/services/notification.service';
import { Types } from 'mongoose';

/**
 * Get all comments.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getComments = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { postId } = req.query;
  const filter: IStandardObject = {};

  if (postId) {
    filter.post = postId;
  }

  const comments = await findAllWithUser(filter);
  res.send(comments);
};

/**
 * Get a comment.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const comment = await findWithUser({
      _id: id,
    });

    res.send(comment);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Create an comment.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const createComment = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const comment = await createOne(req.body);
    const { id: userId } = req;
    const post = await postService.findById(comment.post.toString());
    const authorId = post?.user.toString();

    if (post && userId !== authorId) {
      const notification: INotification = {
        note: 'Ha comentado tu publicación.',
        recipient: post.user,
        sender: new Types.ObjectId(userId as string),
        hasRead: false,
        post: post._id as Types.ObjectId,
        comment: comment._id as Types.ObjectId,
      };

      await notificationService.createOne(notification);
    }

    res.send(comment);
  } catch (error) {
    console.log(error);
    handleHttpError(res, error);
  }
};

/**
 * Update a comment.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const updateComment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const responseComment = await updateOne(id, req.body);

    res.send(responseComment);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Delete a comment.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const deleteComment = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const responseComment = await deleteOne(id);

    res.send(responseComment);
  } catch (error) {
    handleHttpError(res, error);
  }
};
