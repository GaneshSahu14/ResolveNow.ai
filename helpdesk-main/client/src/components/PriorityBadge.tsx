import { AlertCircle, ArrowDown, ArrowUp, Minus } from "lucide-react";

export type TicketPriority = "low" | "medium" | "high" | "critical";

const priorityStyles: Record<TicketPriority, { container: string; dot: string; label: string; icon: React.ComponentType<any> }> = {
  low: {
    container: "bg-slate-150/60 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800",
    dot: "bg-slate-400 dark:bg-slate-600",
    label: "Low",
    icon: ArrowDown
  },
  medium: {
    container: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-950/40",
    dot: "bg-blue-500",
    label: "Medium",
    icon: Minus
  },
  high: {
    container: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-950/40",
    dot: "bg-amber-500",
    label: "High",
    icon: ArrowUp
  },
  critical: {
    container: "bg-rose-550/10 text-rose-600 border-rose-200/50 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-950/40",
    dot: "bg-rose-600",
    label: "Critical",
    icon: AlertCircle
  }
};

export function getTicketPriority(id: number): TicketPriority {
  const priorities: TicketPriority[] = ["low", "medium", "high", "critical"];
  return priorities[id % 4];
}

interface PriorityBadgeProps {
  priority?: TicketPriority;
  ticketId?: number;
}

export default function PriorityBadge({ priority, ticketId }: PriorityBadgeProps) {
  const resolvedPriority = priority || (ticketId !== undefined ? getTicketPriority(ticketId) : "low");
  const style = priorityStyles[resolvedPriority];
  const Icon = style.icon;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-semibold border ${style.container}`}
    >
      <Icon className="h-3 w-3 shrink-0" />
      <span>{style.label}</span>
    </span>
  );
}
