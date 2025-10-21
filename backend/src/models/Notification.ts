import mongoose, { Schema, Document } from "mongoose";

export type NotificationType = "MESSAGE" | "SYSTEM" | "INVITATION";
export type NotificationStatus = "PENDING" | "SEEN" | "DELETED";

export interface INotification extends Document {
  userId: Schema.Types.ObjectId;
  senderId?: Schema.Types.ObjectId;
  title: string;
  content: string;
  type: NotificationType;
  status: NotificationStatus;
  relatedMessageId?: Schema.Types.ObjectId;
  relatedClanId?: Schema.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      enum: ["MESSAGE", "SYSTEM", "INVITATION"],
      default: "SYSTEM",
      index: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "SEEN", "DELETED"],
      default: "PENDING",
      index: true,
    },
    relatedMessageId: {
      type: Schema.Types.ObjectId,
      ref: "Message",
    },
    relatedClanId: {
      type: Schema.Types.ObjectId,
      ref: "Squad",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
notificationSchema.index({ userId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1, status: 1 });

// Auto-delete notifications older than 7 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 604800 });

export default mongoose.model<INotification>(
  "Notification",
  notificationSchema
);
