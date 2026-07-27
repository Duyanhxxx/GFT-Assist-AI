import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function LoginPage() {
  const { t } = await getServerTranslator();

  return (
    <AuthShell
      description={t("authShell.descriptionLogin")}
      eyebrow={t("authShell.eyebrowLogin")}
      title={t("authShell.titleLogin")}
    >
      <LoginForm />
    </AuthShell>
  );
}
