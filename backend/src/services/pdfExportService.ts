import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export class PdfExportService {
  async exportPdf(baseUrl: string, dashboardName: string): Promise<string> {
    let browser;
    try {
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"],
      });
      const page = await browser.newPage();

      await page.setViewport({
        width: 1920,
        height: 1080,
        deviceScaleFactor: 2,
      });

      await page.goto(baseUrl, {
        waitUntil: "networkidle2",
        timeout: 60000,
      });

      const exportButtonSelector = '[data-testid="export-pdf-btn"]';
      await page.waitForSelector(exportButtonSelector, { timeout: 30000 });
      await page.click(exportButtonSelector);

      await page.waitForFunction(() => !!(window as any).generatedPDFBase64, {
        timeout: 30000,
      });

      const base64Pdf = await page.evaluate(
        () => (window as any).generatedPDFBase64
      );

      if (!base64Pdf) {
        throw new Error("Failed to get generated PDF Base64 from page.");
      }

      const pdfBuffer = Buffer.from(base64Pdf, "base64");

      const uploadsDir = path.resolve(__dirname, "../../uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      const safeName = dashboardName.replace(/\s+/g, "_");
      const fileName = `${safeName}_${Date.now()}.pdf`;
      const filePath = path.join(uploadsDir, fileName);

      fs.writeFileSync(filePath, pdfBuffer);

      console.log(`PDF saved at: ${filePath}`);

      return filePath;
    } catch (err) {
      console.error("PDF generation error:", err);
      throw err;
    } finally {
      if (browser) await browser.close();
    }
  }
}
