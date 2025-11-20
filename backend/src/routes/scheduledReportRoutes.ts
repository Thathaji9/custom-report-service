import express from "express";
import ScheduledReport from "../models/ScheduleReport";
import { schedulerService } from "../services/schedulerServiceSingleton";

const router = express.Router();

router.post("/schedule", async (req, res) => {
  try {
    const {
      baseUrl,
      dashboardId,
      dashboardName,
      widgets,
      scheduleType,
      cronExpression,
      startDate,
      endDate,
      isActive,
    } = req.body;

    const report = new ScheduledReport({
      baseUrl,
      dashboardId,
      dashboardName,
      widgets,
      scheduleType,
      cronExpression,
      startDate,
      endDate,
      isActive,
    });

    const savedReport = await report.save();
    schedulerService.scheduleReport(savedReport);

    res.status(201).json({ message: "Report scheduled", report: savedReport });
  } catch (error) {
    console.error("Error scheduling report:", error);
    res.status(500).json({ error: "Failed to schedule report" });
  }
});

export default router;
