import { createContext, useContext, useState } from "react";

import api, { clearSession } from "../api/axios.js";

const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");

    return saved ? JSON.parse(saved) : null;
  });

  const save = (data) => {
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("user", JSON.stringify(data.user));

    setUser(data.user);
  };

  const signup = async (form) => {
    const res = await api.post("/auth/signup", form);

    save(res.data);
  };

  const login = async (form) => {
    const res = await api.post("/auth/login", form);

    save(res.data);
  };

  // tell the server to revoke the refresh token as well, so the session
  // cannot be resumed with a stolen copy of it
  const logout = async () => {
    const refreshToken = localStorage.getItem("refreshToken");

    try {
      if (refreshToken) {
        await api.post("/auth/logout", { refreshToken });
      }
    } catch {
      // logging out locally matters more than the server call succeeding
    }

    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, signup, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  return useContext(AuthContext);
};

export { AuthProvider, useAuth };
