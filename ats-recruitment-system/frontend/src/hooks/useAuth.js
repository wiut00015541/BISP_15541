// useAuth keeps shared frontend state logic reusable.
import { useEffect, useState } from "react";

const defaultUser = null;

// Expose auth state and helper actions through one reusable hook.
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

  // Store the current session in state and localStorage.
  const login = (authPayload) => {
    setToken(authPayload.token);
    setUser(authPayload.user);
    localStorage.setItem("ats_token", authPayload.token);
    localStorage.setItem("ats_user", JSON.stringify(authPayload.user));
  };

  // Clear the stored session and reset the local auth state.
  const logout = () => {
    setToken(null);
    setUser(defaultUser);
    localStorage.removeItem("ats_token");
    localStorage.removeItem("ats_user");
  };

  // Refresh the stored user profile without replacing the current token.
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
