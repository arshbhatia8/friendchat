import { useState, FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Input }        from "@/components/ui/Input";
import { Button }       from "@/components/ui/Button";
import { ErrorAlert }   from "@/components/ui/ErrorAlert";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/utils/cn";

interface FormState {
  displayName: string;
  username:    string;
  email:       string;
  password:    string;
}

type FieldKey = keyof FormState;

function validate(form: FormState): Partial<Record<FieldKey, string>> {
  const errors: Partial<Record<FieldKey, string>> = {};
  if (!form.displayName.trim()) errors.displayName = "Display name is required";
  if (!form.username.trim())    errors.username    = "Username is required";
  else if (!/^[a-zA-Z0-9_]{3,30}$/.test(form.username))
    errors.username = "3–30 characters: letters, numbers, underscores only";
  if (!form.email)              errors.email    = "Email is required";
  else if (!/^\S+@\S+\.\S+$/.test(form.email))
    errors.email = "Enter a valid email address";
  if (!form.password)           errors.password = "Password is required";
  else if (form.password.length < 8)
    errors.password = "Password must be at least 8 characters";
  return errors;
}

// ── Password strength indicator ───────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const hasLen    = password.length >= 8;
  const hasUpper  = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const score     = [hasLen, hasUpper, hasNumber].filter(Boolean).length;
  const bars      = ["bg-danger", "bg-warning", "bg-success"];
  const labels    = ["Weak", "Fair", "Strong"];
  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "h-1 flex-1 rounded-full transition-colors duration-300",
              i < score ? bars[score - 1] : "bg-surface-muted"
            )}
          />
        ))}
      </div>
      <p className="text-xs text-ink-muted">{labels[score - 1] ?? ""}</p>
    </div>
  );
}

export function RegisterForm() {
  const [form, setForm] = useState<FormState>({
    displayName: "", username: "", email: "", password: "",
  });
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const { register, loading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  const errors    = validate(form);
  const showError = (field: FieldKey) => touched[field] ? errors[field] : undefined;

  function update(field: FieldKey) {
    return (e: React.ChangeEvent<HTMLInputElement>) => {
      clearError();
      setForm((prev) => ({ ...prev, [field]: e.target.value }));
    };
  }
  function blur(field: FieldKey) {
    return () => setTouched((t) => ({ ...t, [field]: true }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setTouched({ displayName: true, username: true, email: true, password: true });
    if (Object.keys(errors).length > 0) return;
    clearError();
    try {
      await register(form);
      navigate("/app");
    } catch { /* error in store */ }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      {error && <ErrorAlert message={error} />}

      <Input
        label="Display name"
        value={form.displayName}
        onChange={update("displayName")}
        onBlur={blur("displayName")}
        error={showError("displayName")}
        placeholder="Alice Smith"
        autoComplete="name"
      />

      <Input
        label="Username"
        value={form.username}
        onChange={update("username")}
        onBlur={blur("username")}
        error={showError("username")}
        placeholder="alice_123"
        hint="3–30 characters. Letters, numbers, underscores."
        autoComplete="username"
      />

      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={update("email")}
        onBlur={blur("email")}
        error={showError("email")}
        placeholder="you@example.com"
        autoComplete="email"
      />

      <div>
        <Input
          label="Password"
          type="password"
          value={form.password}
          onChange={update("password")}
          onBlur={blur("password")}
          error={showError("password")}
          placeholder="Min 8 characters"
          autoComplete="new-password"
        />
        <PasswordStrength password={form.password} />
      </div>

      <Button type="submit" loading={loading} fullWidth className="mt-1 h-11 text-base">
        {loading ? "Creating account…" : "Create account"}
      </Button>

      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700 transition-colors">
          Sign in
        </Link>
      </p>
    </form>
  );
}
