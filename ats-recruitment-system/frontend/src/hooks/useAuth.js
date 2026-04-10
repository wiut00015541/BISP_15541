import { useEffect, useState } from "react";

const defaultUser = null;

export const useAuth = () => {
  const [token, setToken] = useState(localStorage.getItem("ats_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ats_user");
    return raw ? JSON.parse(raw) : defaultUser;
  });

  useEffect(() => {
    if (!token) {
      localStorage.removeItem("ats_token");
      localStorage.removeItem("ats_user");
    }
  }, [token]);

  const login = (authPayload) => {
    setToken(authPayload.token);
    setUser(authPayload.user);
    localStorage.setItem("ats_token", authPayload.token);
    localStorage.setItem("ats_user", JSON.stringify(authPayload.user));
  };

  const logout = () => {
    setToken(null);
    setUser(defaultUser);
    localStorage.removeItem("ats_token");
    localStorage.removeItem("ats_user");
  };

  const updateUser = (nextUser) => {
    setUser(nextUser);
    localStorage.setItem("ats_user", JSON.stringify(nextUser));
  };

  return {
    token,
    user,
    isAuthenticated: Boolean(token),
    login,
    logout,
    updateUser,
  };
};
