import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
// Using a lightweight internal palette UI to avoid relying on a missing shadcn `command` component.

import { useNavigate } from "react-router";
import {
  LayoutDashboard,
  Ticket,
  Users,
  Settings,
  Sparkles,
  Plus,
  Search,
} from "lucide-react";
import { useSession } from "@/lib/auth-client";

type PaletteItem = {
  id: string;
  label: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  onSelect: () => void;
};

function useReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    onChange();
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);
  return reduced;
}

export default function CommandPalette() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const reducedMotion = useReducedMotion();

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const inputRef = useRef<HTMLInputElement | null>(null);

  const items = useMemo<PaletteItem[]>(
    () => [
      {
        id: "dashboard",
        label: "Dashboard",
        description: "View analytics & AI insights",
        icon: LayoutDashboard,
        shortcut: "G D",
        onSelect: () => navigate("/dashboard"),
      },
      {
        id: "tickets",
        label: "Tickets",
        description: "Browse and manage support tickets",
        icon: Ticket,
        shortcut: "G T",
        onSelect: () => navigate("/tickets"),
      },
      ...(session?.user?.role === "admin"
        ? [
            {
              id: "users",
              label: "Users",
              description: "Manage team accounts",
              icon: Users,
              shortcut: "G U",
              onSelect: () => navigate("/users"),
            } satisfies PaletteItem,
          ]
        : []),
      {
        id: "create-ticket",
        label: "Create Ticket",
        description: "Draft a new support request",
        icon: Plus,
        shortcut: "C",
        onSelect: () => navigate("/tickets", { state: { create: true } }),
      },
      {
        id: "settings",
        label: "Settings",
        description: "Account preferences",
        icon: Settings,
        shortcut: "S",
        onSelect: () => navigate("/dashboard"),
      },
      {
        id: "ai",
        label: "AI Insights",
        description: "See AI resolution performance",
        icon: Sparkles,
        shortcut: "A",
        onSelect: () => navigate("/dashboard"),
      },
    ],
    [navigate, session?.user?.role]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((it) =>
      [it.label, it.description, it.id].some((v) =>
        (v ?? "").toLowerCase().includes(q)
      )
    );
  }, [items, query]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isK = e.key.toLowerCase() === "k";
      const metaOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      if (metaOrCtrl && isK) {
        e.preventDefault();
        setOpen(true);
        setQuery("");
        return;
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    const onOpenEvent = () => {
      setOpen(true);
      setQuery("");
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("open-command-palette", onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("open-command-palette", onOpenEvent);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 40);
    return () => window.clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
        >
          <div
            className="absolute inset-0 bg-[#09090B]/50 backdrop-blur-[6px]"
            onClick={() => setOpen(false)}
          />

          <motion.div
            className="relative mx-auto mt-[10vh] w-[min(720px,92vw)]"
            initial={reducedMotion ? { y: 0, opacity: 1 } : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reducedMotion ? { y: 0, opacity: 1 } : { y: 12, opacity: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            <div className="rounded-2xl border border-indigo-500/20 bg-[#12141A]/85 backdrop-blur-xl shadow-[0_0_50px_rgba(99,102,241,.15)] overflow-hidden">
              <div className="px-4 pt-4 pb-2 flex items-center gap-2">
                <Search className="h-4 w-4 text-indigo-400" />
                <div className="text-[11px] font-mono tracking-wide text-muted-foreground">
                  Ctrl K
                </div>
              </div>

              <div className="px-4 pb-3">
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search tickets, users, dashboard…"
                  className="w-full bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground/70"
                />
              </div>

              <div className="px-3 pb-3">
                {filtered.length === 0 ? (
                  <div className="px-2 py-3 text-sm text-muted-foreground">
                    No results found.
                  </div>
                ) : (
                  <div className="space-y-1">
                    <div className="px-2 pt-1 pb-2 text-[11px] font-mono uppercase tracking-wide text-muted-foreground/80">
                      Navigate
                    </div>
                    {filtered.map((it) => {
                      const Icon = it.icon;
                      return (
                        <button
                          key={it.id}
                          onClick={() => {
                            setOpen(false);
                            it.onSelect();
                          }}
                          className="w-full flex items-center gap-3 px-2 py-2.5 rounded-xl text-left transition-all duration-150 hover:bg-indigo-500/10 focus:outline-none focus:ring-2 focus:ring-indigo-500/30"
                        >
                          <Icon className="h-4 w-4 text-indigo-400" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3">
                              <span className="truncate text-sm font-semibold">
                                {it.label}
                              </span>
                              {it.shortcut && (
                                <span className="text-[11px] text-muted-foreground font-mono">
                                  {it.shortcut}
                                </span>
                              )}
                            </div>
                            {it.description && (
                              <span className="block text-xs text-muted-foreground truncate">
                                {it.description}
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

