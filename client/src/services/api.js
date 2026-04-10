import axios from "axios";
import toast from "react-hot-toast";

// Determine API base URL
const getBaseURL = () => {
  // In development, use VITE_API_URL from env
  if (import.meta.env.DEV) {
    return `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api`;
  }
  // In production, use relative path (same origin)
  return "/api";
};

const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.code === "ECONNABORTED") {
      return Promise.reject({
        ...err,
        message: "Request timeout. Please check your connection and try again.",
      });
    }

    if (!err.response) {
      return Promise.reject({
        ...err,
        message: "Network error. Please check your internet connection.",
      });
    }

    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      const message = err.response?.data?.message || "";
      // Show session expired message only once
      if (!window.sessionExpiredShown) {
        window.sessionExpiredShown = true;
        toast.error("Your session has expired. Please log in again.", {
          duration: 5000,
          onClose: () => {
            delete window.sessionExpiredShown;
          }
        });
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } else {
        window.location.href = "/login";
      }
    }

    // Normalize API error message
    err.message =
      err.response?.data?.message || err.message || "Something went wrong";
    return Promise.reject(err);
  },
);

export const authAPI = {
  register: (data) => api.post("/auth/register", data),
  login: (data) => api.post("/auth/login", data),
  me: () => api.get("/auth/me"),
};

export const projectAPI = {
  getAll: () => api.get("/projects"),
  getOne: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post("/projects", data),
  delete: (id) => api.delete(`/projects/${id}`),
  getCards: (projectId, boardId) =>
    api.get(`/projects/${projectId}/boards/${boardId}/cards`),
};

export const cardAPI = {
  create: (data) => api.post("/cards", data),
  update: (id, data) => api.patch(`/cards/${id}`, data),
  delete: (id) => api.delete(`/cards/${id}`),
  reorder: (cards) => api.patch("/cards/reorder/bulk", { cards }),
};

export default api;
