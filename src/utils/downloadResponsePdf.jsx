import { createRoot } from 'react-dom/client';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import ResponsePageContent from '../components/responses/ResponsePageContent';

const PDF_MARGIN_MM = 12;
const BLOCK_GAP_MM = 4;
const PAGE_WIDTH_MM = 210;
const PAGE_HEIGHT_MM = 297;
const CONTENT_WIDTH_MM = PAGE_WIDTH_MM - PDF_MARGIN_MM * 2;

function slugify(value) {
  return String(value || 'response')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'response';
}

function waitForRender() {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 300);
      });
    });
  });
}

export function buildSubmissionPayload(page, answers, submissionId = null) {
  return {
    id: submissionId ?? Date.now(),
    page: {
      page_name: page.page_name,
      layout_data: page.layout_data,
    },
    response_data: {
      pageTitle: page.layout_data?.pageTitle,
      answers,
      elements: page.layout_data?.elements?.map((el) => ({
        id: el.id,
        type: el.type,
        answers: answers[el.id] || {},
      })),
    },
  };
}

export async function downloadPublishedSubmissionPdf(page, answers) {
  return downloadResponsePdf(buildSubmissionPayload(page, answers));
}

async function captureBlock(element) {
  return html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: '#ffffff',
    width: element.scrollWidth,
    height: element.scrollHeight,
  });
}

function canvasToHeightMm(canvas) {
  return (canvas.height * CONTENT_WIDTH_MM) / canvas.width;
}

function addCanvasSlice(pdf, canvas, sourceY, sliceHeightPx, destYMm) {
  const sliceCanvas = document.createElement('canvas');
  sliceCanvas.width = canvas.width;
  sliceCanvas.height = sliceHeightPx;

  const ctx = sliceCanvas.getContext('2d');
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
  ctx.drawImage(
    canvas,
    0,
    sourceY,
    canvas.width,
    sliceHeightPx,
    0,
    0,
    canvas.width,
    sliceHeightPx
  );

  const sliceHeightMm = (sliceHeightPx * CONTENT_WIDTH_MM) / canvas.width;
  const imgData = sliceCanvas.toDataURL('image/jpeg', 0.92);
  pdf.addImage(imgData, 'JPEG', PDF_MARGIN_MM, destYMm, CONTENT_WIDTH_MM, sliceHeightMm);
  return sliceHeightMm;
}

function addBlockToPdf(pdf, canvas, yPosition) {
  const maxContentHeight = PAGE_HEIGHT_MM - PDF_MARGIN_MM * 2;
  const fullHeightMm = canvasToHeightMm(canvas);

  if (fullHeightMm <= maxContentHeight) {
    if (yPosition + fullHeightMm > PAGE_HEIGHT_MM - PDF_MARGIN_MM) {
      pdf.addPage();
      yPosition = PDF_MARGIN_MM;
    }

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    pdf.addImage(imgData, 'JPEG', PDF_MARGIN_MM, yPosition, CONTENT_WIDTH_MM, fullHeightMm);
    return yPosition + fullHeightMm + BLOCK_GAP_MM;
  }

  const sliceHeightPx = Math.floor((maxContentHeight / fullHeightMm) * canvas.height);
  let sourceY = 0;

  while (sourceY < canvas.height) {
    const remainingPx = canvas.height - sourceY;
    const currentSlicePx = Math.min(sliceHeightPx, remainingPx);
    const currentSliceMm = (currentSlicePx * CONTENT_WIDTH_MM) / canvas.width;

    if (yPosition + currentSliceMm > PAGE_HEIGHT_MM - PDF_MARGIN_MM && yPosition > PDF_MARGIN_MM) {
      pdf.addPage();
      yPosition = PDF_MARGIN_MM;
    }

    const drawnHeightMm = addCanvasSlice(pdf, canvas, sourceY, currentSlicePx, yPosition);
    sourceY += currentSlicePx;
    yPosition += drawnHeightMm;

    if (sourceY < canvas.height) {
      pdf.addPage();
      yPosition = PDF_MARGIN_MM;
    }
  }

  return yPosition + BLOCK_GAP_MM;
}

export async function downloadResponsePdf(submission) {
  if (!submission?.page?.layout_data) {
    throw new Error('Response page layout is not available');
  }

  const container = document.createElement('div');
  container.className = 'response-pdf-container';
  document.body.appendChild(container);

  const root = createRoot(container);

  try {
    root.render(<ResponsePageContent submission={submission} />);
    await waitForRender();

    const pageRoot = container.querySelector('.response-pdf-page');
    if (!pageRoot) {
      throw new Error('Could not prepare response for PDF export');
    }

    const blocks = pageRoot.querySelectorAll('.response-pdf-block');
    if (!blocks.length) {
      throw new Error('Could not prepare response blocks for PDF export');
    }

    const pageTitle =
      submission.page?.page_name ||
      submission.page?.layout_data?.pageTitle ||
      'form';

    const filename = `${slugify(pageTitle)}-response-${submission.id}.pdf`;
    const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

    let yPosition = PDF_MARGIN_MM;

    for (const block of blocks) {
      const canvas = await captureBlock(block);
      yPosition = addBlockToPdf(pdf, canvas, yPosition);
    }

    pdf.save(filename);
  } finally {
    root.unmount();
    container.remove();
  }
}
