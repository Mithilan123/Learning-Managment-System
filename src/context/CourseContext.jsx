import { createContext, useContext, useState, useCallback } from 'react';
import { courseAPI } from '../services/api';

const CourseContext = createContext(null);

const DEFAULT_COURSE_CODE = 'fullstack-001';

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
    let courses = await courseAPI.getCourses();

    // create default course if none exists
    if (!courses.length) {
      const created = await courseAPI.createCourse({
        code: DEFAULT_COURSE_CODE,
        title: 'Full Stack Web Development',
        description: 'Complete course covering frontend and backend technologies',
      });
      courses = [created];
    }

    const c = courses[0];
    setCourse(c);
    localStorage.setItem('lms_course_id', c._id);

    const [mats, qs, q] = await Promise.allSettled([
      courseAPI.getMaterials(c._id),
      courseAPI.getQuestions(c._id),
      courseAPI.getQuiz(c._id),
    ]);

    setMaterials(mats.status === 'fulfilled' ? mats.value : []);
    setQuestions(qs.status === 'fulfilled' ? qs.value : []);
    setQuiz(q.status === 'fulfilled' ? q.value : null);
  }, []);

  const getCourseId = () => course?._id || localStorage.getItem('lms_course_id');

  const addMaterial = async (data) => {
    const newMaterial = await courseAPI.addMaterial(getCourseId(), data);
    setMaterials((prev) => [...prev, newMaterial]);
  };

  const addQuestion = async (text) => {
    const newQuestion = await courseAPI.addQuestion(getCourseId(), text);
    setQuestions((prev) => [...prev, newQuestion]);
  };

  const addAnswer = async (questionId, text) => {
    const updated = await courseAPI.addAnswer(questionId, text);
    setQuestions((prev) =>
      prev.map((q) => (q._id === questionId ? updated : q))
    );
  };

  const updateQuiz = async (quizData) => {
    const updated = await courseAPI.saveQuiz(getCourseId(), quizData);
    setQuiz(updated);
  };

  const submitQuizAnswer = async (answers) => {
    return await courseAPI.submitQuiz(getCourseId(), answers);
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
