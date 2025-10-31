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
      // ⚙️ DEV MODE AUTO LOGIN (bỏ đi nếu deploy production)
      if (import.meta.env.DEV) {
        console.log("🧪 Dev auto login enabled");
        const devUser = {
          id: "dev-1",
          name: "Dev Tester",
          email: "dev@example.com",
          role: "admin", // đổi "user" nếu muốn
        };
        setUser(devUser);
        setLoading(false);
        return;
      }

      // ✅ Gọi API thật (khi không ở DEV)
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
    } catch {}
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
