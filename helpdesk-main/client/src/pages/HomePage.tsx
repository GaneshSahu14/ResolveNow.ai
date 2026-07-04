import { useState, useEffect, useRef } from "react";
import { Link } from "react-router";
import { useSession } from "@/lib/auth-client";
import { PageTransition } from "../components/PageTransition";
import { motion, AnimatePresence, useInView } from "framer-motion";
import {
  Brain,
  Sparkles,
  Activity,
  CheckCircle2,
  Clock,
  Users,
  BarChart3,
  ArrowRight,
  Play,
  Menu,
  X,
  Shield,
  MessageSquare,
  Send,
  BookOpen,
  Search,
  Cpu,
  Check,
  ChevronRight,
  ShieldAlert,
  ArrowRightLeft,
  Workflow,
  Mail
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell
} from "recharts";

// --- Animating Counter Component ---
function Counter({
  value,
  decimals = 0,
  duration = 1.5,
  suffix = ""
}: {
  value: number;
  decimals?: number;
  duration?: number;
  suffix?: string;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (!isInView) return;
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      setCount(progress * value);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [isInView, value, duration]);

  return <span ref={ref}>{count.toFixed(decimals).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}{suffix}</span>;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeDashboardTab, setActiveDashboardTab] = useState<"tickets" | "analytics" | "performance">("tickets");
  
  // Track scroll position to trigger navbar glass background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Mock data for Recharts
  const responseTimeData = [
    { name: "Mon", avg: 4.5, autoshield: 1.2 },
    { name: "Tue", avg: 4.1, autoshield: 1.0 },
    { name: "Wed", avg: 3.2, autoshield: 0.9 },
    { name: "Thu", avg: 2.8, autoshield: 0.8 },
    { name: "Fri", avg: 2.0, autoshield: 0.5 },
    { name: "Sat", avg: 1.8, autoshield: 0.4 },
    { name: "Sun", avg: 1.2, autoshield: 0.3 }
  ];

  const priorityDistributionData = [
    { name: "Critical", value: 12, color: "#ef4444" },
    { name: "High", value: 28, color: "#f97316" },
    { name: "Medium", value: 45, color: "#6366f1" },
    { name: "Low", value: 15, color: "#10b981" }
  ];

  const workloadData = [
    { name: "Queue-IT", assigned: 45, resolved: 38 },
    { name: "Queue-Billing", assigned: 28, resolved: 26 },
    { name: "Queue-Sec", assigned: 15, resolved: 14 },
    { name: "Queue-Ops", assigned: 33, resolved: 29 }
  ];

  // Mock active tickets for dashboard simulation
  const mockTickets = [
    {
      id: "INC-9824",
      subject: "Critical API latency spike on staging cluster",
      category: "IT Operations",
      priority: "Critical",
      status: "Processing",
      assignee: "AI Dispatch",
      confidence: 99
    },
    {
      id: "INC-9823",
      subject: "SSO login failing for Okta identity providers",
      category: "Security",
      priority: "High",
      status: "Open",
      assignee: "Alex Rivera",
      confidence: 96
    },
    {
      id: "INC-9822",
      subject: "Request to update billing address and invoice email",
      category: "Billing",
      priority: "Low",
      status: "Resolved",
      assignee: "Auto-Resolver",
      confidence: 98
    },
    {
      id: "INC-9821",
      subject: "VPN client disconnecting after password reset",
      category: "Access Management",
      priority: "Medium",
      status: "Open",
      assignee: "Sarah Chen",
      confidence: 94
    }
  ];

  const workflowNodes = [
    {
      id: "node1",
      title: "AI Classifies Ticket",
      desc: "Instant intent parsing and routing classification.",
      icon: <Brain className="w-5 h-5 text-indigo-400" />
    },
    {
      id: "node2",
      title: "AI Detects Sentiment",
      desc: "Real-time urgency calibration via customer tone.",
      icon: <Activity className="w-5 h-5 text-cyan-400" />
    },
    {
      id: "node3",
      title: "AI Predicts Priority",
      desc: "Assigns critical metrics based on impact & SLA rules.",
      icon: <ShieldAlert className="w-5 h-5 text-amber-400" />
    },
    {
      id: "node4",
      title: "AI Suggests Articles",
      desc: "Injects relevant contextual knowledge base steps.",
      icon: <BookOpen className="w-5 h-5 text-purple-400" />
    },
    {
      id: "node5",
      title: "AI Generates Response",
      desc: "Drafts tailored resolutions ready for confirmation.",
      icon: <Sparkles className="w-5 h-5 text-indigo-400" />
    }
  ];

  return (
    <PageTransition>
      <div className="bg-[#0B1020] text-slate-100 font-body-md overflow-x-hidden relative selection:bg-indigo-500/30 selection:text-indigo-200 min-h-screen flex flex-col">
        {/* Glow Effects Container */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="ambient-glow-1"></div>
          <div className="ambient-glow-2"></div>
          <div className="ambient-glow-3"></div>
          <div className="absolute inset-0 grid-overlay opacity-30"></div>
        </div>

        {/* Sticky Transparent Navbar */}
        <nav
          className={`sticky top-0 w-full z-50 transition-all duration-300 ${
            scrolled
              ? "bg-[#0B1020]/75 backdrop-blur-md border-b border-indigo-500/10 shadow-lg shadow-indigo-950/20"
              : "bg-transparent border-b border-transparent"
          }`}
          id="main-nav"
        >
          <div className="max-w-7xl mx-auto flex justify-between items-center h-20 px-6 md:px-8">
            <div className="flex items-center gap-10">
              <a className="flex items-center gap-3 group" href="#">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-200 transition-colors">
                  ResolveNow<span className="text-cyan-400">.ai</span>
                </span>
              </a>
              <div className="hidden md:flex items-center gap-8">
                <a className="text-sm font-medium text-slate-300 hover:text-white transition-colors" href="#features">
                  Features
                </a>
                <a className="text-sm font-medium text-slate-300 hover:text-white transition-colors" href="#showcase">
                  Dashboard
                </a>
                <a className="text-sm font-medium text-slate-300 hover:text-white transition-colors" href="#workflow">
                  AI Workflow
                </a>
                <a className="text-sm font-medium text-slate-300 hover:text-white transition-colors" href="#pricing">
                  Pricing
                </a>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-5">
              {session ? (
                <Link to="/dashboard" className="glow-button-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white">
                  Enter Dashboard
                </Link>
              ) : (
                <>
                  <Link className="text-sm font-medium text-slate-300 hover:text-white transition-colors" to="/login">
                    Sign In
                  </Link>
                  <Link className="glow-button-primary px-5 py-2.5 rounded-xl text-sm font-semibold text-white" to="/signup">
                    Get Started Free
                  </Link>
                </>
              )}
            </div>

            {/* Mobile menu toggle */}
            <button
              className="md:hidden text-slate-300 hover:text-white transition-colors p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Dropdown Menu */}
          <AnimatePresence>
            {mobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="md:hidden bg-[#0c1224] border-b border-indigo-500/10 px-6 py-8 flex flex-col gap-6"
              >
                <a
                  className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
                  href="#features"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </a>
                <a
                  className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
                  href="#showcase"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </a>
                <a
                  className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
                  href="#workflow"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  AI Workflow
                </a>
                <a
                  className="text-lg font-medium text-slate-300 hover:text-white transition-colors"
                  href="#pricing"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </a>
                <hr className="border-indigo-500/10" />
                {session ? (
                  <Link
                    to="/dashboard"
                    className="glow-button-primary py-3 rounded-xl text-center font-semibold text-white text-sm"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Enter Dashboard
                  </Link>
                ) : (
                  <div className="flex flex-col gap-4">
                    <Link
                      className="text-center font-medium text-slate-300 hover:text-white transition-colors py-2 text-sm"
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      className="glow-button-primary py-3 rounded-xl text-center font-semibold text-white text-sm"
                      to="/signup"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Get Started Free
                    </Link>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </nav>

        {/* Main Content Area */}
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="relative pt-12 pb-24 md:pt-20 md:pb-36 max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* Left Column: CTAs and Trust */}
              <div className="lg:col-span-6 flex flex-col justify-center text-left">
                <motion.div
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/5 text-indigo-300 text-xs font-semibold mb-6 w-fit shadow-[0_0_15px_rgba(99,102,241,0.1)]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>The Enterprise AI Service Desk 2.0</span>
                </motion.div>
                
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white leading-[1.1] mb-6"
                >
                  AI-First Service Desk <br />
                  <span className="text-gradient-purple-cyan">Built for Enterprise IT</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-lg text-slate-300 max-w-xl mb-10 leading-relaxed"
                >
                  Empower IT operations with predictive triage, semantic knowledge routing, and autonomous tier-1 resolution. Reduce MTTR by 40% while providing instant answers.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="flex flex-col sm:flex-row gap-4 mb-14"
                >
                  {session ? (
                    <Link
                      to="/dashboard"
                      className="glow-button-primary px-8 py-4 rounded-xl text-center text-white font-semibold text-base flex items-center justify-center gap-2"
                    >
                      Go to Dashboard <ArrowRight className="w-5 h-5" />
                    </Link>
                  ) : (
                    <Link
                      to="/signup"
                      className="glow-button-primary px-8 py-4 rounded-xl text-center text-white font-semibold text-base flex items-center justify-center gap-2"
                    >
                      Start Free Trial <ArrowRight className="w-5 h-5" />
                    </Link>
                  )}
                  <a
                    href="#showcase"
                    className="glow-button-ghost px-8 py-4 rounded-xl text-center text-slate-200 font-semibold text-base flex items-center justify-center gap-2 hover:text-white"
                  >
                    <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" /> Watch Product Demo
                  </a>
                </motion.div>

                {/* Trust Badges */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="border-t border-slate-800 pt-8"
                >
                  <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mb-4">
                    TRUSTED BY ENTERPRISES GLOBALLY
                  </p>
                  <div className="flex flex-wrap items-center gap-x-8 gap-y-4 opacity-50 grayscale hover:opacity-75 transition-opacity duration-300">
                    <span className="font-semibold text-slate-300 tracking-wider text-sm">ACME CORP</span>
                    <span className="font-semibold text-slate-300 tracking-wider text-sm">GLOBEX</span>
                    <span className="font-semibold text-slate-300 tracking-wider text-sm">INITECH</span>
                    <span className="font-semibold text-slate-300 tracking-wider text-sm">STARK IND</span>
                    <span className="font-semibold text-slate-300 tracking-wider text-sm">UMBRELLA</span>
                  </div>
                </motion.div>
              </div>

              {/* Right Column: Realistic Floating Dashboard */}
              <div className="lg:col-span-6 relative flex justify-center items-center h-[520px] md:h-[600px]">
                {/* Visual grid backdrop behind the floating dashboard */}
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/10 via-transparent to-transparent rounded-full filter blur-3xl opacity-60"></div>
                
                {/* Floating Card Base Panel */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                  className="relative w-full max-w-[500px] h-[400px] rounded-2xl border border-slate-800 bg-[#0c1329]/80 backdrop-blur-xl p-5 shadow-2xl shadow-indigo-950/50 overflow-hidden flex flex-col"
                >
                  {/* Chrome dots */}
                  <div className="flex items-center gap-1.5 pb-4 border-b border-slate-800/80 mb-3">
                    <div className="w-3 h-3 rounded-full bg-red-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500/40"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500/40"></div>
                    <div className="ml-4 text-xs font-mono text-slate-500">resolvenow.ai/dashboard</div>
                  </div>

                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-semibold text-white">IT Operations Dashboard</h4>
                      <p className="text-[11px] text-slate-400">Live AI agent activities</p>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Connected
                    </span>
                  </div>

                  {/* Core Dashboard UI Content - Active Tickets Sim */}
                  <div className="space-y-2.5 overflow-hidden flex-1">
                    {mockTickets.slice(0, 3).map((ticket) => (
                      <div key={ticket.id} className="p-3 bg-slate-900/50 border border-slate-800/50 rounded-xl flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                            <Brain className="w-4 h-4 text-indigo-400" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-mono text-slate-500">{ticket.id}</span>
                              <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                                ticket.priority === "Critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                ticket.priority === "High" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                                "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                              }`}>
                                {ticket.priority}
                              </span>
                            </div>
                            <p className="text-xs font-medium text-slate-200 truncate max-w-[200px] mt-0.5">{ticket.subject}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                            ticket.status === "Processing" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          }`}>
                            {ticket.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Realtime stats line */}
                  <div className="mt-auto border-t border-slate-800/60 pt-3 flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>MTTR: <strong>1.4m</strong></span>
                    <span>Triage Accuracy: <strong>98.4%</strong></span>
                  </div>
                </motion.div>

                {/* Overlapping Floating Card 1: AI Confidence Indicator */}
                <motion.div
                  className="absolute top-8 right-0 md:-right-4 w-48 p-4 rounded-xl border border-slate-800 bg-[#0e1631]/95 backdrop-blur-md shadow-2xl shadow-black/40 animate-float-1 z-30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-slate-400">AI Confidence</span>
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-white">98.4%</span>
                    <span className="text-[9px] text-emerald-400 flex items-center font-medium">+1.2%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2.5 overflow-hidden">
                    <div className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full w-[98.4%] rounded-full"></div>
                  </div>
                </motion.div>

                {/* Overlapping Floating Card 2: AI Classification Triage */}
                <motion.div
                  className="absolute bottom-16 -left-4 md:-left-12 w-56 p-4 rounded-xl border border-indigo-500/20 bg-[#0e1631]/95 backdrop-blur-md shadow-2xl shadow-black/40 animate-float-2 z-30"
                >
                  <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-800">
                    <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
                    <span className="text-xs font-semibold text-slate-200">Autonomous Classification</span>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Extracted Intent:</span>
                      <span className="text-indigo-300 font-semibold">SSO Outage</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Assigned Team:</span>
                      <span className="text-cyan-300 font-semibold">Identity Ops</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Resolution Path:</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Auto-Verify
                      </span>
                    </div>
                  </div>
                </motion.div>

                {/* Overlapping Floating Card 3: Response Suggestions */}
                <motion.div
                  className="absolute -bottom-4 right-4 w-64 p-4 rounded-xl border border-slate-800 bg-[#0e1631]/95 backdrop-blur-md shadow-2xl shadow-black/40 animate-float-3 z-30"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-white flex items-center gap-1">
                      <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Suggested Resolution
                    </span>
                    <span className="text-[10px] text-slate-500">Drafted</span>
                  </div>
                  <p className="text-[11px] text-slate-300 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 leading-relaxed font-mono">
                    "I have validated the configuration for Okta and pushed a hotfix. Please clear cookie sessions and verify access."
                  </p>
                  <div className="flex justify-end gap-2 mt-3">
                    <button className="text-[10px] font-semibold px-2 py-1 rounded bg-slate-800 text-slate-300 hover:bg-slate-700">Discard</button>
                    <button className="text-[10px] font-semibold px-2 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-500 flex items-center gap-1">
                      Apply <Send className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Feature Bento Grid Section */}
          <section className="py-24 md:py-36 bg-[#0B1020] relative border-t border-slate-900" id="features">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-3">Enterprise Capabilities</h2>
                <p className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-5">
                  AI-Powered Features Styled as Pro Widgets
                </p>
                <p className="text-slate-300 leading-relaxed">
                  ResolveNow AI introduces smart agent workflows directly into the interface. Experience dashboard utilities built for high-velocity service teams.
                </p>
              </div>

              {/* Bento Grid layout */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* 1. AI Ticket Classification (Large Span) */}
                <div className="lg:col-span-2 glass-widget p-6 flex flex-col justify-between h-[300px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                      <Brain className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">AI Ticket Classification</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Auto-detects categories, hardware entities, software components, and urgency parameters instantly from incoming email content.
                    </p>
                  </div>
                  {/* Simulated widget visual */}
                  <div className="bg-[#0b0f1e] rounded-lg border border-slate-800 p-2.5 flex items-center justify-between text-xs mt-4">
                    <span className="font-mono text-slate-500">"VPN disconnected on macOS..."</span>
                    <span className="text-indigo-400 font-semibold bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                      IT &gt; Remote Access
                    </span>
                  </div>
                </div>

                {/* 2. Smart Routing */}
                <div className="glass-widget p-6 flex flex-col justify-between h-[300px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                      <ArrowRightLeft className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Smart Routing</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Intelligently routes tickets to specific support tiers or specialized agents based on historical resolution rates.
                    </p>
                  </div>
                  {/* Visual */}
                  <div className="flex gap-2 items-center justify-between mt-4">
                    <span className="text-[11px] text-slate-500">Incoming</span>
                    <div className="flex-1 h-0.5 bg-dashed border-t border-slate-800 mx-2"></div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                      Tier 2 Network
                    </span>
                  </div>
                </div>

                {/* 3. AI Response Suggestions */}
                <div className="glass-widget p-6 flex flex-col justify-between h-[300px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5">
                      <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">AI Response Suggestions</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Drafts optimized templates using contextual historical data and corporate compliance manuals.
                    </p>
                  </div>
                  {/* Visual */}
                  <div className="h-6 w-full bg-indigo-500/10 rounded border border-indigo-500/20 flex items-center px-2 text-[10px] text-indigo-300 font-semibold justify-between mt-4">
                    <span>Auto-draft resolved</span>
                    <Check className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* 4. Knowledge Base Search */}
                <div className="glass-widget p-6 flex flex-col justify-between h-[300px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5">
                      <BookOpen className="w-5 h-5 text-emerald-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Knowledge Base Search</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Uses semantic vector retrieval to surface documentation and similar resolved incidents.
                    </p>
                  </div>
                  {/* Visual */}
                  <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-2 mt-4 text-[10px] text-slate-400">
                    <Search className="w-3 h-3 text-slate-500" />
                    <span>Search KB documents...</span>
                  </div>
                </div>

                {/* 5. SLA Monitoring */}
                <div className="glass-widget p-6 flex flex-col justify-between h-[300px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5">
                      <Clock className="w-5 h-5 text-amber-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">SLA Monitoring</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Real-time SLA expiration trackers trigger escalating notifications to prevent breach incidents.
                    </p>
                  </div>
                  {/* Visual */}
                  <div className="w-full mt-4">
                    <div className="flex justify-between text-[10px] mb-1 font-semibold">
                      <span className="text-amber-400">SLA Threat (INC-921)</span>
                      <span className="text-slate-400">12m left</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div className="bg-amber-400 h-full w-[85%] rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>

                {/* 6. Real-Time Analytics (Large Span) */}
                <div className="lg:col-span-2 glass-widget p-6 flex flex-col justify-between h-[300px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mb-5">
                      <BarChart3 className="w-5 h-5 text-indigo-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Real-Time Analytics</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Simulate ticket volumes, active resolved ratios, and monitor average team response rates in high precision.
                    </p>
                  </div>
                  {/* Visual Sparkline */}
                  <div className="h-16 w-full mt-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={responseTimeData.slice(0, 5)}>
                        <defs>
                          <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <Area type="monotone" dataKey="avg" stroke="#4f46e5" strokeWidth={2} fillOpacity={1} fill="url(#colorAvg)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 7. Automation Workflows */}
                <div className="glass-widget p-6 flex flex-col justify-between h-[300px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-5">
                      <Workflow className="w-5 h-5 text-purple-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Automation Workflows</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Custom triggers connect tickets with external systems like Jira and Slack automatically.
                    </p>
                  </div>
                  {/* Visual */}
                  <div className="flex gap-2 items-center justify-center text-[10px] text-slate-400 mt-4 border border-slate-800 rounded bg-[#0b0f1e]/80 py-1.5">
                    <span>Trigger</span>
                    <ChevronRight className="w-3 h-3 text-indigo-400" />
                    <span className="text-indigo-300 font-semibold">Slack Hook</span>
                  </div>
                </div>

                {/* 8. Multi-channel Support */}
                <div className="glass-widget p-6 flex flex-col justify-between h-[300px]">
                  <div>
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center mb-5">
                      <MessageSquare className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">Multi-channel Support</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Ingest, reply, and track threads from Slack, email boxes, client portal forms, and developer APIs.
                    </p>
                  </div>
                  {/* Visual */}
                  <div className="flex justify-around items-center mt-4">
                    <span className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-300">Slack</span>
                    <span className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-300">Email</span>
                    <span className="w-7 h-7 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-[10px] text-slate-300">Portal</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Full Enterprise Dashboard Showcase */}
          <section className="py-24 md:py-36 bg-[#090d19]/80 border-t border-slate-900 relative" id="showcase">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <h2 className="text-xs uppercase tracking-widest text-cyan-400 font-bold mb-3">Enterprise Dashboard Showcase</h2>
                <p className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-5">
                  See the Real Product in Action
                </p>
                <p className="text-slate-300 leading-relaxed">
                  ResolveNow AI delivers a high-density, pro-grade console for agents. No abstract illustrations—this is a preview of the actual system dashboard interface.
                </p>
              </div>

              {/* Console Container */}
              <div className="glass-panel rounded-2xl overflow-hidden shadow-2xl border border-slate-800 max-w-5xl mx-auto">
                {/* Console tabs */}
                <div className="flex items-center justify-between px-6 bg-[#0f152a] border-b border-slate-800 h-14">
                  <div className="flex gap-4">
                    <button
                      className={`text-xs font-semibold uppercase tracking-wider h-14 border-b-2 px-1 transition-colors ${
                        activeDashboardTab === "tickets"
                          ? "border-indigo-500 text-white"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                      onClick={() => setActiveDashboardTab("tickets")}
                    >
                      Active Tickets
                    </button>
                    <button
                      className={`text-xs font-semibold uppercase tracking-wider h-14 border-b-2 px-1 transition-colors ${
                        activeDashboardTab === "analytics"
                          ? "border-indigo-500 text-white"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                      onClick={() => setActiveDashboardTab("analytics")}
                    >
                      Real-Time Analytics
                    </button>
                    <button
                      className={`text-xs font-semibold uppercase tracking-wider h-14 border-b-2 px-1 transition-colors ${
                        activeDashboardTab === "performance"
                          ? "border-indigo-500 text-white"
                          : "border-transparent text-slate-400 hover:text-white"
                      }`}
                      onClick={() => setActiveDashboardTab("performance")}
                    >
                      Team Workload
                    </button>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-xs text-slate-400 font-mono hidden sm:inline">UPDATED JUST NOW</span>
                  </div>
                </div>

                {/* Interactive Tab contents */}
                <div className="p-6 bg-[#070b16]">
                  {activeDashboardTab === "tickets" && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500">
                            <th className="py-3 px-4">TICKET ID</th>
                            <th className="py-3 px-4">SUBJECT</th>
                            <th className="py-3 px-4">AI CLASSIFICATION</th>
                            <th className="py-3 px-4 text-center">PRIORITY</th>
                            <th className="py-3 px-4">ASSIGNEE</th>
                            <th className="py-3 px-4 text-right">ACCURACY</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-slate-300">
                          {mockTickets.map((ticket) => (
                            <tr key={ticket.id} className="hover:bg-slate-900/50 transition-colors">
                              <td className="py-4 px-4 font-mono text-slate-400">{ticket.id}</td>
                              <td className="py-4 px-4 font-semibold text-white max-w-[220px] truncate">{ticket.subject}</td>
                              <td className="py-4 px-4">
                                <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[10px]">
                                  <Brain className="w-3 h-3" /> {ticket.category}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded font-semibold text-[10px] ${
                                  ticket.priority === "Critical" ? "bg-red-500/10 text-red-400 border border-red-500/20" :
                                  ticket.priority === "High" ? "bg-orange-500/10 text-orange-400 border border-orange-500/20" :
                                  ticket.priority === "Medium" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" :
                                  "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                }`}>
                                  {ticket.priority}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-slate-400 font-medium">{ticket.assignee}</td>
                              <td className="py-4 px-4 text-right font-mono text-cyan-400 font-semibold">{ticket.confidence}%</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {activeDashboardTab === "analytics" && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[300px]">
                      {/* Line Chart */}
                      <div className="md:col-span-8 h-[250px] w-full">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">RESPONSE TIME TRENDS (HOURS)</h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={responseTimeData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip
                              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: 11 }}
                            />
                            <Line type="monotone" dataKey="avg" stroke="#3b82f6" strokeWidth={3} dot={{ fill: "#3b82f6" }} name="Team Average" />
                            <Line type="monotone" dataKey="autoshield" stroke="#00dce5" strokeWidth={3} dot={{ fill: "#00dce5" }} name="AI Resolves" />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Pie Chart */}
                      <div className="md:col-span-4 flex flex-col items-center justify-center">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">TICKET PRIORITY BREAKDOWN</h4>
                        <div className="h-[180px] w-full flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={priorityDistributionData}
                                cx="50%"
                                cy="50%"
                                innerRadius={45}
                                outerRadius={65}
                                paddingAngle={4}
                                dataKey="value"
                              >
                                {priorityDistributionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                              </Pie>
                              <Tooltip
                                contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: 11 }}
                              />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-2 text-[10px] mt-2 justify-center">
                          {priorityDistributionData.map((item) => (
                            <span key={item.name} className="flex items-center gap-1">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></span>
                              <span className="text-slate-400">{item.name} ({item.value}%)</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeDashboardTab === "performance" && (
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center min-h-[300px]">
                      {/* Bar Chart */}
                      <div className="md:col-span-8 h-[250px] w-full">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">TICKETS PROCESSED BY QUEUE</h4>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={workloadData} margin={{ left: -20, right: 10, top: 10, bottom: 0 }}>
                            <XAxis dataKey="name" stroke="#475569" fontSize={10} />
                            <YAxis stroke="#475569" fontSize={10} />
                            <Tooltip
                              contentStyle={{ background: "#0f172a", border: "1px solid #334155", borderRadius: "8px", fontSize: 11 }}
                            />
                            <Bar dataKey="assigned" fill="#4f46e5" radius={[4, 4, 0, 0]} name="Assigned" />
                            <Bar dataKey="resolved" fill="#10b981" radius={[4, 4, 0, 0]} name="Auto-Resolved" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>

                      {/* AI Feed metrics */}
                      <div className="md:col-span-4 space-y-4">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">LIVE WORKLOAD METRICS</h4>
                        <div className="p-4 bg-slate-900/50 border border-slate-800/80 rounded-xl space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Total Ingestion Rate:</span>
                            <span className="text-white font-bold font-mono">14.2 t/min</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">AI Auto-Triage:</span>
                            <span className="text-cyan-400 font-bold font-mono">100.0%</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Agent Hand-off Ratio:</span>
                            <span className="text-orange-400 font-bold font-mono">4.8%</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-400">Average Feed Queue:</span>
                            <span className="text-white font-bold font-mono">0.02s latency</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* AI Workflow Section */}
          <section className="py-24 md:py-36 bg-[#0B1020] relative border-t border-slate-900 overflow-hidden" id="workflow">
            <div className="max-w-7xl mx-auto px-6 md:px-8 relative">
              <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-3">AI Workflow Flow</h2>
                <p className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-5">
                  End-to-End Autonomous Processing
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Watch how our platform intercepts inbound support requests, extracts entities, maps semantic records, and processes actions down to auto-resolution.
                </p>
              </div>

              {/* Workflow Graph (Grid of Nodes with glowing connection lines) */}
              <div className="relative">
                {/* Visual connectors drawn behind node components (on Desktop sizes) */}
                <div className="hidden lg:block absolute inset-0 w-full h-full pointer-events-none z-0">
                  <svg className="w-full h-full" viewBox="0 0 1000 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M 120,100 L 280,100 M 380,100 L 520,100 M 620,100 L 760,100 M 820,100 L 920,100"
                      stroke="url(#glowing-grad)"
                      strokeWidth="2"
                      className="glowing-connector glow-glow"
                    />
                    <defs>
                      <linearGradient id="glowing-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#4f46e5" />
                        <stop offset="50%" stopColor="#00dce5" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 relative z-10">
                  {workflowNodes.map((node, index) => (
                    <motion.div
                      key={node.id}
                      initial={{ opacity: 0, y: 30 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true, margin: "-50px" }}
                      transition={{ duration: 0.6, delay: index * 0.1 }}
                      className="glass-card p-6 rounded-xl flex flex-col items-center text-center relative group"
                    >
                      {/* Node number badge */}
                      <span className="absolute -top-3 left-4 w-6 h-6 rounded-full bg-slate-900 border border-indigo-500/30 text-indigo-400 text-xs font-mono font-bold flex items-center justify-center shadow-md">
                        {index + 1}
                      </span>
                      
                      <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center mb-5 group-hover:border-indigo-500/40 transition-colors duration-300">
                        {node.icon}
                      </div>

                      <h4 className="text-sm font-bold text-white mb-2">{node.title}</h4>
                      <p className="text-xs text-slate-400 leading-relaxed">{node.desc}</p>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Statistics Grid */}
          <section className="py-24 md:py-36 bg-[#090d19]/80 border-t border-slate-900 relative">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
                {/* Stat 1 */}
                <div className="glass-card p-6 rounded-2xl text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">TICKETS RESOLVED</p>
                  <p className="text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
                    <Counter value={1249820} suffix="+" />
                  </p>
                  <span className="text-[10px] text-emerald-400 mt-2 block">Autonomous resolution</span>
                </div>

                {/* Stat 2 */}
                <div className="glass-card p-6 rounded-2xl text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">AI ACCURACY</p>
                  <p className="text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
                    <Counter value={98.4} decimals={1} suffix="%" />
                  </p>
                  <span className="text-[10px] text-indigo-300 mt-2 block">Precision triage</span>
                </div>

                {/* Stat 3 */}
                <div className="glass-card p-6 rounded-2xl text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">AVG RESPONSE TIME</p>
                  <p className="text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
                    &lt; <Counter value={2} suffix="m" />
                  </p>
                  <span className="text-[10px] text-cyan-400 mt-2 block">Reduced from 12 hours</span>
                </div>

                {/* Stat 4 */}
                <div className="glass-card p-6 rounded-2xl text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">CUSTOMER SATISFACTION</p>
                  <p className="text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
                    <Counter value={4.9} decimals={1} suffix="/5.0" />
                  </p>
                  <span className="text-[10px] text-emerald-400 mt-2 block">CSAT score</span>
                </div>

                {/* Stat 5 */}
                <div className="col-span-2 lg:col-span-1 glass-card p-6 rounded-2xl text-center">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">ACTIVE ORGS</p>
                  <p className="text-3xl md:text-4xl font-bold tracking-tight text-white font-mono">
                    <Counter value={520} suffix="+" />
                  </p>
                  <span className="text-[10px] text-indigo-300 mt-2 block">Global deployment</span>
                </div>
              </div>
            </div>
          </section>

          {/* Testimonials Section */}
          <section className="py-24 md:py-36 bg-[#0B1020] relative border-t border-slate-900" id="pricing">
            <div className="max-w-7xl mx-auto px-6 md:px-8">
              <div className="text-center max-w-3xl mx-auto mb-20">
                <h2 className="text-xs uppercase tracking-widest text-indigo-400 font-bold mb-3">Customer Testimonials</h2>
                <p className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-5">
                  Trusted by Pro Operations Teams
                </p>
                <p className="text-slate-300 leading-relaxed">
                  Read reviews from director level professionals who have successfully scaled their support queue metrics with ResolveNow AI.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Card 1 */}
                <div className="glass-card p-8 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex gap-1 mb-5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-amber-400 text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-slate-300 italic text-sm leading-relaxed mb-6">
                      "Deploying ResolveNow AI was a breeze. The classification model auto-categorized 94% of our password and VPN requests in the first day. Our service agents can focus on real infrastructure issues."
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs font-mono">
                      MS
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Marcus Sterling</h4>
                      <p className="text-[11px] text-slate-500">Director of IT Ops, Globex</p>
                    </div>
                  </div>
                </div>

                {/* Card 2 */}
                <div className="glass-card p-8 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex gap-1 mb-5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-amber-400 text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-slate-300 italic text-sm leading-relaxed mb-6">
                      "The response suggestions dashboard is incredible. Having AI draft the exact reply and cross-reference our Confluence documents saved my agents an average of 4 minutes per ticket. Highly recommend."
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs font-mono">
                      LC
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Linda Chen</h4>
                      <p className="text-[11px] text-slate-500">VP of Service Desk, Stark Industries</p>
                    </div>
                  </div>
                </div>

                {/* Card 3 */}
                <div className="glass-card p-8 rounded-2xl flex flex-col justify-between hover:border-slate-700 transition-colors">
                  <div>
                    <div className="flex gap-1 mb-5">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className="text-amber-400 text-lg">★</span>
                      ))}
                    </div>
                    <p className="text-slate-300 italic text-sm leading-relaxed mb-6">
                      "Our SLA breach incident count dropped by 80% since adopting the AI routing rules. Escalation workflows ensure the right engineering teams are paged instantly. A massive win for our operations."
                    </p>
                  </div>
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white text-xs font-mono">
                      EH
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Eric Haddon</h4>
                      <p className="text-[11px] text-slate-500">Lead Operations Architect, Initech</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Interactive SLA/CTA pricing section */}
          <section className="py-24 md:py-36 bg-[#090d19]/80 border-t border-slate-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-radial-gradient from-indigo-500/5 via-transparent to-transparent rounded-full filter blur-3xl opacity-50 pointer-events-none"></div>
            <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
              <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-white mb-6">
                Ready to Supercharge Your ITSM?
              </h2>
              <p className="text-slate-300 text-lg mb-10 max-w-2xl mx-auto">
                Connect your service channels, link your internal wikis, and deploy autonomous ticketing assistants in minutes.
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
                <Link
                  to="/signup"
                  className="glow-button-primary w-full sm:w-auto px-8 py-4 rounded-xl text-white font-semibold text-base text-center"
                >
                  Start Your Free Trial
                </Link>
                <a
                  href="mailto:sales@resolvenow.ai"
                  className="glow-button-ghost w-full sm:w-auto px-8 py-4 rounded-xl text-slate-200 hover:text-white font-semibold text-base text-center border border-slate-800 hover:border-slate-700"
                >
                  Contact Enterprise Sales
                </a>
              </div>
            </div>
          </section>

          {/* Get In Touch Section */}
          <section className="py-24 border-t border-slate-900 bg-[#080B14] relative overflow-hidden">
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[30%] h-[35%] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-10 right-1/4 w-[25%] h-[30%] bg-cyan-500/5 rounded-full blur-[90px] pointer-events-none" />
            
            <div className="max-w-6xl mx-auto px-6 relative z-10">
              <div className="text-center mb-16">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-4">
                  <Sparkles className="w-3.5 h-3.5" />
                  Contact Us
                </div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white mb-4">
                  Get in Touch
                </h2>
                <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto">
                  Need assistance or have queries? Contact us directly.
                </p>
              </div>

              <div className="flex justify-center">
                {/* Ganesh Sahu Card */}
                <div className="group relative w-full max-w-xl rounded-2xl border border-slate-800 bg-slate-950/40 p-8 hover:border-cyan-500/30 transition-all duration-300 hover:shadow-[0_0_40px_-5px_rgba(6,182,212,0.12)] flex flex-col justify-between overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-bl-full filter blur-xl group-hover:bg-cyan-500/10 transition-colors" />
                  <div>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-cyan-500/30 flex items-center justify-center font-bold text-white text-lg shadow-inner select-none font-mono">
                        GS
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white tracking-wide group-hover:text-cyan-400 transition-colors">
                          Ganesh Sahu
                        </h3>
                        <p className="text-xs text-cyan-400/90 font-semibold tracking-wider uppercase mt-0.5">
                          AI Engineer
                        </p>
                      </div>
                    </div>
                    <p className="text-slate-400 text-sm leading-relaxed mb-6">
                      Built and integrated AI-powered ticket management features, including automated ticket classification, intelligent response suggestions, email-based ticket creation, and workflow automation, while leading the full-stack development of the platform.
                    </p>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-900">
                    <a
                      href="mailto:ganeshsahu2147@gmail.com"
                      className="inline-flex items-center gap-2 text-xs text-slate-300 hover:text-white transition-colors bg-slate-900/60 hover:bg-cyan-600/10 px-4 py-2.5 rounded-lg border border-slate-800 hover:border-cyan-500/30 font-medium"
                    >
                      <Mail className="w-3.5 h-3.5 text-cyan-400" />
                      ganeshsahu2147@gmail.com
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>

        {/* Premium Enterprise Footer */}
        <footer className="w-full border-t border-slate-900 bg-[#090d17] py-16 z-10 relative">
          <div className="max-w-7xl mx-auto px-6 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-10 mb-16">
              <div className="md:col-span-2">
                <a className="flex items-center gap-3 mb-6" href="#">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-lg font-bold tracking-tight text-white">ResolveNow.ai</span>
                </a>
                <p className="text-xs text-slate-400 leading-relaxed max-w-xs mb-6">
                  The AI-first service desk software platform engineered specifically for modern, high-velocity enterprise IT operations.
                </p>
                <div className="flex gap-4">
                  <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="Twitter">
                    <MessageSquare className="w-4 h-4" />
                  </a>
                  <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="LinkedIn">
                    <Users className="w-4 h-4" />
                  </a>
                  <a href="#" className="text-slate-500 hover:text-white transition-colors" aria-label="Security">
                    <Shield className="w-4 h-4" />
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Product</h4>
                <ul className="space-y-3.5 text-xs text-slate-400">
                  <li><a className="hover:text-white transition-colors" href="#features">AI Triage</a></li>
                  <li><a className="hover:text-white transition-colors" href="#features">Smart Routing</a></li>
                  <li><a className="hover:text-white transition-colors" href="#features">Response Suggestions</a></li>
                  <li><a className="hover:text-white transition-colors" href="#features">Workflows</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Resources</h4>
                <ul className="space-y-3.5 text-xs text-slate-400">
                  <li><a className="hover:text-white transition-colors" href="#">Documentation</a></li>
                  <li><a className="hover:text-white transition-colors" href="#">API Reference</a></li>
                  <li><a className="hover:text-white transition-colors" href="#">Developer Console</a></li>
                  <li><a className="hover:text-white transition-colors" href="#">Status Dashboard</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Company</h4>
                <ul className="space-y-3.5 text-xs text-slate-400">
                  <li><a className="hover:text-white transition-colors" href="#">About Us</a></li>
                  <li><a className="hover:text-white transition-colors" href="#">Security Certifications</a></li>
                  <li><a className="hover:text-white transition-colors" href="#">Privacy Shield</a></li>
                  <li><a className="hover:text-white transition-colors" href="#">GDPR Compliance</a></li>
                </ul>
              </div>

              <div>
                <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-5">Newsletter</h4>
                <p className="text-[11px] text-slate-500 mb-4">Stay updated with latest enterprise service desk advancements.</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="Enter email address"
                    className="bg-slate-900 border border-slate-800 text-xs px-3 py-2 rounded-lg text-white w-full focus:outline-none focus:border-indigo-500"
                  />
                  <button className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors flex items-center justify-center" aria-label="Subscribe">
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

              <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
                <p>© 2026 ResolveNow AI Inc. All rights reserved. Registered under GDPR.</p>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span className="font-semibold text-slate-400 uppercase tracking-widest text-[10px]">ALL SYSTEMS RUNNING NORMAL</span>
                </div>
              </div>

              <div className="mt-6 text-center text-xs text-slate-500">
                Developed by Ganesh Sahu
              </div>
          </div>
        </footer>
      </div>
    </PageTransition>
  );
}
