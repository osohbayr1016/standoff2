import mongoose, { Document, Schema } from "mongoose";

export type StreamStatus = "scheduled" | "live" | "ended" | "cancelled";
export type StreamPlatform = "twitch" | "youtube" | "custom" | "multi";

export interface IStreamSession extends Document {
  // Basic stream info
  title: string;
  description?: string;
  streamKey: string; // Unique stream key for RTMP
  status: StreamStatus;
  
  // Related entities
  tournamentId?: mongoose.Types.ObjectId; // Optional tournament association
  matchId?: mongoose.Types.ObjectId; // Optional match association
  organizerId: mongoose.Types.ObjectId; // User who created the stream
  
  // Platform integration
  platforms: {
    platform: StreamPlatform;
    streamUrl?: string; // External platform URL
    embedUrl?: string; // Embed URL for iframe
    channelId?: string; // Platform channel ID
    streamId?: string; // Platform stream ID
    isActive: boolean;
  }[];
  
  // External stream integration for promotion (YouTube, Facebook, Kick, etc.)
  externalStreamUrl?: string; // URL to external stream
  externalPlatform?: "youtube" | "facebook" | "kick" | "twitch"; // Platform type
  externalThumbnail?: string; // Thumbnail from external platform
  isLiveStatus?: "live" | "offline"; // Current live status from external platform
  
  // Stream metadata
  scheduledStartTime?: Date;
  actualStartTime?: Date;
  endTime?: Date;
  duration?: number; // Duration in seconds
  
  // Viewer analytics
  peakViewers: number;
  totalViewers: number;
  currentViewers: number;
  
  // Stream settings
  isPublic: boolean; // Public or private stream
  allowChat: boolean; // Enable/disable chat
  allowReactions: boolean; // Enable/disable reactions
  
  // Technical settings
  quality: "720p" | "1080p" | "4k";
  bitrate?: number;
  resolution?: string;
  
  // Stream content
  tags: string[]; // Game tags, tournament tags, etc.
  thumbnail?: string; // Stream thumbnail
  
  // Moderation
  moderators: mongoose.Types.ObjectId[]; // User IDs who can moderate
  
  createdAt: Date;
  updatedAt: Date;
}

const streamSessionSchema = new Schema<IStreamSession>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    streamKey: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "ended", "cancelled"],
      default: "scheduled",
      index: true,
    },
    tournamentId: {
      type: Schema.Types.ObjectId,
      ref: "Tournament",
      index: true,
    },
    matchId: {
      type: Schema.Types.ObjectId,
      ref: "Match",
      index: true,
    },
    organizerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    platforms: [{
      platform: {
        type: String,
        enum: ["twitch", "youtube", "custom", "multi"],
        required: true,
      },
      streamUrl: String,
      embedUrl: String,
      channelId: String,
      streamId: String,
      isActive: {
        type: Boolean,
        default: true,
      },
    }],
    scheduledStartTime: {
      type: Date,
      index: true,
    },
    actualStartTime: Date,
    endTime: Date,
    duration: {
      type: Number,
      min: 0,
    },
    peakViewers: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalViewers: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentViewers: {
      type: Number,
      default: 0,
      min: 0,
    },
    // External stream integration for promotion
    externalStreamUrl: String,
    externalPlatform: {
      type: String,
      enum: ["youtube", "facebook", "kick", "twitch"],
    },
    externalThumbnail: String,
    isLiveStatus: {
      type: String,
      enum: ["live", "offline"],
      default: "offline",
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    allowChat: {
      type: Boolean,
      default: true,
    },
    allowReactions: {
      type: Boolean,
      default: true,
    },
    quality: {
      type: String,
      enum: ["720p", "1080p", "4k"],
      default: "1080p",
    },
    bitrate: {
      type: Number,
      min: 0,
    },
    resolution: String,
    tags: [{
      type: String,
      trim: true,
    }],
    thumbnail: String,
    moderators: [{
      type: Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
streamSessionSchema.index({ status: 1, scheduledStartTime: 1 });
streamSessionSchema.index({ tournamentId: 1, status: 1 });
streamSessionSchema.index({ matchId: 1, status: 1 });
streamSessionSchema.index({ organizerId: 1, status: 1 });
streamSessionSchema.index({ tags: 1 });
streamSessionSchema.index({ isPublic: 1, status: 1 });

export default mongoose.model<IStreamSession>("StreamSession", streamSessionSchema);
