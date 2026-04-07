import { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import './QuizTake.css';

const questionKey = (q) => (q._id != null ? String(q._id) : q.id != null ? String(q.id) : '');

const QuizTake = ({ onResult }) => {
  const { quiz, submitQuizAnswer } = useCourse();
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const questions = quiz?.questions || [];

  const handleAnswerChange = (qid, answer) => {
    setAnswers((prev) => ({ ...prev, [qid]: answer }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (Object.keys(answers).length !== questions.length) {
      alert('Please answer all questions before submitting.');
      return;
    }

    const payload = {};
    questions.forEach((q) => {
      const id = questionKey(q);
      if (id) payload[id] = answers[id];
    });

    setSubmitting(true);
    try {
      const quizResult = await submitQuizAnswer(payload);
      setResult(quizResult);
      setSubmitted(true);
      onResult?.(quizResult);
    } catch (err) {
      setError(err.message || 'Could not submit quiz');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted && result) {
    return (
      <div className="quiz-result">
        <div className={`result-card ${result.passed ? 'passed' : 'failed'}`}>
          <h3>Quiz Submitted!</h3>
          <div className="result-score">
            <div className="score-circle">
              <span className="score-value">{result.percentage}%</span>
            </div>
            <p className="score-details">
              You scored {result.score} out of {result.totalPoints} points
            </p>
          </div>
          <div className={`result-status ${result.passed ? 'passed' : 'failed'}`}>
            {result.passed ? (
              <>
                <span className="status-icon">✅</span>
                <span>Congratulations! You passed the quiz.</span>
              </>
            ) : (
              <>
                <span className="status-icon">❌</span>
                <span>
                  You need {quiz?.passingScore ?? 70}% to pass. Keep studying!
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!questions.length) {
    return (
      <div className="empty-state">
        <p>No quiz questions yet.</p>
      </div>
    );
  }

  return (
    <div className="quiz-take-container">
      <div className="quiz-info-bar">
        <p>
          <strong>Instructions:</strong> Answer all questions. You need {quiz?.passingScore ?? 70}% to pass.
        </p>
        <p>
          Questions: {questions.length} | Passing Score: {quiz?.passingScore ?? 70}%
        </p>
      </div>

      {error && <p className="quiz-error" role="alert">{error}</p>}

      <form onSubmit={handleSubmit} className="quiz-form">
        {questions.map((question, index) => {
          const qid = questionKey(question);
          return (
            <div key={qid || index} className="quiz-question">
              <div className="question-header">
                <span className="question-number">Question {index + 1}</span>
                <span className="question-points">
                  {question.points || 1} point{question.points !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="question-text">{question.text}</p>
              <div className="question-options">
                {(question.options || []).map((option, optIndex) => (
                  <label key={optIndex} className="option-label">
                    <input
                      type="radio"
                      name={qid}
                      value={option}
                      checked={answers[qid] === option}
                      onChange={() => handleAnswerChange(qid, option)}
                      required
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        <div className="quiz-submit-section">
          <button type="submit" className="submit-quiz-button" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit Quiz'}
          </button>
          <p className="submit-warning">
            Make sure you&apos;ve answered all questions. You cannot change your answers after submission.
          </p>
        </div>
      </form>
    </div>
  );
};

export default QuizTake;
