import type { TicketMessage } from "@gft-assist/types";

import { Card } from "@/components/ui/card";

type TicketMessagesProps = {
  messages: TicketMessage[];
};

export function TicketMessages({ messages }: TicketMessagesProps) {
  if (!messages.length) {
    return (
      <Card className="p-6">
        <p className="text-sm text-slate-600">No messages on this ticket yet.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">Timeline</p>
      <div className="mt-4 space-y-5">
        {messages.map((message) => (
          <div className="rounded-lg border border-slate-200 p-4" key={message.id}>
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-900">{message.authorType}</p>
              <p className="text-xs text-slate-500">{new Date(message.createdAt).toLocaleString()}</p>
            </div>

            <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{message.content}</p>

            {message.citations?.length ? (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">Citations</p>
                {message.citations.map((citation) => (
                  <div className="rounded-md bg-slate-50 p-3 text-sm" key={`${message.id}-${citation.chunkId}`}>
                    <p className="font-medium text-slate-900">
                      {citation.documentTitle} · Chunk {citation.chunkIndex}
                    </p>
                    <p className="mt-1 text-slate-600">{citation.excerpt}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </Card>
  );
}
