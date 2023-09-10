import {
  IPost,
  IPostDocument,
  IStandardObject,
  IStandardResponse,
} from 'src/interfaces';
import { Post } from 'src/models';
import { HttpError } from 'src/utils';
import { updateImage, uploadImage } from 'src/services/upload.service';

/**
 * Find all posts.
 *
 * @param filter The filter to apply.
 * @param include The fields to include.
 * @returns All posts.
 */
export const findAll = async (
  filter: IStandardObject = {},
  include: string = ''
): Promise<IPostDocument[]> => {
  const posts = await Post.find(filter).populate(include);
  return posts;
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
