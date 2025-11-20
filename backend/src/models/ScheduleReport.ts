import mongoose, { Schema, Document } from "mongoose";

export interface IScheduledReport extends Document {
  baseUrl: string;
  dashboardId: string;
  dashboardName: string;
  widgets: string[];
  scheduleType: "daily" | "weekly" | "monthly";
  cronExpression: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  lastRun?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ScheduledReportSchema: Schema = new Schema(
  {
    baseUrl: { type: String, required: true },
    dashboardId: { type: String, required: true },
    dashboardName: { type: String, required: true },
    widgets: [{ type: String, required: true }],
    scheduleType: {
      type: String,
      enum: ["daily", "weekly", "monthly"],
      required: true,
    },
    cronExpression: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    lastRun: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IScheduledReport>(
  "ScheduledReport",
  ScheduledReportSchema
);
