import Link from "next/link";
import { FileSearch } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl items-center justify-center px-4 py-8">
      <Card className="surface-elevated w-full rounded-[32px]">
        <CardHeader className="p-8 pb-0">
          <CardTitle className="sr-only">Page not found</CardTitle>
          <CardDescription className="sr-only">Use one of the provided links to continue navigating the app.</CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <EmptyState
            actions={
              <>
                <Link href="/dashboard">
                  <Button>Go to dashboard</Button>
                </Link>
                <Link href="/submit-ticket">
                  <Button variant="secondary">Open support intake</Button>
                </Link>
              </>
            }
            description="The page you&apos;re looking for doesn&apos;t exist or may have moved. Use one of the links below to get back into the product."
            icon={FileSearch}
            title="Page not found"
          />
        </CardContent>
      </Card>
    </main>
  );
}
