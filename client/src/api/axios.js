import axios from "axios";

const DEFAULT_API_URL = "https://lostlink-3mkr.onrender.com/api";

// The value must be an absolute URL ending in /api. Two easy mistakes:
// pasting the whole "VITE_API_URL=..." line into the dashboard value field,
// and leaving the /api off. Either one makes axios post to the frontend's
// own origin and 404, so we repair both here rather than trust the env var.
const normalizeBaseUrl = (value) => {
  const cleaned = String(value || "")
    .trim()
    .replace(/^VITE_API_URL\s*=\s*/, "")
    .replace(/^["']|["']$/g, "");

  if (!/^https?:\/\//.test(cleaned)) {
    return DEFAULT_API_URL;
  }

  const trimmed = cleaned.replace(/\/+$/, "");

  return trimmed.endsWith("/api") ? trimmed : `${trimmed}/api`;
};

const api = axios.create({
  baseURL: normalizeBaseUrl(import.meta.env.VITE_API_URL),
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
