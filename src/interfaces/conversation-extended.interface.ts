import { IConversation, IMessage } from '.';

/**
 * Conversation extended data.
 */
export interface ConversationExtended extends IConversation {
  /** Additional message. */
  message: IMessage;
}
