import { Auth, AuthResponse, Role, StandardObject, User } from 'src/interfaces';
import { UserModel } from 'src/models';
import {
  encryptText,
  verifyEncryptedText,
  HttpError,
  generateToken,
} from 'src/utils';

/**
 * Find all users.
 *
 * @returns All users.
 */
export const findAll = async (filter: StandardObject = {}): Promise<User[]> => {
  const users = await UserModel.find(filter);
  return users;
};

/**
 * Find a user.
 *
 * @param filter The filter to apply.
 * @returns The user found.
 */
export const findOne = async (filter: StandardObject): Promise<User | null> => {
  const user = await UserModel.findOne(filter);
  return user;
};

/**
 * Find a user by id.
 *
 * @returns The user found.
 */
export const findById = async (id: string): Promise<User | null> => {
  const user = await findOne({ _id: id });
  return user;
};

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
 * Login a user.
 *
 * @param auth The auth data.
 * @returns The auth response.
 */
export const loginUser = async (auth: Auth): Promise<AuthResponse> => {
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

/**
 * Update a user.
 *
 * @param id The user id.
 * @param user The user data.
 * @returns The updated user.
 */
export const updateOne = async (
  id: string,
  user: User
): Promise<User | null> => {
  const updatedUser = await UserModel.findByIdAndUpdate(id, user, {
    new: true,
  });

  if (!updatedUser) {
    throw new HttpError('User not found.', 404);
  }

  return updatedUser;
};

/**
 * Delete a user.
 *
 * @param id The user id.
 * @returns The deleted user.
 */
export const deleteOne = async (id: string) => {
  const existingUser = await UserModel.findByIdAndDelete(id);

  if (!existingUser) {
    throw new HttpError('User not found.', 404);
  }

  return existingUser;
};

/**
 * Renew a user token.
 *
 * @param id The user id.
 * @returns The auth response.
 */
export const renewToken = async (id: string): Promise<AuthResponse> => {
  const user = await findById(id);

  if (!user) {
    throw new HttpError('User not found.', 404);
  }

  const token = generateToken(id);

  const response: AuthResponse = {
    accessToken: token,
    user,
  };

  return response;
};
