import { Role, User } from 'src/interfaces';
import UserModel from 'src/models/user.model';
import { encryptText } from 'src/utils/encryption.handler';
import { HttpError } from 'src/utils/http-error';

/**
 * Create a new user.
 *
 * @param user User data.
 */
export const createOne = async (user: User): Promise<User> => {
  const { email, password } = user;
  const existingUser = await UserModel.findOne({ email });

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
