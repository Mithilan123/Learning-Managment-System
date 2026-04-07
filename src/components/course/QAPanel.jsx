import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourse } from '../../context/CourseContext';
import './QAPanel.css';

const formatDate = (dateString) =>
  new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });

const createBotReply = (message, questions) => {
  const text = message.toLowerCase().trim();
  const allQuestions = questions || [];
  const answered = allQuestions.filter((q) => (q.answers || []).length > 0);
  const unanswered = allQuestions.filter((q) => (q.answers || []).length === 0);

  if (text.includes('hello') || text.includes('hi')) {
    return 'Hi! I can help you with the Q&A section. Ask me things like "how many unanswered questions?" or "latest answered question".';
  }

  if (text.includes('unanswered') || text.includes('pending')) {
    if (unanswered.length === 0) return 'Great news! There are no unanswered questions right now.';
    const latest = unanswered[unanswered.length - 1];
    return `${unanswered.length} question(s) are still unanswered. Latest pending question: "${latest.text}".`;
  }

  if (text.includes('answered') || text.includes('resolved')) {
    if (answered.length === 0) return 'No questions have answers yet. You can ask one and wait for an instructor reply.';
    const latest = answered[answered.length - 1];
    return `${answered.length} question(s) have been answered. Latest resolved question: "${latest.text}".`;
  }

  if (text.includes('latest') || text.includes('recent')) {
    if (allQuestions.length === 0) return 'No questions posted yet. Use "Ask a Question" to start the discussion.';
    const latest = allQuestions[allQuestions.length - 1];
    return `Latest question is: "${latest.text}" by ${latest.askedBy?.name || 'Student'} on ${formatDate(latest.createdAt)}.`;
  }

  if (text.includes('help') || text.includes('what can you do')) {
    return 'I can summarize question status, show latest discussion activity, and suggest posting a clear question with topic + error details.';
  }

  return 'I could not fully understand that yet. Try asking: "unanswered questions", "latest question", or "answered count".';
};

const QAPanel = () => {
  const { user } = useAuth();
  const { questions, addQuestion, addAnswer } = useCourse();
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [answerTexts, setAnswerTexts] = useState({});
  const [expandedQuestion, setExpandedQuestion] = useState(null);
  const [botMessages, setBotMessages] = useState([
    {
      id: 'welcome',
      from: 'bot',
      text: 'I am your Study Assistant. Ask me about Q&A activity and pending doubts.',
      createdAt: new Date().toISOString(),
    },
  ]);
  const [botInput, setBotInput] = useState('');

  const isStudent = user?.role === 'student';
  const isInstructor = user?.role === 'instructor';

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!questionText.trim()) return;
    await addQuestion(questionText.trim());
    setQuestionText('');
    setShowQuestionForm(false);
  };

  const handleSubmitAnswer = async (questionId) => {
    const answerText = answerTexts[questionId];
    if (!answerText?.trim()) return;
    await addAnswer(questionId, answerText.trim());
    setAnswerTexts({ ...answerTexts, [questionId]: '' });
  };

  const sendBotMessage = (messageText) => {
    const trimmed = messageText.trim();
    if (!trimmed) return;

    const userMsg = {
      id: `u-${Date.now()}`,
      from: 'user',
      text: trimmed,
      createdAt: new Date().toISOString(),
    };
    const botMsg = {
      id: `b-${Date.now() + 1}`,
      from: 'bot',
      text: createBotReply(trimmed, questions),
      createdAt: new Date().toISOString(),
    };
    setBotMessages((prev) => [...prev, userMsg, botMsg]);
    setBotInput('');
  };

  const handleBotSubmit = (e) => {
    e.preventDefault();
    sendBotMessage(botInput);
  };

  return (
    <div className="qa-panel-container">
      <div className="qa-header">
        <h2>Questions & Answers</h2>
        {isStudent && (
          <button
            onClick={() => setShowQuestionForm(!showQuestionForm)}
            className="ask-question-button"
          >
            {showQuestionForm ? 'Cancel' : '+ Ask a Question'}
          </button>
        )}
      </div>

      {showQuestionForm && isStudent && (
        <div className="question-form-container">
          <form onSubmit={handleSubmitQuestion} className="question-form">
            <textarea
              value={questionText}
              onChange={(e) => setQuestionText(e.target.value)}
              placeholder="Type your question here..."
              rows="4"
              required
              className="question-input"
            />
            <div className="form-actions">
              <button type="button" onClick={() => { setShowQuestionForm(false); setQuestionText(''); }} className="cancel-button">
                Cancel
              </button>
              <button type="submit" className="submit-button">Post Question</button>
            </div>
          </form>
        </div>
      )}

      {isStudent && (
        <div className="chatbot-card">
          <div className="chatbot-header">
            <h3>Study Assistant Chatbot</h3>
            <p>Get quick insights from the discussion board.</p>
          </div>
          <div className="chatbot-messages">
            {botMessages.map((msg) => (
              <div key={msg.id} className={`chat-msg ${msg.from === 'user' ? 'user' : 'bot'}`}>
                <p>{msg.text}</p>
                <span>{formatDate(msg.createdAt)}</span>
              </div>
            ))}
          </div>
          <div className="chatbot-quick-actions">
            <button type="button" onClick={() => sendBotMessage('unanswered questions')}>
              Unanswered questions
            </button>
            <button type="button" onClick={() => sendBotMessage('latest question')}>
              Latest question
            </button>
            <button type="button" onClick={() => sendBotMessage('answered count')}>
              Answered count
            </button>
          </div>
          <form onSubmit={handleBotSubmit} className="chatbot-form">
            <input
              type="text"
              value={botInput}
              onChange={(e) => setBotInput(e.target.value)}
              placeholder='Ask: "how many unanswered questions?"'
            />
            <button type="submit" disabled={!botInput.trim()}>Send</button>
          </form>
        </div>
      )}

      {questions.length === 0 ? (
        <div className="empty-state">
          <p>No questions yet.</p>
          {isStudent && <p>Be the first to ask a question!</p>}
        </div>
      ) : (
        <div className="questions-list">
          {[...questions].reverse().map((question) => (
            <div key={question._id} className="question-card">
              <div className="question-header">
                <div className="question-info">
                  <h4>{question.askedBy?.name || 'Student'}</h4>
                  <span className="question-date">{formatDate(question.createdAt)}</span>
                </div>
              </div>

              <p className="question-text">{question.text}</p>

              <div className="answers-section">
                <div className="answers-header">
                  <h5>{question.answers.length} Answer{question.answers.length !== 1 ? 's' : ''}</h5>
                  <button
                    onClick={() => setExpandedQuestion(expandedQuestion === question._id ? null : question._id)}
                    className="toggle-answers-button"
                  >
                    {expandedQuestion === question._id ? 'Hide' : 'Show'} Answers
                  </button>
                </div>

                {expandedQuestion === question._id && (
                  <>
                    {question.answers.length === 0 ? (
                      <p className="no-answers">No answers yet. {isInstructor && 'Be the first to answer!'}</p>
                    ) : (
                      <div className="answers-list">
                        {[...question.answers].reverse().map((answer) => (
                          <div key={answer._id} className="answer-card">
                            <div className="answer-header">
                              <strong>{answer.answeredBy?.name || 'Instructor'}</strong>
                              <span className="answer-date">{formatDate(answer.createdAt)}</span>
                            </div>
                            <p className="answer-text">{answer.text}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {isInstructor && (
                      <div className="answer-form">
                        <textarea
                          value={answerTexts[question._id] || ''}
                          onChange={(e) => setAnswerTexts({ ...answerTexts, [question._id]: e.target.value })}
                          placeholder="Type your answer here..."
                          rows="3"
                          className="answer-input"
                        />
                        <button
                          onClick={() => handleSubmitAnswer(question._id)}
                          className="submit-answer-button"
                          disabled={!answerTexts[question._id]?.trim()}
                        >
                          Post Answer
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QAPanel;
