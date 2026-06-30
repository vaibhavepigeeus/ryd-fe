import { useRef, useState } from 'react';
import { useBuilder } from '../../context/BuilderContext';
import { COMPONENT_TYPES } from '../../constants/builder';
import { resolveMediaUrl, uploadDocument } from '../../services/documentApi';
import './ImagePanel.css';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];

export default function ImagePanel() {
  const { state, dispatch } = useBuilder();
  const selected = state.elements.find((el) => el.id === state.selectedId);
  const isImage = selected?.type === COMPONENT_TYPES.IMAGE;
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleFile = async (file) => {
    if (!file || !selected) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload a JPG, PNG, GIF, WebP, or SVG image.');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const document = await uploadDocument(file, {
        name: file.name,
        type: 'image',
        details: 'form-builder-image',
      });

      const src = resolveMediaUrl(document.document_file);

      dispatch({
        type: 'UPDATE_ELEMENT',
        payload: {
          id: selected.id,
          props: {
            src,
            documentId: document.id,
            documentName: document.document_name,
            alt: document.document_name,
          },
        },
      });
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleInputChange = (e) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  if (!isImage) {
    return null;
  }

  return (
    <div className="image-panel">
      <h3 className="panel-section-label">IMAGE</h3>

      {selected.props.src ? (
        <div className="image-panel-preview">
          <img src={selected.props.src} alt={selected.props.alt || 'Uploaded'} />
        </div>
      ) : (
        <div className="image-panel-placeholder">No image uploaded yet</div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="image-panel-input"
        onChange={handleInputChange}
        disabled={uploading}
      />

      <button
        type="button"
        className="image-panel-upload-btn"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
      >
        {uploading ? 'Uploading...' : selected.props.src ? 'Replace Image' : 'Upload Image'}
      </button>

      {selected.props.documentName && (
        <p className="image-panel-meta">
          <span>File:</span> {selected.props.documentName}
        </p>
      )}

      {error && <p className="image-panel-error">{error}</p>}
    </div>
  );
}
