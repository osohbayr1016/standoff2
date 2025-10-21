import mongoose, { Schema, Document } from "mongoose";

export interface ISettings extends Document {
  // General settings
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maintenanceMode: boolean;

  // Security settings
  requireEmailVerification: boolean;
  allowRegistration: boolean;
  maxLoginAttempts: number;
  sessionTimeout: number;

  // Notification settings
  emailNotifications: boolean;
  pushNotifications: boolean;
  adminAlerts: boolean;

  // Appearance settings
  theme: "dark" | "light" | "auto";
  primaryColor: string;
  accentColor: string;

  // Metadata
  createdAt: Date;
  updatedAt: Date;
}

const settingsSchema = new Schema<ISettings>(
  {
    siteName: {
      type: String,
      default: "E-Sport Connection",
      trim: true,
      maxlength: 100,
    },
    siteDescription: {
      type: String,
      default: "Connect with esports players and organizations",
      trim: true,
      maxlength: 500,
    },
    contactEmail: {
      type: String,
      default: "admin@esport-connection.com",
      trim: true,
      lowercase: true,
    },
    maintenanceMode: {
      type: Boolean,
      default: false,
    },
    requireEmailVerification: {
      type: Boolean,
      default: true,
    },
    allowRegistration: {
      type: Boolean,
      default: true,
    },
    maxLoginAttempts: {
      type: Number,
      default: 5,
      min: 3,
      max: 10,
    },
    sessionTimeout: {
      type: Number,
      default: 24,
      min: 1,
      max: 168, // 1 week max
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    pushNotifications: {
      type: Boolean,
      default: true,
    },
    adminAlerts: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      enum: ["dark", "light", "auto"],
      default: "dark",
    },
    primaryColor: {
      type: String,
      default: "#3B82F6",
      match: /^#[0-9A-Fa-f]{6}$/,
    },
    accentColor: {
      type: String,
      default: "#06B6D4",
      match: /^#[0-9A-Fa-f]{6}$/,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISettings>("Settings", settingsSchema);
