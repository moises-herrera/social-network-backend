import { IUser } from '.';

/**
 * The auth response.
 */
export interface IAuthResponse {
  /** Access token. */
  accessToken: string;

  /** User data. */
  user: IUser;
}
