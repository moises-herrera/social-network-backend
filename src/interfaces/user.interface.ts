import { Document, Model, Types } from 'mongoose';
import { IAuth, Role } from '.';

/**
 * The user information.
 */
export interface IUser extends IAuth {
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

  /** Articles of the user. */
  articles: Types.ObjectId[];
}

/**
 * Represents the user document that is stored in the database.
 */
export interface IUserDocument extends IUser, Document {}

/**
 * Represents the user mongoose model.
 */
export interface IUserModel extends Model<IUserDocument> {
  buildUser(user: IUser): IUserDocument;
}
