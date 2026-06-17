import mongoose, { Document, Schema, Model } from "mongoose";

export interface IPingLog extends Document {
  serviceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  success: boolean;
  statusCode: number | null;
  responseTimeMs: number | null;
  error: string | null;
  pingedAt: Date;
}

const PingLogSchema = new Schema<IPingLog>(
  {
    serviceId: {
      type: Schema.Types.ObjectId,
      ref: "Service",
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    success: {
      type: Boolean,
      required: true,
    },
    statusCode: {
      type: Number,
      default: null,
    },
    responseTimeMs: {
      type: Number,
      default: null,
    },
    error: {
      type: String,
      default: null,
      maxlength: 500,
    },
    pingedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: false },
  }
);

PingLogSchema.index({ serviceId: 1, pingedAt: -1 });
PingLogSchema.index({ pingedAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 30 });

export const PingLog: Model<IPingLog> =
  mongoose.models.PingLog || mongoose.model<IPingLog>("PingLog", PingLogSchema);