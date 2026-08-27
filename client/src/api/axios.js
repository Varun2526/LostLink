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

const clearSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");
};

const goToLogin = () => {
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// attach the saved access token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// The access token only lives 15 minutes. When one expires we swap the
// refresh token for a new pair and replay the failed request, so the user
// never sees a logout. Requests that fail while a refresh is already in
// flight wait for that same refresh instead of firing their own.
let refreshPromise = null;

const runRefresh = async () => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("no refresh token");
  }

  // a bare axios call, so it does not loop back through this interceptor
  const res = await axios.post(`${api.defaults.baseURL}/auth/refresh`, {
    refreshToken,
  });

  localStorage.setItem("token", res.data.token);
  localStorage.setItem("refreshToken", res.data.refreshToken);

  if (res.data.user) {
    localStorage.setItem("user", JSON.stringify(res.data.user));
  }

  return res.data.token;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    const isAuthCall =
      original && original.url && original.url.includes("/auth/");

    if (
      error.response &&
      error.response.status === 401 &&
      original &&
      !original._retried &&
      !isAuthCall
    ) {
      original._retried = true;

      try {
        if (!refreshPromise) {
          refreshPromise = runRefresh().finally(() => {
            refreshPromise = null;
          });
        }

        const newToken = await refreshPromise;

        original.headers.Authorization = `Bearer ${newToken}`;

        return api(original);
      } catch {
        clearSession();
        goToLogin();

        return Promise.reject(error);
      }
    }

    if (error.response && error.response.status === 401 && isAuthCall) {
      // a failed login or a dead refresh token, let the page show it
      return Promise.reject(error);
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

// express-validator sends { fields: { email: "...", password: "..." } }
// so a form can show the message under the right input.
const getFieldErrors = (error) => {
  if (error.response && error.response.data && error.response.data.fields) {
    return error.response.data.fields;
  }

  return {};
};

export { getErrorMessage, getFieldErrors, clearSession };
export default api;
