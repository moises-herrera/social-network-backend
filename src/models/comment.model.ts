import { Schema, model } from 'mongoose';
import { IComment, ICommentDocument, ICommentModel } from 'src/interfaces';

const CommentSchema = new Schema<ICommentDocument>(
  {
    content: {
      type: String,
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users',
    },
    post: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'posts',
    },
  },
  {
    timestamps: true,
  }
);

CommentSchema.statics.buildComment = (comment: IComment) => {
  return new Comment(comment);
};

const Comment = model<ICommentDocument, ICommentModel>(
  'comments',
  CommentSchema
);

export default Comment;
