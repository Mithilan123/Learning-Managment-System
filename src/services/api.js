const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const request = async (method, path, body) => {
  const token = localStorage.getItem('lms_token');
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });
  } catch {
    throw new Error(`Cannot reach backend at ${BASE_URL}. Start server and check VITE_API_URL.`);
  }

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
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
  addMaterial: async (courseId, data) => {
    const token = localStorage.getItem('lms_token');
    const headers = { ...(token && { Authorization: `Bearer ${token}` }) };
    let body;

    if (data.uploadMode === 'file' && data.file) {
      body = new FormData();
      body.append('file', data.file);
      body.append('title', data.title);
      body.append('description', data.description || '');
      body.append('type', data.type);
    } else {
      body = JSON.stringify({ title: data.title, description: data.description, type: data.type, url: data.url });
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${BASE_URL}/api/materials/${courseId}`, { method: 'POST', headers, body });
    const json = await res.json();
    if (!res.ok) throw new Error(json.message || 'Request failed');
    return json;
  },
  deleteMaterial: (id) => request('DELETE', `/api/materials/${id}`),

  getQuestions: (courseId) => request('GET', `/api/questions/${courseId}`),
  addQuestion: (courseId, text) => request('POST', `/api/questions/${courseId}`, { text }),
  addAnswer: (questionId, text) => request('POST', `/api/questions/${questionId}/answer`, { text }),

  getQuiz: (courseId) => request('GET', `/api/quiz/${courseId}`),
  saveQuiz: (courseId, data) => request('POST', `/api/quiz/${courseId}`, data),
  submitQuiz: (courseId, answers) => request('POST', `/api/quiz/${courseId}/submit`, { answers }),
};

export { BASE_URL };
