import axios, { AxiosError } from "axios";
export const BACKEND_URL = "/energymatrix/uat";
export const BACKEND_API_URL = `${BACKEND_URL}/api`;
export const BACKEND_UPLOAD_URL = `${BACKEND_URL}/uploads`;

const api = axios.create({
  baseURL: BACKEND_API_URL,
  timeout: 30000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

/**
 * ⚠️ Handle errors globally
 */
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");

      window.location.href = "/energymatrix/uat/login";
    }

    return Promise.reject(error);
  }
);

/**
 * 📦 Export API
 */
export default api;
