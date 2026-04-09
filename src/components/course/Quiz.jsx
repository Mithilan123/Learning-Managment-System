import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourse } from '../../context/CourseContext';
import QuizForm from './QuizForm';
import QuizTake from './QuizTake';
import './Quiz.css';

const Quiz = () => {
  const { user } = useAuth();
  const { quiz } = useCourse();
  const [showQuizForm, setShowQuizForm] = useState(false);
  const [result, setResult] = useState(null);

  const isInstructor = user?.role === 'instructor';
  const hasQuestions = quiz?.questions?.length > 0;

  const handleResult = (r) => {
    setResult(r);
  };

  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>{quiz?.title || 'Course Quiz'}</h2>
          {isInstructor && (
            <button onClick={() => { setShowQuizForm(!showQuizForm); setResult(null); }} className="manage-quiz-button">
              {showQuizForm ? 'Cancel' : hasQuestions ? 'Edit Quiz' : 'Create Quiz'}
            </button>
          )}
        </div>
      </div>

      {showQuizForm && isInstructor && (
        <QuizForm onClose={() => setShowQuizForm(false)} />
      )}

      {!showQuizForm && (
        <>
          {!hasQuestions ? (
            <div className="empty-state">
              <p>No quiz available yet.</p>
              {isInstructor ? <p>Click "Create Quiz" to add questions.</p> : <p>Instructors are setting up the quiz.</p>}
            </div>
          ) : result ? (
            <div className="quiz-result">
              <div className={`result-card ${result.passed ? 'passed' : 'failed'}`}>
                <h3>Quiz Results</h3>
                <div className="result-score">
                  <div className="score-circle">
                    <span className="score-value">{result.percentage}%</span>
                  </div>
                  <p className="score-details">You scored {result.score} out of {result.totalPoints} points</p>
                </div>
                <div className={`result-status ${result.passed ? 'passed' : 'failed'}`}>
                  {result.passed ? (
                    <><span className="status-icon">✅</span><span>Congratulations! You passed the quiz.</span></>
                  ) : (
                    <><span className="status-icon">❌</span><span>You need {quiz?.passingScore ?? 70}% to pass. Keep studying!</span></>
                  )}
                </div>
                {!isInstructor && (
                  <button className="manage-quiz-button" onClick={() => setResult(null)} style={{ marginTop: '1rem' }}>
                    Retake Quiz
                  </button>
                )}
              </div>
            </div>
          ) : isInstructor ? (
            <div className="empty-state">
              <p>This quiz has {quiz.questions.length} question(s). Use <strong>Edit Quiz</strong> to update it.</p>
            </div>
          ) : (
            <QuizTake onResult={handleResult} />
          )}
        </>
      )}
    </div>
  );
};

export default Quiz;
