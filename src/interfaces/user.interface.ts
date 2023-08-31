import { Auth, Role } from '.';

/**
 * The user information.
 */
export interface User extends Auth {
  /** User id. */
  _id: string;

  /** First name. */
  firstName: string;

  /** Last name. */
  lastName: string;

  /** Avatar url. */
  avatar?: string;

  /** Email address. */
  email: string;

  /** Password. */
  password: string;

  /** Role. */
  role: Role;

  /** If the email is verified. */
  isEmailVerified: boolean;
}
