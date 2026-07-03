import { type TicketStatus } from "./ticket-status";
import { type TicketCategory } from "./ticket-category";

export interface Ticket {
  id: number;
  subject: string;
  body: string;
  bodyHtml: string | null;
  status: TicketStatus;
  category: TicketCategory | null;
  priority: "low" | "medium" | "high" | "critical" | null;
  aiSummary: string | null;
  aiCategory: TicketCategory | null;
  senderName: string;
  senderEmail: string;
  assignedTo: { id: string; name: string } | null;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}
