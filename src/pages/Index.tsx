import { useState } from "react";
import Login from "./Login";
import Dashboard from "./Dashboard";

const Index = () => {
  const [user, setUser] = useState<string | null>(() => {
    return localStorage.getItem("annotate_ai_user");
  });

  const handleLogin = (username: string) => {
    localStorage.setItem("annotate_ai_user", username);
    setUser(username);
  };

  const handleLogout = () => {
    localStorage.removeItem("annotate_ai_user");
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;
  return <Dashboard username={user} onLogout={handleLogout} />;
};

export default Index;
