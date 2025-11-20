"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmailService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: parseInt(process.env.SMTP_PORT || "587"),
            secure: false,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }
    async sendPDFReport(recipients, dashboardName, pdfBuffer) {
        try {
            const fileName = `${dashboardName.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
            await this.transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: recipients.join(", "),
                subject: `Scheduled Report: ${dashboardName}`,
                html: `
          <h2>Your scheduled dashboard report is ready!</h2>
          <p><strong>Dashboard:</strong> ${dashboardName}</p>
          <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
          <p>Please find the attached PDF report.</p>
        `,
                attachments: [
                    {
                        filename: fileName,
                        content: pdfBuffer,
                    },
                ],
            });
            console.log(`Email sent to: ${recipients.join(", ")}`);
        }
        catch (error) {
            console.error("Error sending email:", error);
            throw error;
        }
    }
}
exports.EmailService = EmailService;
