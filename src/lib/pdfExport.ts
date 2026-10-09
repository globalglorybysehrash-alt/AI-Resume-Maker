import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface PdfExportOptions {
  filename?: string;
  marginMm?: number;
  format?: 'letter' | 'a4';
}

/**
 * Exports an HTML element directly to a clean, high-resolution PDF file.
 */
export async function exportElementToPdf(
  elementId: string,
  options: PdfExportOptions = {}
): Promise<void> {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Element with id "${elementId}" not found for PDF export.`);
  }

  const {
    filename = 'Document.pdf',
    marginMm = 10,
    format = 'letter',
  } = options;

  // Temporarily adjust any visual styles for clean capture
  const originalShadow = element.style.boxShadow;
  const originalBorder = element.style.border;
  element.style.boxShadow = 'none';

  try {
    // Capture element with html2canvas at high resolution (scale: 2)
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: 1024, // Consistent desktop-grade rendering baseline
    });

    // Create jsPDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format,
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();

    const usableWidth = pageWidth - marginMm * 2;
    const usableHeight = pageHeight - marginMm * 2;

    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    // Calculate height in mm corresponding to usableWidth
    const imgHeightMm = (canvasHeight * usableWidth) / canvasWidth;

    let heightLeftMm = imgHeightMm;
    let positionMm = marginMm;

    const imgData = canvas.toDataURL('image/jpeg', 0.98);

    // First page
    pdf.addImage(
      imgData,
      'JPEG',
      marginMm,
      positionMm,
      usableWidth,
      imgHeightMm,
      undefined,
      'FAST'
    );
    heightLeftMm -= usableHeight;

    // Multi-page slicing if the resume or letter exceeds a single page
    while (heightLeftMm > 0) {
      positionMm = heightLeftMm - imgHeightMm + marginMm;
      pdf.addPage();
      pdf.addImage(
        imgData,
        'JPEG',
        marginMm,
        positionMm,
        usableWidth,
        imgHeightMm,
        undefined,
        'FAST'
      );
      heightLeftMm -= usableHeight;
    }

    // Save PDF directly to user's downloads
    pdf.save(filename);
  } finally {
    // Restore styling
    element.style.boxShadow = originalShadow;
    element.style.border = originalBorder;
  }
}
