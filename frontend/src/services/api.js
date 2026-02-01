import axios from 'axios';

const API_BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor for auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Posts API
export const postsAPI = {
  getAll: () => api.get('/posts/'),
  getOne: (id) => api.get(`/posts/${id}/`),
  create: (data) => api.post('/posts/', data),
  update: (id, data) => api.put(`/posts/${id}/`, data),
  delete: (id) => api.delete(`/posts/${id}/`),
  like: (id) => api.post(`/posts/${id}/like/`),
  unlike: (id) => api.post(`/posts/${id}/unlike/`),
};

// Comments API
export const commentsAPI = {
  getAll: (postId) => api.get('/comments/', { params: { post: postId } }),
  create: (data) => api.post('/comments/', data),
  update: (id, data) => api.put(`/comments/${id}/`, data),
  delete: (id) => api.delete(`/comments/${id}/`),
  like: (id) => api.post(`/comments/${id}/like/`),
  unlike: (id) => api.post(`/comments/${id}/unlike/`),
};

// Leaderboard API
export const leaderboardAPI = {
  get: () => api.get('/leaderboard/'),
};

// Users API
export const usersAPI = {
  getCurrent: () => api.get('/users/me/'),
  getAll: () => api.get('/users/'),
};

export default api;
