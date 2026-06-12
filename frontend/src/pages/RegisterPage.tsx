import { RegisterForm } from "@/components/auth/RegisterForm";

export function RegisterPage() {
  return (
    <>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-ink">Create an account</h1>
        <p className="text-sm text-ink-muted mt-1">Join and start connecting with friends</p>
      </div>
      <RegisterForm />
    </>
  );
}
