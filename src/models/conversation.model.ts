import { Schema, model } from 'mongoose';
import { IConversationDocument, IConversationModel } from 'src/interfaces';

const ConversationSchema = new Schema<IConversationDocument>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'users',
      },
    ],
  },
  {
    timestamps: true,
  }
);

ConversationSchema.statics.buildConversation = (
  conversation: IConversationDocument
) => {
  return new Conversation(conversation);
};

const Conversation = model<IConversationDocument, IConversationModel>(
  'conversations',
  ConversationSchema
);

export default Conversation;
