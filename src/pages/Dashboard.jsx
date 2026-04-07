import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Learning Management Portal</h1>
          <p>Welcome back, {user?.name || user?.email}!</p>
        </div>
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
      </div>

      <div className="dashboard-content">
        <div className="welcome-card">
          <h2>Welcome to Your Dashboard</h2>
          <p>
            {user?.role === 'instructor'
              ? 'Manage course materials and answer student questions.'
              : 'Access course materials, ask questions, and take quizzes.'}
          </p>
          <div className="info-grid">
            <div className="info-card">
              <h3>Your Account</h3>
              <p><strong>Name:</strong> {user?.name || 'N/A'}</p>
              <p><strong>Email:</strong> {user?.email}</p>
              <p><strong>Role:</strong> {user?.role === 'instructor' ? 'Instructor' : 'Student'}</p>
            </div>
            <div className="info-card course-card">
              <h3>Full Stack Course</h3>
              <p>Complete course covering frontend and backend technologies</p>
              <button
                onClick={() => navigate('/course')}
                className="course-button"
              >
                {user?.role === 'instructor' ? 'Manage Course' : 'View Course'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
