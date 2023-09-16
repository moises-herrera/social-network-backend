import { Schema, model } from 'mongoose';
import { IMessageDocument, IMessageModel } from 'src/interfaces';

const MessageSchema = new Schema<IMessageDocument>(
  {
    content: {
      text: {
        type: String,
        required: true,
        maxlength: 2000,
      },
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    conversation: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

MessageSchema.statics.buildMessage = (message: IMessageDocument) => {
  return new Message(message);
};

const Message = model<IMessageDocument, IMessageModel>(
  'messages',
  MessageSchema
);

export default Message;
