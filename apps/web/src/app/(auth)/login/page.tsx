import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      description="Move from customer request intake to grounded AI-assisted resolution with clear auditability, strong operator controls, and a product experience that feels ready for production."
      eyebrow="Authentication"
      title="A cleaner support workspace for faster, safer decisions."
    >
      <LoginForm />
    </AuthShell>
  );
}
