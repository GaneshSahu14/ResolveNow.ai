import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { type Ticket } from "core/constants/ticket.ts";
import { agentTicketStatuses, statusLabel } from "core/constants/ticket-status.ts";
import { ticketCategories, categoryLabel } from "core/constants/ticket-category.ts";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Agent {
  id: string;
  name: string;
}

interface UpdateTicketProps {
  ticket: Ticket;
}

export default function UpdateTicket({ ticket }: UpdateTicketProps) {
  const queryClient = useQueryClient();

  const { data: agentsData } = useQuery({
    queryKey: ["agents"],
    queryFn: async () => {
      const { data } = await axios.get<{ agents: Agent[] }>("/api/agents");
      return data;
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      const { data } = await axios.patch(`/api/tickets/${ticket.id}`, body);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ticket", String(ticket.id)] });
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
    },
  });

  return (
    <Card className="w-full h-fit bg-card border-border rounded-2xl shadow-sm">
      <CardContent className="p-5 space-y-4">
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground">
            Ticket Status
          </span>
          <Select
            value={ticket.status}
            onValueChange={(value) => updateMutation.mutate({ status: value })}
          >
            <SelectTrigger size="sm" className="w-full text-xs font-semibold rounded-xl bg-muted/40 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              {agentTicketStatuses.map((s) => (
                <SelectItem key={s} value={s} className="text-xs">
                  {statusLabel[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground">
            Category
          </span>
          <Select
            value={ticket.category ?? "none"}
            onValueChange={(value) =>
              updateMutation.mutate({
                category: value === "none" ? null : value,
              })
            }
          >
            <SelectTrigger size="sm" className="w-full text-xs font-semibold rounded-xl bg-muted/40 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="none" className="text-xs">None</SelectItem>
              {ticketCategories.map((c) => (
                <SelectItem key={c} value={c} className="text-xs">
                  {categoryLabel[c]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <span className="text-[10px] font-bold font-mono uppercase tracking-wider text-muted-foreground">
            Assigned Agent
          </span>
          <Select
            value={ticket.assignedTo?.id ?? "unassigned"}
            onValueChange={(value) =>
              updateMutation.mutate({
                assignedToId: value === "unassigned" ? null : value,
              })
            }
          >
            <SelectTrigger size="sm" className="w-full text-xs font-semibold rounded-xl bg-muted/40 border-border">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-card border-border text-foreground">
              <SelectItem value="unassigned" className="text-xs">Unassigned</SelectItem>
              {agentsData?.agents.map((agent) => (
                <SelectItem key={agent.id} value={agent.id} className="text-xs">
                  {agent.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
}
