import cron, { ScheduledTask } from "node-cron";
import { PdfExportService } from "./pdfExportService";
import ScheduledReport, { IScheduledReport } from "../models/ScheduleReport";

interface ScheduledJob {
  task: ScheduledTask;
  reportId: string;
}

export class SchedulerService {
  private jobs: Map<string, ScheduledJob> = new Map();
  private pdfExportService = new PdfExportService();

  scheduleReport(report: IScheduledReport) {
    const id = (report._id as string | number).toString();

    if (this.jobs.has(id)) {
      this.removeSchedule(id);
    }

    if (!report.isActive) return;

    if (!cron.validate(report.cronExpression)) {
      console.error(
        `Invalid cron expression for report: ${report.cronExpression}`
      );
      return;
    }

    const task = cron.schedule(
      report.cronExpression,
      async () => {
        const now = new Date();
        if (report.startDate > now || report.endDate < now) {
          console.log(
            `Report ${report.dashboardName} outside start/end date window. Skipped.`
          );
          return;
        }

        try {
          console.log(`Generating PDF for report: ${report.dashboardName}`);

          const pdfPath = await this.pdfExportService.exportPdf(
            report.baseUrl,
            report.dashboardName
          );

          console.log(`PDF saved at ${pdfPath}`);

          await ScheduledReport.findByIdAndUpdate(id, { lastRun: new Date() });
        } catch (err) {
          console.error("Error generating PDF:", err);
        }
      },
      { timezone: "Asia/Kolkata" }
    );

    this.jobs.set(id, { task, reportId: id });

    console.log(
      `Scheduled report: ${report.dashboardName} with cron ${report.cronExpression}`
    );
  }

  removeSchedule(reportId: string) {
    const job = this.jobs.get(reportId);
    if (job) {
      job.task.stop();
      this.jobs.delete(reportId);
      console.log(`Stopped schedule for report ID: ${reportId}`);
    }
  }

  async initializeSchedules() {
    const activeReports = await ScheduledReport.find({ isActive: true });
    activeReports.forEach((report: any) => this.scheduleReport(report));
    console.log(`Initialized ${activeReports.length} scheduled reports`);
  }

  async cleanupExpiredSchedules() {
    const now = new Date();
    const expiredReports = await ScheduledReport.find({
      endDate: { $lte: now },
    });

    expiredReports.forEach((report: any) => {
      this.removeSchedule(report._id.toString());
    });
    await ScheduledReport.deleteMany({ endDate: { $lte: now } });
    console.log(`Cleaned up ${expiredReports.length} expired schedules`);
  }
}
