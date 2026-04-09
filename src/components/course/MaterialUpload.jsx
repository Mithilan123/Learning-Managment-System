import { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import './MaterialUpload.css';

const MaterialUpload = ({ onClose }) => {
  const { addMaterial } = useCourse();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('document');
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim()) { setError('Title is required'); return; }
    if (uploadMode === 'url' && !url.trim()) { setError('URL is required'); return; }
    if (uploadMode === 'file' && !file) { setError('Please select a file'); return; }

    setLoading(true);
    try {
      await addMaterial({ title: title.trim(), description: description.trim(), type, url: url.trim(), file, uploadMode });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to upload material');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="material-upload-container">
      <form onSubmit={handleSubmit} className="material-upload-form">
        <h3>Upload New Material</h3>
        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label>Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Introduction to React" required />
        </div>

        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description" rows="3" />
        </div>

        <div className="form-group">
          <label>Material Type *</label>
          <select value={type} onChange={(e) => { setType(e.target.value); setUploadMode(e.target.value === 'pdf' ? 'file' : 'url'); }}>
            <option value="document">Document</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
            <option value="pdf">PDF</option>
            <option value="code">Code Example</option>
          </select>
        </div>

        {type === 'pdf' && (
          <div className="form-group">
            <label>Upload Method</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label><input type="radio" value="file" checked={uploadMode === 'file'} onChange={() => setUploadMode('file')} /> Upload PDF File</label>
              <label><input type="radio" value="url" checked={uploadMode === 'url'} onChange={() => setUploadMode('url')} /> PDF URL</label>
            </div>
          </div>
        )}

        {uploadMode === 'file' ? (
          <div className="form-group">
            <label>Select File * (PDF, DOC, PPT — max 10MB)</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.ppt,.pptx"
              onChange={(e) => setFile(e.target.files[0])}
              required
            />
            {file && <small>Selected: {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</small>}
          </div>
        ) : (
          <div className="form-group">
            <label>URL/Link *</label>
            <input type="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://example.com/material" required />
          </div>
        )}

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-button" disabled={loading}>Cancel</button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialUpload;
