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
import { updateImage, uploadImage } from 'src/services/upload.service';

/**
 * Find all users.
 *
 * @returns All users.
 */
export const findAll = async (
  filter: IStandardObject = {}
): Promise<IUserDocument[]> => {
  const users = await User.aggregate([
    {
      $match: filter,
    },
    {
      $addFields: {
        followersCount: { $size: '$followers' },
      },
    },
    {
      $sort: { followersCount: -1 },
    },
  ]);

  if (users.length > 0) {
    users[0].isAccountVerified = true;
  }

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
  const users = await User.aggregate([
    {
      $addFields: {
        followersCount: { $size: '$followers' },
      },
    },
    {
      $sort: { followersCount: -1 },
    },
  ]);
  const user = await User.findOne(filter);

  if (users.length > 0 && user && user.username === users[0].username) {
    user.isAccountVerified = true;
  }

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
export const createOne = async (user: IUser): Promise<IAuthResponse> => {
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

  const token = generateToken(createdUser._id);

  const response: IAuthResponse = {
    accessToken: token,
    user: createdUser,
  };

  return response;
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
  user: IUser,
  avatarBuffer?: Buffer
): Promise<IUserDocument | null> => {
  const userToUpdate = await findById(id);

  if (!userToUpdate) {
    throw new HttpError('Usuario no encontrado', 404);
  }

  if (userToUpdate.email !== user.email) {
    const existingUser = await findOne({ email: user.email });

    if (existingUser) {
      throw new HttpError('Ya existe una cuenta con ese email', 400);
    }
  }

  if (userToUpdate.username !== user.username) {
    const existingUser = await findOne({ username: user.username });

    if (existingUser) {
      throw new HttpError(
        'Ya existe una cuenta con ese nombre de usuario',
        400
      );
    }
  }

  if (user.password) {
    const userPassword = user.password;
    user.password = await encryptText(userPassword);
  }

  let avatarUrl: string | undefined;

  if (avatarBuffer) {
    avatarUrl = !userToUpdate.avatar
      ? await uploadImage('users', avatarBuffer)
      : await updateImage('users', avatarBuffer, userToUpdate.avatar);
  }

  const userData: IUser = {
    ...user,
    avatar: avatarUrl || userToUpdate.avatar,
  };

  const updatedUser = await User.findByIdAndUpdate(id, userData, {
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
export const verifyUserEmail = async (
  id: string
): Promise<IStandardResponse> => {
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

  const response: IStandardResponse = {
    message: 'Email verificado correctamente',
  };

  return response;
};

/**
 * Change user password.
 *
 * @param id The user id.
 * @returns Standard response.
 */
export const changeUserPassword = async (
  id: string,
  password: string
): Promise<IStandardResponse> => {
  const encryptedPassword = await encryptText(password);
  const user = await User.findByIdAndUpdate(
    id,
    { password: encryptedPassword },
    {
      new: true,
    }
  );

  if (!user) {
    throw new HttpError('Usuario no encontrado', 404);
  }

  const response: IStandardResponse = {
    message: 'Contraseña actualizada correctamente',
  };

  return response;
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

/**
 * Unfollow a user.
 *
 * @param id The user id.
 * @param followerId The follower id.
 */
export const unFollowOne = async (
  id: string,
  followerId: string
): Promise<IStandardResponse> => {
  const user = await User.findByIdAndUpdate(
    id,
    { $pull: { followers: followerId } },
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

/**
 * Get user followers.
 *
 * @param id The user id.
 * @returns The user followers.
 */
export const getFollowers = async (
  id: string,
  filter: IStandardObject = {}
): Promise<IUserDocument[]> => {
  const user = await User.findById(id).populate('followers');

  if (!user) {
    throw new HttpError('Usuario no encontrado', 404);
  }

  let followers = user.followers as IUserDocument[];

  if (filter.username) {
    followers = followers.filter((user) => {
      const { username } = filter;
      const regex = new RegExp(username as string, 'i');
      return regex.test(user.username);
    });
  }

  return followers;
};

/**
 * Get all the accounts that the user follows.
 *
 * @param id The user id.
 * @returns The accounts that the user follows.
 */
export const getFollowing = async (
  id: string,
  filter: IStandardObject = {}
): Promise<IUserDocument[]> => {
  let users = await User.find({ followers: id });

  if (filter.username) {
    users = users.filter((user) => {
      const { username } = filter;
      const regex = new RegExp(username as string, 'i');
      return regex.test(user.username);
    });
  }

  return users;
};
