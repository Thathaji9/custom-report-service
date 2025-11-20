import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dashboardRoutes from "./routes/dashboardRoutes";
import scheduledReportRoutes from "./routes/scheduledReportRoutes";
import { SchedulerService } from "./services/schedulerService";

const app = express();
const port = 5000;

app.use(cors({ origin: "http://localhost:3000" }));
app.use(express.json());

app.use("/api/dashboards", dashboardRoutes);
app.use("/api/reports", scheduledReportRoutes);

const schedulerService = new SchedulerService();

mongoose
  .connect("mongodb://localhost:27017/db")
  .then(() => {
    console.log("MongoDB connected");
    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      schedulerService.cleanupExpiredSchedules();
      schedulerService
        .initializeSchedules()
        .then(() => console.log("Scheduler initialized"))
        .catch((err) => console.error("Scheduler init error:", err));
    });
  })
  .catch((err) => console.error(err));
