import DOMPurify from "dompurify";
import { type Ticket } from "core/constants/ticket.ts";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { Badge } from "@/components/ui/badge";
import { categoryLabel } from "core/constants/ticket-category.ts";

interface TicketDetailProps {
  ticket: Ticket;
}

export default function TicketDetail({ ticket }: TicketDetailProps) {
  const init = ticket.senderName[0].toUpperCase();

  return (
    <div className="space-y-4">
      {/* Subject and tags header */}
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold font-mono text-muted-foreground uppercase">
            Ticket #{ticket.id}
          </span>
          <PriorityBadge ticketId={ticket.id} />
          <StatusBadge status={ticket.status} />
          {ticket.category && (
            <Badge variant="outline" className="text-[9.5px] uppercase tracking-wide bg-primary/5 text-primary border-primary/10 rounded-full font-bold px-2 py-0.2">
              {categoryLabel[ticket.category]}
            </Badge>
          )}
        </div>
        
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground leading-tight">
          {ticket.subject}
        </h1>
      </div>

      {/* Sender details and Date */}
      <div className="p-4 bg-card border border-border rounded-2xl flex items-start gap-3.5 shadow-sm">
        <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center font-bold text-xs shrink-0">
          {init}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
            <h3 className="text-xs font-bold text-foreground">
              {ticket.senderName} ({ticket.senderEmail})
            </h3>
            <div className="text-[10px] text-muted-foreground font-mono flex flex-col sm:items-end gap-0.5">
              <span>Created: {new Date(ticket.createdAt).toLocaleString()}</span>
              <span>Updated: {new Date(ticket.updatedAt).toLocaleString()}</span>
            </div>
          </div>
          
          <div className="mt-4 text-xs sm:text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap border-t border-border/50 pt-3">
            {ticket.bodyHtml ? (
              <div
                className="prose dark:prose-invert max-w-none text-[13px] sm:text-sm"
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(ticket.bodyHtml),
                }}
              />
            ) : (
              ticket.body
            )}
          </div>

          {ticket.attachments && ticket.attachments.length > 0 && (
            <div className="mt-4 pt-3 border-t border-border/50">
              <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Attachments</p>
              <div className="flex flex-wrap gap-2">
                {ticket.attachments.map((url, idx) => {
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
    </div>
  );
}
