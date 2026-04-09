import { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import './QuizTake.css';

const getQuestionKey = (question, index) => String(question?._id || question?.id || `q-${index}`);

const QuizTake = ({ onResult }) => {
  const { quiz, submitQuizAnswer } = useCourse();
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const questions = quiz?.questions || [];

  const handleAnswerChange = (qid, answer) => {
    setAnswers((prev) => ({ ...prev, [qid]: answer }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const unanswered = questions.filter((q, index) => !answers[getQuestionKey(q, index)]);
    if (unanswered.length > 0) {
      setError(`Please answer all ${questions.length} questions before submitting.`);
      return;
    }

    const payload = {};
    questions.forEach((q, index) => {
      const key = getQuestionKey(q, index);
      payload[key] = answers[key];
    });

    setSubmitting(true);
    try {
      const result = await submitQuizAnswer(payload);
      onResult?.(result);
    } catch (err) {
      setError(err.message || 'Could not submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!questions.length) {
    return <div className="empty-state"><p>No quiz questions yet.</p></div>;
  }

  const answeredCount = questions.filter((q, index) => answers[getQuestionKey(q, index)]).length;

  return (
    <div className="quiz-take-container">
      <div className="quiz-info-bar">
        <p><strong>Instructions:</strong> Answer all questions. You need {quiz?.passingScore ?? 70}% to pass.</p>
        <p>Answered: {answeredCount} / {questions.length} | Passing Score: {quiz?.passingScore ?? 70}%</p>
      </div>

      {error && <p className="quiz-error" role="alert" style={{ color: 'red', padding: '0.5rem' }}>{error}</p>}

      <form onSubmit={handleSubmit} className="quiz-form">
        {questions.map((question, index) => {
          const qid = getQuestionKey(question, index);
          return (
            <div key={qid} className="quiz-question">
              <div className="question-header">
                <span className="question-number">Question {index + 1}</span>
                <span className="question-points">{question.points || 1} point{question.points !== 1 ? 's' : ''}</span>
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
                    />
                    <span>{option}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        })}

        <div className="quiz-submit-section">
          <button
            type="submit"
            className="submit-quiz-button"
            disabled={submitting || answeredCount < questions.length}
          >
            {submitting ? 'Submitting…' : `Submit Quiz (${answeredCount}/${questions.length} answered)`}
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizTake;
