import { useState, useEffect } from 'react';
import { useCourse } from '../context/CourseContext';
import { useNavigate } from 'react-router-dom';
import MaterialsList from '../components/course/MaterialsList';
import QAPanel from '../components/course/QAPanel';
import Quiz from '../components/course/Quiz';
import './Course.css';

const Course = () => {
  const { course, fetchCourse } = useCourse();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('materials');

  useEffect(() => {
    fetchCourse();
  }, [fetchCourse]);

  return (
    <div className="course-container">
      <div className="course-header">
        <div>
          <h1>{course?.title || 'Full Stack Web Development'}</h1>
          <p>{course?.description}</p>
        </div>
        <button onClick={() => navigate('/dashboard')} className="back-button">
          Back to Dashboard
        </button>
      </div>

      <div className="course-tabs">
        <button
          className={`tab-button ${activeTab === 'materials' ? 'active' : ''}`}
          onClick={() => setActiveTab('materials')}
        >
          Materials
        </button>
        <button
          className={`tab-button ${activeTab === 'qa' ? 'active' : ''}`}
          onClick={() => setActiveTab('qa')}
        >
          Q&A Panel
        </button>
        <button
          className={`tab-button ${activeTab === 'quiz' ? 'active' : ''}`}
          onClick={() => setActiveTab('quiz')}
        >
          Quiz
        </button>
      </div>

      <div className="course-content">
        {activeTab === 'materials' && <MaterialsList />}
        {activeTab === 'qa' && <QAPanel />}
        {activeTab === 'quiz' && <Quiz />}
      </div>
    </div>
  );
};

export default Course;
