"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const ScheduleReport_1 = __importDefault(require("../models/ScheduleReport"));
const schedulerService_1 = require("../services/schedulerService");
const router = express_1.default.Router();
const schedulerService = new schedulerService_1.SchedulerService();
// Create scheduled report
router.post("/schedule", async (req, res) => {
    try {
        const { dashboardName, dashboardUrl, scheduleType, cronExpression, recipients, widgets, } = req.body;
        const report = new ScheduleReport_1.default({
            dashboardName,
            dashboardUrl,
            scheduleType,
            cronExpression,
            recipients,
            widgets,
            isActive: true,
        });
        await report.save();
        // Schedule the report
        schedulerService.scheduleReport(report);
        res.status(201).json({
            message: "Report scheduled successfully",
            report,
        });
    }
    catch (error) {
        console.error("Error scheduling report:", error);
        res.status(500).json({ error: "Failed to schedule report" });
    }
});
// Update scheduled report
router.put("/schedule/:id", async (req, res) => {
    try {
        const report = await ScheduleReport_1.default.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }
        // Reschedule with updated info
        schedulerService.scheduleReport(report);
        res.json({ message: "Report updated successfully", report });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to update report" });
    }
});
// Delete scheduled report
router.delete("/schedule/:id", async (req, res) => {
    try {
        const report = await ScheduleReport_1.default.findByIdAndDelete(req.params.id);
        if (!report) {
            return res.status(404).json({ error: "Report not found" });
        }
        // Remove from scheduler
        schedulerService.removeSchedule(req.params.id);
        res.json({ message: "Report deleted successfully" });
    }
    catch (error) {
        res.status(500).json({ error: "Failed to delete report" });
    }
});
exports.default = router;
