import { useState } from "react";
import { Link } from "react-router";
import { type TicketStatus, agentTicketStatuses, statusLabel } from "core/constants/ticket-status.ts";
import { type TicketCategory } from "core/constants/ticket-category.ts";
import { type Ticket } from "core/constants/ticket.ts";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TicketsTable from "./TicketsTable";
import CreateTicketForm from "./CreateTicketForm";
import { PageTransition } from "../components/PageTransition";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import { useSession } from "../lib/auth-client";
import { motion, AnimatePresence } from "framer-motion";

export interface TicketFilters {
  status?: TicketStatus;
  category?: TicketCategory;
  search?: string;
  priority?: "low" | "medium" | "high" | "critical";
}

export default function TicketsPage() {
  const queryClient = useQueryClient();
  const { data: session } = useSession();
  const [filters, setFilters] = useState<TicketFilters>({});
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);

  // Fetch selected ticket details for the preview panel
  const { data: previewTicket, isLoading: previewLoading } = useQuery<Ticket>({
    queryKey: ["ticket", selectedTicketId],
    queryFn: async () => {
      const { data } = await axios.get<Ticket>(`/api/tickets/${selectedTicketId}`);
      return data;
    },
    enabled: selectedTicketId !== null,
  });

  // AI Summary generation for the preview panel
  const generatePreviewSummary = async () => {
    if (!selectedTicketId) return;
    setAiLoading(true);
    setAiSummary(null);
    try {
      const { data } = await axios.post(`/api/tickets/${selectedTicketId}/replies/summarize`);
      setAiSummary(data.summary);
      queryClient.invalidateQueries({ queryKey: ["ticket", selectedTicketId] });
    } catch (err) {
      console.error(err);
      setAiSummary("Failed to generate AI summary.");
    } finally {
      setAiLoading(false);
    }
  };

  // Quick action update (Status / Assignee)
  const updateMutation = useMutation({
    mutationFn: async (payload: { status?: TicketStatus; assignedToId?: string | null }) => {
      await axios.patch(`/api/tickets/${selectedTicketId}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", selectedTicketId] });
      setAiSummary(null);
    },
  });

  return (
    <PageTransition className="h-full flex flex-col">
      <h1 className="sr-only">Tickets</h1>
      <div className="flex-1 flex overflow-hidden w-full h-full">

        
        {/* Left Column: Filter Sidebar */}
        <div className="w-64 border-r border-outline-variant/10 bg-background/30 flex flex-col hidden lg:flex shrink-0">
          <div className="p-4 border-b border-outline-variant/10 flex items-center justify-between">
            <span className="font-label-md text-on-surface">Views</span>
            <button className="material-symbols-outlined text-on-surface-variant text-[18px] hover:text-primary transition-colors cursor-pointer">add</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-6">
            {/* Status Filter */}
            <div>
              <div className="px-2 pb-2">
                <span className="font-label-sm text-outline uppercase tracking-wider text-[10px]">Status</span>
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => setFilters({ ...filters, status: undefined })}
                  className={`w-full text-left px-3 py-2 rounded-lg font-body-sm text-[13px] transition-colors cursor-pointer ${
                    filters.status === undefined
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                  }`}
                >
                  All Tickets
                </button>
                {agentTicketStatuses.map((s) => (
                  <button
                    key={s}
                    onClick={() => setFilters({ ...filters, status: s })}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-body-sm text-[13px] transition-colors cursor-pointer capitalize ${
                      filters.status === s
                        ? "bg-primary/10 text-primary font-bold"
                        : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                    }`}
                  >
                    <span>{statusLabel[s]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <div className="px-2 pb-2">
                <span className="font-label-sm text-outline uppercase tracking-wider text-[10px]">Category</span>
              </div>
              <div className="space-y-0.5">
                <button
                  onClick={() => setFilters({ ...filters, category: undefined })}
                  className={`w-full text-left px-3 py-2 rounded-lg font-body-sm text-[13px] transition-colors cursor-pointer ${
                    filters.category === undefined
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                  }`}
                >
                  All Categories
                </button>
                <button
                  onClick={() => setFilters({ ...filters, category: "general_question" })}
                  className={`w-full text-left px-3 py-2 rounded-lg font-body-sm text-[13px] transition-colors cursor-pointer ${
                    filters.category === "general_question"
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                  }`}
                >
                  General Qs
                </button>
                <button
                  onClick={() => setFilters({ ...filters, category: "technical_question" })}
                  className={`w-full text-left px-3 py-2 rounded-lg font-body-sm text-[13px] transition-colors cursor-pointer ${
                    filters.category === "technical_question"
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                  }`}
                >
                  Technical Qs
                </button>
                <button
                  onClick={() => setFilters({ ...filters, category: "refund_request" })}
                  className={`w-full text-left px-3 py-2 rounded-lg font-body-sm text-[13px] transition-colors cursor-pointer ${
                    filters.category === "refund_request"
                      ? "bg-primary/10 text-primary font-bold"
                      : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                  }`}
                >
                  Refunds
                </button>
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <div className="px-2 pb-2">
                <span className="font-label-sm text-outline uppercase tracking-wider text-[10px]">Priority</span>
              </div>
              <div className="space-y-0.5">
                {["all", "low", "medium", "high", "critical"].map((p) => {
                  const isActive = p === "all" ? filters.priority === undefined : filters.priority === p;
                  return (
                    <button
                      key={p}
                      onClick={() => setFilters({ ...filters, priority: p === "all" ? undefined : (p as any) })}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-lg font-body-sm text-[13px] transition-colors cursor-pointer capitalize ${
                        isActive
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-on-surface-variant hover:bg-surface-variant/50 hover:text-on-surface"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {p === "critical" && <span className="w-2 h-2 rounded-full bg-error"></span>}
                        {p === "high" && <span className="w-2 h-2 rounded-full bg-tertiary"></span>}
                        {p === "medium" && <span className="w-2 h-2 rounded-full bg-primary"></span>}
                        {p === "low" && <span className="w-2 h-2 rounded-full bg-outline"></span>}
                        <span>{p}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Center Column: Interactive Ticket Table */}
        <div className="flex-1 flex flex-col bg-background/50 relative overflow-hidden h-full w-full">
          {/* Action Bar */}
          <div className="h-14 border-b border-outline-variant/10 px-4 flex items-center justify-between bg-surface-container-lowest/50 shrink-0">
            <div className="flex items-center gap-2">
              <button className="px-3 py-1.5 rounded bg-surface-variant/50 border border-outline-variant/30 text-on-surface text-[12px] hover:border-primary/50 transition-colors flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[14px]">filter_list</span>
                Add Filter
              </button>
              <button className="px-3 py-1.5 rounded bg-surface-variant/50 border border-outline-variant/30 text-on-surface text-[12px] hover:border-primary/50 transition-colors flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[14px]">sort</span>
                Sort
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">refresh</span>
              </button>
              <button className="w-8 h-8 rounded hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">more_horiz</span>
              </button>
            </div>
          </div>

          {/* Table Area */}
          <div className="flex-1 overflow-auto p-4 w-full relative">
             <TicketsTable
              filters={filters}
              selectedTicketId={selectedTicketId}
              onSelectTicket={(id) => {
                setSelectedTicketId(id);
                setAiSummary(null);
              }}
            />
          </div>
        </div>

        {/* Right Column: AI Insights / Preview Panel */}
        <AnimatePresence>
          {selectedTicketId && (
            <motion.div
              key="ticket-preview-panel"
              initial={{ x: "100%", opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="w-80 border-l border-outline-variant/10 bg-background/40 flex flex-col relative z-10 glass-panel shrink-0 overflow-y-auto"
            >
              {/* Header */}
              <div className="h-14 border-b border-outline-variant/10 px-4 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-[18px]">auto_awesome</span>
                  <span className="font-label-md text-on-surface">Preview #{selectedTicketId}</span>
                </div>
                <button
                  onClick={() => setSelectedTicketId(null)}
                  className="w-8 h-8 rounded-full hover:bg-surface-variant flex items-center justify-center text-on-surface-variant transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>

              {/* Content */}
              {previewLoading || !previewTicket ? (
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-on-surface-variant">
                  <span className="material-symbols-outlined animate-spin text-[24px] text-primary mb-2">refresh</span>
                  <span className="text-[12px] font-body-sm">Loading preview...</span>
                </div>
              ) : (
                <div className="flex-1 p-4 overflow-y-auto space-y-6">
                  
                  {/* Badges */}
                  <div className="flex flex-wrap gap-2">
                    <PriorityBadge ticketId={previewTicket.id} />
                    <StatusBadge status={previewTicket.status} />
                  </div>

                  {/* Title & Info */}
                  <div>
                    <h3 className="font-headline-lg-mobile text-[18px] text-on-surface mb-2">{previewTicket.subject}</h3>
                    <p className="font-body-sm text-[12px] text-on-surface-variant mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">mail</span>
                      {previewTicket.senderName} &lt;{previewTicket.senderEmail}&gt;
                    </p>
                  </div>

                  {/* Body Preview */}
                  <div className="glass-card rounded-xl p-4 relative overflow-hidden border border-outline-variant/20 shadow-lg">
                    <p className="font-label-sm text-[10px] text-outline uppercase tracking-wider mb-2">Message Body</p>
                    <p className="font-body-sm text-on-surface text-[13px] leading-relaxed max-h-40 overflow-y-auto whitespace-pre-wrap">
                      {previewTicket.body}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col gap-2">
                    <p className="font-label-sm text-[10px] text-outline uppercase tracking-wider mb-1">Quick Actions</p>
                    
                    {previewTicket.assignedTo?.id !== session?.user?.id && (
                      <button
                        onClick={() => updateMutation.mutate({ assignedToId: session?.user?.id })}
                        disabled={updateMutation.isPending}
                        className="w-full bg-surface-variant hover:bg-primary/20 hover:text-primary hover:border-primary/30 border border-outline-variant/30 text-on-surface transition-all rounded-lg py-2 flex items-center justify-center gap-2 font-label-md text-[13px] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">person_add</span>
                        Assign to Me
                      </button>
                    )}

                    {previewTicket.status !== "resolved" && (
                      <button
                        onClick={() => updateMutation.mutate({ status: "resolved" })}
                        disabled={updateMutation.isPending}
                        className="w-full bg-surface-variant hover:bg-error/20 hover:text-error hover:border-error/30 border border-outline-variant/30 text-on-surface transition-all rounded-lg py-2 flex items-center justify-center gap-2 font-label-md text-[13px] cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[16px]">task_alt</span>
                        Mark Resolved
                      </button>
                    )}
                    
                    <Link
                      to={`/tickets/${previewTicket.id}`}
                      className="w-full mt-2 glow-button-primary text-white transition-all rounded-lg py-2 flex items-center justify-center gap-2 font-label-md text-[13px] shadow-[0_0_15px_rgba(46,91,255,0.3)] cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">open_in_new</span>
                      Open Full Details
                    </Link>
                  </div>

                  {/* AI Summary block */}
                  <div className="pt-4 border-t border-outline-variant/10">
                    <div className="flex items-center justify-between mb-3">
                      <p className="font-label-sm text-[10px] text-outline uppercase tracking-wider">AI Insight</p>
                      {!(previewTicket.aiSummary || aiSummary) && (
                        <button
                          onClick={generatePreviewSummary}
                          disabled={aiLoading}
                          className="font-label-md text-[11px] text-primary hover:text-primary-fixed transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                        >
                          <span className="material-symbols-outlined text-[14px]">psychology</span>
                          Summarize
                        </button>
                      )}
                    </div>
                    
                    {aiLoading && (
                      <div className="glass-card rounded-xl p-4 animate-pulse">
                        <div className="h-3 w-3/4 bg-surface-variant rounded mb-2"></div>
                        <div className="h-3 w-1/2 bg-surface-variant rounded"></div>
                      </div>
                    )}

                    {(previewTicket.aiSummary || aiSummary) && (
                      <div className="glass-card rounded-xl p-4 border border-primary/20 relative overflow-hidden bg-primary/5">
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-primary"></div>
                        <p className="font-body-sm text-[13px] text-on-surface leading-relaxed ml-2 font-mono">
                          {previewTicket.aiSummary || aiSummary}
                        </p>
                      </div>
                    )}
                  </div>

                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      {/* Create Ticket Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) setDialogOpen(false); }}>
        <DialogContent className="bg-surface-container border-outline-variant/30 text-on-surface rounded-2xl max-w-lg shadow-2xl glass-card">
          <DialogHeader>
            <DialogTitle className="text-base font-bold text-on-surface font-headline-lg-mobile">Create Support Request</DialogTitle>
          </DialogHeader>
          <CreateTicketForm onSuccess={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </PageTransition>
  );
}
