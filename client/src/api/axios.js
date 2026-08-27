import axios from "axios";

// The API always lives under /api. A base URL missing that suffix silently
// 404s every request, so we fix it here instead of trusting the env var.
const normalizeBaseUrl = (url) => {
  const trimmed = url.replace(/\/+$/, "");

  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const DEFAULT_API_URL = "https://lostlink-3mkr.onrender.com/api";

const api = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL || DEFAULT_API_URL),
});

// attach the saved token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// if the token is dead, log out and send the user to login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");

      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

// Turns an axios error into something a human can act on.
// Without this, a wrong VITE_API_URL just shows "Something went wrong"
// because a 404 HTML page has no JSON message field.
const getErrorMessage = (error, fallback = "Something went wrong") => {
  if (!error.response) {
    return "Cannot reach the server. Check that the API is running and that VITE_API_URL is correct.";
  }

  if (error.response.data && error.response.data.message) {
    return error.response.data.message;
  }

  return `${fallback} (server returned ${error.response.status})`;
};

export { getErrorMessage };
export default api;
