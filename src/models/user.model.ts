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
    username: {
      type: String,
      required: true,
      unique: true,
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
      enum: Role,
      required: true,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    isAccountVerified: {
      type: Boolean,
      default: false,
    },
    isFounder: {
      type: Boolean,
      default: false,
    },
    posts: [
      {
        type: Schema.Types.ObjectId,
        ref: 'posts',
        default: [],
      },
    ],
    followers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'users',
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
