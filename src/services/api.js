const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const request = async (method, path, body) => {
  const token = localStorage.getItem('lms_token');
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
};

export const authAPI = {
  signup: (name, email, password, role) =>
    request('POST', '/api/auth/signup', { name, email, password, role }),
  login: (email, password) =>
    request('POST', '/api/auth/login', { email, password }),
  me: () => request('GET', '/api/auth/me'),
};

export const courseAPI = {
  getCourses: () => request('GET', '/api/courses'),
  getCourse: (id) => request('GET', `/api/courses/${id}`),
  createCourse: (data) => request('POST', '/api/courses', data),

  getMaterials: (courseId) => request('GET', `/api/materials/${courseId}`),
  addMaterial: (courseId, data) => request('POST', `/api/materials/${courseId}`, data),
  deleteMaterial: (id) => request('DELETE', `/api/materials/${id}`),

  getQuestions: (courseId) => request('GET', `/api/questions/${courseId}`),
  addQuestion: (courseId, text) => request('POST', `/api/questions/${courseId}`, { text }),
  addAnswer: (questionId, text) => request('POST', `/api/questions/${questionId}/answer`, { text }),

  getQuiz: (courseId) => request('GET', `/api/quiz/${courseId}`),
  saveQuiz: (courseId, data) => request('POST', `/api/quiz/${courseId}`, data),
  submitQuiz: (courseId, answers) => request('POST', `/api/quiz/${courseId}/submit`, { answers }),
};
