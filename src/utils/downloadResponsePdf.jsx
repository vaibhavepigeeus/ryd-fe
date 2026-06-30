import { createRoot } from 'react-dom/client';
import html2pdf from 'html2pdf.js';
import ResponsePageContent from '../components/responses/ResponsePageContent';

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
        setTimeout(resolve, 250);
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

    const target = container.querySelector('.response-pdf-page');
    if (!target) {
      throw new Error('Could not prepare response for PDF export');
    }

    const pageTitle =
      submission.page?.page_name ||
      submission.page?.layout_data?.pageTitle ||
      'form';

    const filename = `${slugify(pageTitle)}-response-${submission.id}.pdf`;

    await html2pdf()
      .set({
        margin: [8, 8, 8, 8],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] },
      })
      .from(target)
      .save();
  } finally {
    root.unmount();
    container.remove();
  }
}
