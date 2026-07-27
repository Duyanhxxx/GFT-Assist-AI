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
import { getIntlLocale } from "@/lib/i18n/config";
import { useLocale } from "@/providers/locale-provider";

type TicketsTableProps = {
  tickets: TicketListItem[];
};

const PAGE_SIZE = 8;

function formatDate(value: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function TicketsTable({ tickets }: TicketsTableProps) {
  const { locale, t } = useLocale();
  const intlLocale = getIntlLocale(locale);
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
          description={t("tickets.noTicketsDescription")}
          icon={Ticket}
          title={t("tickets.noTickets")}
        />
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { label: t("tickets.queueCards.volume"), value: summary.total, icon: Ticket, helper: t("tickets.queueCards.volumeHelper") },
          { label: t("tickets.queueCards.critical"), value: summary.critical, icon: TriangleAlert, helper: t("tickets.queueCards.criticalHelper") },
          { label: t("tickets.queueCards.triaged"), value: summary.triaged, icon: Sparkles, helper: t("tickets.queueCards.triagedHelper") },
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
              <CardTitle className="text-xl">{t("tickets.operatorQueue")}</CardTitle>
              <p className="mt-1 text-sm text-[color:var(--muted)]">
                {t("tickets.operatorQueueDescription")}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{t("common.visibleCount", { count: filteredTickets.length })}</Badge>
              <Badge variant="info">{t("common.pageCount", { page: currentPage, total: pageCount })}</Badge>
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
                placeholder={t("common.searchSubjectRequesterIntent")}
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
              <option value="ALL">{t("common.allStatuses")}</option>
              {Array.from(new Set(tickets.map((ticket) => ticket.status))).map((status) => (
                <option key={status} value={status}>
                  {t(`tickets.statuses.${status}`)}
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
              <option value="ALL">{t("common.allPriorities")}</option>
              {Array.from(new Set(tickets.map((ticket) => ticket.priority))).map((priority) => (
                <option key={priority} value={priority}>
                  {t(`tickets.priorities.${priority}`)}
                </option>
              ))}
            </Select>
            <Select onChange={(event) => setSort(event.target.value)} value={sort}>
              <option value="updated-desc">{t("common.newestActivity")}</option>
              <option value="updated-asc">{t("common.oldestActivity")}</option>
              <option value="confidence-desc">{t("common.highestConfidence")}</option>
              <option value="priority-desc">{t("common.highestPriority")}</option>
            </Select>
          </div>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl dark:bg-slate-950/70">
              <tr className="border-b border-[color:var(--border)] text-left text-[color:var(--muted)]">
                <th className="px-6 py-4 font-medium">{t("tickets.table.ticket")}</th>
                <th className="px-6 py-4 font-medium">{t("tickets.table.requester")}</th>
                <th className="px-6 py-4 font-medium">{t("tickets.table.status")}</th>
                <th className="px-6 py-4 font-medium">{t("tickets.table.priority")}</th>
                <th className="px-6 py-4 font-medium">{t("tickets.table.confidence")}</th>
                <th className="px-6 py-4 font-medium">
                  <span className="inline-flex items-center gap-2">
                    {t("tickets.table.updated")}
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
                        {ticket.intentLabel ? <Badge>{ticket.intentLabel}</Badge> : <Badge>{t("common.noIntent")}</Badge>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-[color:var(--muted-foreground)]">
                    <div className="space-y-1">
                      <p className="font-medium text-[color:var(--foreground)]">{ticket.requesterName ?? t("common.unknownRequester")}</p>
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
                  <td className="px-6 py-5 text-[color:var(--muted-foreground)]">{formatDate(ticket.updatedAt, intlLocale)}</td>
                </tr>
              )) : (
                <tr>
                  <td className="px-6 py-10" colSpan={6}>
                    <EmptyState
                      description={t("tickets.noMatchingDescription")}
                      icon={Search}
                      title={t("tickets.noMatching")}
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
              {t("common.previous")}
            </Button>
            <Button
              disabled={currentPage === pageCount}
              onClick={() => setPage((value) => Math.min(pageCount, value + 1))}
              variant="secondary"
            >
              {t("common.next")}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
