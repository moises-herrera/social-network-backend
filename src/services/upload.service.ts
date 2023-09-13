import { v2 } from 'cloudinary';
import { HttpError } from 'src/utils';
import streamifier from 'streamifier';

/**
 * Upload image to Cloudinary.
 *
 * @param imageBuffer The image buffer.
 * @returns The image url.
 */
export const uploadImage = async (
  folder: string,
  imageBuffer: Buffer
): Promise<string> => {
  try {
    return new Promise<string>((resolve, reject) => {
      const uploadStream = v2.uploader.upload_stream(
        {
          folder,
        },
        function (error, result) {
          if (result) {
            resolve(result.secure_url);
          } else {
            reject(error);
          }
        }
      );

      streamifier.createReadStream(imageBuffer).pipe(uploadStream);
    });
  } catch (error) {
    console.log(error);
    throw new HttpError('Error al subir la imagen', 500);
  }
};

/**
 * Update image.
 *
 * @param folder The folder to update the image.
 * @param newImageBuffer The new image buffer.
 * @param oldImageUrl The old image url.
 * @returns The url of the new image.
 */
export const updateImage = async (
  folder: string,
  newImageBuffer: Buffer,
  oldImageUrl: string
): Promise<string> => {
  await deleteImage(folder, oldImageUrl);
  return uploadImage(folder, newImageBuffer);
};

/**
 * Delete image from Cloudinary.
 *
 * @param imageUrl The image url.
 */
export const deleteImage = async (
  folder: string,
  imageUrl: string
): Promise<void> => {
  const publicId = imageUrl.split('/').pop()?.split('.')[0] as string;

  return new Promise<void>((resolve, reject) => {
    v2.uploader.destroy(`${folder}/${publicId}`, (error, result) => {
      if (result) {
        resolve();
      } else {
        reject(error);
      }
    });
  });
};
