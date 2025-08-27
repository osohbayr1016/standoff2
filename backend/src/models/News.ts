import mongoose, { Document, Schema } from "mongoose";

export interface INews extends Document {
  title: string;
  description: string;
  content: string;
  image: string;
  type: "update" | "player" | "tournament" | "winner" | "feature";
  category: string;
  author: string;
  featured: boolean;
  readTime: string;
  tags: string[];
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const newsSchema = new Schema<INews>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    image: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["update", "player", "tournament", "winner", "feature"],
      required: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
    readTime: {
      type: String,
      required: true,
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    publishedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
newsSchema.index({ type: 1 });
newsSchema.index({ category: 1 });
newsSchema.index({ featured: 1 });
newsSchema.index({ publishedAt: -1 });
newsSchema.index({ title: "text", description: "text" });

export default mongoose.model<INews>("News", newsSchema);
