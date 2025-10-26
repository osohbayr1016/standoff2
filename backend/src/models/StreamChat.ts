import mongoose, { Document, Schema } from "mongoose";

export interface IStreamChat extends Document {
  streamSessionId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  message: string;
  isModerator: boolean; // Whether user is a stream moderator
  isSubscriber: boolean; // Whether user is subscribed to the streamer
  isVip: boolean; // Whether user has VIP status
  
  // Message metadata
  timestamp: Date;
  isDeleted: boolean;
  deletedAt?: Date;
  deletedBy?: mongoose.Types.ObjectId; // Who deleted the message
  
  // Reactions and interactions
  reactions: {
    emoji: string;
    count: number;
    users: mongoose.Types.ObjectId[]; // Users who reacted
  }[];
  
  // Reply functionality
  replyToId?: mongoose.Types.ObjectId; // Reply to another message
  
  createdAt: Date;
  updatedAt: Date;
}

const streamChatSchema = new Schema<IStreamChat>(
  {
    streamSessionId: {
      type: Schema.Types.ObjectId,
      ref: "StreamSession",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    isModerator: {
      type: Boolean,
      default: false,
    },
    isSubscriber: {
      type: Boolean,
      default: false,
    },
    isVip: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
    deletedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    reactions: [{
      emoji: {
        type: String,
        required: true,
      },
      count: {
        type: Number,
        default: 0,
        min: 0,
      },
      users: [{
        type: Schema.Types.ObjectId,
        ref: "User",
      }],
    }],
    replyToId: {
      type: Schema.Types.ObjectId,
      ref: "StreamChat",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
streamChatSchema.index({ streamSessionId: 1, timestamp: -1 });
streamChatSchema.index({ streamSessionId: 1, isDeleted: 1, timestamp: -1 });
streamChatSchema.index({ userId: 1, timestamp: -1 });

export default mongoose.model<IStreamChat>("StreamChat", streamChatSchema);
