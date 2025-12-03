import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { meApi, logoutApi } from "../services/auth";

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refreshMe = useCallback(async () => {
    try {
      const { data } = await meApi();
      setUser(data?.user || null);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const logout = async () => {
    try {
      await logoutApi();
    } catch {
      // Ignore logout errors
    }
    setUser(null);
  };

  const isAdmin = (user?.role || "").toLowerCase() === "admin";

  return (
    <AuthCtx.Provider
      value={{ user, setUser, loading, refreshMe, logout, isAdmin }}
    >
      {children}
    </AuthCtx.Provider>
  );
}
