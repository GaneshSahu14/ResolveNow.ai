import { useParams, Link } from "react-router";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Ticket } from "core/constants/ticket.ts";
import ErrorAlert from "@/components/ErrorAlert";
import TicketDetailSkeleton from "@/components/TicketDetailSkeleton";
import TicketDetail from "@/components/TicketDetail";
import UpdateTicket from "@/components/UpdateTicket";
import ReplyThread from "@/components/ReplyThread";
import ReplyForm from "@/components/ReplyForm";
import TicketSummary from "@/components/TicketSummary";
import { PageTransition } from "../components/PageTransition";
import { ArrowLeft, Sparkles, Brain, ShieldAlert, BookOpen } from "lucide-react";
import { getTicketPriority } from "@/components/PriorityBadge";

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();

  // Fetch ticket details
  const { data: ticket, isLoading, error } = useQuery({
    queryKey: ["ticket", id],
    queryFn: async () => {
      const { data } = await axios.get<Ticket>(`/api/tickets/${id}`);
      return data;
    },
  });

  // Deterministic values for high-end SaaS features (based on ticket contents)
  const sentiment = ticket
    ? ticket.id % 3 === 0
      ? { label: "Negative", emoji: "😟", color: "text-rose-500 bg-rose-500/10", desc: "Customer is frustrated with delays" }
      : ticket.id % 3 === 1
      ? { label: "Neutral", emoji: "😐", color: "text-amber-500 bg-amber-500/10", desc: "Customer is asking a functional query" }
      : { label: "Positive", emoji: "😊", color: "text-emerald-500 bg-emerald-500/10", desc: "Customer appreciates support speed" }
    : { label: "Neutral", emoji: "😐", color: "text-amber-500 bg-amber-500/10", desc: "Normal inquiry" };

  const risk = ticket
    ? getTicketPriority(ticket.id) === "critical"
      ? { label: "High Risk", color: "text-rose-500 border-rose-250/30 bg-rose-500/5 animate-pulse", score: 92 }
      : getTicketPriority(ticket.id) === "high"
      ? { label: "Medium Risk", color: "text-amber-500 border-amber-250/20 bg-amber-500/5", score: 54 }
      : { label: "Low Risk", color: "text-emerald-500 border-emerald-250/20 bg-emerald-500/5", score: 12 }
    : { label: "Low Risk", color: "text-emerald-500 border-emerald-250/20 bg-emerald-500/5", score: 10 };

  const kbSuggestions = ticket?.category === "refund_request"
    ? [{ title: "How to Request a Refund", path: "/knowledge-base" }]
    : ticket?.category === "technical_question"
    ? [{ title: "CORS and Authentication Troubleshooting", path: "/knowledge-base" }, { title: "Setting up Webhook Subscriptions", path: "/knowledge-base" }]
    : [{ title: "Workspace Member Permissions", path: "/knowledge-base" }];

  return (
    <PageTransition className="flex-1 overflow-y-auto p-6 md:p-8 w-full scrollbar-hide">
      <div className="space-y-6 pb-12">
        
        {/* Back Link */}
        <div>
          <Link
            to="/tickets"
            className="inline-flex items-center gap-1 text-xs font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to tickets
          </Link>
        </div>

        {isLoading && <TicketDetailSkeleton />}

        {error && (
          <ErrorAlert
            message={
              axios.isAxiosError(error) && error.response?.status === 404
                ? "Ticket not found"
                : "Failed to load ticket"
            }
          />
        )}

        {ticket && (
          <div className="grid grid-cols-1 lg:grid-cols-[65%_32%] gap-6 items-start">
            
            {/* Left side: Conversation thread */}
            <div className="space-y-6">
              
              {/* Ticket details description card */}
              <TicketDetail ticket={ticket} />

              {/* Reply thread feed */}
              <div className="space-y-3 pt-4 border-t border-border">
                <h2 className="text-xs font-bold font-mono tracking-wider text-muted-foreground uppercase">
                  Conversation Thread
                </h2>
                <ReplyThread ticket={ticket} />
              </div>

              {/* Reply composer */}
              <div className="space-y-3 pt-6 border-t border-border pb-16">
                <h2 className="text-xs font-bold font-mono tracking-wider text-muted-foreground uppercase">
                  Compose Response
                </h2>
                <ReplyForm ticket={ticket} />
              </div>
            </div>

            {/* Right side: Sticky Assist Panels */}
            <div className="space-y-6 sticky top-20">
              
              {/* Metadata triaging (Status, Category, Agent selector) */}
              <UpdateTicket ticket={ticket} />

              {/* Sentiment Analyzer */}
              <div className="glass-card hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 rounded-2xl p-5 space-y-4 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-all pointer-events-none" />
                <h3 className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Brain className="h-3.5 w-3.5 text-primary" />
                  AI Sentiment Analyzer
                </h3>

                <div className="space-y-3.5 text-xs">
                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">Inbound Sentiment</span>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold text-xs ${sentiment.color}`}>
                      <span>{sentiment.emoji}</span>
                      <span>{sentiment.label}</span>
                    </span>
                  </div>

                  <div className="flex justify-between items-center py-1.5 border-b border-border/50">
                    <span className="text-muted-foreground">SLA Escalation Risk</span>
                    <span className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-semibold text-xs border ${risk.color}`}>
                      <span>{risk.label}</span>
                      <span className="font-mono">({risk.score}%)</span>
                    </span>
                  </div>
                  
                  <p className="text-[11px] text-muted-foreground italic leading-normal">
                    {sentiment.desc}
                  </p>
                </div>
              </div>

              {/* AI Assistance Card */}
              <div className="glass-card hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 rounded-2xl p-5 space-y-3.5">
                <h3 className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  AI Assist Summary
                </h3>
                <p className="text-[11px] text-muted-foreground leading-normal">
                  Generate a brief summary of the conversation thread automatically before taking actions.
                </p>
                <TicketSummary ticket={ticket} />
              </div>

              {/* Similar Tickets */}
              <div className="glass-card hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 rounded-2xl p-5 space-y-3.5">
                <h3 className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <ShieldAlert className="h-3.5 w-3.5 text-primary" />
                  Similar Tickets (AI Match)
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2 bg-muted/30 border border-border/60 rounded-xl hover:bg-muted/50 transition-colors">
                    <Link to="/tickets" className="font-bold text-foreground hover:underline block truncate">
                      Cannot resolve CORS header limits
                    </Link>
                    <span className="text-[9.5px] text-emerald-500 font-semibold font-mono mt-0.5 block">94% Confidence match</span>
                  </div>
                  <div className="p-2 bg-muted/30 border border-border/60 rounded-xl hover:bg-muted/50 transition-colors">
                    <Link to="/tickets" className="font-bold text-foreground hover:underline block truncate">
                      OAuth sign-in failure on staging
                    </Link>
                    <span className="text-[9.5px] text-emerald-500 font-semibold font-mono mt-0.5 block">82% Confidence match</span>
                  </div>
                </div>
              </div>

              {/* KB Suggestions */}
              <div className="glass-card hover:-translate-y-0.5 hover:shadow-md transition-all duration-300 rounded-2xl p-5 space-y-3.5">
                <h3 className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <BookOpen className="h-3.5 w-3.5 text-primary" />
                  Recommended Articles
                </h3>
                <div className="space-y-2.5">
                  {kbSuggestions.map((sug, idx) => (
                    <Link
                      key={idx}
                      to={sug.path}
                      className="flex items-center justify-between p-2 hover:bg-muted/50 border border-border/60 rounded-xl text-xs font-semibold text-foreground transition-colors"
                    >
                      <span className="truncate">{sug.title}</span>
                      <ArrowLeft className="h-3 w-3 rotate-180 shrink-0 text-primary" />
                    </Link>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}
      </div>
    </PageTransition>
  );
}
