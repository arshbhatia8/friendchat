import { LoginForm } from "@/components/auth/LoginForm";

export function LoginPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Welcome back</h1>
        <p className="text-sm text-ink-muted mt-1">Sign in to your account to continue</p>
      </div>
      <LoginForm />
    </>
  );
}
