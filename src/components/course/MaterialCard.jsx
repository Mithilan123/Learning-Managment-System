import './MaterialCard.css';

const MaterialCard = ({ material }) => {
  const getTypeIcon = (type) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'pdf':
        return '📄';
      case 'code':
        return '💻';
      case 'link':
        return '🔗';
      default:
        return '📝';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="material-card">
      <div className="material-header">
        <span className="material-icon">{getTypeIcon(material.type)}</span>
        <div className="material-info">
          <h4>{material.title}</h4>
          <p className="material-instructor">
            By {material.instructor?.name || material.instructorName || 'Instructor'}
          </p>
        </div>
      </div>

      {material.description && (
        <p className="material-description">{material.description}</p>
      )}

      <div className="material-footer">
        <span className="material-type">{material.type}</span>
        <span className="material-date">
          {formatDate(material.createdAt)}
        </span>
        <a
          href={material.url}
          target="_blank"
          rel="noopener noreferrer"
          className="material-link"
        >
          View →
        </a>
      </div>
    </div>
  );
};

export default MaterialCard;
