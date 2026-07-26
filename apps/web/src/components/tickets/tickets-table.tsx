"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowUpDown, ChevronLeft, ChevronRight, Search, Sparkles, Ticket, TriangleAlert } from "lucide-react";

import type { TicketListItem } from "@gft-assist/types";

import { TicketConfidenceBadge, TicketPriorityBadge, TicketStatusBadge } from "@/components/tickets/ticket-badges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";

type TicketsTableProps = {
  tickets: TicketListItem[];
};

const PAGE_SIZE = 8;

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TicketsTable({ tickets }: TicketsTableProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [sort, setSort] = useState("updated-desc");
  const [page, setPage] = useState(1);

  const filteredTickets = useMemo(() => {
    const filtered = tickets.filter((ticket) => {
      const matchesQuery =
        !query ||
        ticket.subject.toLowerCase().includes(query.toLowerCase()) ||
        (ticket.requesterName ?? ticket.requesterEmail).toLowerCase().includes(query.toLowerCase()) ||
        (ticket.intentLabel ?? "").toLowerCase().includes(query.toLowerCase());

      const matchesStatus = statusFilter === "ALL" || ticket.status === statusFilter;
      const matchesPriority = priorityFilter === "ALL" || ticket.priority === priorityFilter;

      return matchesQuery && matchesStatus && matchesPriority;
    });

    return filtered.sort((left, right) => {
      if (sort === "updated-asc") {
        return new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime();
      }

      if (sort === "confidence-desc") {
        return (right.confidenceScore ?? -1) - (left.confidenceScore ?? -1);
      }

      if (sort === "priority-desc") {
        const weights = { LOW: 1, MEDIUM: 2, HIGH: 3, URGENT: 4, CRITICAL: 5 };
        return weights[right.priority] - weights[left.priority];
      }

      return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
    });
  }, [priorityFilter, query, sort, statusFilter, tickets]);

  const pageCount = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const paginatedTickets = filteredTickets.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const summary = useMemo(
    () => ({
      total: tickets.length,
      critical: tickets.filter((ticket) => ticket.priority === "CRITICAL" || ticket.priority === "URGENT").length,
      triaged: tickets.filter((ticket) => ticket.confidenceScore !== null).length,
    }),
    [tickets],
  );

  if (!tickets.length) {
    return (
      <Card className="rounded-[28px] p-6">
        <EmptyState
          description="New customer requests will appear here once tickets are created for this organization."
          icon={Ticket}
          title="No tickets yet"
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Queue volume", value: summary.total, icon: Ticket, helper: "All tickets in the current workspace." },
          { label: "Critical attention", value: summary.critical, icon: TriangleAlert, helper: "Urgent and critical tickets needing rapid review." },
          { label: "AI scored", value: summary.triaged, icon: Sparkles, helper: "Tickets with confidence already recorded." },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Card className="rounded-[28px]" key={item.label}>
              <CardContent className="flex items-start justify-between gap-4 p-6">
                <div>
                  <p className="text-sm text-[color:var(--muted)]">{item.label}</p>
                  <p className="mt-2 text-3xl font-semibold">{item.value}</p>
                  <p className="mt-2 text-sm leading-6 text-[color:var(--muted)]">{item.helper}</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950/5 dark:bg-white/8">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="overflow-hidden rounded-[32px]">
        <CardHeader className="gap-4 border-b border-[color:var(--border)] p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <CardTitle className="text-xl">Operator queue</CardTitle>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                Search, filter, and prioritize the current queue without changing backend behavior.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{filteredTickets.length} visible</Badge>
              <Badge variant="info">Page {currentPage} of {pageCount}</Badge>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.4fr_0.7fr_0.7fr_0.7fr]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[color:var(--muted)]" />
              <Input
                className="pl-11"
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
                placeholder="Search subject, requester, or intent"
                value={query}
              />
            </div>
            <Select
              onChange={(event) => {
                setStatusFilter(event.target.value);
                setPage(1);
              }}
              value={statusFilter}
            >
              <option value="ALL">All statuses</option>
              {Array.from(new Set(tickets.map((ticket) => ticket.status))).map((status) => (
                <option key={status} value={status}>
                  {status.replaceAll("_", " ")}
                </option>
              ))}
            </Select>
            <Select
              onChange={(event) => {
                setPriorityFilter(event.target.value);
                setPage(1);
              }}
              value={priorityFilter}
            >
              <option value="ALL">All priorities</option>
              {Array.from(new Set(tickets.map((ticket) => ticket.priority))).map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </Select>
            <Select onChange={(event) => setSort(event.target.value)} value={sort}>
              <option value="updated-desc">Newest activity</option>
              <option value="updated-asc">Oldest activity</option>
              <option value="confidence-desc">Highest confidence</option>
              <option value="priority-desc">Highest priority</option>
            </Select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl dark:bg-slate-950/70">
              <tr className="border-b border-[color:var(--border)] text-left text-[color:var(--muted)]">
                <th className="px-6 py-4 font-medium">Ticket</th>
                <th className="px-6 py-4 font-medium">Requester</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Priority</th>
                <th className="px-6 py-4 font-medium">Confidence</th>
                <th className="px-6 py-4 font-medium">
                  <span className="inline-flex items-center gap-2">
                    Updated
                    <ArrowUpDown className="h-3.5 w-3.5" />
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedTickets.length ? paginatedTickets.map((ticket) => (
                <tr
                  className="border-b border-[color:var(--border)] align-top hover:bg-slate-950/[0.03] dark:hover:bg-white/[0.03]"
                  key={ticket.id}
                >
                  <td className="px-6 py-5">
                    <div className="space-y-2">
                      <Link className="text-sm font-semibold hover:opacity-75" href={`/tickets/${ticket.id}`}>
                        {ticket.subject}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2">
                        {ticket.intentLabel ? <Badge>{ticket.intentLabel}</Badge> : <Badge>No intent</Badge>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[color:var(--muted-foreground)]">
                    <div className="space-y-1">
                      <p className="font-medium text-[color:var(--foreground)]">{ticket.requesterName ?? "Unknown requester"}</p>
                      <p>{ticket.requesterEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <TicketStatusBadge status={ticket.status} />
                  </td>
                  <td className="px-6 py-5">
                    <TicketPriorityBadge priority={ticket.priority} />
                  </td>
                  <td className="px-6 py-5">
                    <TicketConfidenceBadge score={ticket.confidenceScore} />
                  </td>
                  <td className="px-6 py-5 text-[color:var(--muted-foreground)]">{formatDate(ticket.updatedAt)}</td>
                </tr>
              )) : (
                <tr>
                  <td className="px-6 py-10" colSpan={6}>
                    <EmptyState
                      description="Try widening the search or removing one of the active filters."
                      icon={Search}
                      title="No matching tickets"
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[color:var(--border)] px-6 py-4">
          <p className="text-sm text-[color:var(--muted)]">
            Showing {(currentPage - 1) * PAGE_SIZE + (paginatedTickets.length ? 1 : 0)}-
            {(currentPage - 1) * PAGE_SIZE + paginatedTickets.length} of {filteredTickets.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              disabled={currentPage === 1}
              onClick={() => setPage((value) => Math.max(1, value - 1))}
              variant="secondary"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              disabled={currentPage === pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              variant="secondary"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
