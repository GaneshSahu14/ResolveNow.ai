import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { Role } from "core/constants/role.ts";
import ErrorAlert from "@/components/ErrorAlert";

interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt: string;
}

interface UsersTableProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
}

export default function UsersTable({ onEdit, onDelete }: UsersTableProps) {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await axios.get<{ users: User[] }>("/api/users");
      return data.users;
    },
  });

  if (error) {
    return <ErrorAlert message="Failed to fetch users" />;
  }

  return (
    <div className="glass-card rounded-b-xl overflow-x-auto border-t-0 shadow-lg relative bg-surface-container-lowest/50 backdrop-blur-md">
      <table className="w-full text-left border-collapse min-w-[800px]">
        <thead>
          <tr className="border-b border-outline-variant/20 bg-surface-container-low/80 backdrop-blur-md">
            <th className="py-4 px-6 font-label-md text-[12px] text-outline uppercase tracking-widest font-medium w-12 text-center">
              <input type="checkbox" className="w-4 h-4 rounded border-outline-variant/40 bg-surface-container-lowest text-primary focus:ring-primary focus:ring-offset-surface-container-lowest cursor-pointer accent-primary" />
            </th>
            <th className="py-4 px-6 font-label-md text-[12px] text-outline uppercase tracking-widest font-medium">Name</th>
            <th className="py-4 px-6 font-label-md text-[12px] text-outline uppercase tracking-widest font-medium">Email</th>
            <th className="py-4 px-6 font-label-md text-[12px] text-outline uppercase tracking-widest font-medium">Role</th>
            <th className="py-4 px-6 font-label-md text-[12px] text-outline uppercase tracking-widest font-medium">Status</th>
            <th className="py-4 px-6 font-label-md text-[12px] text-outline uppercase tracking-widest font-medium">Created</th>
            <th className="py-4 px-6 font-label-md text-[12px] text-outline uppercase tracking-widest font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="font-body-md text-[16px] divide-y divide-outline-variant/10">
          {isLoading ? (
             Array.from({ length: 5 }).map((_, i) => (
               <tr key={i} className="animate-pulse bg-surface-container-highest/10">
                  <td className="py-4 px-6"><div data-slot="skeleton" className="w-4 h-4 bg-surface-variant rounded mx-auto"></div></td>
                  <td className="py-4 px-6"><div data-slot="skeleton" className="h-4 bg-surface-variant rounded w-32"></div></td>
                  <td className="py-4 px-6"><div data-slot="skeleton" className="h-3 bg-surface-variant/50 rounded w-48"></div></td>
                  <td className="py-4 px-6"><div data-slot="skeleton" className="h-5 bg-surface-variant rounded-full w-24"></div></td>
                  <td className="py-4 px-6"><div data-slot="skeleton" className="h-4 bg-surface-variant rounded w-16"></div></td>
                  <td className="py-4 px-6"><div data-slot="skeleton" className="h-4 bg-surface-variant rounded w-24"></div></td>
                  <td className="py-4 px-6"><div data-slot="skeleton" className="h-8 bg-surface-variant rounded w-20 ml-auto"></div></td>
               </tr>
             ))
          ) : (
            users?.map((user) => {
              const isAdmin = user.role === Role.admin;
              const initials = user.name
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <tr key={user.id} className="hover:bg-surface-variant/20 transition-colors group">
                  <td className="py-4 px-6 text-center">
                    <input type="checkbox" className="w-4 h-4 rounded border-outline-variant/40 bg-surface-container-lowest text-primary focus:ring-primary focus:ring-offset-surface-container-lowest cursor-pointer accent-primary" />
                  </td>
                  {/* Name */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <div className="w-9 h-9 rounded-full overflow-hidden border border-outline-variant/30 bg-surface-container flex items-center justify-center text-on-surface-variant font-label-md text-[14px]">
                          {initials}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-surface border-2 border-surface-container flex items-center justify-center">
                          {isAdmin ? (
                            <div className="w-1.5 h-1.5 rounded-full bg-tertiary shadow-[0_0_5px_#00dce5]"></div>
                          ) : (
                            <div className="w-1.5 h-1.5 rounded-full bg-outline-variant"></div>
                          )}
                        </div>
                      </div>
                      <div className="font-medium text-on-surface">{user.name}</div>
                    </div>
                  </td>
                  {/* Email */}
                  <td className="py-4 px-6">
                    <div className="text-[13px] text-outline-variant font-label-sm tracking-wide">{user.email}</div>
                  </td>
                  {/* Role */}
                  <td className="py-4 px-6">
                    <span className={`inline-flex items-center w-max px-2.5 py-0.5 rounded-full text-[11px] font-label-sm tracking-wider uppercase border ${
                      isAdmin 
                        ? 'border-secondary/30 text-secondary bg-secondary/10' 
                        : 'border-primary/30 text-primary bg-primary/10'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  {/* Status */}
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      {isAdmin ? (
                        <>
                          <span className="material-symbols-outlined text-[16px] text-tertiary">check_circle</span>
                          <span className="text-on-surface-variant text-[14px]">Active</span>
                        </>
                      ) : (
                        <>
                          <span className="material-symbols-outlined text-[16px] text-outline-variant">schedule</span>
                          <span className="text-outline-variant text-[14px]">Offline</span>
                        </>
                      )}
                    </div>
                  </td>
                  {/* Created */}
                  <td className="py-4 px-6 text-on-surface-variant text-[14px]">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  {/* Actions */}
                  <td className="py-4 px-6 text-right opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onEdit(user)}
                        className="p-1.5 text-outline-variant hover:text-primary transition-colors cursor-pointer" 
                        title={`Edit ${user.name}`}
                        aria-label={`Edit ${user.name}`}
                      >
                        <span className="material-symbols-outlined text-[18px]">edit</span>
                      </button>
                      <button 
                        className="p-1.5 text-outline-variant hover:text-secondary transition-colors cursor-pointer" 
                        title="Manage AI Access"
                      >
                        <span className="material-symbols-outlined text-[18px]">psychology</span>
                      </button>
                      {!isAdmin && (
                        <button 
                          onClick={() => onDelete(user)}
                          className="p-1.5 text-outline-variant hover:text-error transition-colors cursor-pointer" 
                          title={`Delete ${user.name}`}
                          aria-label={`Delete ${user.name}`}
                        >
                          <span className="material-symbols-outlined text-[18px]">block</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      
      {/* Pagination Footer */}
      <div className="border-t border-outline-variant/20 p-4 flex items-center justify-between bg-surface-container-lowest/50">
        <div className="text-[13px] text-outline-variant font-label-sm tracking-wide">
          Showing {users?.length || 0} users
        </div>
        <div className="flex items-center gap-2">
          <button className="p-1 border border-outline-variant/30 rounded text-outline-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors disabled:opacity-50 cursor-pointer" disabled>
            <span className="material-symbols-outlined text-[20px]">chevron_left</span>
          </button>
          <span className="text-[13px] text-on-surface font-label-sm px-2 tracking-widest">Page 1 of 1</span>
          <button className="p-1 border border-outline-variant/30 rounded text-outline-variant hover:text-on-surface hover:bg-surface-variant/50 transition-colors cursor-pointer" disabled>
            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
          </button>
        </div>
      </div>
    </div>
  );
}
