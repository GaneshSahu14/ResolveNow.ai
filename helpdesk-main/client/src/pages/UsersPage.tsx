import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Role } from "core/constants/role.ts";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import ErrorAlert from "@/components/ErrorAlert";
import UserForm from "./UserForm";
import UsersTable from "./UsersTable";
import { PageTransition } from "../components/PageTransition";

interface EditingUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

interface DeletingUser {
  id: string;
  name: string;
}

type DialogState = { mode: "create" } | { mode: "edit"; user: EditingUser } | null;

export default function UsersPage() {
  const [dialog, setDialog] = useState<DialogState>(null);
  const [deletingUser, setDeletingUser] = useState<DeletingUser | null>(null);
  const queryClient = useQueryClient();

  const close = () => setDialog(null);

  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axios.get<{ users: EditingUser[] }>("/api/users");
      return data.users;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => axios.delete(`/api/users/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["users"] });
      setDeletingUser(null);
    },
  });

  return (
    <PageTransition className="flex-1 overflow-y-auto w-full scrollbar-hide">
      <div className="max-w-[1440px] mx-auto w-full px-4 md:px-margin-desktop py-8 md:py-12 pb-32">
        <h1 className="sr-only">Users</h1>
        
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div>
            <div className="flex items-center gap-2 text-on-surface-variant mb-2">
              <span className="font-label-sm text-[12px] uppercase tracking-widest text-secondary">Administration</span>
              <span className="material-symbols-outlined text-[14px]">chevron_right</span>
              <span className="font-label-sm text-[12px] uppercase tracking-widest text-on-surface-variant">Identity</span>
            </div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-[32px] text-on-surface">User Management</h2>
            <p className="font-body-lg text-[18px] text-on-surface-variant mt-2 max-w-2xl">Manage enterprise access, roles, and AI privileges across your organization.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button className="px-4 py-2.5 border border-outline-variant/30 rounded-lg glass-card text-on-surface font-label-md text-[14px] hover:border-primary/50 hover:text-primary transition-all flex items-center gap-2 cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">download</span>
              Export CSV
            </button>
            <button 
              onClick={() => setDialog({ mode: "create" })}
              className="px-5 py-2.5 bg-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_0_20px_rgba(46,91,255,0.3)] text-on-primary rounded-lg font-label-md text-[14px] font-bold hover:brightness-110 hover:-translate-y-0.5 transition-all flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">person_add</span>
              New User
            </button>
          </div>
        </div>

        {/* Filters / Controls Bar */}
        <div className="glass-card rounded-t-xl p-4 flex flex-col lg:flex-row justify-between items-center gap-4 border-b-0 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
            <button className="px-4 py-1.5 rounded-full border border-primary/50 bg-primary/10 text-primary font-label-md text-[13px] tracking-wide whitespace-nowrap cursor-pointer transition-all">
              All Users ({users?.length || 0})
            </button>
            <button className="px-4 py-1.5 rounded-full border border-outline-variant/30 text-on-surface-variant font-label-md text-[13px] tracking-wide hover:border-outline-variant hover:text-on-surface transition-colors whitespace-nowrap cursor-pointer">
              Admins ({users?.filter(u => u.role === 'admin').length || 0})
            </button>
            <button className="px-4 py-1.5 rounded-full border border-outline-variant/30 text-on-surface-variant font-label-md text-[13px] tracking-wide hover:border-outline-variant hover:text-on-surface transition-colors whitespace-nowrap cursor-pointer">
              Agents ({users?.filter(u => u.role === 'agent').length || 0})
            </button>
            <button className="px-4 py-1.5 rounded-full border border-outline-variant/30 text-on-surface-variant font-label-md text-[13px] tracking-wide hover:border-outline-variant hover:text-on-surface transition-colors whitespace-nowrap cursor-pointer">
              Pending (0)
            </button>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative w-full lg:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline-variant text-[18px]">search</span>
              <input 
                className="w-full bg-surface-container-lowest/50 border-0 border-b border-outline-variant/30 rounded-none pl-10 pr-4 py-2 text-[15px] font-body-md focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all text-on-surface placeholder:text-outline-variant/50" 
                placeholder="Search users by name, email..." 
                type="text"
              />
            </div>
            <button className="p-1.5 border border-outline-variant/30 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[20px]">filter_list</span>
            </button>
          </div>
        </div>

        {/* Table list */}
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-700">
          <UsersTable
            onEdit={(user) => setDialog({ mode: "edit", user })}
            onDelete={(user) => setDeletingUser(user)}
          />
        </div>

        {/* Create / Edit Dialog */}
        <Dialog open={dialog !== null} onOpenChange={(open) => { if (!open) close(); }}>
          <DialogContent className="glass-card border-border text-foreground rounded-2xl max-w-md shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <DialogHeader>
              <DialogTitle className="text-[20px] font-headline-lg-mobile text-on-surface">
                {dialog?.mode === "edit" ? "Edit User" : "Create User"}
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <UserForm
                key={dialog?.mode === "edit" ? dialog.user.id : "create"}
                user={dialog?.mode === "edit" ? dialog.user : undefined}
                onSuccess={close}
              />
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation dialog */}
        <AlertDialog open={deletingUser !== null} onOpenChange={(open) => { if (!open) { setDeletingUser(null); deleteMutation.reset(); } }}>
          <AlertDialogContent className="glass-card border-border text-foreground rounded-2xl max-w-sm shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[20px] font-headline-lg-mobile text-on-surface flex items-center gap-2">
                <span className="material-symbols-outlined text-error">warning</span>
                Revoke Access
              </AlertDialogTitle>
              <AlertDialogDescription className="text-[15px] text-on-surface-variant mt-2 leading-relaxed">
                Are you sure you want to delete {deletingUser?.name}? They will be immediately disconnected from the workspace.
              </AlertDialogDescription>
            </AlertDialogHeader>
            {deleteMutation.isError && (
              <div className="mt-4">
                <ErrorAlert message="Failed to delete user" />
              </div>
            )}
            <AlertDialogFooter className="mt-6 pt-4 border-t border-outline-variant/10">
              <AlertDialogCancel className="bg-transparent border border-outline-variant/30 hover:bg-surface-variant/50 text-[14px] font-bold rounded-lg h-10 px-4 text-on-surface-variant">
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deletingUser && deleteMutation.mutate(deletingUser.id)}
                className="bg-error hover:bg-error/90 text-on-error text-[14px] font-bold rounded-lg h-10 px-6 cursor-pointer shadow-[0_0_15px_rgba(255,180,171,0.2)]"
              >
                Confirm Revocation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
