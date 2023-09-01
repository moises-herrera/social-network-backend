import { Model, Types } from 'mongoose';

/**
 * Represents the information of a like.
 */
export interface ILike {
  /** User id. */
  userId: Types.ObjectId;

  /** Article id. */
  articleId: Types.ObjectId;
}

/**
 * Represents the document of a like.
 */
export interface ILikeDocument extends ILike, Document {}

/**
 * Represents the model of a like.
 */
export interface ILikeModel extends Model<ILikeDocument> {
  buildLike(like: ILike): ILikeDocument;
}
