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

CommentSchema.pre<ICommentDocument[]>('find', function (next) {
  const comments = this;

  (comments as any).populate(
    'user',
    'firstName lastName username avatar isAccountVerified'
  );

  next();
});

CommentSchema.pre<ICommentDocument>('findOne', function (next) {
  const comment = this;

  (comment as any).populate(
    'user',
    'firstName lastName username avatar isAccountVerified'
  );

  next();
});

const Comment = model<ICommentDocument, ICommentModel>(
  'comments',
  CommentSchema
);

export default Comment;
