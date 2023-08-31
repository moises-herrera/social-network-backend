import { Request, Response } from 'express';
import { RequestExtended } from 'src/interfaces';
import {
  createOne,
  deleteOne,
  findAll,
  findById,
  updateOne,
} from 'src/services/article.service';
import { HttpError, handleHttpError } from 'src/utils';

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
    const httpError =
      error instanceof HttpError
        ? error
        : new HttpError('Internal server error.', 500);

    handleHttpError(res, httpError);
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
    const httpError =
      error instanceof HttpError
        ? error
        : new HttpError('Internal server error.', 500);

    handleHttpError(res, httpError);
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
    const httpError =
      error instanceof HttpError
        ? error
        : new HttpError('Internal server error.', 500);

    handleHttpError(res, httpError);
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
    const httpError =
      error instanceof HttpError
        ? error
        : new HttpError('Internal server error.', 500);

    handleHttpError(res, httpError);
  }
};
