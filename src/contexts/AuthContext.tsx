import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import UserInfo from "../UserInfo";
import {SSOEnabled} from "../configuration";
import {
  getUseOidcAccessToken,
  getUseOidcHook,
  NoSSOProfilePicture,
  NoSSOUserInfo,
} from "../SSODisabledDefaults";

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
  const {accessTokenPayload} = getUseOidcAccessToken()();
  const userInfo = SSOEnabled
    ? (accessTokenPayload as UserInfo)
    : NoSSOUserInfo;

  useEffect(() => {
    try {
      setUser({username: userInfo.preferred_username, uuid:userInfo.uuid})
    } catch (error) {
      console.warn("error in loading user info", error)
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
