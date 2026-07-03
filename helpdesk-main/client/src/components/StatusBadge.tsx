import { type TicketStatus, statusLabel } from "core/constants/ticket-status.ts";

const statusStyles: Record<TicketStatus, string> = {
  new: "bg-purple-50 text-purple-700 border-purple-150 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-950/40",
  processing: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-950/40",
  open: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-950/40",
  resolved: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-950/40",
  closed: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-400 dark:border-slate-800",
};

export default function StatusBadge({ status }: { status: TicketStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold font-mono border ${statusStyles[status]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current shrink-0" />
      {statusLabel[status]}
    </span>
  );
}
