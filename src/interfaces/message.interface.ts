import { Document, Model, Types } from 'mongoose';

/**
 * Represents the message information.
 */
export interface IMessage {
  /** The content of the message. */
  content: {
    text: string;
  };

  /** The sender of the message. */
  sender: Types.ObjectId;

  /** The conversation of the message. */
  conversation: Types.ObjectId;

  /** When the message was delivered. */
  deliveredAt: Date;

  /** When the message was read. */
  readAt: Date;
}

/**
 * Represents the message document that is stored in the database.
 */
export interface IMessageDocument extends IMessage, Document {}

/**
 * Represents the message mongoose model.
 */
export interface IMessageModel extends Model<IMessageDocument> {
  buildMessage(message: IMessage): IMessageDocument;
}
