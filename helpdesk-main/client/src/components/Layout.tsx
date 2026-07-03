import { useState, useEffect, cloneElement, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation, useOutlet } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Role } from "core/constants/role.ts";
import { signOut, useSession } from "../lib/auth-client";
import { useTheme } from "../lib/theme";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CreateTicketForm from "../pages/CreateTicketForm";
import CommandPalette from "./CommandPalette";
import {
  Brain,
  Sparkles,
  Users,
  BarChart3,
  Menu,
  X,
  BookOpen,
  Search,
  ChevronRight,
  ChevronLeft,
  LayoutDashboard,
  Ticket,
  Inbox,
  Settings,
  Sun,
  Moon,
  LogOut,
  HelpCircle,
  Bell,
  Plus,
  ChevronDown,
  Zap
} from "lucide-react";

interface SidebarItem {
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  accentColor?: string;
}

export default function Layout() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const location = useLocation();
  const outlet = useOutlet();
  const { theme, toggleTheme } = useTheme();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);

  // Sidebar collapsed state, loaded from localStorage for persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem("sidebar_collapsed");
    return saved === "true";
  });

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem("sidebar_collapsed", String(next));
      return next;
    });
  };

  // Auto-collapse sidebar on tablet screen size (768px to 1024px)
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024 && window.innerWidth >= 768) {
        setIsCollapsed(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Keyboard accessibility: ESC closes the mobile drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileDrawerOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      navigate("/", { replace: true });
    }
  };

  // Build sidebar elements with Lucide React icons
  const sidebarItems: SidebarItem[] = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, accentColor: "#818cf8" },
    { name: "Tickets", path: "/tickets", icon: Ticket, badge: 3, accentColor: "#60a5fa" },
    { name: "Inbox", path: "/inbox", icon: Inbox, badge: 1, accentColor: "#34d399" },
    { name: "Analytics", path: "/analytics", icon: BarChart3, accentColor: "#f59e0b" },
    { name: "AI Insights", path: "/ai-insights", icon: Brain, accentColor: "#c084fc" },
    { name: "Knowledge Base", path: "/knowledge-base", icon: BookOpen, accentColor: "#22d3ee" },
    ...(session?.user?.role === Role.admin
      ? [{ name: "Users", path: "/users", icon: Users, accentColor: "#fb923c" }]
      : []),
    { name: "Settings", path: "/settings", icon: Settings, accentColor: "#94a3b8" },
  ];

  // Dynamic breadcrumb generation
  const getBreadcrumbs = () => {
    const segments = location.pathname.split("/").filter((x) => x);
    if (segments.length === 0) return [{ name: "Home", path: "/", active: true }];

    const breadcrumbs = [{ name: "Home", path: "/", active: false }];
    
    segments.forEach((seg, index) => {
      const path = `/${segments.slice(0, index + 1).join("/")}`;
      let name = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, " ");
      
      if (name === "Ai insights") name = "AI Insights";
      if (name === "Knowledge base") name = "Knowledge Base";
      
      if (!isNaN(Number(seg))) {
        name = `Ticket #${seg}`;
      }

      breadcrumbs.push({
        name,
        path,
        active: index === segments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  const userInitials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : "U";

  // Trigger global search palette via custom event
  const triggerSearch = () => {
    window.dispatchEvent(new CustomEvent("open-command-palette"));
  };

  // Listen to keyboard shortcut for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        triggerSearch();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-full bg-[#080B14] text-slate-100 font-body-md antialiased overflow-hidden selection:bg-indigo-500/20 selection:text-indigo-200">
      
      {/* Deep background radial orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[55%] h-[55%] bg-indigo-600/5 rounded-full blur-[140px] animate-glow-pulse" />
        <div className="absolute bottom-[-25%] right-[-15%] w-[65%] h-[65%] bg-violet-600/4 rounded-full blur-[180px]" />
        <div className="absolute top-[45%] left-[35%] w-[40%] h-[40%] bg-cyan-600/3 rounded-full blur-[160px]" />
      </div>
      
      <CommandPalette />

      {/* Desktop/Tablet Sidebar */}
      <motion.nav
        animate={{ width: isCollapsed ? 76 : 252 }}
        transition={{ type: "spring", stiffness: 400, damping: 38 }}
        className="sidebar-glass h-screen flex flex-col py-5 hidden md:flex shrink-0 relative z-30 overflow-hidden"
      >
        {/* Subtle inner top glow */}
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/20 to-transparent" />

        {/* Sidebar Header */}
        <div className="mb-5 flex flex-col px-3 relative">
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "justify-between"} h-9`}>
            <Link to="/" className="flex items-center gap-2.5 hover:no-underline group min-w-0">
              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center group-hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/30 shrink-0">
                <Sparkles className="w-3.5 h-3.5 text-white drop-shadow-sm" />
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
              </div>
              {!isCollapsed && (
                <div className="min-w-0">
                  <span className="font-bold text-[15px] tracking-tight text-white group-hover:text-indigo-100 transition-colors leading-none">
                    ResolveNow<span className="text-cyan-400 font-black">.ai</span>
                  </span>
                </div>
              )}
            </Link>

            {!isCollapsed && (
              <button
                onClick={toggleSidebar}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer shrink-0"
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {!isCollapsed ? (
            <div className="mt-2.5 flex items-center justify-between px-0.5">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
                <span className="text-[9px] uppercase tracking-[0.12em] text-slate-500 font-semibold font-label-sm">Enterprise AI</span>
              </div>
              <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold font-label-sm uppercase tracking-wide">
                v2.1
              </span>
            </div>
          ) : (
            <div className="flex justify-center mt-3">
              <button
                onClick={toggleSidebar}
                className="w-6 h-6 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer"
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Workspace Selector */}
        {!isCollapsed && (
          <div className="mb-4 px-3">
            <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:border-indigo-500/20 hover:bg-white/[0.05] transition-all flex items-center justify-between cursor-pointer group">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600/30 to-violet-600/30 border border-indigo-500/25 flex items-center justify-center font-bold text-indigo-300 text-[10px] font-label-sm shrink-0">
                  E
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[11px] font-semibold text-slate-200 truncate">Enterprise Ops</p>
                  <p className="text-[9px] text-slate-600 font-label-sm uppercase tracking-wide">Workspace</p>
                </div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-600 group-hover:text-slate-400 transition-colors shrink-0" />
            </div>
          </div>
        )}

        {/* New Ticket Button */}
        <div className="px-3 mb-4">
          <button
            onClick={() => setCreateDialogOpen(true)}
            className={`relative overflow-hidden glow-button-primary text-white rounded-xl transition-all duration-250 flex items-center justify-center gap-2 cursor-pointer font-semibold text-sm ${
              isCollapsed ? "w-10 h-10 p-0 mx-auto rounded-xl" : "w-full py-2.5 px-4"
            }`}
            title={isCollapsed ? "New Ticket" : undefined}
            aria-label="New Ticket"
          >
            <Plus className="w-4 h-4 shrink-0" />
            {!isCollapsed && <span>New Ticket</span>}
          </button>
        </div>

        {/* Divider */}
        {!isCollapsed && (
          <div className="mx-3 mb-3 h-px bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        )}

        {/* Section label */}
        {!isCollapsed && (
          <div className="px-4 mb-1">
            <span className="text-[9px] font-label-sm uppercase tracking-[0.14em] text-slate-600">Navigation</span>
          </div>
        )}

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto scrollbar-hide space-y-0.5 px-3">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `relative flex items-center rounded-xl text-[13px] font-medium transition-all duration-200 group cursor-pointer ${
                    isCollapsed ? "justify-center h-10 w-10 mx-auto" : "px-3 py-2.5 gap-3"
                  } ${
                    isActive
                      ? "nav-item-active sidebar-active-glow"
                      : "nav-item-inactive"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    {/* Active left glow indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeNavIndicator"
                        className="absolute left-0 top-2 bottom-2 w-0.5 bg-gradient-to-b from-indigo-400 to-violet-500 rounded-r-full"
                        transition={{ type: "spring", stiffness: 400, damping: 32 }}
                      />
                    )}
                    
                    <div className={`shrink-0 w-[18px] h-[18px] flex items-center justify-center ${isActive ? "text-indigo-300" : "text-slate-500 group-hover:text-slate-300"} transition-colors`}>
                      <Icon className="w-[17px] h-[17px]" />
                    </div>
                    
                    {!isCollapsed && (
                      <span className={`truncate ${isActive ? "text-slate-100" : "text-slate-400 group-hover:text-slate-200"} transition-colors`}>
                        {item.name}
                      </span>
                    )}
                    
                    {/* Badge */}
                    {item.badge && !isCollapsed && (
                      <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-label-sm min-w-[18px] text-center leading-tight">
                        {item.badge}
                      </span>
                    )}

                    {/* Collapsed tooltip */}
                    {isCollapsed && (
                      <div className="absolute left-full ml-3 px-2.5 py-1.5 bg-[#0f1225] border border-white/10 text-[11px] font-semibold text-slate-200 rounded-lg shadow-2xl pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50 whitespace-nowrap backdrop-blur-xl">
                        {item.name}
                        {item.badge && (
                          <span className="ml-2 bg-indigo-500/20 text-indigo-300 px-1 py-0.5 rounded text-[9px] font-label-sm">{item.badge}</span>
                        )}
                      </div>
                    )}
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div className="mt-auto pt-3 border-t border-white/[0.05] px-3">
          {isCollapsed ? (
            <div className="flex flex-col items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/15 border border-indigo-500/25 flex items-center justify-center font-bold text-indigo-300 text-[11px] font-label-sm cursor-pointer hover:border-indigo-400/40 transition-all">
                  {userInitials}
                </div>
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#080B14] shadow-sm shadow-emerald-400/50" />
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={toggleTheme}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer"
                  title="Toggle Theme"
                  aria-label="Toggle Theme"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-rose-400 hover:bg-rose-500/8 transition-all cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-3">
              <div className="flex items-center gap-2.5">
                <div className="relative shrink-0">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/15 border border-indigo-500/25 flex items-center justify-center font-bold text-indigo-300 text-[11px] font-label-sm cursor-pointer hover:border-indigo-400/40 transition-all">
                    {userInitials}
                  </div>
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#080B14] shadow-sm shadow-emerald-400/50" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-semibold text-slate-200 truncate">{session?.user?.name || "Agent"}</p>
                  <p className="text-[9px] text-slate-600 uppercase tracking-[0.1em] font-label-sm mt-0.5 truncate">{session?.user?.role || "Support Agent"}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05] text-slate-600">
                <button
                  onClick={toggleTheme}
                  className="hover:text-indigo-400 hover:bg-indigo-500/8 rounded-lg p-1.5 transition-all cursor-pointer"
                  title="Toggle Theme"
                  aria-label="Toggle Theme"
                >
                  {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                </button>
                <button
                  className="hover:text-indigo-400 hover:bg-indigo-500/8 rounded-lg p-1.5 transition-all cursor-pointer relative"
                  title="Notifications"
                  aria-label="Notifications"
                >
                  <Bell className="w-3.5 h-3.5" />
                  <span className="absolute top-1 right-1 w-1 h-1 rounded-full bg-indigo-400" />
                </button>
                <button
                  className="hover:text-indigo-400 hover:bg-indigo-500/8 rounded-lg p-1.5 transition-all cursor-pointer"
                  title="Help & Info"
                  aria-label="Help"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleSignOut}
                  className="hover:text-rose-400 hover:bg-rose-500/8 rounded-lg p-1.5 transition-all cursor-pointer"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Bottom inner glow */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/10 to-transparent" />
      </motion.nav>

      {/* Mobile Slide-in Drawer */}
      <AnimatePresence>
        {isMobileDrawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileDrawerOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 md:hidden"
            />
            <motion.div
              ref={drawerRef}
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 33 }}
              className="fixed inset-y-0 left-0 w-72 sidebar-glass z-50 flex flex-col p-5 shadow-2xl md:hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-5">
                <Link to="/" className="flex items-center gap-2.5" onClick={() => setIsMobileDrawerOpen(false)}>
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Sparkles className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="font-bold text-[15px] tracking-tight text-white">
                    ResolveNow<span className="text-cyan-400 font-black">.ai</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all"
                  aria-label="Close menu"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* New Ticket Button */}
              <button
                onClick={() => {
                  setIsMobileDrawerOpen(false);
                  setCreateDialogOpen(true);
                }}
                className="mb-5 glow-button-primary text-white rounded-xl py-3 px-4 flex items-center justify-center gap-2 cursor-pointer w-full text-sm font-semibold"
              >
                <Plus className="w-4 h-4" />
                <span>New Ticket</span>
              </button>

              {/* Navigation Links */}
              <div className="flex-1 overflow-y-auto scrollbar-hide space-y-0.5">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.name}
                      to={item.path}
                      onClick={() => setIsMobileDrawerOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center px-3.5 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 cursor-pointer gap-3 ${
                          isActive
                            ? "nav-item-active sidebar-active-glow"
                            : "nav-item-inactive"
                        }`
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className={`w-[17px] h-[17px] shrink-0 ${isActive ? "text-indigo-300" : "text-slate-500"}`} />
                          <span className={`flex-1 ${isActive ? "text-slate-100" : "text-slate-400"}`}>{item.name}</span>
                          {item.badge && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-indigo-500/15 text-indigo-300 border border-indigo-500/20 font-label-sm">
                              {item.badge}
                            </span>
                          )}
                        </>
                      )}
                    </NavLink>
                  );
                })}
              </div>

              {/* Mobile Footer */}
              <div className="mt-auto pt-4 border-t border-white/[0.05]">
                <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="relative shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/15 border border-indigo-500/25 flex items-center justify-center font-bold text-indigo-300 text-[11px] font-label-sm">
                        {userInitials}
                      </div>
                      <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 border-2 border-[#080B14]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-semibold text-slate-200 truncate">{session?.user?.name || "Agent"}</p>
                      <p className="text-[9px] text-slate-600 uppercase tracking-[0.1em] font-label-sm mt-0.5">{session?.user?.role || "Support Agent"}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between pt-2.5 border-t border-white/[0.05] text-slate-600">
                    <button onClick={toggleTheme} className="hover:text-indigo-400 hover:bg-indigo-500/8 rounded-lg p-1.5 transition-all cursor-pointer" title="Toggle Theme" aria-label="Toggle Theme">
                      {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                    </button>
                    <button onClick={handleSignOut} className="hover:text-rose-400 hover:bg-rose-500/8 rounded-lg p-1.5 transition-all cursor-pointer" title="Sign Out" aria-label="Sign Out">
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-y-auto bg-transparent relative z-20">

        
        {/* TopNavBar */}
        <header className="topbar-glass w-full h-14 flex justify-between items-center px-5 sticky top-0 z-40 shrink-0">
          
          {/* Left: Hamburger + Breadcrumbs */}
          <div className="flex items-center gap-3.5">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden w-9 h-9 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/5 transition-all cursor-pointer border border-white/[0.06]"
              title="Open Navigation"
              aria-label="Open Navigation"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div className="md:hidden">
              <Link to="/dashboard" className="font-bold text-[15px] text-white hover:text-indigo-200 transition-colors hover:no-underline tracking-tight">
                ResolveNow<span className="text-cyan-400 font-black">.ai</span>
              </Link>
            </div>

            {/* Desktop Breadcrumbs */}
            <div className="hidden md:flex items-center gap-1.5 text-slate-500 font-label-sm">
              {breadcrumbs.map((crumb, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  {idx > 0 && <ChevronRight className="w-3 h-3 text-slate-700" />}
                  {crumb.active ? (
                    <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-[0.08em]">{crumb.name}</span>
                  ) : (
                    <Link to={crumb.path} className="text-[11px] font-semibold text-slate-600 hover:text-slate-300 cursor-pointer transition-colors uppercase tracking-[0.08em]">
                      {crumb.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Center Search Bar */}
          <div className="flex-1 max-w-sm mx-5 hidden md:block">
            <div className="relative group cursor-text" onClick={triggerSearch}>
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-indigo-400 transition-colors" />
              <div className="w-full bg-white/[0.03] border border-white/[0.07] hover:border-indigo-500/20 rounded-xl py-2 pl-9 pr-16 text-[12px] text-slate-500 hover:text-slate-300 transition-all flex items-center h-8.5 group-hover:bg-white/[0.05]">
                <span>Search anything...</span>
              </div>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-40 group-hover:opacity-70 transition-opacity">
                <kbd className="font-label-sm text-[9px] bg-white/5 px-1.5 py-0.5 rounded-md border border-white/10 text-slate-400 leading-none">⌘</kbd>
                <kbd className="font-label-sm text-[9px] bg-white/5 px-1.5 py-0.5 rounded-md border border-white/10 text-slate-400 leading-none">K</kbd>
              </div>
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* AI status chip */}
            <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/8 border border-indigo-500/15 cursor-default">
              <Zap className="w-2.5 h-2.5 text-indigo-400" />
              <span className="text-[9px] font-label-sm uppercase tracking-[0.1em] text-indigo-400 font-semibold">AI Live</span>
              <span className="w-1 h-1 rounded-full bg-indigo-400 animate-pulse" />
            </div>

            {/* Notifications */}
            <button className="relative w-8 h-8 rounded-xl flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-white/5 border border-transparent hover:border-white/[0.06] transition-all cursor-pointer" aria-label="View notifications">
              <Bell className="w-3.5 h-3.5" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-indigo-400 rounded-full border border-[#080B14]" />
            </button>
            
            {/* User avatar */}
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500/20 to-violet-500/15 border border-indigo-500/25 hover:border-indigo-400/40 cursor-pointer flex items-center justify-center font-bold text-indigo-300 text-[10px] font-label-sm transition-all hover:scale-105">
              {userInitials}
            </div>
          </div>
        </header>

        {/* Main Page Render */}
        <main className="flex-1 flex overflow-y-auto bg-transparent">

          <AnimatePresence mode="wait">
            {outlet && cloneElement(outlet, { key: location.pathname })}
          </AnimatePresence>
        </main>
      </div>

      {/* New Ticket Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-[#0d1022] border border-white/10 text-slate-100 rounded-2xl max-w-lg shadow-2xl auth-panel">
          <DialogHeader>
            <DialogTitle className="text-[15px] font-bold text-white font-headline-lg-mobile flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                <Plus className="w-3.5 h-3.5 text-indigo-400" />
              </div>
              Create Support Ticket
            </DialogTitle>
          </DialogHeader>
          <CreateTicketForm onSuccess={() => setCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
