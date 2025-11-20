import { useState, useCallback } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const usePdfExport = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateDashboardPDF = useCallback(async (dashboardName: string) => {
    setIsGenerating(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const gridster = document.querySelector(
        ".react-grid-layout"
      ) as HTMLElement;

      if (!gridster) {
        throw new Error("Dashboard not found");
      }

      const gridsterRect = gridster.getBoundingClientRect();

      const wrapper = document.createElement("div");
      wrapper.style.position = "absolute";
      wrapper.style.left = "-9999px";
      wrapper.style.top = "0";
      wrapper.style.width = gridsterRect.width + "px";
      wrapper.style.height = gridsterRect.height + "px";
      wrapper.style.backgroundColor = "#f5f5f5";
      wrapper.style.padding = "10px";

      const originalItems = gridster.querySelectorAll(".react-grid-item");

      originalItems.forEach((originalItem: any) => {
        const itemRect = originalItem.getBoundingClientRect();
        const itemClone = originalItem.cloneNode(true) as HTMLElement;

        itemClone.style.position = "absolute";
        itemClone.style.left = itemRect.left - gridsterRect.left + "px";
        itemClone.style.top = itemRect.top - gridsterRect.top + "px";
        itemClone.style.width = itemRect.width + "px";
        itemClone.style.height = itemRect.height + "px";
        itemClone.style.transform = "none";
        itemClone.style.transition = "none";

        wrapper.appendChild(itemClone);
      });

      document.body.appendChild(wrapper);
      await new Promise((resolve) => setTimeout(resolve, 500));
      const originalCanvases = gridster.querySelectorAll("canvas");
      const clonedCanvases = wrapper.querySelectorAll("canvas");

      for (let i = 0; i < originalCanvases.length; i++) {
        const originalCanvas = originalCanvases[i] as HTMLCanvasElement;
        const clonedCanvas = clonedCanvases[i] as HTMLCanvasElement;

        try {
          const tempCanvas = document.createElement("canvas");
          tempCanvas.width = originalCanvas.width;
          tempCanvas.height = originalCanvas.height;
          const tempCtx = tempCanvas.getContext("2d");

          if (tempCtx) {
            tempCtx.fillStyle = "#ffffff";
            tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            tempCtx.drawImage(originalCanvas, 0, 0);

            const imgData = tempCanvas.toDataURL("image/jpeg", 0.85);

            const img = document.createElement("img");
            img.src = imgData;
            img.style.width = "100%";
            img.style.height = "auto";

            if (clonedCanvas.parentNode) {
              clonedCanvas.parentNode.replaceChild(img, clonedCanvas);
            }
          }
        } catch (error) {
          console.error(`Failed to convert chart ${i + 1}:`, error);
        }
      }

      await new Promise((resolve) => setTimeout(resolve, 500));

      const canvas = await html2canvas(wrapper, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        logging: false,
        backgroundColor: "#f5f5f5",
        width: wrapper.offsetWidth,
        height: wrapper.offsetHeight,
      });

      document.body.removeChild(wrapper);

      if (canvas.width === 0 || canvas.height === 0) {
        throw new Error("Failed to capture dashboard content");
      }

      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = 210;
      const pageHeight = 297;
      let currentY = 20;

      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(63, 81, 181);
      pdf.text(dashboardName, pageWidth / 2, currentY, { align: "center" });

      currentY += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      pdf.setTextColor(100, 100, 100);
      pdf.text(
        `Generated on: ${new Date().toLocaleString()}`,
        pageWidth / 2,
        currentY,
        {
          align: "center",
        }
      );

      currentY += 5;
      pdf.setDrawColor(200, 200, 200);
      pdf.line(10, currentY, pageWidth - 10, currentY);
      currentY += 10;

      const imgWidth = pageWidth - 20;
      const pdfPageHeight = pageHeight - 20;

      // Convert one PDF page height to canvas pixels
      const pdfPageHeightPx = (pdfPageHeight * canvas.width) / imgWidth;

      // Reserve header height only for first page
      const headerReservedHeightMm = currentY + 10;

      let renderedHeight = 0;
      let pageIndex = 0;

      while (renderedHeight < canvas.height) {
        const pageCanvas = document.createElement("canvas");
        pageCanvas.width = canvas.width;
        pageCanvas.height = Math.min(
          pdfPageHeightPx,
          canvas.height - renderedHeight
        );

        const pageCtx = pageCanvas.getContext("2d");
        if (pageCtx) {
          pageCtx.fillStyle = "#ffffff";
          pageCtx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
          pageCtx.drawImage(
            canvas,
            0,
            renderedHeight,
            canvas.width,
            pageCanvas.height,
            0,
            0,
            canvas.width,
            pageCanvas.height
          );
        }

        const pageImgData = pageCanvas.toDataURL("image/jpeg", 0.85);
        const pageImgHeight = (pageCanvas.height * imgWidth) / canvas.width;

        if (pageIndex > 0) {
          pdf.addPage();
        }

        // For first page, start after header; otherwise start near top
        const yOffset = pageIndex === 0 ? headerReservedHeightMm : 10;

        pdf.addImage(
          pageImgData,
          "JPEG",
          10,
          yOffset,
          imgWidth,
          pageImgHeight,
          undefined,
          "FAST"
        );

        renderedHeight += pageCanvas.height;
        pageIndex++;
      }

      const fileName = `${dashboardName.replace(
        /\s+/g,
        "_"
      )}_Dashboard_${Date.now()}.pdf`;
      const pdfBase64 = pdf.output("datauristring").split(",")[1];
      (window as any).generatedPDFBase64 = pdfBase64;
      pdf.save(fileName);
    } catch (error) {
      console.error("Error generating PDF:", error);
      alert(
        `Failed to generate PDF: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsGenerating(false);
    }
  }, []);

  return {
    generateDashboardPDF,
    isGenerating,
  };
};
