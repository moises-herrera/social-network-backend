import {
  IComment,
  ICommentDocument,
  IStandardObject,
  IStandardResponse,
  IUser,
} from 'src/interfaces';
import { Comment, Post } from 'src/models';
import { HttpError } from 'src/utils';
import * as postService from 'src/services/post.service';
import { getUserWithMostFollowers } from 'src/services/user.service';

/**
 * Find all comments.
 *
 * @param filter The filter to apply.
 * @returns All comments.
 */
export const findAll = async (
  filter: IStandardObject = {}
): Promise<ICommentDocument[]> => {
  const comments = await Comment.find(filter);
  return comments;
};

/**
 * Find a comment.
 *
 * @param filter The filter to apply.
 * @returns All comments.
 */
export const findOne = async (
  filter: IStandardObject = {}
): Promise<ICommentDocument | null> => {
  const comment = await Comment.findOne(filter);
  return comment;
};

/**
 * Find all comments with user.
 *
 * @param filter The filter to apply.
 * @returns All comments.
 */
export const findAllWithUser = async (
  filter: IStandardObject = {}
): Promise<ICommentDocument[]> => {
  const comments = await Comment.find(filter).populate(
    'user',
    'firstName lastName username avatar isAccountVerified'
  );
  const userWithMostFollowers = await getUserWithMostFollowers();

  if (userWithMostFollowers && comments.length) {
    comments.forEach((comment) => {
      const commentUser = comment.user as unknown as IUser;
      commentUser.isAccountVerified =
        commentUser.username === userWithMostFollowers.username;
    });
  }

  return comments;
};

/**
 * Find a comment with user.
 *
 * @param filter The filter to apply.
 * @returns The comment found.
 */
export const findWithUser = async (
  filter: IStandardObject
): Promise<ICommentDocument | null> => {
  const comment = await Comment.findOne(filter).populate(
    'user',
    'firstName lastName username avatar isAccountVerified'
  );
  const userWithMostFollowers = await getUserWithMostFollowers();

  if (userWithMostFollowers && comment && comment.user) {
    const commentUser = comment.user as unknown as IUser;
    commentUser.isAccountVerified =
      commentUser.username === userWithMostFollowers.username;
  }

  return comment;
};

/**
 * Find a comment by id.
 *
 * @returns The comment found.
 */
export const findById = async (
  id: string
): Promise<ICommentDocument | null> => {
  const comment = await findOne({ _id: id });
  return comment;
};

/**
 * Create a new comment.
 *
 * @param comment Comment data.
 * @returns The created comment.
 */
export const createOne = async (
  comment: IComment
): Promise<ICommentDocument> => {
  const post = await postService.findById(comment.post.toString());

  if (!post) {
    throw new HttpError('Post no encontrado', 404);
  }

  const createdComment = await Comment.create(comment);

  await Post.findByIdAndUpdate(comment.post, {
    $push: { comments: createdComment._id },
  });

  return createdComment.populate(
    'user',
    'firstName lastName username avatar isAccountVerified'
  );
};

/**
 * Update an comment.
 *
 * @param id The comment id.
 * @param comment The comment data.
 * @returns The updated comment.
 */
export const updateOne = async (
  id: string,
  comment: IComment
): Promise<ICommentDocument | null> => {
  const updatedComment = await Comment.findByIdAndUpdate(id, comment, {
    new: true,
  });

  if (!updatedComment) {
    throw new HttpError('Comentario no encontrado', 404);
  }

  return updatedComment;
};

/**
 * Delete an comment.
 *
 * @param id The comment id.
 * @returns The deleted comment.
 */
export const deleteOne = async (id: string): Promise<IStandardResponse> => {
  const deletedComment = await Comment.findByIdAndDelete(id);

  if (!deletedComment) {
    throw new HttpError('Comentario no encontrado', 404);
  }

  await Post.findByIdAndUpdate(deletedComment.post, {
    $pull: { comments: deletedComment._id },
  });

  const response: IStandardResponse = {
    message: 'Comentario eliminado correctamente',
  };

  return response;
};
