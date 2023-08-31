import { Schema, model } from 'mongoose';
import { Role, IUser, IUserDocument, IUserModel } from 'src/interfaces';

/**
 * The user schema definition.
 */
const UserSchema = new Schema<IUserDocument>(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: [Role.User, Role.Admin],
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    articles: [
      {
        type: Schema.Types.ObjectId,
        ref: 'articles',
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

UserSchema.statics.buildUser = (args: IUser) => {
  return new User(args);
};

const User = model<IUserDocument, IUserModel>('users', UserSchema);

export default User;
