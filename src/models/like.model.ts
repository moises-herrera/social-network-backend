import { Schema, model } from 'mongoose';
import { ILike, ILikeDocument, ILikeModel } from 'src/interfaces';

const LikeSchema = new Schema<ILikeDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users',
    },
    articleId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'articles',
    },
  },
  {
    timestamps: true,
  }
);

LikeSchema.statics.buildLike = (like: ILike) => {
  return new Like(like);
};

const Like = model<ILikeDocument, ILikeModel>('likes', LikeSchema);

export default Like;
