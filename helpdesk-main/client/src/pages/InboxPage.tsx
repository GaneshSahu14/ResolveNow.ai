import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type Ticket } from "core/constants/ticket.ts";
import StatusBadge from "../components/StatusBadge";
import PriorityBadge from "../components/PriorityBadge";
import ErrorAlert from "../components/ErrorAlert";
import { Loader2 } from "lucide-react";
import { Link } from "react-router";
import { PageTransition } from "../components/PageTransition";

interface Reply {
  id: number;
  body: string;
  bodyHtml: string | null;
  senderType: "agent" | "customer";
  user: { id: string; name: string } | null;
  createdAt: string;
}

interface TicketsResponse {
  tickets: Ticket[];
  total: number;
}

export default function InboxPage() {
  const queryClient = useQueryClient();
  const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
  const [replyBody, setReplyBody] = useState("");

  // Get active tickets list
  const { data: ticketsData, isLoading: listLoading, error: listError } = useQuery<TicketsResponse>({
    queryKey: ["inbox-tickets"],
    queryFn: async () => {
      const { data } = await axios.get<TicketsResponse>("/api/tickets", {
        params: { status: "open", pageSize: 15, page: 1, sortBy: "createdAt", sortOrder: "desc" },
      });
      return data;
    },
  });

  const tickets = ticketsData?.tickets ?? [];

  // Get selected ticket details
  const { data: activeTicket, isLoading: ticketLoading } = useQuery<Ticket>({
    queryKey: ["ticket", selectedTicketId],
    queryFn: async () => {
      const { data } = await axios.get<Ticket>(`/api/tickets/${selectedTicketId}`);
      return data;
    },
    enabled: selectedTicketId !== null,
  });

  // Get ticket thread replies
  const { data: repliesData, isLoading: repliesLoading } = useQuery<{ replies: Reply[] }>({
    queryKey: ["replies", selectedTicketId],
    queryFn: async () => {
      const { data } = await axios.get<{ replies: Reply[] }>(`/api/tickets/${selectedTicketId}/replies`);
      return data;
    },
    enabled: selectedTicketId !== null,
  });

  const replies = repliesData?.replies ?? [];

  // Suggest AI reply
  const suggestMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post<{ suggestion: string }>(
        `/api/tickets/${selectedTicketId}/replies/suggest`
      );
      return data.suggestion;
    },
    onSuccess: (suggestion) => {
      setReplyBody(suggestion);
    },
  });

  // Submit reply
  const replyMutation = useMutation({
    mutationFn: async (payload: { body: string }) => {
      const { data } = await axios.post(`/api/tickets/${selectedTicketId}/replies`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replies", selectedTicketId] });
      setReplyBody("");
    },
  });

  // Automatically select first ticket when loaded
  if (tickets.length > 0 && selectedTicketId === null) {
    setSelectedTicketId(tickets[0].id);
  }

  const handleSend = () => {
    if (!replyBody.trim()) return;
    replyMutation.mutate({ body: replyBody });
  };

  if (listError) return <ErrorAlert message="Failed to load inbox items" />;

  return (
    <PageTransition className="flex-1 flex overflow-hidden h-full">
      {/* Message List Column (Left) */}
      <div className="w-full md:w-[380px] lg:w-[420px] flex flex-col border-r border-outline-variant/10 shrink-0 bg-surface-container-lowest/50 backdrop-blur-sm h-full">
        {/* List Header */}
        <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
          <div>
            <h2 className="font-headline-lg text-[20px] text-on-surface">Inbox</h2>
            <p className="font-label-sm text-on-surface-variant mt-1">{tickets.length} open tickets</p>
          </div>
          <div className="flex gap-2">
            <button className="p-2 rounded-md hover:bg-surface-variant/30 text-on-surface-variant transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
            <button className="p-2 rounded-md hover:bg-surface-variant/30 text-on-surface-variant transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">sort</span>
            </button>
          </div>
        </div>

        {/* List Items */}
        <div className="flex-1 overflow-y-auto">
          {listLoading ? (
            <div className="flex flex-col items-center justify-center h-full gap-2 text-on-surface-variant p-8">
              <span className="material-symbols-outlined animate-spin text-[24px] text-primary">refresh</span>
              <span className="font-body-sm text-[12px]">Loading queue...</span>
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6 text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] mb-2 opacity-40 text-primary">inbox</span>
              <p className="font-label-md font-bold">Inbox empty</p>
              <p className="font-body-sm text-[11px] mt-1">No open tickets assigned to this team.</p>
            </div>
          ) : (
            tickets.map((ticket) => {
              const isSelected = ticket.id === selectedTicketId;
              return (
                <div
                  key={ticket.id}
                  onClick={() => setSelectedTicketId(ticket.id)}
                  className={`p-4 border-b border-outline-variant/10 cursor-pointer transition-colors ${
                    isSelected
                      ? "bg-primary/5 border-l-2 border-l-primary hover:bg-primary/10"
                      : "hover:bg-surface-variant/20 border-l-2 border-transparent"
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      {isSelected && <span className="w-2 h-2 rounded-full bg-tertiary"></span>}
                      <span className="font-label-md font-bold text-on-surface truncate max-w-[120px]">
                        {ticket.senderName}
                      </span>
                    </div>
                    <span className="font-label-sm text-outline">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h3 className="font-body-md text-on-surface font-medium truncate mb-1">
                    {ticket.subject}
                  </h3>
                  <p className="font-body-md text-[13px] text-on-surface-variant line-clamp-2 leading-relaxed">
                    {ticket.body}
                  </p>
                  <div className="flex items-center gap-2 mt-3">
                    <PriorityBadge ticketId={ticket.id} />
                    <StatusBadge status={ticket.status} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Conversation Thread (Center) */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface/40 h-full">
        {selectedTicketId === null ? (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-8 text-center">
            <span className="material-symbols-outlined text-[48px] mb-3 opacity-30 text-primary">chat</span>
            <h3 className="font-label-md font-bold text-on-surface">No ticket selected</h3>
            <p className="font-body-sm text-[12px] mt-1">Select an item from the unresolved queue to start responding.</p>
          </div>
        ) : ticketLoading || !activeTicket ? (
          <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant p-8">
            <span className="material-symbols-outlined animate-spin text-[24px] text-primary mb-2">refresh</span>
            <span className="font-body-sm text-[12px]">Loading details...</span>
          </div>
        ) : (
          <>
            {/* Thread Header */}
            <div className="p-6 border-b border-outline-variant/10 glass-panel sticky top-0 z-10 flex justify-between items-start shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="font-headline-lg text-[24px] text-on-surface truncate max-w-lg" title={activeTicket.subject}>
                    {activeTicket.subject}
                  </h2>
                  <StatusBadge status={activeTicket.status} />
                </div>
                <div className="flex items-center gap-4 font-label-sm text-on-surface-variant">
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">person</span>
                    {activeTicket.senderName} ({activeTicket.senderEmail})
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">tag</span>
                    TKT-{activeTicket.id}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Link
                  to={`/tickets/${activeTicket.id}`}
                  className="px-4 py-2 rounded-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary transition-all font-label-md flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                  Details
                </Link>
                <button className="px-4 py-2 rounded-md border border-outline-variant/30 text-on-surface-variant hover:bg-surface-variant/30 hover:text-primary transition-all font-label-md flex items-center gap-2 cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">more_horiz</span>
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Customer Message */}
              <div className="flex gap-4 max-w-3xl">
                <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary shrink-0">
                  {activeTicket.senderName[0].toUpperCase()}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="font-label-md text-on-surface font-bold">{activeTicket.senderName}</span>
                    <span className="font-label-sm text-outline">
                      {new Date(activeTicket.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="glass-card p-4 rounded-2xl rounded-tl-sm text-on-surface/90 font-body-md leading-relaxed border border-outline-variant/20 shadow-sm whitespace-pre-wrap">
                    {activeTicket.body}
                  </div>
                </div>
              </div>

              {/* Replies */}
              {repliesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              ) : (
                replies.map((reply) => {
                  const isAgent = reply.senderType === "agent";
                  const senderName = isAgent ? (reply.user?.name ?? "Agent") : activeTicket.senderName;
                  const senderInit = senderName[0].toUpperCase();

                  return (
                    <div key={reply.id} className={`flex gap-4 max-w-3xl ${isAgent ? "ml-auto flex-row-reverse" : ""}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs border shrink-0 ${
                        isAgent ? "bg-secondary/10 border-secondary/20 text-secondary" : "bg-primary/10 border-primary/20 text-primary"
                      }`}>
                        {senderInit}
                      </div>
                      <div className={`flex-1 space-y-1 flex flex-col ${isAgent ? "items-end" : "items-start"}`}>
                        <div className={`flex items-baseline gap-2 ${isAgent ? "flex-row-reverse" : ""}`}>
                          <span className="font-label-md text-on-surface font-bold">{senderName}</span>
                          <span className="font-label-sm text-outline">
                            {new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className={`p-4 rounded-2xl font-body-md leading-relaxed shadow-sm border whitespace-pre-wrap ${
                          isAgent 
                            ? "bg-secondary/5 border-secondary/20 rounded-tr-sm text-on-surface text-right" 
                            : "glass-card border-outline-variant/20 rounded-tl-sm text-on-surface/90 text-left"
                        }`}>
                          {reply.body}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Reply Composer */}
            <div className="p-4 border-t border-outline-variant/10 bg-surface-container-low shrink-0">
              <div className="glass-card rounded-xl border border-outline-variant/30 focus-within:border-primary/50 transition-colors p-3 relative">
                <textarea
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  className="w-full bg-transparent border-none focus:ring-0 text-on-surface font-body-md placeholder:text-outline resize-none min-h-[80px]"
                  placeholder="Type your reply..."
                />
                <div className="flex justify-between items-center mt-2 pt-2 border-t border-outline-variant/10">
                  <div className="flex gap-1">
                    <button className="p-2 rounded hover:bg-surface-variant/50 text-outline hover:text-on-surface transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">format_bold</span>
                    </button>
                    <button className="p-2 rounded hover:bg-surface-variant/50 text-outline hover:text-on-surface transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">link</span>
                    </button>
                    <button className="p-2 rounded hover:bg-surface-variant/50 text-outline hover:text-on-surface transition-colors cursor-pointer">
                      <span className="material-symbols-outlined text-[20px]">attach_file</span>
                    </button>
                    <div className="w-px h-6 bg-outline-variant/30 mx-1 self-center"></div>
                    <button
                      onClick={() => suggestMutation.mutate()}
                      disabled={suggestMutation.isPending || replyMutation.isPending}
                      className="p-2 rounded hover:bg-secondary/20 text-secondary transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                    >
                      <span className={`material-symbols-outlined text-[20px] ${suggestMutation.isPending ? 'animate-pulse' : ''}`}>
                        auto_awesome
                      </span>
                      <span className="font-label-sm text-[11px] font-medium uppercase tracking-wider">AI Draft</span>
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleSend}
                      disabled={!replyBody.trim() || replyMutation.isPending}
                      className="px-6 py-2 rounded-lg bg-primary text-on-primary font-label-md font-bold hover:bg-primary-fixed transition-all shadow-[0_0_15px_rgba(184,195,255,0.2)] disabled:opacity-50 disabled:shadow-none cursor-pointer"
                    >
                      {replyMutation.isPending ? "Sending..." : "Send Reply"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* AI Assist Panel (Right) */}
      {selectedTicketId !== null && activeTicket && (
        <div className="hidden xl:flex w-[340px] flex-col border-l border-outline-variant/10 bg-surface-container-lowest/80 backdrop-blur-md shrink-0 h-full">
          <div className="p-5 border-b border-outline-variant/10 flex items-center gap-2 text-secondary shrink-0">
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
            <h3 className="font-label-md uppercase tracking-widest text-[12px]">Copilot Assist</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-5 space-y-6">
            {/* Sentiment Card */}
            <div className="glass-card rounded-xl p-4 border border-outline-variant/20">
              <h4 className="font-label-sm text-outline uppercase tracking-wider mb-3">Sentiment Analysis</h4>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-error/10 border border-error/20 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined">sentiment_dissatisfied</span>
                </div>
                <div>
                  <div className="font-body-md text-on-surface font-medium">Frustrated</div>
                  <div className="font-label-sm text-[11px] text-outline mt-0.5">High risk of escalation</div>
                </div>
              </div>
            </div>

            {/* Suggested Action Card */}
            <div className="glass-card rounded-xl border border-secondary/20 relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent pointer-events-none"></div>
              <div className="p-4 relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-label-sm text-secondary uppercase tracking-wider flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">bolt</span> Suggested Action
                  </h4>
                </div>
                <div className="font-body-md text-on-surface/80 text-[13px] leading-relaxed mb-4">
                  Consider escalating this ticket to the Senior Support tier, as the customer has expressed urgency multiple times.
                </div>
                <button className="w-full py-2 rounded-lg border border-secondary/30 text-secondary font-label-md hover:bg-secondary/10 transition-all flex justify-center items-center gap-2 cursor-pointer">
                  <span className="material-symbols-outlined text-[18px]">keyboard_double_arrow_up</span>
                  Escalate Ticket
                </button>
              </div>
            </div>

            {/* Related Docs */}
            <div className="glass-card rounded-xl p-4 border border-outline-variant/20">
              <h4 className="font-label-sm text-outline uppercase tracking-wider mb-3">Relevant Docs</h4>
              <div className="space-y-3">
                <a className="flex gap-3 group cursor-pointer" href="#">
                  <span className="material-symbols-outlined text-outline group-hover:text-primary transition-colors text-[20px] shrink-0">article</span>
                  <div>
                    <div className="font-body-md text-[13px] text-on-surface group-hover:text-primary transition-colors leading-tight mb-1">Standard Operating Procedure</div>
                    <div className="font-label-sm text-[10px] text-outline">Knowledge Base</div>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
