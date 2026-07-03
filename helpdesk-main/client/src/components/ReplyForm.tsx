import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type Ticket } from "core/constants/ticket.ts";
import { createReplySchema, type CreateReplyInput } from "core/schemas/replies.ts";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import ErrorAlert from "@/components/ErrorAlert";
import ErrorMessage from "@/components/ErrorMessage";
import { Loader2, Sparkles, ShieldAlert } from "lucide-react";

interface ReplyFormProps {
  ticket: Ticket;
}

export default function ReplyForm({ ticket }: ReplyFormProps) {
  const ticketId = ticket.id;
  const queryClient = useQueryClient();
  
  // States for AI and Internal Notes
  const [shouldFetchSuggestion, setShouldFetchSuggestion] = useState(false);
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isInternalNote, setIsInternalNote] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateReplyInput>({
    resolver: zodResolver(createReplySchema),
    defaultValues: {
      body: "",
    },
  });

  const bodyValue = watch("body");

  // Fetch AI suggested reply
  const { data: suggestionData, isFetching: suggestionLoading, refetch: fetchSuggestion } = useQuery({
    queryKey: ["suggested-reply", ticketId],
    queryFn: async () => {
      const { data } = await axios.post<{ suggestion: string }>(
        `/api/tickets/${ticketId}/replies/suggest`
      );
      return data;
    },
    enabled: shouldFetchSuggestion,
    retry: false,
    refetchOnWindowFocus: false,
  });

  const handleSuggestClick = () => {
    setShouldFetchSuggestion(true);
    setShowSuggestion(true);
    if (shouldFetchSuggestion) {
      fetchSuggestion();
    }
  };

  // Submit reply mutation
  const replyMutation = useMutation({
    mutationFn: async (data: CreateReplyInput) => {
      // Prepend /note code if internal note mode is active
      const finalPayload = {
        body: isInternalNote ? `/note ${data.body}` : data.body,
      };

      const { data: reply } = await axios.post(
        `/api/tickets/${ticketId}/replies`,
        finalPayload
      );
      return reply;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["replies", ticketId] });
      reset();
      setShowSuggestion(false);
      setShouldFetchSuggestion(false);
    },
  });

  // Polish draft response mutation
  const polishMutation = useMutation({
    mutationFn: async () => {
      const { data } = await axios.post(`/api/tickets/${ticketId}/replies/polish`, {
        body: getValues("body"),
      });
      return data.body as string;
    },
    onSuccess: (polishedText) => {
      setValue("body", polishedText, { shouldValidate: true });
    },
  });

  return (
    <div className="space-y-4">
      {/* AI Suggested Reply Drawer */}
      {showSuggestion && suggestionLoading && (
        <div className="border border-primary/10 bg-primary/5 p-4 rounded-xl flex items-center gap-2.5 animate-pulse shadow-sm">
          <Loader2 className="h-4 w-4 text-primary animate-spin" />
          <span className="text-xs text-muted-foreground font-mono">
            Compiling smart draft from knowledge base...
          </span>
        </div>
      )}

      {showSuggestion && !suggestionLoading && suggestionData?.suggestion && (
        <div className="border border-primary/20 bg-primary/5 p-4 rounded-xl space-y-3 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 bottom-0 left-0 w-1 bg-primary" />
          
          <div className="flex items-center justify-between pl-1.5">
            <span className="font-mono text-[10px] font-bold text-primary tracking-widest uppercase flex items-center gap-1">
              ✦ AI Suggested Reply
            </span>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 text-[11px] font-semibold border-primary/20 text-primary hover:bg-primary/10 rounded-lg cursor-pointer"
                onClick={() => {
                  setValue("body", suggestionData.suggestion, { shouldValidate: true });
                  setShowSuggestion(false);
                }}
              >
                Insert draft
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 text-[11px] text-muted-foreground hover:text-foreground rounded-lg cursor-pointer"
                onClick={() => setShowSuggestion(false)}
              >
                Dismiss
              </Button>
            </div>
          </div>
          <div className="pl-1.5">
            <Textarea
              readOnly
              value={suggestionData.suggestion}
              className="bg-card border-border text-xs sm:text-sm leading-relaxed resize-none rounded-xl"
              rows={4}
            />
          </div>
        </div>
      )}

      {/* Reply Form */}
      <form onSubmit={handleSubmit((data) => replyMutation.mutate(data))} className="space-y-3">
        {replyMutation.error && (
          <ErrorAlert error={replyMutation.error} fallback="Failed to send reply" />
        )}
        {polishMutation.error && (
          <ErrorAlert error={polishMutation.error} fallback="Failed to polish reply" />
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsInternalNote(false)}
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md cursor-pointer transition-colors ${
                  !isInternalNote ? "bg-primary/15 text-primary" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Customer Reply
              </button>
              <button
                type="button"
                onClick={() => setIsInternalNote(true)}
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md cursor-pointer transition-colors flex items-center gap-1 ${
                  isInternalNote ? "bg-amber-500/10 text-amber-600" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ShieldAlert className="h-3 w-3" />
                Internal Note
              </button>
            </div>
            
            {!isInternalNote && (
              <button
                type="button"
                onClick={handleSuggestClick}
                disabled={suggestionLoading || replyMutation.isPending || polishMutation.isPending}
                className="inline-flex items-center gap-1 text-[11.5px] font-bold text-primary hover:text-primary/80 transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="h-3 w-3" />
                ✦ Suggest Reply
              </button>
            )}
          </div>

          <Textarea
            placeholder={isInternalNote ? "Type a private note for your team..." : "Type your reply..."}
            {...register("body")}
            rows={4}
            className={`bg-card text-foreground rounded-xl transition-all ${
              isInternalNote
                ? "border-amber-500/30 focus-visible:ring-amber-500/20 focus-visible:border-amber-500/50"
                : "border-border focus-visible:ring-primary/20 focus-visible:border-primary/50"
            }`}
          />
          {errors.body && <ErrorMessage message={errors.body.message} />}
        </div>

        <div className="flex gap-2">
          {!isInternalNote && (
            <Button
              type="button"
              variant="outline"
              disabled={!bodyValue?.trim() || polishMutation.isPending || replyMutation.isPending}
              onClick={() => polishMutation.mutate()}
              className="border-border hover:bg-muted text-xs font-semibold rounded-xl h-9"
            >
              {polishMutation.isPending ? "Polishing..." : "Polish"}
            </Button>
          )}

          <Button
            type="submit"
            disabled={!bodyValue?.trim() || replyMutation.isPending || polishMutation.isPending}
            className={`text-xs font-bold rounded-xl h-9 px-4 shadow-sm transition-all cursor-pointer ${
              isInternalNote
                ? "bg-amber-500 hover:bg-amber-450 text-white shadow-amber-500/10 hover:scale-[1.01] active:scale-[0.99]"
                : "bg-primary hover:bg-primary/95 text-white shadow-primary/10 hover:scale-[1.01] active:scale-[0.99]"
            }`}
          >
            {replyMutation.isPending ? "Sending..." : isInternalNote ? "Add Note" : "Send Reply"}
          </Button>
        </div>
      </form>
    </div>
  );
}
