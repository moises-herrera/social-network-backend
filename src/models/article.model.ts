import { Schema, model } from 'mongoose';
import { IArticle, IArticleDocument, IArticleModel } from 'src/interfaces';

const ArticleSchema = new Schema<IArticleDocument>(
  {
    title: {
      type: String,
      required: true,
    },
    image: {
      type: String,
    },
    description: {
      type: String,
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users',
    },
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'comments',
        default: [],
      },
    ],
  },
  {
    timestamps: true,
  }
);

ArticleSchema.statics.buildArticle = (article: IArticle) => {
  return new Article(article);
};

const Article = model<IArticleDocument, IArticleModel>(
  'articles',
  ArticleSchema
);

export default Article;
