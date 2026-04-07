const USERS_KEY = 'lms_users';
const COURSE_KEY = 'lms_course';
const TOKEN_KEY = 'lms_token';
const USER_KEY = 'lms_user';

const readJSON = (key, fallback) => {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const writeJSON = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const id = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

const getCurrentUser = () => readJSON(USER_KEY, null);

const ensureCourse = () => {
  const existing = readJSON(COURSE_KEY, null);
  if (existing) return existing;
  const seed = {
    id: id(),
    code: 'fullstack-001',
    title: 'Full Stack Web Development',
    description: 'Complete course covering frontend and backend technologies',
    materials: [],
    questions: [],
    quiz: { title: 'Full Stack Development Quiz', passingScore: 70, questions: [], submissions: [] },
  };
  writeJSON(COURSE_KEY, seed);
  return seed;
};

const saveCourse = (course) => {
  writeJSON(COURSE_KEY, course);
  return course;
};

const safeUser = (user) => ({ id: user.id, name: user.name, email: user.email, role: user.role });

export const authAPI = {
  signup: async (name, email, password, role) => {
    if (!name || !email || !password) throw new Error('Name, email and password are required');
    const users = readJSON(USERS_KEY, []);
    const normalizedEmail = email.trim().toLowerCase();
    if (users.some((u) => u.email === normalizedEmail)) throw new Error('Email already in use');
    const user = {
      id: id(),
      name: name.trim(),
      email: normalizedEmail,
      password,
      role: role === 'instructor' ? 'instructor' : 'student',
    };
    users.push(user);
    writeJSON(USERS_KEY, users);
    const token = id();
    localStorage.setItem(TOKEN_KEY, token);
    return { token, user: safeUser(user) };
  },
  login: async (email, password) => {
    if (!email || !password) throw new Error('Email and password are required');
    const users = readJSON(USERS_KEY, []);
    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email === normalizedEmail && u.password === password);
    if (!user) throw new Error('Invalid credentials');
    const token = id();
    localStorage.setItem(TOKEN_KEY, token);
    return { token, user: safeUser(user) };
  },
  me: async () => {
    const current = getCurrentUser();
    if (!current) throw new Error('Not authenticated');
    return { user: current };
  },
};

export const courseAPI = {
  getCourse: async () => ensureCourse(),
  getMaterials: async () => ensureCourse().materials || [],
  addMaterial: async (data) => {
    const user = getCurrentUser();
    if (user?.role !== 'instructor') throw new Error('Forbidden: insufficient role');
    const course = ensureCourse();
    const material = {
      _id: id(),
      title: data?.title,
      description: data?.description || '',
      type: data?.type || 'document',
      url: data?.url,
      instructor: { id: user.id, name: user.name, email: user.email },
      createdAt: new Date().toISOString(),
    };
    if (!material.title || !material.url) throw new Error('Title and URL are required');
    course.materials.push(material);
    saveCourse(course);
    return material;
  },
  getQuestions: async () => ensureCourse().questions || [],
  addQuestion: async (text) => {
    const user = getCurrentUser();
    if (user?.role !== 'student') throw new Error('Forbidden: insufficient role');
    if (!text?.trim()) throw new Error('Question text is required');
    const course = ensureCourse();
    const question = {
      _id: id(),
      text: text.trim(),
      askedBy: { id: user.id, name: user.name, email: user.email },
      answers: [],
      createdAt: new Date().toISOString(),
    };
    course.questions.push(question);
    saveCourse(course);
    return question;
  },
  addAnswer: async (questionId, text) => {
    const user = getCurrentUser();
    if (user?.role !== 'instructor') throw new Error('Forbidden: insufficient role');
    if (!text?.trim()) throw new Error('Answer text is required');
    const course = ensureCourse();
    const question = course.questions.find((q) => String(q._id) === String(questionId));
    if (!question) throw new Error('Question not found');
    const answer = {
      _id: id(),
      text: text.trim(),
      answeredBy: { id: user.id, name: user.name, email: user.email },
      createdAt: new Date().toISOString(),
    };
    question.answers.push(answer);
    saveCourse(course);
    return answer;
  },
  getQuiz: async () => ensureCourse().quiz,
  saveQuiz: async (data) => {
    const user = getCurrentUser();
    if (user?.role !== 'instructor') throw new Error('Forbidden: insufficient role');
    const questions = Array.isArray(data?.questions) ? data.questions : [];
    if (!questions.length) throw new Error('Questions array is required');
    const course = ensureCourse();
    course.quiz = {
      title: data?.title || course.quiz?.title || 'Full Stack Development Quiz',
      passingScore: data?.passingScore ?? course.quiz?.passingScore ?? 70,
      questions: questions.map((q) => ({
        _id: id(),
        text: q.text,
        options: q.options,
        correctAnswer: q.correctAnswer,
        points: q.points || 1,
      })),
      submissions: course.quiz?.submissions || [],
    };
    saveCourse(course);
    return course.quiz;
  },
  submitQuiz: async (answers) => {
    const user = getCurrentUser();
    if (user?.role !== 'student') throw new Error('Forbidden: insufficient role');
    const course = ensureCourse();
    const quiz = course.quiz;
    if (!quiz?.questions?.length) throw new Error('Quiz not available');
    let score = 0;
    const totalPoints = quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0);
    quiz.questions.forEach((q) => {
      if (answers?.[String(q._id)] === q.correctAnswer) score += q.points || 1;
    });
    const percentage = totalPoints ? Math.round((score / totalPoints) * 100) : 0;
    const passed = percentage >= (quiz.passingScore || 70);
    quiz.submissions.push({
      _id: id(),
      user: user.id,
      score,
      totalPoints,
      percentage,
      passed,
      createdAt: new Date().toISOString(),
    });
    saveCourse(course);
    return { score, totalPoints, percentage, passed };
  },
};
