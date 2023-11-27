import { Document, Model, Types } from 'mongoose';

/**
 * Represents all the information about a notification.
 */
export interface INotification {
  /** Note with info about the notification. */
  note: string;

  /** User id of the recipient. */
  recipient: Types.ObjectId;

  /** User id of the sender. */
  sender: Types.ObjectId;

  /** Whether the notification has been read or not. */
  hasRead: boolean;

  /** Post id of the post that the notification is about. */
  post?: Types.ObjectId;

  /** Comment id of the comment that the notification is about. */
  comment?: Types.ObjectId;
}

/**
 * Represents the document of a notification.
 */
export interface INotificationDocument extends INotification, Document {}

/**
 * Represents the model of a notification.
 */
export interface INotificationModel extends Model<INotificationDocument> {
  buildNotification(notification: INotification): INotificationDocument;
}
