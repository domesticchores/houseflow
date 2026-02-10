import { useState } from "react";
import { Box, Eye, EyeOff } from "lucide-react";

interface LoginProps {
  onLogin: (username: string) => void;
}

const Login = ({ onLogin }: LoginProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) onLogin(username.trim());
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="w-full max-w-sm animate-fade-in">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 glow-primary">
            <Box className="h-7 w-7 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">AnnotateAI</h1>
          <p className="mt-1 text-sm text-muted-foreground">Image Annotation Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-border bg-card p-6">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              placeholder="Enter username"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-foreground uppercase tracking-wider">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border bg-surface-2 px-3 py-2 pr-10 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Sign In
          </button>
          <p className="text-center text-xs text-muted-foreground">Demo: enter any username</p>
        </form>
      </div>
    </div>
  );
};

export default Login;
