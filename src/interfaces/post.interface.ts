import { Model, Types } from 'mongoose';
import { FileStored } from '.';

/**
 * Represents the information of a post.
 */
export interface IPost {
  /** Post title. */
  title: string;

  /** Image url. */
  image?: string;

  /** Post files. */
  files: FileStored[];

  /** Topic. */
  topic: string;

  /** Description. */
  description: string;

  /** User id of the author. */
  user: Types.ObjectId;

  /** Comments. */
  comments: Types.ObjectId[];

  /** Likes. */
  likes: Types.ObjectId[];

  /** Whether the post is anonymous. */
  isAnonymous: boolean;
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
