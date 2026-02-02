import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/api/",
  headers: {
    "Content-Type": "application/json",
  },
});

/* =========================
   REQUEST INTERCEPTOR
   ========================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      // ✅ Django TokenAuth format
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* =========================
   RESPONSE INTERCEPTOR
   ========================= */
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // ❌ No redirect, just logout
    if (error.response?.status === 401) {
      localStorage.clear();
    }
    return Promise.reject(error);
  }
);

export default api;
