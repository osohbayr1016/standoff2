import mongoose, { Document, Schema } from "mongoose";

export interface IStreamViewer extends Document {
  streamSessionId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId; // Optional - anonymous viewers
  sessionId: string; // Unique session identifier for anonymous users
  
  // Viewer info
  ipAddress?: string; // For analytics (hashed for privacy)
  userAgent?: string;
  country?: string;
  city?: string;
  
  // Viewing session
  joinTime: Date;
  leaveTime?: Date;
  duration?: number; // Duration in seconds
  
  // Viewer status
  isActive: boolean; // Currently watching
  lastSeen: Date; // Last activity timestamp
  
  // Viewer engagement
  messagesSent: number; // Number of chat messages sent
  reactionsGiven: number; // Number of reactions given
  
  createdAt: Date;
  updatedAt: Date;
}

const streamViewerSchema = new Schema<IStreamViewer>(
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
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    ipAddress: String,
    userAgent: String,
    country: String,
    city: String,
    joinTime: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    leaveTime: Date,
    duration: {
      type: Number,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
    messagesSent: {
      type: Number,
      default: 0,
      min: 0,
    },
    reactionsGiven: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
streamViewerSchema.index({ streamSessionId: 1, isActive: 1 });
streamViewerSchema.index({ streamSessionId: 1, joinTime: -1 });
streamViewerSchema.index({ userId: 1, streamSessionId: 1 });
streamViewerSchema.index({ sessionId: 1, streamSessionId: 1 });

// Auto-delete viewer records older than 30 days
streamViewerSchema.index({ createdAt: 1 }, { expireAfterSeconds: 2592000 });

export default mongoose.model<IStreamViewer>("StreamViewer", streamViewerSchema);
