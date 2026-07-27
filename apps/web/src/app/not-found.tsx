import Link from "next/link";
import { FileSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { getServerTranslator } from "@/lib/i18n/server";

export default async function NotFound() {
  const { t } = await getServerTranslator();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-8">
      <Card className="surface-elevated w-full rounded-[32px]">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="sr-only">{t("system.notFoundTitle")}</CardTitle>
          <CardDescription className="sr-only">{t("system.notFoundDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <EmptyState
            actions={
              <>
                <Link href="/dashboard">
                  <Button>{t("common.goToDashboard")}</Button>
                </Link>
                <Link href="/submit-ticket">
                  <Button variant="secondary">{t("common.customerIntake")}</Button>
                </Link>
              </>
            }
            description={t("system.notFoundDescription")}
            icon={FileSearch}
            title={t("system.notFoundTitle")}
          />
        </CardContent>
      </Card>
    </main>
  );
}
