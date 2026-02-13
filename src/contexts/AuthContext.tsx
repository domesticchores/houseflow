import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface AuthUser {
  uuid: string;
  username: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  // Stub: in production, these would be replaced by OIDC callbacks
  setUser: (user: AuthUser | null) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

/**
 * Auth provider stub. Currently uses localStorage to simulate a session.
 * Replace the useEffect with your OIDC provider's session hook.
 * The UUID field is used to track which user is logged in.
 */
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // STUB: Replace with OIDC session check
    // e.g. oidcProvider.getUser().then(u => setUser({ uuid: u.sub, username: u.preferred_username }))
    try {
      const saved = localStorage.getItem("annotate_auth_user");
      if (saved) {
        setUser(JSON.parse(saved));
      } else {
        // Auto-create a demo user for development
        const demo: AuthUser = {
          uuid: crypto.randomUUID(),
          username: "demo_user",
        };
        localStorage.setItem("annotate_auth_user", JSON.stringify(demo));
        setUser(demo);
      }
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const handleSetUser = (u: AuthUser | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem("annotate_auth_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("annotate_auth_user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
};
