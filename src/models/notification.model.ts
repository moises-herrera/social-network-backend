import { Schema, model } from 'mongoose';
import { INotificationDocument, INotificationModel } from 'src/interfaces';

const NotificationSchema = new Schema<INotificationDocument>(
  {
    note: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    recipient: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users',
    },
    sender: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'users',
    },
    hasRead: {
      type: Boolean,
      default: false,
    },
    post: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    comment: {
      type: Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

NotificationSchema.statics.buildNotification = (
  notification: INotificationDocument
) => {
  return new Notification(notification);
};

const Notification = model<INotificationDocument, INotificationModel>(
  'notifications',
  NotificationSchema
);

export default Notification;
