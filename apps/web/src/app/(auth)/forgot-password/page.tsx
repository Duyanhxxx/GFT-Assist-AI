import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      description="Recovery should feel just as polished as the core workspace: clear, low-friction, and trustworthy for operators handling sensitive support workflows."
      eyebrow="Account recovery"
      title="Get operators back into the workspace quickly."
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
