import DOMPurify from "dompurify";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { type Ticket } from "core/constants/ticket.ts";
import { type SenderType } from "core/constants/sender-type.ts";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorAlert from "@/components/ErrorAlert";
import { Shield } from "lucide-react";

interface Reply {
  id: number;
  body: string;
  bodyHtml: string | null;
  senderType: SenderType;
  user: { id: string; name: string } | null;
  createdAt: string;
  attachments?: string[];
}

interface ReplyThreadProps {
  ticket: Ticket;
}

export default function ReplyThread({ ticket }: ReplyThreadProps) {
  const { id: ticketId, senderName } = ticket;
  const { data, isLoading, error } = useQuery({
    queryKey: ["replies", ticketId],
    queryFn: async () => {
      const { data } = await axios.get<{ replies: Reply[] }>(
        `/api/tickets/${ticketId}/replies`
      );
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full bg-border/40" />
        <Skeleton className="h-20 w-full bg-border/40" />
      </div>
    );
  }

  if (error) {
    return <ErrorAlert message="Failed to load replies" />;
  }

  const replies = data?.replies ?? [];

  if (replies.length === 0) {
    return (
      <div className="text-center py-6 border border-border border-dashed rounded-2xl text-muted-foreground text-xs">
        No replies yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {replies.map((reply) => {
        const isAgent = reply.senderType === "agent";
        
        // Custom parser for private notes
        const isInternalNote = reply.body.startsWith("/note");
        const displayBody = isInternalNote ? reply.body.replace(/^\/note\s*/, "") : reply.body;
        
        const displayName = isAgent
          ? reply.user?.name ?? "Agent"
          : senderName;

        const senderInit = displayName[0].toUpperCase();

        return (
          <div
            key={reply.id}
            className={`flex gap-3 items-start ${isAgent ? "flex-row-reverse" : ""}`}
          >
            {/* Avatar icon */}
            <div className={`h-8 w-8 rounded-full border flex items-center justify-center font-bold text-xs shrink-0 ${
              isInternalNote
                ? "bg-amber-500/10 border-amber-500/25 text-amber-550"
                : isAgent
                ? "bg-accent/15 border-accent/20 text-accent-foreground"
                : "bg-primary/10 border-primary/20 text-primary"
            }`}>
              {isInternalNote ? (
                <Shield className="h-3.5 w-3.5" />
              ) : (
                senderInit
              )}
            </div>

            {/* Bubble content */}
            <div className={`border p-4 max-w-[85%] sm:max-w-[75%] rounded-2xl shadow-sm space-y-1.5 transition-all ${
              isInternalNote
                ? "bg-amber-500/5 border-amber-500/25 rounded-xl rounded-tr-none text-left w-full"
                : isAgent
                ? "bg-accent/5 border-accent/20 rounded-tr-none text-right"
                : "bg-card border-border rounded-tl-none text-left"
            }`}>
              {/* Header meta */}
              <div className={`flex items-baseline gap-2 text-[10px] ${isAgent ? "flex-row-reverse" : ""}`}>
                <span className="font-bold text-foreground text-xs">{displayName}</span>
                <span className="text-muted-foreground font-mono">
                  {new Date(reply.createdAt).toLocaleString()}
                </span>
                {isInternalNote && (
                  <span className="font-mono text-[9px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.2 rounded-full uppercase shrink-0">
                    Internal Note
                  </span>
                )}
                {!isInternalNote && isAgent && (
                  <span className="font-mono text-[9px] font-bold text-accent-foreground bg-accent/10 px-1.5 py-0.2 rounded-full uppercase shrink-0">
                    Agent
                  </span>
                )}
                {!isInternalNote && !isAgent && (
                  <span className="font-mono text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.2 rounded-full uppercase shrink-0">
                    Customer
                  </span>
                )}
              </div>

              {/* Message text */}
              <div className="text-[13px] leading-relaxed text-foreground whitespace-pre-wrap text-left">
                {reply.bodyHtml ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html: DOMPurify.sanitize(reply.bodyHtml),
                    }}
                  />
                ) : (
                  displayBody
                )}
              </div>

              {/* Attachments */}
              {reply.attachments && reply.attachments.length > 0 && (
                <div className="mt-3 pt-2 border-t border-border/40 text-left">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Attachments</p>
                  <div className="flex flex-wrap gap-2">
                    {reply.attachments.map((url, idx) => {
                      const filename = url.split("/").pop() || `Attachment ${idx + 1}`;
                      return (
                        <a
                          key={url}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-variant/40 border border-outline-variant/35 hover:bg-surface-variant hover:text-primary transition-all text-xs font-mono"
                        >
                          <span className="material-symbols-outlined text-[14px]">attachment</span>
                          <span className="max-w-[150px] truncate">{filename}</span>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

          </div>
        );
      })}
    </div>
  );
}
