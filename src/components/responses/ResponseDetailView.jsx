import { useState } from 'react';
import FormViewToolbar from '../layout/FormViewToolbar';
import ResponsePageContent from './ResponsePageContent';
import { downloadResponsePdf } from '../../utils/downloadResponsePdf';
import './ResponseDetailView.css';

function formatSubmittedAt(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function ResponseDetailView({ submission, onBack, backLabel = 'Back to my forms' }) {
  const [downloading, setDownloading] = useState(false);
  const page = submission.page;
  const layout = page?.layout_data || {};
  const pageTitle = page?.page_name || layout.pageTitle || 'Untitled form';

  const handleDownload = async () => {
    try {
      setDownloading(true);
      await downloadResponsePdf(submission);
    } catch (err) {
      window.alert(err.message || 'Failed to download PDF');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="response-detail-screen">
      <FormViewToolbar
        onBack={onBack}
        backLabel={backLabel}
        title={pageTitle}
        subtitle={[
          submission.submitted_by?.user_name && `Submitted by ${submission.submitted_by.user_name}`,
          submission.submitted_by?.email,
          formatSubmittedAt(submission.submitted_at) && `on ${formatSubmittedAt(submission.submitted_at)}`,
        ].filter(Boolean).join(' · ')}
      >
        <button
          type="button"
          className="form-view-toolbar-btn"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </FormViewToolbar>

      <div className="response-detail-canvas-wrap">
        <div className="response-detail-page">
          <ResponsePageContent submission={submission} />
        </div>
      </div>
    </div>
  );
}
