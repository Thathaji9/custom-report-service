"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PdfExportService = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
class PdfExportService {
    async exportPdfUsingButton(dashboardUrl, token, outputFileName) {
        let browser;
        try {
            // Append token param for access
            const urlWithToken = `${dashboardUrl}?token=${token}`;
            browser = await puppeteer_1.default.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-dev-shm-usage",
                    "--disable-gpu",
                ],
            });
            const page = await browser.newPage();
            // Set viewport
            await page.setViewport({
                width: 1920,
                height: 1080,
                deviceScaleFactor: 2,
            });
            // Navigate to dashboard URL with token
            await page.goto(urlWithToken, {
                waitUntil: "networkidle2",
                timeout: 60000,
            });
            // Wait for main dashboard container
            await page.waitForSelector(".react-grid-layout", { timeout: 30000 });
            // Wait for charts/widgets to fully render
            await new Promise((res) => setTimeout(res, 5000));
            // Optional: Hide unwanted UI elements for cleaner PDF
            await page.evaluate(() => {
                const sidebar = document.querySelector(".MuiDrawer-root");
                if (sidebar)
                    sidebar.style.display = "none";
                const editButtons = document.querySelectorAll(".MuiIconButton-root");
                editButtons.forEach((btn) => (btn.style.display = "none"));
                const banner = document.querySelector('[style*="fff3cd"]');
                if (banner)
                    banner.style.display = "none";
            });
            // Click the export PDF button - replace selector below with your actual button selector
            const exportButtonSelector = "#export-pdf-btn";
            await page.waitForSelector(exportButtonSelector, { timeout: 15000 });
            await page.click(exportButtonSelector);
            // Wait for PDF generation after button click (adjust timing as needed)
            await new Promise((res) => setTimeout(res, 7000));
            // Alternatively, directly create a PDF of the current page state
            const pdfBuffer = await page.pdf({
                format: "A4",
                printBackground: true,
                margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" },
            });
            // Save PDF locally in backend/uploads or your preferred folder
            const saveDir = path_1.default.join(__dirname, "../../backend/uploads");
            if (!fs_1.default.existsSync(saveDir))
                fs_1.default.mkdirSync(saveDir, { recursive: true });
            const filePath = path_1.default.join(saveDir, outputFileName);
            fs_1.default.writeFileSync(filePath, pdfBuffer);
            console.log(`PDF exported and saved at: ${filePath}`);
            return filePath;
        }
        catch (error) {
            console.error("Error exporting PDF:", error);
            throw error;
        }
        finally {
            if (browser)
                await browser.close();
        }
    }
}
exports.PdfExportService = PdfExportService;
