import { Model, Types } from 'mongoose';

/**
 * Represents the information of a comment.
 */
export interface IComment {
  /** Comment content. */
  content: string;

  /** User id. */
  userId: Types.ObjectId;

  /** Article id. */
  articleId: Types.ObjectId;
}

/**
 * Represents the document of a comment.
 */
export interface ICommentDocument extends IComment, Document {}

/**
 * Represents the model of a comment.
 */
export interface ICommentModel extends Model<ICommentDocument> {
  buildComment(comment: IComment): ICommentDocument;
}
