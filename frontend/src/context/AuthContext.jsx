import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const u = localStorage.getItem("authUser");
      const t = localStorage.getItem("authToken");
      if (u && t) {
        setUser(JSON.parse(u));
        setToken(t);
      }
    } catch {
      localStorage.clear();
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (user, token) => {
    localStorage.setItem("authUser", JSON.stringify(user));
    localStorage.setItem("authToken", token);
    setUser(user);
    setToken(token);
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
