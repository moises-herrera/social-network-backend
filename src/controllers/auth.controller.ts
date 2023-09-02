import { Request, Response } from 'express';
import { RequestExtended } from 'src/interfaces';
import { createOne, loginUser, renewToken } from 'src/services/user.service';
import { handleHttpError } from 'src/utils';

/**
 * Register a user.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const responseUser = await createOne(req.body);
    res.send(responseUser);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Login a user.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const loginResponse = await loginUser(req.body);
    res.send(loginResponse);
  } catch (error) {
    handleHttpError(res, error);
  }
};

/**
 * Validate a JWT token.
 *
 * @param req The request object.
 * @param res The response object.
 */
export const validateToken = async (
  req: RequestExtended,
  res: Response
): Promise<void> => {
  try {
    const { id } = req;
    const loginResponse = await renewToken(id as string);
    res.send(loginResponse);
  } catch (error) {
    handleHttpError(res, error);
  }
};
