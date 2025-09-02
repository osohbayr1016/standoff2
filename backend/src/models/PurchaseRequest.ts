import mongoose, { Schema, Document } from "mongoose";

export type PurchaseStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface IPurchaseRequest extends Document {
  squadId: Schema.Types.ObjectId;
  requestedBy: Schema.Types.ObjectId; // user id (usually squad leader)
  amount: number; // amount of bounty coins requested
  status: PurchaseStatus;
  adminNotes?: string;
  processedBy?: Schema.Types.ObjectId; // admin user id
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseRequestSchema = new Schema<IPurchaseRequest>(
  {
    squadId: {
      type: Schema.Types.ObjectId,
      ref: "Squad",
      required: true,
      index: true,
    },
    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    processedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    processedAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

purchaseRequestSchema.index({ status: 1, createdAt: -1 });

export default mongoose.model<IPurchaseRequest>(
  "PurchaseRequest",
  purchaseRequestSchema
);
