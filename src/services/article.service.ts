import {
  IArticle,
  IArticleDocument,
  IStandardObject,
  IStandardResponse,
} from 'src/interfaces';
import { Article } from 'src/models';
import { HttpError } from 'src/utils';

/**
 * Find all articles.
 *
 * @param filter The filter to apply.
 * @returns All articles.
 */
export const findAll = async (
  filter: IStandardObject = {}
): Promise<IArticleDocument[]> => {
  const articles = await Article.find(filter);
  return articles;
};

/**
 * Find an article.
 *
 * @param filter The filter to apply.
 * @returns The article found.
 */
export const findOne = async (
  filter: IStandardObject
): Promise<IArticleDocument | null> => {
  const article = await Article.findOne(filter);
  return article;
};

/**
 * Find an article by id.
 *
 * @returns The article found.
 */
export const findById = async (
  id: string
): Promise<IArticleDocument | null> => {
  const article = await findOne({ _id: id });
  return article;
};

/**
 * Create a new article.
 *
 * @param article Article data.
 * @returns The created article.
 */
export const createOne = async (
  article: IArticle
): Promise<IArticleDocument> => {
  const createdArticle = await Article.create(article);
  return createdArticle;
};

/**
 * Update an article.
 *
 * @param id The article id.
 * @param article The article data.
 * @returns The updated article.
 */
export const updateOne = async (
  id: string,
  article: IArticle
): Promise<IArticleDocument | null> => {
  const updatedArticle = await Article.findByIdAndUpdate(id, article, {
    new: true,
  });

  if (!updatedArticle) {
    throw new HttpError('Articulo no encontrado', 404);
  }

  return updatedArticle;
};

/**
 * Delete an article.
 *
 * @param id The article id.
 * @returns The deleted article.
 */
export const deleteOne = async (id: string): Promise<IStandardResponse> => {
  const deletedArticle = await Article.findByIdAndDelete(id);

  if (!deletedArticle) {
    throw new HttpError('Articulo no encontrado', 404);
  }

  const response: IStandardResponse = {
    message: 'Comentario eliminado correctamente',
  };

  return response;
};
