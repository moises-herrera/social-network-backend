import { Model, Types } from 'mongoose';

/**
 * Represents the information of a post.
 */
export interface IPost {
  /** Post title. */
  title: string;

  /** Image url. */
  image?: string;

  /** Topic. */
  topic: string;

  /** Description. */
  description: string;

  /** User id of the author. */
  userId: Types.ObjectId;

  /** Comments. */
  comments: Types.ObjectId[];

  /** Likes. */
  likes: Types.ObjectId[];
}

/**
 * Represents the document of a post.
 */
export interface IPostDocument extends IPost, Document {}

/**
 * Represents the model of a post.
 */
export interface IPostModel extends Model<IPostDocument> {
  buildPost(post: IPost): IPostDocument;
}