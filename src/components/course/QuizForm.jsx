import { useState } from 'react';
import { useCourse } from '../../context/CourseContext';
import './QuizForm.css';

const QuizForm = ({ onClose }) => {
  const { quiz, updateQuiz } = useCourse();

  const [title, setTitle] = useState(quiz?.title || 'Course Quiz');
  const [passingScore, setPassingScore] = useState(quiz?.passingScore || 70);
  const [questions, setQuestions] = useState(() => {
    if (quiz?.questions?.length) {
      return quiz.questions.map((q) => ({
        id: String(q._id || Date.now()),
        text: q.text,
        options: [...q.options],
        correctAnswer: q.correctAnswer,
        points: q.points || 1,
      }));
    }
    return [{ id: Date.now().toString(), text: '', options: ['', '', '', ''], correctAnswer: '', points: 1 }];
  });

  const addQuestion = () =>
    setQuestions([...questions, { id: Date.now().toString(), text: '', options: ['', '', '', ''], correctAnswer: '', points: 1 }]);

  const updateQuestion = (id, field, value) =>
    setQuestions(questions.map((q) => (q.id === id ? { ...q, [field]: value } : q)));

  const updateOption = (qId, idx, value) =>
    setQuestions(questions.map((q) => {
      if (q.id !== qId) return q;
      const options = [...q.options];
      options[idx] = value;
      const correctAnswer = q.correctAnswer === q.options[idx] ? value : q.correctAnswer;
      return { ...q, options, correctAnswer };
    }));

  const removeQuestion = (id) => setQuestions(questions.filter((q) => q.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const valid = questions.filter(
      (q) => q.text.trim() && q.options.every((o) => o.trim()) && q.correctAnswer && q.options.includes(q.correctAnswer)
    );
    if (!valid.length) { alert('Please add at least one valid question with a correct answer selected.'); return; }

    const forApi = valid.map(({ id, ...rest }) => rest);
    await updateQuiz({ title, passingScore, questions: forApi });
    onClose();
  };

  return (
    <div className="quiz-form-container">
      <form onSubmit={handleSubmit} className="quiz-form">
        <div className="form-header">
          <h3>Create / Edit Quiz</h3>
          <button type="button" onClick={addQuestion} className="add-question-button">+ Add Question</button>
        </div>

        <div className="form-group">
          <label>Quiz Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
        </div>

        <div className="form-group">
          <label>Passing Score (%)</label>
          <input type="number" value={passingScore} onChange={(e) => setPassingScore(Number(e.target.value))} min="1" max="100" />
        </div>

        {questions.map((question, index) => (
          <div key={question.id} className="question-editor">
            <div className="question-editor-header">
              <h4>Question {index + 1}</h4>
              {questions.length > 1 && (
                <button type="button" onClick={() => removeQuestion(question.id)} className="remove-question-button">Remove</button>
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
              <label>Options * (select the correct answer)</label>
              {question.options.map((option, optIndex) => (
                <div key={optIndex} className="option-input-group">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(question.id, optIndex, e.target.value)}
                    placeholder={`Option ${optIndex + 1}`}
                    required
                  />
                  <input
                    type="radio"
                    name={`correct-${question.id}`}
                    checked={question.correctAnswer === option && option.trim() !== ''}
                    onChange={() => updateQuestion(question.id, 'correctAnswer', option)}
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
                onChange={(e) => updateQuestion(question.id, 'points', parseInt(e.target.value) || 1)}
                min="1"
                required
              />
            </div>
          </div>
        ))}

        <div className="form-actions">
          <button type="button" onClick={onClose} className="cancel-button">Cancel</button>
          <button type="submit" className="submit-button">Save Quiz</button>
        </div>
      </form>
    </div>
  );
};

export default QuizForm;
