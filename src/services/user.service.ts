import {
  IAuth,
  IAuthResponse,
  Role,
  IStandardObject,
  IUser,
  IUserDocument,
  IStandardResponse,
  PaginationOptions,
  PaginatedResponse,
} from 'src/interfaces';
import { User } from 'src/models';
import {
  encryptText,
  verifyEncryptedText,
  HttpError,
  generateToken,
} from 'src/utils';
import { updateImage, uploadImage } from 'src/services/upload.service';
import { ObjectId, Types } from 'mongoose';

/**
 * Find all users.
 *
 * @param filter The filter to apply.
 * @param paginationOptions The pagination options.
 * @returns All users.
 */
export const findAll = async (
  filter: IStandardObject = {},
  paginationOptions?: PaginationOptions
): Promise<PaginatedResponse<IUserDocument>> => {
  const userWithMostFollowers = await getUserWithMostFollowers();
  const { limit = 10, page = 1 } = paginationOptions || {};
  const skipRecords = (page - 1) * limit;

  const usersCount = await User.countDocuments();

  const usersResult = await User.aggregate<{
    users: IUserDocument[];
    resultsCount: [{ count: number }];
  }>([
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
    {
      $facet: {
        users: [
          {
            $skip: skipRecords > 0 ? skipRecords : 0,
          },
          {
            $limit: limit,
          },
        ],
        resultsCount: [
          {
            $count: 'count',
          },
        ],
      },
    },
  ]);

  const { users, resultsCount } = usersResult[0];

  if (users.length > 0 && userWithMostFollowers) {
    users[0].isAccountVerified =
      users[0].username === userWithMostFollowers.username;
  }

  const response: PaginatedResponse<IUserDocument> = {
    data: users,
    total: usersCount,
    page,
    resultsCount: resultsCount[0]?.count || 0,
  };

  return response;
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
  const userWithMostFollowers = await getUserWithMostFollowers();
  const user = await User.findOne(filter);

  if (userWithMostFollowers && user) {
    user.isAccountVerified = user.username === userWithMostFollowers.username;
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
 * Get the user with most followers.
 *
 * @returns The user with most followers.
 */
export const getUserWithMostFollowers = async (): Promise<
  IUserDocument | undefined
> => {
  const users = await User.aggregate([
    {
      $project: {
        username: 1,
        followers: 1,
      },
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

  return users[0];
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
  user: IUser
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

  const updatedUser = await User.findByIdAndUpdate(id, user, {
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
 * @param filter The filter to apply.
 * @param paginationOptions The pagination options.
 * @returns The user followers.
 */
export const getFollowers = async (
  id: string,
  filter: IStandardObject = {},
  paginationOptions?: PaginationOptions
): Promise<PaginatedResponse<IUserDocument>> => {
  const { limit = 10, page = 1 } = paginationOptions || {};
  const skipRecords = (page - 1) * limit;
  const response: PaginatedResponse<IUserDocument> = {
    data: [],
    total: 0,
    page,
    resultsCount: 0,
  };

  const user = await User.aggregate([
    {
      $match: { _id: new Types.ObjectId(id) },
    },
    {
      $project: {
        followers: 1,
      },
    },
  ]);

  if (user.length && user[0].followers === 0) {
    return response;
  }

  const followersResult = await User.aggregate<{
    followers: IUserDocument[];
    resultsCount: [{ count: number }];
  }>([
    {
      $match: {
        _id: {
          $in: user[0].followers,
        },
        ...filter,
      },
    },
    {
      $facet: {
        followers: [
          {
            $skip: skipRecords > 0 ? skipRecords : 0,
          },
          {
            $limit: limit,
          },
        ],
        resultsCount: [
          {
            $count: 'count',
          },
        ],
      },
    },
  ]);

  const { followers, resultsCount } = followersResult[0];

  response.data = followers;
  response.total = user[0].followers.length;
  response.resultsCount = resultsCount[0]?.count || 0;

  return response;
};

/**
 * Get all the accounts that the user follows.
 *
 * @param id The user id.
 * @param filter The filter to apply.
 * @param paginationOptions The pagination options.
 * @returns The accounts that the user follows.
 */
export const getFollowing = async (
  id: string,
  filter: IStandardObject = {},
  paginationOptions?: PaginationOptions
): Promise<PaginatedResponse<IUserDocument>> => {
  const { limit = 10, page = 1 } = paginationOptions || {};
  const skipRecords = (page - 1) * limit;

  const followingCount = await User.countDocuments({
    followers: new Types.ObjectId(id),
  });

  const usersResult = await User.aggregate<{
    following: IUserDocument[];
    resultsCount: [{ count: number }];
  }>([
    {
      $match: {
        followers: new Types.ObjectId(id),
      },
      ...filter,
    },
    {
      $facet: {
        following: [
          {
            $skip: skipRecords > 0 ? skipRecords : 0,
          },
          {
            $limit: limit,
          },
        ],
        resultsCount: [
          {
            $count: 'count',
          },
        ],
      },
    },
  ]);

  const { following, resultsCount } = usersResult[0];

  const response: PaginatedResponse<IUserDocument> = {
    data: following,
    total: followingCount,
    page,
    resultsCount: resultsCount[0]?.count || 0,
  };

  return response;
};

/**
 * Get all the account ids that the user follows.
 *
 * @param id The user id.
 * @returns The account ids that the user follows.
 */
export const getFollowingIds = async (id: string): Promise<ObjectId[]> => {
  const usersIds = await User.aggregate([
    {
      $match: {
        followers: new Types.ObjectId(id),
      },
    },
    {
      $project: {
        _id: 1,
      },
    },
  ]);

  return usersIds.map((user) => user._id);
};
