import mongoose, { Document, Schema, Model } from "mongoose";

export type PingStatus = "up" | "down" | "pending";

export interface IService extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  url: string;
  isActive: boolean;
  lastPingedAt: Date | null;
  lastStatus: PingStatus;
  lastStatusCode: number | null;
  consecutiveFailures: number;
  createdAt: Date;
  updatedAt: Date;
}

const ServiceSchema = new Schema<IService>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, "Service name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    url: {
      type: String,
      required: [true, "URL is required"],
      trim: true,
      match: [/^https?:\/\/.+/, "Please enter a valid URL starting with http:// or https://"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastPingedAt: {
      type: Date,
      default: null,
    },
    lastStatus: {
      type: String,
      enum: ["up", "down", "pending"],
      default: "pending",
    },
    lastStatusCode: {
      type: Number,
      default: null,
    },
    consecutiveFailures: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

ServiceSchema.index({ userId: 1, createdAt: -1 });

export const Service: Model<IService> =
  mongoose.models.Service || mongoose.model<IService>("Service", ServiceSchema);