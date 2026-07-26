"use client";

import { AlertTriangle } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type GlobalErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-8">
          <Card className="surface-elevated w-full rounded-[32px]">
            <CardHeader className="items-center gap-4 p-8 pb-4 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-rose-500/10 text-rose-600 dark:text-rose-300">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <CardTitle className="text-3xl">Something went wrong</CardTitle>
              <CardDescription className="max-w-xl text-sm leading-7">
                The application hit an unexpected error while rendering this page. You can try loading it again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 p-8 pt-2">
            <Alert title="Error details" variant="danger">
                {error.message}
            </Alert>
              <div className="flex justify-center">
                <Button onClick={reset}>Try again</Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </body>
    </html>
  );
}
