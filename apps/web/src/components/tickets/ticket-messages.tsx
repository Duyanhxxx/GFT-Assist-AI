import type { TicketMessage } from "@gft-assist/types";
import { Bot, FileSearch, MessageSquare, ShieldEllipsis, UserRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";

type TicketMessagesProps = {
  messages: TicketMessage[];
};

export function TicketMessages({ messages }: TicketMessagesProps) {
  if (!messages.length) {
    return (
      <Card className="rounded-[28px] p-6">
        <EmptyState
          description="Customer replies, operator notes, and AI-generated messages will appear here."
          icon={MessageSquare}
          title="No timeline events yet"
        />
      </Card>
    );
  }

  const authorMeta = {
    CUSTOMER: { icon: UserRound, tone: "default" as const },
    AGENT: { icon: Bot, tone: "info" as const },
    OPERATOR: { icon: ShieldEllipsis, tone: "success" as const },
    SYSTEM: { icon: MessageSquare, tone: "warning" as const },
  };

  return (
    <Card className="rounded-[32px]">
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {messages.map((message) => (
          <div className="rounded-[28px] border border-[color:var(--border)] bg-white/50 p-5 dark:bg-slate-950/30" key={message.id}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                  {(() => {
                    const Icon = authorMeta[message.authorType].icon;
                    return <Icon className="h-4 w-4" />;
                  })()}
                </div>
                <div>
                  <p className="text-sm font-medium">{message.authorType}</p>
                  <p className="text-xs text-[color:var(--muted)]">{new Date(message.createdAt).toLocaleString()}</p>
                </div>
              </div>
              <Badge variant={authorMeta[message.authorType].tone}>{message.citations?.length ? "Grounded" : "Message"}</Badge>
            </div>

            <p className="mt-4 whitespace-pre-wrap text-sm leading-7 text-[color:var(--foreground)]">{message.content}</p>

            {message.citations?.length ? (
              <div className="mt-4 space-y-2">
                <p className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-[0.2em] text-[color:var(--muted)]">
                  <FileSearch className="h-3.5 w-3.5" />
                  Citations
                </p>
                {message.citations.map((citation) => (
                  <div className="rounded-2xl bg-slate-950/[0.03] p-4 text-sm dark:bg-white/[0.04]" key={`${message.id}-${citation.chunkId}`}>
                    <p className="font-medium">
                      {citation.documentTitle} · Chunk {citation.chunkIndex}
                    </p>
                    <p className="mt-2 leading-6 text-[color:var(--muted)]">{citation.excerpt}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
