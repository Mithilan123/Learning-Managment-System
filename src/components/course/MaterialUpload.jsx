import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourse } from '../../context/CourseContext';
import './MaterialUpload.css';

const MaterialUpload = ({ onClose }) => {
  const { user } = useAuth();
  const { addMaterial } = useCourse();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('document');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !url.trim()) {
      setError('Title and URL are required');
      return;
    }

    setLoading(true);

    const material = {
      title: title.trim(),
      description: description.trim(),
      type,
      url: url.trim(),
      instructorEmail: user.email,
      instructorName: user.name,
    };

    addMaterial(material);
    setTitle('');
    setDescription('');
    setUrl('');
    setType('document');
    setLoading(false);
    onClose();
  };

  return (
    <div className="material-upload-container">
      <form onSubmit={handleSubmit} className="material-upload-form">
        <h3>Upload New Material</h3>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="title">Title *</label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Introduction to React"
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of the material"
            rows="3"
          />
        </div>

        <div className="form-group">
          <label htmlFor="type">Material Type *</label>
          <select
            id="type"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
          >
            <option value="document">Document</option>
            <option value="video">Video</option>
            <option value="link">Link</option>
            <option value="pdf">PDF</option>
            <option value="code">Code Example</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="url">URL/Link *</label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/material"
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="cancel-button"
            disabled={loading}
          >
            Cancel
          </button>
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? 'Uploading...' : 'Upload Material'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MaterialUpload;
