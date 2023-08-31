import { Auth, AuthResponse, Role, User } from 'src/interfaces';
import { UserModel } from 'src/models';
import {
  encryptText,
  verifyEncryptedText,
  HttpError,
  generateToken,
} from 'src/utils';

/**
 * Create a new user.
 *
 * @param user User data.
 */
export const createOne = async (user: User): Promise<User> => {
  const { email, password } = user;
  const existingUser = await findOne({ email });

  if (existingUser) {
    throw new HttpError('User already exists.', 400);
  }

  const passwordEncrypted = await encryptText(password);

  const createdUser = await UserModel.create({
    ...user,
    password: passwordEncrypted,
    role: Role.User,
  });

  return createdUser;
};

/**
 * Find a user.
 *
 * @param filter The filter to apply.
 * @returns The user found.
 */
export const findOne = async (filter: {
  [key: string]: any;
}): Promise<User | null> => {
  const user = await UserModel.findOne(filter);
  return user;
};

/**
 * Login a user.
 *
 * @param auth The auth data.
 * @returns The auth response.
 */
export const loginUser = async (auth: Auth) => {
  const { email, password } = auth;

  const existingUser = await findOne({ email });

  if (!existingUser) {
    throw new HttpError('User not found.', 404);
  }

  const isPasswordValid = await verifyEncryptedText(
    password,
    existingUser.password
  );

  if (!isPasswordValid) {
    throw new HttpError('Email or password invalid.', 400);
  }

  const token = generateToken(existingUser._id);

  const response: AuthResponse = {
    accessToken: token,
    user: existingUser,
  };

  return response;
};
