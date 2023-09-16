import { Document, Model, Types } from 'mongoose';

/**
 * The conversation information.
 */
export interface IConversation {
  /** The participants of the conversation. */
  participants: Types.ObjectId[];
}

/**
 * Represents the conversation document that is stored in the database.
 */
export interface IConversationDocument extends IConversation, Document {}

/**
 * Represents the conversation mongoose model.
 */
export interface IConversationModel extends Model<IConversationDocument> {
  buildConversation(conversation: IConversation): IConversationDocument;
}
