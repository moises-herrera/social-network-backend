import {
  IAuth,
  IAuthResponse,
  Role,
  IStandardObject,
  IUser,
  IUserDocument,
  IStandardResponse,
} from 'src/interfaces';
import { User } from 'src/models';
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
export const findAll = async (
  filter: IStandardObject = {}
): Promise<IUserDocument[]> => {
  const users = await User.find(filter);
  return users;
};

/**
 * Find a user.
 *
 * @param filter The filter to apply.
 * @returns The user found.
 */
export const findOne = async (
  filter: IStandardObject
): Promise<IUserDocument | null> => {
  const user = await User.findOne(filter);
  return user;
};

/**
 * Find a user by id.
 *
 * @returns The user found.
 */
export const findById = async (id: string): Promise<IUserDocument | null> => {
  const user = await findOne({ _id: id });
  return user;
};

/**
 * Create a new user.
 *
 * @param user User data.
 */
export const createOne = async (user: IUser): Promise<IUserDocument> => {
  const { username, email, password } = user;
  const existingUser = await findOne({
    $or: [{ username }, { email }],
  });

  if (existingUser) {
    throw new HttpError(
      'Ya existe una cuenta con ese nombre de usuario o email',
      400
    );
  }

  const passwordEncrypted = await encryptText(password);

  const createdUser = await User.create({
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
export const loginUser = async (auth: IAuth): Promise<IAuthResponse> => {
  const { email, password } = auth;

  const existingUser = await findOne({ email });

  if (!existingUser) {
    throw new HttpError('Usuario no encontrado', 404);
  }

  const isPasswordValid = await verifyEncryptedText(
    password,
    existingUser.password
  );

  if (!isPasswordValid) {
    throw new HttpError('Email o contraseña invalidos', 400);
  }

  const token = generateToken(existingUser._id);

  const response: IAuthResponse = {
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
  user: IUser
): Promise<IUserDocument | null> => {
  const userToUpdate = await findById(id);

  if (!userToUpdate) {
    throw new HttpError('Usuario no encontrado', 404);
  }

  if (
    userToUpdate.email !== user.email ||
    userToUpdate.username !== user.username
  ) {
    const existingUser = await findOne({
      $or: [{ username: user.username }, { email: user.email }],
    });

    if (existingUser) {
      throw new HttpError(
        'Ya existe una cuenta con ese nombre de usuario o email',
        400
      );
    }
  }

  const { password, ...fields } = user;

  const updatedUser = await User.findByIdAndUpdate(id, fields, {
    new: true,
  });

  return updatedUser;
};

/**
 * Delete a user.
 *
 * @param id The user id.
 * @returns The deleted user.
 */
export const deleteOne = async (id: string): Promise<IStandardResponse> => {
  const existingUser = await User.findByIdAndDelete(id);

  if (!existingUser) {
    throw new HttpError('Usuario no encontrado', 404);
  }

  const response: IStandardResponse = {
    message: 'Usuario eliminado correctamente',
  };

  return response;
};

/**
 * Renew a user token.
 *
 * @param id The user id.
 * @returns The auth response.
 */
export const renewToken = async (id: string): Promise<IAuthResponse> => {
  const user = await findById(id);

  if (!user) {
    throw new HttpError('Usuario no encontrado', 404);
  }

  const token = generateToken(id);

  const response: IAuthResponse = {
    accessToken: token,
    user,
  };

  return response;
};

/**
 * Verify user email.
 *
 * @param id The user id.
 * @returns The updated user.
 */
export const verifyUserEmail = async (id: string): Promise<IUserDocument> => {
  const user = await User.findByIdAndUpdate(
    id,
    { isEmailVerified: true },
    {
      new: true,
    }
  );

  if (!user) {
    throw new HttpError('Usuario no encontrado', 404);
  }

  return user;
};

/**
 * Change user password.
 *
 * @param id The user id.
 * @returns The updated user.
 */
export const changeUserPassword = async (
  id: string,
  password: string
): Promise<IUserDocument> => {
  const user = await User.findByIdAndUpdate(
    id,
    { password },
    {
      new: true,
    }
  );

  if (!user) {
    throw new HttpError('Usuario no encontrado', 404);
  }

  return user;
};

/**
 * Follow a user.
 *
 * @param id The user id.
 * @param followerId The follower id.
 */
export const followOne = async (
  id: string,
  followerId: string
): Promise<IStandardResponse> => {
  const user = await User.findByIdAndUpdate(
    id,
    { $push: { followers: followerId } },
    {
      new: true,
    }
  );

  if (!user) {
    throw new HttpError('Usuario no encontrado', 404);
  }

  const response: IStandardResponse = {
    message: 'Usuario actualizado correctamente',
  };

  return response;
};
