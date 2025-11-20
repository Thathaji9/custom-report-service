"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SchedulerService = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const pdfExportService_1 = require("./pdfExportService");
const ScheduleReport_1 = __importDefault(require("../models/ScheduleReport")); // Adjust path if needed
class SchedulerService {
    constructor() {
        this.pdfExportService = new pdfExportService_1.PdfExportService();
        this.jobs = new Map();
    }
    // Schedule a new report
    scheduleReport(report) {
        if (this.jobs.has(report._id.toString())) {
            // If job exists, stop and remove first (to reschedule)
            this.removeSchedule(report._id.toString());
        }
        if (!report.isActive) {
            console.log(`Report ${report.dashboardName} is inactive, skipping scheduling.`);
            return;
        }
        // Validate cron expression before scheduling
        if (!node_cron_1.default.validate(report.cronExpression)) {
            console.error(`Invalid cron expression for report ${report.dashboardName}: ${report.cronExpression}`);
            return;
        }
        const task = node_cron_1.default.schedule(report.cronExpression, async () => {
            try {
                console.log(`Running scheduled export for report: ${report.dashboardName}`);
                const outputFileName = `report_${report._id}_${Date.now()}.pdf`;
                await this.pdfExportService.exportPdfUsingButton(report.dashboardUrl, "dummy_token_value", // Use your actual token here or get from report
                outputFileName);
                // Optionally update lastRun in DB
                await ScheduleReport_1.default.findByIdAndUpdate(report._id, {
                    lastRun: new Date(),
                });
                console.log(`Export completed for report: ${report.dashboardName}`);
            }
            catch (err) {
                console.error(`Error during export for report ${report.dashboardName}:`, err);
            }
        }, {
            timezone: "Asia/Kolkata", // Set your timezone
        });
        this.jobs.set(report._id.toString(), {
            task,
            reportId: report._id.toString(),
        });
        console.log(`Scheduled report: ${report.dashboardName} with cron: ${report.cronExpression}`);
    }
    // Remove/cancel scheduled job
    removeSchedule(reportId) {
        const job = this.jobs.get(reportId);
        if (job) {
            job.task.stop();
            this.jobs.delete(reportId);
            console.log(`Removed scheduled job for report ID: ${reportId}`);
        }
    }
    // Initialize schedules for all reports at app start
    async initializeSchedules() {
        const reports = await ScheduleReport_1.default.find({ isActive: true });
        reports.forEach((report) => this.scheduleReport(report));
        console.log(`Initialized ${reports.length} scheduled report jobs.`);
    }
}
exports.SchedulerService = SchedulerService;
