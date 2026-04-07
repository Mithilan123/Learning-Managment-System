import { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import './QuizForm.css';

const normalizeEditorQuestion = (q) => ({
  ...q,
  id: q._id != null ? String(q._id) : q.id != null ? String(q.id) : Date.now().toString(),
});

const QuizForm = ({ onClose }) => {
  const { course, updateQuiz } = useCourse();
  const [questions, setQuestions] = useState(() => {
    const existing = course.quiz?.questions;
    if (existing?.length) return existing.map(normalizeEditorQuestion);
    return [
      {
        id: Date.now().toString(),
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
      },
    ];
  });

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now().toString(),
        text: '',
        options: ['', '', '', ''],
        correctAnswer: '',
        points: 1,
      },
    ]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (questionId, optionIndex, value) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const removeQuestion = (id) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate all questions
    const validQuestions = questions.filter(
      (q) =>
        q.text.trim() &&
        q.options.every((opt) => opt.trim()) &&
        q.correctAnswer &&
        q.options.includes(q.correctAnswer)
    );

    if (validQuestions.length === 0) {
      alert('Please add at least one valid question.');
      return;
    }

    const forApi = validQuestions.map(({ id, _id, ...rest }) => rest);
    updateQuiz({ questions: forApi });
    onClose();
  };

  return (
    <div className="quiz-form-container">
      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="form-header">
          <h3>Create Quiz Questions</h3>
          <button type="button" onClick={addQuestion} className="add-question-button">
            + Add Question
          </button>
        </div>

        {questions.map((question, index) => (
          <div key={question.id} className="question-editor">
            <div className="question-editor-header">
              <h4>Question {index + 1}</h4>
              {questions.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeQuestion(question.id)}
                  className="remove-question-button"
                >
                  Remove
                </button>
              )}
            </div>

            <div className="form-group">
              <label>Question Text *</label>
              <textarea
                value={question.text}
                onChange={(e) => updateQuestion(question.id, 'text', e.target.value)}
                placeholder="Enter the question..."
                rows="2"
                required
              />
            </div>

            <div className="form-group">
              <label>Options *</label>
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="option-input-group">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) =>
                      updateOption(question.id, optIndex, e.target.value)
                    }
                    placeholder={`Option ${optIndex + 1}`}
                    required
                  />
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === option}
                    onChange={() =>
                      updateQuestion(question.id, 'correctAnswer', option)
                    }
                    disabled={!option.trim()}
                  />
                  <label>Correct</label>
                </div>
              ))}
            </div>

            <div className="form-group">
              <label>Points</label>
              <input
                type="number"
                value={question.points}
                onChange={(e) =>
                  updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)
                }
                min="1"
                required
              />
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-button">
            Cancel
          </button>
          <button type="submit" className="submit-button">
            Save Quiz
          </button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;
