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
 * @returns All posts.
 */
export const findAll = async (
  filter: IStandardObject = {}
): Promise<IPostDocument[]> => {
  const posts = await Post.find(filter);
  return posts;
};

/**
 * Find a post.
 *
 * @param filter The filter to apply.
 * @returns The post found.
 */
export const findOne = async (
  filter: IStandardObject
): Promise<IPostDocument | null> => {
  const post = await Post.findOne(filter);
  return post;
};

/**
 * Find a post by id.
 *
 * @returns The post found.
 */
export const findById = async (id: string): Promise<IPostDocument | null> => {
  const post = await findOne({ _id: id });
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
): Promise<IPostDocument> => {
  if (imageBuffer) {
    const imageUrl = await uploadImage('posts', imageBuffer);
    post.image = imageUrl;
  }

  const createdPost = await Post.create(post);
  return createdPost;
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
): Promise<IPostDocument | null> => {
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

  return updatedPost;
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
      likes: {
        $push: userId,
      },
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