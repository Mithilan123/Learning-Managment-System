import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourse } from '../../context/CourseContext';
import MaterialUpload from './MaterialUpload';
import MaterialCard from './MaterialCard';
import './MaterialsList.css';

const MaterialsList = () => {
  const { user } = useAuth();
  const { materials } = useCourse();
  const [showUpload, setShowUpload] = useState(false);
  const isInstructor = user?.role === 'instructor';

  return (
    <div className="materials-list-container">
      <div className="materials-header">
        <h2>Course Materials</h2>
        {isInstructor ? (
          <button onClick={() => setShowUpload(!showUpload)} className="upload-button">
            {showUpload ? 'Cancel Upload' : '+ Upload Material'}
          </button>
        ) : (
          <p className="materials-count">{materials.length} material(s) available</p>
        )}
      </div>

      {showUpload && isInstructor && (
        <MaterialUpload onClose={() => setShowUpload(false)} />
      )}

      {materials.length === 0 ? (
        <div className="empty-state">
          <p>No materials uploaded yet.</p>
          {isInstructor && <p>Click "Upload Material" to add your first material.</p>}
        </div>
      ) : (
        <div className="materials-grid">
          <div className="materials-section">
            <div className="materials-cards">
              {materials.map((material) => (
                <MaterialCard key={material._id} material={material} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsList;
