import { useState } from 'react';
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

export default function ResponseDetailView({ submission, onBack }) {
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
      <div className="response-detail-toolbar">
        <button type="button" className="response-detail-back" onClick={onBack}>
          ← Back to responses
        </button>
        <div className="response-detail-meta">
          <span className="response-detail-title">{pageTitle}</span>
          <span className="response-detail-date">
            Submitted {formatSubmittedAt(submission.submitted_at)}
          </span>
        </div>
        <button
          type="button"
          className="response-detail-download"
          onClick={handleDownload}
          disabled={downloading}
        >
          {downloading ? 'Downloading...' : 'Download PDF'}
        </button>
      </div>

      <div className="response-detail-canvas-wrap">
        <div className="response-detail-page">
          <ResponsePageContent submission={submission} />
        </div>
      </div>
    </div>
  );
}
