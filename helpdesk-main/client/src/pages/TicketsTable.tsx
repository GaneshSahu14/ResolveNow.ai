import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type Ticket } from "core/constants/ticket.ts";
import { type TicketStatus } from "core/constants/ticket-status.ts";
import { categoryLabel } from "core/constants/ticket-category.ts";
import ErrorAlert from "@/components/ErrorAlert";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CheckCircle,
  AlertCircle,
  MoreHorizontal,
  Search,
} from "lucide-react";
import type { TicketFilters } from "./TicketsPage";
import { useSession } from "../lib/auth-client";

interface TicketsResponse {
  tickets: Ticket[];
  total: number;
  page: number;
  pageSize: number;
}

interface TicketsTableProps {
  filters: TicketFilters;
  selectedTicketId?: number | null;
  onSelectTicket?: (id: number) => void;
}

const PAGE_SIZE = 10;

export default function TicketsTable({
  filters,
  selectedTicketId = null,
  onSelectTicket,
}: TicketsTableProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: session } = useSession();

  const [searchQuery, setSearchQuery] = useState(filters.search || "");
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }>({
    id: "createdAt",
    desc: true,
  });
  const [pageIndex, setPageIndex] = useState(0);

  // Checkbox multi-select states
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  // Reset page when filters change
  useEffect(() => {
    setPageIndex(0);
    setSelectedIds([]);
  }, [filters, searchQuery]);

  // Sync parent search filter
  useEffect(() => {
    if (filters.search !== undefined) {
      setSearchQuery(filters.search);
    }
  }, [filters.search]);

  const sortBy = sorting.id;
  const sortOrder = sorting.desc ? "desc" : "asc";

  // Fetch tickets query
  const { data, isLoading, error } = useQuery({
    queryKey: ["tickets", sortBy, sortOrder, filters, searchQuery, pageIndex],
    queryFn: async () => {
      const activeFilters = {
        ...filters,
        search: searchQuery || undefined,
      };

      const { data } = await axios.get<TicketsResponse>("/api/tickets", {
        params: {
          sortBy,
          sortOrder,
          ...activeFilters,
          page: pageIndex + 1,
          pageSize: PAGE_SIZE,
        },
      });
      return data;
    },
  });

  const tickets = data?.tickets ?? [];

  const total = data?.total ?? 0;
  const pageCount = Math.ceil(total / PAGE_SIZE);

  // Toggle sorting helper
  const handleSort = (field: string) => {
    setSorting((prev) => ({
      id: field,
      desc: prev.id === field ? !prev.desc : false,
    }));
    setPageIndex(0);
  };

  // Toggle single checkbox selection
  const handleSelectRow = (id: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid selecting row preview
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  // Toggle check-all checkboxes
  const handleSelectAll = () => {
    if (selectedIds.length === tickets.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(tickets.map((t) => t.id));
    }
  };

  // Bulk action patch mutation
  const bulkUpdateMutation = useMutation({
    mutationFn: async (payload: { status?: TicketStatus; assignedToId?: string | null }) => {
      // Loop patches for simplicity (no bulk endpoint exists on server)
      const promises = selectedIds.map((id) =>
        axios.patch(`/api/tickets/${id}`, payload)
      );
      await Promise.all(promises);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      setSelectedIds([]);
    },
  });

  // Single action patch mutation
  const quickUpdateMutation = useMutation({
    mutationFn: async (args: { id: number; payload: { status?: TicketStatus; assignedToId?: string | null } }) => {
      await axios.patch(`/api/tickets/${args.id}`, args.payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  if (error) {
    return <ErrorAlert message="Failed to fetch tickets" />;
  }

  const pageStart = total === 0 ? 0 : pageIndex * PAGE_SIZE + 1;
  const pageEnd = Math.min((pageIndex + 1) * PAGE_SIZE, total);

  return (
    <div className="flex-1 flex flex-col justify-between h-full relative overflow-hidden">
      
      {/* Table search bar header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground opacity-60" />
          <input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-card border border-border rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Dense page indicator */}
        <p className="text-[11px] font-mono text-muted-foreground">
          Showing {tickets.length} items of {total} total
        </p>
      </div>

      {/* Main Table view */}
      <div className="flex-1 overflow-y-auto">
        <Table className="text-left w-full h-full min-w-[800px] border-collapse table-auto">
          <TableHeader className="bg-surface-container-low sticky top-0 z-10">
            <TableRow className="border-b border-outline-variant/20 hover:bg-transparent">
              <TableHead className="w-12 text-center">
                <input
                  type="checkbox"
                  checked={tickets.length > 0 && selectedIds.length === tickets.length}
                  onChange={handleSelectAll}
                  className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/25 cursor-pointer"
                />
              </TableHead>
              <TableHead className="w-24">
                <button
                  onClick={() => handleSort("id")}
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  ID
                  {sorting.id === "id" ? (
                    sorting.desc ? <ArrowDown className="h-3 w-3 text-primary" /> : <ArrowUp className="h-3 w-3 text-primary" />
                  ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("subject")}
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Subject
                  {sorting.id === "subject" ? (
                    sorting.desc ? <ArrowDown className="h-3 w-3 text-primary" /> : <ArrowUp className="h-3 w-3 text-primary" />
                  ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("senderName")}
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Sender
                  {sorting.id === "senderName" ? (
                    sorting.desc ? <ArrowDown className="h-3 w-3 text-primary" /> : <ArrowUp className="h-3 w-3 text-primary" />
                  ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </button>
              </TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("category")}
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Category
                  {sorting.id === "category" ? (
                    sorting.desc ? <ArrowDown className="h-3 w-3 text-primary" /> : <ArrowUp className="h-3 w-3 text-primary" />
                  ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </button>
              </TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>
                <button
                  onClick={() => handleSort("status")}
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Status
                  {sorting.id === "status" ? (
                    sorting.desc ? <ArrowDown className="h-3 w-3 text-primary" /> : <ArrowUp className="h-3 w-3 text-primary" />
                  ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </button>
              </TableHead>
              <TableHead>Agent</TableHead>
              <TableHead className="w-32">
                <button
                  onClick={() => handleSort("createdAt")}
                  className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground cursor-pointer"
                >
                  Created
                  {sorting.id === "createdAt" ? (
                    sorting.desc ? <ArrowDown className="h-3 w-3 text-primary" /> : <ArrowUp className="h-3 w-3 text-primary" />
                  ) : <ArrowUpDown className="h-3 w-3 opacity-40" />}
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <TableRow key={i} className="hover:bg-transparent border-b border-border/40">
                  <TableCell className="py-4 text-center">
                    <Skeleton className="h-3.5 w-3.5 mx-auto bg-border/45" />
                  </TableCell>
                  <TableCell><Skeleton className="h-4 w-12 bg-border/45" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-48 bg-border/45" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-28 bg-border/45" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20 rounded-full bg-border/45" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full bg-border/45" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16 rounded-full bg-border/45" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-24 bg-border/45" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-16 bg-border/45" /></TableCell>
                </TableRow>
              ))
            ) : tickets.length === 0 ? null : (
              tickets.map((ticket) => {
                const isSelected = selectedTicketId === ticket.id;
                const isChecked = selectedIds.includes(ticket.id);
                return (
                  <TableRow
                    key={ticket.id}
                    onClick={() => onSelectTicket?.(ticket.id)}
                    className={`cursor-pointer group border-b border-outline-variant/10 transition-colors ${
                      isSelected ? "bg-surface-variant" : isChecked ? "bg-primary/5 hover:bg-primary/10" : "hover:bg-surface-variant/30"
                    }`}
                  >
                    {/* Checkbox */}
                    <TableCell
                      className="text-center"
                      onClick={(e) => handleSelectRow(ticket.id, e)}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => {}} // Controlled by cell click handler
                        className="h-3.5 w-3.5 rounded border-border text-primary focus:ring-primary/25 cursor-pointer"
                      />
                    </TableCell>

                    {/* ID */}
                    <TableCell className="font-mono text-xs font-semibold text-muted-foreground">
                      #{ticket.id}
                    </TableCell>

                    {/* Subject link & Action hover buttons */}
                    <TableCell className="relative pr-12 min-w-[200px]">
                      <div className="flex flex-col gap-0.5">
                        <Link
                          to={`/tickets/${ticket.id}`}
                          onClick={(e) => e.stopPropagation()} // Let link handle navigation
                          className="font-bold text-foreground hover:text-primary transition-colors text-[13px] truncate"
                        >
                          {ticket.subject}
                        </Link>
                      </div>

                      {/* Row Hover floating quick actions */}
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-card/90 dark:bg-card border border-border shadow-lg p-1 rounded-lg z-20 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                        {ticket.assignedTo?.id !== session?.user?.id && (
                          <button
                            title="Assign to me"
                            onClick={(e) => {
                              e.stopPropagation();
                              quickUpdateMutation.mutate({ id: ticket.id, payload: { assignedToId: session?.user?.id } });
                            }}
                            className="h-6 w-6 rounded hover:bg-primary/10 text-muted-foreground hover:text-primary flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <UserCheck className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {ticket.status !== "resolved" && (
                          <button
                            title="Resolve ticket"
                            onClick={(e) => {
                              e.stopPropagation();
                              quickUpdateMutation.mutate({ id: ticket.id, payload: { status: "resolved" } });
                            }}
                            className="h-6 w-6 rounded hover:bg-emerald-500/10 text-muted-foreground hover:text-emerald-500 flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <CheckCircle className="h-3.5 w-3.5" />
                          </button>
                        )}
                        <button
                          title="Full conversation"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/tickets/${ticket.id}`);
                          }}
                          className="h-6 w-6 rounded hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-colors cursor-pointer"
                        >
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </TableCell>

                    {/* Customer */}
                    <TableCell className="max-w-[150px] truncate text-xs">
                      <p className="font-semibold text-foreground truncate">{ticket.senderName}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{ticket.senderEmail}</p>
                    </TableCell>

                    {/* Category */}
                    <TableCell>
                      {ticket.category ? (
                        <Badge variant="secondary" className="text-[9.5px] uppercase tracking-wide bg-primary/5 text-primary border border-primary/10 font-bold px-2 py-0.2 rounded-full">
                          {categoryLabel[ticket.category]}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground font-mono text-xs">—</span>
                      )}
                    </TableCell>

                    {/* Dynamic Priority */}
                    <TableCell>
                      <PriorityBadge ticketId={ticket.id} />
                    </TableCell>

                    {/* Status */}
                    <TableCell>
                      <StatusBadge status={ticket.status} />
                    </TableCell>

                    {/* Assignee */}
                    <TableCell className="text-xs font-medium text-foreground truncate max-w-[120px]">
                      {ticket.assignedTo ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center text-[9px] font-bold">
                            {ticket.assignedTo.name[0]}
                          </div>
                          <span className="truncate">{ticket.assignedTo.name}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground italic text-[11px]">Unassigned</span>
                      )}
                    </TableCell>

                    {/* Created */}
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        {!isLoading && tickets.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-muted-foreground bg-card/50 backdrop-blur-xs z-10">
            <AlertCircle className="h-8 w-8 mb-2 opacity-30 text-primary animate-pulse" />
            <p className="text-xs font-bold">No tickets</p>
            <p className="text-[11px] mt-0.5">Adjust filter presets or refine search query.</p>
          </div>
        )}
      </div>

      {/* Pagination Footer */}
      {!isLoading && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-4 text-xs text-muted-foreground">
          <div>
            Showing {pageStart}–{pageEnd} of {total} tickets
          </div>
          <div className="flex items-center gap-4">
            <span>
              Page {pageIndex + 1} of {pageCount || 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg cursor-pointer"
                onClick={() => setPageIndex(0)}
                disabled={pageIndex === 0}
                aria-label="First page"
              >
                <span className="sr-only">First page</span>
                &lt;&lt;
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg cursor-pointer"
                onClick={() => setPageIndex((p) => Math.max(0, p - 1))}
                disabled={pageIndex === 0}
                aria-label="Previous page"
              >
                <span className="sr-only">Previous page</span>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg cursor-pointer"
                onClick={() => setPageIndex((p) => Math.min(pageCount - 1, p + 1))}
                disabled={pageIndex >= pageCount - 1}
                aria-label="Next page"
              >
                <span className="sr-only">Next page</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-lg cursor-pointer"
                onClick={() => setPageIndex(pageCount - 1)}
                disabled={pageIndex >= pageCount - 1}
                aria-label="Last page"
              >
                <span className="sr-only">Last page</span>
                &gt;&gt;
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Bulk Actions Bar */}
      {selectedIds.length > 0 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-surface border border-outline-variant/30 p-2.5 rounded-2xl shadow-2xl flex items-center gap-4 z-50 animate-in slide-in-from-bottom duration-150 glass-panel">
          <span className="text-[13px] font-label-md text-on-surface pl-1.5">
            {selectedIds.length} selected
          </span>
          <div className="h-4 w-px bg-outline-variant/30" />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => bulkUpdateMutation.mutate({ assignedToId: session?.user?.id })}
              disabled={bulkUpdateMutation.isPending}
              className="h-7 text-[11px] bg-primary/10 border border-primary/20 text-primary hover:bg-primary/20 cursor-pointer px-2.5 font-bold"
            >
              Assign to Me
            </Button>
            <Button
              size="sm"
              onClick={() => bulkUpdateMutation.mutate({ status: "resolved" })}
              disabled={bulkUpdateMutation.isPending}
              className="h-7 text-[11px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-550 hover:bg-emerald-500/20 cursor-pointer px-2.5 font-bold"
            >
              Resolve
            </Button>
            <Button
              size="sm"
              onClick={() => setSelectedIds([])}
              variant="ghost"
              className="h-7 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer px-2"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

    </div>
  );
}
