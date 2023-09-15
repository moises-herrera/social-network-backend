import {
  IPost,
  IPostDocument,
  IStandardObject,
  IStandardResponse,
  IUser,
  IUserDocument,
  PaginatedResponse,
  PaginationOptions,
  SelectOptions,
} from 'src/interfaces';
import { Post } from 'src/models';
import { HttpError } from 'src/utils';
import { updateImage, uploadImage } from 'src/services/upload.service';
import { getUserWithMostFollowers } from 'src/services/user.service';
import { Types } from 'mongoose';
import * as userService from 'src/services/user.service';

/**
 * Find all posts.
 *
 * @param filter The filter to apply.
 * @param selectOptions The select options.
 * @param paginationOptions The pagination options.
 * @returns All posts.
 */
export const findAll = async (
  filter: IStandardObject = {},
  selectOptions?: SelectOptions,
  paginationOptions?: PaginationOptions
): Promise<PaginatedResponse<IPostDocument>> => {
  const { include = '', select = '' } = selectOptions || {};
  const { limit = 10, page = 1 } = paginationOptions || {};
  const skipRecords = (page - 1) * limit;

  const postsResult = await Post.aggregate<{
    posts: IPostDocument[];
    resultsCount: [{ count: number }];
  }>([
    {
      $match: filter,
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $facet: {
        posts: [
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

  const { posts, resultsCount } = postsResult[0];

  await Post.populate(posts, {
    path: include,
    select,
  });

  const userWithMostFollowers = await getUserWithMostFollowers();

  if (userWithMostFollowers && posts.length) {
    posts.forEach((post) => {
      const postUser = post.user as unknown as IUser;
      postUser.isAccountVerified =
        postUser.username === userWithMostFollowers.username;
    });
  }

  const response: PaginatedResponse<IPostDocument> = {
    data: posts,
    total: resultsCount[0]?.count || 0,
    page,
    resultsCount: resultsCount[0]?.count || 0,
  };

  return response;
};

/**
 * Find a post.
 *
 * @param filter The filter to apply.
 * @param include The fields to include.
 * @returns The post found.
 */
export const findOne = async (
  filter: IStandardObject,
  include: string = ''
): Promise<IPostDocument | null> => {
  const post = await Post.findOne(filter).populate(include);

  return post;
};

/**
 * Find a post by id.
 *
 * @param id The post id.
 * @param include The fields to include.
 * @returns The post found.
 */
export const findById = async (
  id: string,
  include: string = ''
): Promise<IPostDocument | null> => {
  const post = await findOne({ _id: id }, include);
  return post;
};

/**
 * Create a new post.
 *
 * @param post Post data.
 * @returns The created post.
 */
export const createOne = async (
  post: IPost,
  imageBuffer?: Buffer
): Promise<IStandardResponse<IPost>> => {
  if (imageBuffer) {
    const imageUrl = await uploadImage('posts', imageBuffer);
    post.image = imageUrl;
  }

  const createdPost = await Post.create(post);

  const response: IStandardResponse<IPost> = {
    message: 'Post creado correctamente',
    data: createdPost,
  };

  return response;
};

/**
 * Update a post.
 *
 * @param id The post id.
 * @param post The post data.
 * @returns The updated post.
 */
export const updateOne = async (
  id: string,
  post: IPost,
  imageBuffer?: Buffer
): Promise<IStandardResponse<IPost>> => {
  const postToUpdate = await findById(id);

  if (!postToUpdate) {
    throw new HttpError('Post no encontrado', 404);
  }

  let imageUrl: string | undefined;

  if (imageBuffer) {
    imageUrl = !postToUpdate.image
      ? await uploadImage('posts', imageBuffer)
      : await updateImage('posts', imageBuffer, postToUpdate?.image);
  }

  const postData: IPost = {
    ...post,
    image: imageUrl || postToUpdate.image,
  };

  const updatedPost = await Post.findByIdAndUpdate(id, postData, {
    new: true,
  });

  if (!updatedPost) {
    throw new HttpError('Post no encontrado', 404);
  }

  const response: IStandardResponse<IPost> = {
    message: 'Post actualizado correctamente',
    data: updatedPost,
  };

  return response;
};

/**
 * Delete a post.
 *
 * @param id The post id.
 * @returns The deleted post.
 */
export const deleteOne = async (id: string): Promise<IStandardResponse> => {
  const deletedPost = await Post.findByIdAndDelete(id);

  if (!deletedPost) {
    throw new HttpError('Post no encontrado', 404);
  }

  const response: IStandardResponse = {
    message: 'Post eliminado correctamente',
  };

  return response;
};

/**
 * Like a post.
 *
 * @param id The post id.
 * @param userId The user id.
 */
export const likeOne = async (
  id: string,
  userId: string
): Promise<IStandardResponse> => {
  const updatedPost = await Post.findByIdAndUpdate(
    id,
    {
      $push: { likes: userId },
    },
    {
      new: true,
    }
  );

  if (!updatedPost) {
    throw new HttpError('Post no encontrado', 404);
  }

  const response: IStandardResponse = {
    message: 'Post actualizado correctamente',
  };

  return response;
};

/**
 * Remove like from a post.
 *
 * @param id The post id.
 * @param userId The user id.
 */
export const removeLikeOne = async (
  id: string,
  userId: string
): Promise<IStandardResponse> => {
  const updatedPost = await Post.findByIdAndUpdate(
    id,
    {
      $pull: { likes: userId },
    },
    {
      new: true,
    }
  );

  if (!updatedPost) {
    throw new HttpError('Post no encontrado', 404);
  }

  const response: IStandardResponse = {
    message: 'Post actualizado correctamente',
  };

  return response;
};

/**
 * Get post likes.
 *
 * @param id The post id.
 * @param paginationOptions The pagination options.
 * @returns The post likes.
 */
export const getLikes = async (
  id: string,
  paginationOptions?: PaginationOptions
): Promise<PaginatedResponse<IUserDocument>> => {
  const likesResult = await Post.aggregate([
    {
      $match: {
        _id: new Types.ObjectId(id),
      },
    },
    {
      $project: {
        _id: 0,
        likes: 1,
      },
    },
  ]);

  const likes = likesResult[0]?.likes || [];

  const response = await userService.findAll(
    {
      _id: { $in: likes },
    },
    paginationOptions
  );

  response.total = likes.length;

  return response;
};
