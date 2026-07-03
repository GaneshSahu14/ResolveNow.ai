import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createTicketSchema,
  type CreateTicketInput,
} from "core/schemas/tickets";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import ErrorAlert from "@/components/ErrorAlert";
import ErrorMessage from "@/components/ErrorMessage";

interface CreateTicketFormProps {
  onSuccess: () => void;
}

export default function CreateTicketForm({ onSuccess }: CreateTicketFormProps) {
  const queryClient = useQueryClient();

  const form = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      senderName: "",
      senderEmail: "",
      subject: "",
      body: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (payload: CreateTicketInput) => {
      const { data } = await axios.post("/api/tickets", payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      form.reset();
      mutation.reset();
      onSuccess();
    },
  });

  return (
    <form
      onSubmit={form.handleSubmit((data) => mutation.mutate(data))}
      className="space-y-4"
      autoComplete="off"
    >
      <div className="space-y-2">
        <Label htmlFor="senderName">Customer Name</Label>
        <Input
          id="senderName"
          placeholder="Full name"
          aria-invalid={!!form.formState.errors.senderName}
          {...form.register("senderName")}
        />
        {form.formState.errors.senderName && (
          <ErrorMessage message={form.formState.errors.senderName.message} />
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="senderEmail">Customer Email</Label>
        <Input
          id="senderEmail"
          type="email"
          placeholder="customer@example.com"
          autoComplete="off"
          aria-invalid={!!form.formState.errors.senderEmail}
          {...form.register("senderEmail")}
        />
        {form.formState.errors.senderEmail && (
          <ErrorMessage message={form.formState.errors.senderEmail.message} />
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="Brief description of the issue"
          aria-invalid={!!form.formState.errors.subject}
          {...form.register("subject")}
        />
        {form.formState.errors.subject && (
          <ErrorMessage message={form.formState.errors.subject.message} />
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="body">Description</Label>
        <Textarea
          id="body"
          placeholder="Describe the customer's issue in detail..."
          rows={5}
          aria-invalid={!!form.formState.errors.body}
          {...form.register("body")}
        />
        {form.formState.errors.body && (
          <ErrorMessage message={form.formState.errors.body.message} />
        )}
      </div>
      {mutation.error && (
        <ErrorAlert
          error={mutation.error}
          fallback="Failed to create ticket"
        />
      )}
      <div className="flex justify-end">
        <Button type="submit" disabled={mutation.isPending}>
          {mutation.isPending ? "Creating..." : "Create Ticket"}
        </Button>
      </div>
    </form>
  );
}
