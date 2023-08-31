import { User } from '.';

/**
 * The auth response.
 */
export interface AuthResponse {
  /** Access token. */
  accessToken: string;

  /** User data. */
  user: User;
}
