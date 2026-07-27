import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function ForgotPasswordPage() {
  const { t } = await getServerTranslator();

  return (
    <AuthShell
      description={t("authShell.descriptionForgot")}
      eyebrow={t("authShell.eyebrowForgot")}
      title={t("authShell.titleForgot")}
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
