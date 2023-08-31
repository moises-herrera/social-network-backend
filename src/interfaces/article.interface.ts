import { Model, Types } from 'mongoose';

/**
 * Represents the information of an article.
 */
export interface IArticle {
  /** Article title. */
  title: string;

  /** Image url. */
  image?: string;

  /** Description. */
  description: string;

  /** User id of the author. */
  userId: Types.ObjectId;

  /** Comments. */
  comments: Types.ObjectId[];
}

/**
 * Represents the document of an article.
 */
export interface IArticleDocument extends IArticle, Document {}

/**
 * Represents the model of an article.
 */
export interface IArticleModel extends Model<IArticleDocument> {
  buildArticle(article: IArticle): IArticleDocument;
}
