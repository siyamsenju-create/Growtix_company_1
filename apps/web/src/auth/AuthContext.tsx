import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { api, clearTokens, setTokens } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  role: "client" | "admin";
  orgId: string;
  emailVerified?: boolean;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, orgName: string) => Promise<AuthUser>;
  logout: () => void;
  refreshUser: () => Promise<void>;
};

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const me = await api<{
      id: string;
      email: string;
      role: "client" | "admin";
      orgId: string;
      emailVerified?: boolean;
    }>("/auth/me");
    setUser({
      id: me.id,
      email: me.email,
      role: me.role,
      orgId: me.orgId,
      emailVerified: me.emailVerified,
    });
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await refreshUser();
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshUser]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api<{
      accessToken: string;
      refreshToken: string;
      user: AuthUser;
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
    setTokens(res.accessToken, res.refreshToken);
    setUser({
      ...res.user,
      emailVerified: res.user.emailVerified ?? true,
    });
  }, []);

  const register = useCallback(async (email: string, password: string, orgName: string) => {
    const res = await api<{
      accessToken: string;
      refreshToken: string;
      user: AuthUser;
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password, orgName }),
      skipAuth: true,
    });
    setTokens(res.accessToken, res.refreshToken);
    const u: AuthUser = {
      ...res.user,
      emailVerified: res.user.emailVerified ?? false,
    };
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, loading, login, register, logout, refreshUser }),
    [user, loading, login, register, logout, refreshUser]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth(): AuthState {
  const v = useContext(Ctx);
  if (!v) throw new Error("AuthProvider missing");
  return v;
}
