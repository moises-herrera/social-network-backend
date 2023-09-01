import { IComment, ICommentDocument, IStandardObject } from 'src/interfaces';
import { Comment } from 'src/models';
import { HttpError } from 'src/utils';

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
 * Find an comment.
 *
 * @param filter The filter to apply.
 * @returns The comment found.
 */
export const findOne = async (
  filter: IStandardObject
): Promise<ICommentDocument | null> => {
  const comment = await Comment.findOne(filter);
  return comment;
};

/**
 * Find an comment by id.
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
  const createdComment = await Comment.create(comment);
  return createdComment;
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
    throw new HttpError('Comment not found.', 404);
  }

  return updatedComment;
};

/**
 * Delete an comment.
 *
 * @param id The comment id.
 * @returns The deleted comment.
 */
export const deleteOne = async (
  id: string
): Promise<ICommentDocument | null> => {
  const deletedComment = await Comment.findByIdAndDelete(id);

  if (!deletedComment) {
    throw new HttpError('Comment not found.', 404);
  }

  return deletedComment;
};