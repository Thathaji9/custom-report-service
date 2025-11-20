import mongoose, { Schema, Document } from "mongoose";
import { Layout } from "react-grid-layout";

export interface IDashboard extends Document {
  name: string;
  layout: Layout[];
  widgets: string[];
  createdAt: Date;
  updatedAt: Date;
}

const DashboardSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    layout: { type: Array, required: true },
    widgets: [{ type: String, required: true }],
  },
  { timestamps: true }
);

export default mongoose.model<IDashboard>("Dashboard", DashboardSchema);
