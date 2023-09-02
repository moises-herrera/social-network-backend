import { Request, Response } from 'express';
import { RequestExtended } from 'src/interfaces';
import {
  createOne,
  deleteOne,
  findAll,
  findById,
  updateOne,
} from 'src/services/article.service';
import { handleHttpError } from 'src/utils';

/**
 * Get all articles.
 *
 * @param _req The request object.
 * @param res The response object.
 */
export const getArticles = async (
  _req: Request,
  res: Response
): Promise<void> => {
  const articles = await findAll();
  res.send(articles);
};

/**
 * Get a article.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const getArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const article = await findById(id);

    res.send(article);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Create an article.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const createArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const article = await createOne(req.body);

    res.send(article);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Update a article.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const updateArticle = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const responseArticle = await updateOne(id, req.body);

    res.send(responseArticle);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Delete a article.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const deleteArticle = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const responseArticle = await deleteOne(id);

    res.send(responseArticle);
  } catch (error) {
    handleHttpError(res, error);
  }
};
