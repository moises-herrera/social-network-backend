import { Schema, model } from 'mongoose';
import { IComment, ICommentDocument, ICommentModel } from 'src/interfaces';

const CommentSchema = new Schema<ICommentDocument>(
  {
    content: {
      type: String,
      required: true,
    },
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

CommentSchema.statics.buildComment = (comment: IComment) => {
  return new Comment(comment);
};

const Comment = model<ICommentDocument, ICommentModel>(
  'comments',
  CommentSchema
);

export default Comment;
