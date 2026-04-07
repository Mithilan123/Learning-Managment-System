import { createContext, useContext, useState, useCallback } from 'react';
import { courseAPI } from '../services/api';

const CourseContext = createContext(null);

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error('useCourse must be used within a CourseProvider');
  return context;
};

export const CourseProvider = ({ children }) => {
  const [course, setCourse] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [quiz, setQuiz] = useState(null);

  const fetchCourse = useCallback(async () => {
    const data = await courseAPI.getCourse();
    setCourse(data);
    setMaterials(data.materials || []);
    setQuestions(data.questions || []);
    setQuiz(data.quiz || null);
  }, []);

  const addMaterial = async (material) => {
    const newMaterial = await courseAPI.addMaterial(material);
    setMaterials((prev) => [...prev, newMaterial]);
  };

  const addQuestion = async (text) => {
    const newQuestion = await courseAPI.addQuestion(text);
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const addAnswer = async (questionId, text) => {
    const newAnswer = await courseAPI.addAnswer(questionId, text);
    setQuestions((prev) =>
      prev.map((q) =>
        q._id === questionId ? { ...q, answers: [...q.answers, newAnswer] } : q
      )
    );
  };

  const updateQuiz = async (quizData) => {
    const updated = await courseAPI.saveQuiz(quizData);
    setQuiz(updated);
  };

  const submitQuizAnswer = async (answers) => {
    const result = await courseAPI.submitQuiz(answers);
    return result;
  };

  return (
    <CourseContext.Provider
      value={{
        course,
        materials,
        questions,
        quiz,
        fetchCourse,
        addMaterial,
        addQuestion,
        addAnswer,
        updateQuiz,
        submitQuizAnswer,
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};
