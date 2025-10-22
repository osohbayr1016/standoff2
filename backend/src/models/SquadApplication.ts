import mongoose, { Document, Schema } from "mongoose";

export enum ApplicationStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  WITHDRAWN = "WITHDRAWN",
}

export interface ISquadApplication extends Document {
  squad: mongoose.Types.ObjectId; // Squad ID
  applicant: mongoose.Types.ObjectId; // User applying
  status: ApplicationStatus;
  message?: string; // Optional message from applicant
  responseMessage?: string; // Optional response from squad leader
  respondedBy?: mongoose.Types.ObjectId; // User who responded (squad leader)
  respondedAt?: Date; // When the response was given
  createdAt: Date;
  updatedAt: Date;
}

const squadApplicationSchema = new Schema<ISquadApplication>(
  {
    squad: {
      type: Schema.Types.ObjectId,
      ref: "Squad",
      required: true,
    },
    applicant: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ApplicationStatus),
      default: ApplicationStatus.PENDING,
    },
    message: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    responseMessage: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    respondedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    respondedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
// Only prevent duplicate pending applications, not all applications
squadApplicationSchema.index({ squad: 1, applicant: 1, status: 1 }, { unique: true, partialFilterExpression: { status: ApplicationStatus.PENDING } });
squadApplicationSchema.index({ applicant: 1, status: 1 });
squadApplicationSchema.index({ squad: 1, status: 1 });
squadApplicationSchema.index({ createdAt: -1 });

// Validation: Prevent duplicate pending applications
squadApplicationSchema.pre("save", async function (next) {
  if (this.isNew && this.status === ApplicationStatus.PENDING) {
    try {
      const existingApplication = await mongoose
        .model("SquadApplication")
        .findOne({
          squad: this.squad,
          applicant: this.applicant,
          status: ApplicationStatus.PENDING,
        });

      if (existingApplication) {
        return next(
          new Error("User already has a pending application to this squad")
        );
      }
    } catch (error) {
      // If there's an error checking for duplicates, let the unique index handle it
      console.warn("Error checking for duplicate application:", error);
    }
  }
  next();
});

export default mongoose.model<ISquadApplication>(
  "SquadApplication",
  squadApplicationSchema
);
