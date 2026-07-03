import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Sparkles } from "lucide-react";
import { type Ticket } from "core/constants/ticket.ts";
import { Button } from "@/components/ui/button";
import ErrorAlert from "@/components/ErrorAlert";

interface TicketSummaryProps {
  ticket: Ticket;
}

export default function TicketSummary({ ticket }: TicketSummaryProps) {
  const summarizeMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(
        `/api/tickets/${ticket.id}/replies/summarize`
      );
      return data.summary as string;
    },
  });

  return (
    <div className="space-y-4">
      <Button
        variant="outline"
        onClick={() => summarizeMutation.mutate()}
        disabled={summarizeMutation.isPending}
        className="w-full gap-1.5 border-primary/20 text-primary hover:text-primary/95 hover:bg-primary/5 hover:border-primary/40 transition-all duration-150 h-9 text-xs font-bold rounded-xl cursor-pointer"
      >
        <Sparkles className="h-3.5 w-3.5" />
        {summarizeMutation.isPending ? "Summarizing..." : "Summarize"}
      </Button>

      {summarizeMutation.error && (
        <ErrorAlert
          error={summarizeMutation.error}
          fallback="Failed to generate summary"
        />
      )}

      {summarizeMutation.data && (
        <div className="border border-primary/15 bg-primary/5 rounded-2xl p-4 relative overflow-hidden transition-all duration-200 shadow-sm">
          {/* Subtle accent line */}
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />
          
          <div className="flex items-center gap-1.5 mb-2 pl-2">
            <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase flex items-center gap-1">
              ✦ AI Summary
            </span>
          </div>
          <p className="pl-2 whitespace-pre-wrap text-xs leading-relaxed text-foreground/90">
            {summarizeMutation.data}
          </p>
        </div>
      )}
    </div>
  );
}
