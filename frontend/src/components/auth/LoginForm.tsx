import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input }        from "@/components/ui/Input";
import { Button }       from "@/components/ui/Button";
import { ErrorAlert }   from "@/components/ui/ErrorAlert";
import { useAuthStore } from "@/store/auth.store";

export function LoginForm() {
  const [email,    setEmail]    = useState("");
  const [password, setPassword] = useState("");
  const [touched,  setTouched]  = useState({ email: false, password: false });

  const { login, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const emailError    = touched.email    && !email    ? "Email is required" : "";
  const passwordError = touched.password && !password ? "Password is required" : "";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ email: true, password: true });
    if (!email || !password) return;
    clearError();
    try {
      await login(email, password);
      navigate("/app");
    } catch { /* error set in store */ }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error && (
        <ErrorAlert message={error} onRetry={() => clearError()} />
      )}

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => { setEmail(e.target.value); clearError(); }}
        onBlur={() => setTouched((t) => ({ ...t, email: true }))}
        error={emailError}
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      <div>
        <Input
          label="Password"
          type="password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); clearError(); }}
          onBlur={() => setTouched((t) => ({ ...t, password: true }))}
          error={passwordError}
          placeholder="••••••••"
          autoComplete="current-password"
          required
        />
      </div>

      <Button type="submit" loading={loading} fullWidth className="mt-1 h-11 text-base">
        {loading ? "Signing in…" : "Sign in"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700 transition-colors">
          Create one
        </Link>
      </p>
    </form>
  );
}
