import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, AreaChart, Area, Tooltip } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import ErrorAlert from "@/components/ErrorAlert";
import StatusBadge from "@/components/StatusBadge";
import PriorityBadge from "@/components/PriorityBadge";
import { categoryLabel } from "core/constants/ticket-category.ts";
import {
  CircleDot,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Clock,
  Sparkles,
  Inbox,
  ShieldAlert,
  Flame,
  UserCheck,
  Calendar,
  ArrowUpRight,
  Brain,
  Zap,
  Activity,
  BarChart2,
} from "lucide-react";
import { Link } from "react-router";
import { PageTransition } from "../components/PageTransition";
import { motion } from "framer-motion";

interface Stats {
  totalTickets: number;
  openTickets: number;
  resolvedByAI: number;
  aiResolutionRate: number;
  avgResolutionTime: number;
  resolvedTickets: number;
  closedTickets: number;
  categoryCounts: { category: string | null; count: number }[];
  recentActivity: {
    id: number;
    subject: string;
    status: "open" | "resolved" | "closed" | "new" | "processing";
    category: "general_question" | "technical_question" | "refund_request" | null;
    senderName: string;
    createdAt: string;
  }[];
}

interface DailyVolume {
  data: { date: string; tickets: number }[];
}

function formatDuration(seconds: number): string {
  if (seconds <= 0) return "N/A";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

// Custom Tooltip for charts
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1022]/95 backdrop-blur-xl border border-white/10 rounded-xl px-3 py-2 shadow-2xl">
        <p className="text-[10px] font-label-sm text-slate-500 uppercase tracking-wide mb-1">{label}</p>
        <p className="text-sm font-bold text-indigo-300">{payload[0].value} <span className="text-slate-500 font-normal text-xs">tickets</span></p>
      </div>
    );
  }
  return null;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] as const } },
};

export default function DashboardPage() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery<Stats>({
    queryKey: ["ticket-stats"],
    queryFn: async () => {
      const res = await axios.get("/api/tickets/stats");
      return res.data;
    },
  });

  const { data: volume, isLoading: volumeLoading } = useQuery<DailyVolume>({
    queryKey: ["ticket-daily-volume"],
    queryFn: async () => {
      const res = await axios.get("/api/tickets/stats/daily-volume");
      return res.data;
    },
  });

  if (statsError) {
    return (
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <h1 className="text-xl font-bold tracking-tight text-foreground">Dashboard</h1>
        <ErrorAlert error={statsError} fallback="Failed to load dashboard stats" />
      </div>
    );
  }

  // Sparkline data (last 7 days)
  const sparklineData = volume?.data.slice(-7) ?? [
    { tickets: 2 }, { tickets: 4 }, { tickets: 3 }, { tickets: 5 }, { tickets: 8 }, { tickets: 4 }, { tickets: 7 }
  ];

  const kpis = [
    {
      title: "Open Tickets",
      value: stats?.openTickets ?? 0,
      icon: CircleDot,
      desc: "Requires agent review",
      trend: "+4%",
      trendUp: true,
      trendLabel: "vs yesterday",
      colorClass: "text-blue-400",
      bgClass: "bg-blue-500/10 border-blue-500/20",
      sparkColor: "#3b82f6",
      sparkFill: "#3b82f610",
    },
    {
      title: "Resolved Today",
      value: stats?.resolvedTickets ?? 0,
      icon: CheckCircle2,
      desc: "Successfully solved",
      trend: "+12%",
      trendUp: true,
      trendLabel: "vs last week",
      colorClass: "text-emerald-400",
      bgClass: "bg-emerald-500/10 border-emerald-500/20",
      sparkColor: "#10b981",
      sparkFill: "#10b98110",
    },
    {
      title: "Avg Response",
      value: stats ? formatDuration(stats.avgResolutionTime) : "—",
      icon: Clock,
      desc: "Average SLA resolution",
      trend: "-8m",
      trendUp: true,
      trendLabel: "faster today",
      colorClass: "text-amber-400",
      bgClass: "bg-amber-500/10 border-amber-500/20",
      sparkColor: "#f59e0b",
      sparkFill: "#f59e0b10",
    },
    {
      title: "CSAT Score",
      value: "4.8",
      icon: TrendingUp,
      desc: "Customer satisfaction",
      trend: "+0.2",
      trendUp: true,
      trendLabel: "improvement",
      colorClass: "text-violet-400",
      bgClass: "bg-violet-500/10 border-violet-500/20",
      sparkColor: "#8b5cf6",
      sparkFill: "#8b5cf610",
    },
  ];

  const categoryGradients = [
    "from-blue-500 to-indigo-500",
    "from-violet-500 to-purple-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
  ];

  return (
    <PageTransition className="flex-1 overflow-y-auto scrollbar-hide">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="p-5 md:p-7 space-y-6 pb-12 max-w-[1600px] mx-auto"
      >
        {/* ─── Header ──────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-[22px] font-bold tracking-tight text-white leading-tight">Dashboard</h1>
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-label-sm uppercase tracking-[0.1em]">Live</span>
              </span>
            </div>
            <p className="text-[12px] text-slate-500 leading-relaxed max-w-lg">
              AI-Powered Support Operations — Real-time ticket tracking, agent performance, and automated AI classification.
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-indigo-500/8 border border-indigo-500/15">
              <Brain className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-[11px] font-semibold text-indigo-300">
                AI Resolve Rate: <span className="text-white">{stats?.aiResolutionRate ?? 0}%</span>
              </span>
            </div>
          </div>
        </motion.div>

        {/* ─── KPI Grid ──────────────────────────────────────────────── */}
        <motion.div variants={itemVariants} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {kpis.map((kpi, i) => (
            <motion.div
              key={kpi.title}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="kpi-card p-4 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-[10px] font-label-sm uppercase tracking-[0.12em] text-slate-600">{kpi.title}</span>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20 mt-1.5 bg-white/5 rounded-lg" />
                  ) : (
                    <p className="text-[28px] font-bold tracking-tight text-white leading-none mt-1.5 tabular-nums">
                      {kpi.value}
                    </p>
                  )}
                </div>
                <div className={`w-9 h-9 rounded-xl ${kpi.bgClass} border flex items-center justify-center shrink-0`}>
                  <kpi.icon className={`w-4 h-4 ${kpi.colorClass}`} />
                </div>
              </div>
              
              <div className="flex items-center justify-between mb-3">
                <span className="text-[11px] text-slate-600">{kpi.desc}</span>
                <div className="flex items-center gap-1">
                  {kpi.trendUp ? (
                    <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <TrendingDown className="w-3 h-3 text-rose-400" />
                  )}
                  <span className={`text-[10px] font-label-sm font-semibold ${kpi.trendUp ? "text-emerald-400" : "text-rose-400"}`}>
                    {kpi.trend}
                  </span>
                  <span className="text-[10px] text-slate-600">{kpi.trendLabel}</span>
                </div>
              </div>

              {/* Sparkline */}
              <div className="h-9 w-full opacity-70 group-hover:opacity-100 transition-opacity">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparklineData}>
                    <defs>
                      <linearGradient id={`spark-${i}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={kpi.sparkColor} stopOpacity={0.3} />
                        <stop offset="100%" stopColor={kpi.sparkColor} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="tickets"
                      stroke={kpi.sparkColor}
                      fill={`url(#spark-${i})`}
                      strokeWidth={1.5}
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ─── Main Content Grid ──────────────────────────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
          
          {/* ── Left Column (8 cols) ─────────────────────────────────── */}
          <div className="xl:col-span-8 space-y-5">

            {/* Row: Work Queue + AI Suggestions */}
            <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Today's Work Queue */}
              <Card className="glass-card border-0 overflow-hidden">
                <CardHeader className="pb-3 border-b border-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                        <Inbox className="h-3.5 w-3.5 text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-[11px] font-label-sm uppercase tracking-[0.1em] text-slate-400">
                          Work Queue
                        </CardTitle>
                        <CardDescription className="text-[10px] text-slate-600">Unresolved items</CardDescription>
                      </div>
                    </div>
                    <Link to="/tickets" className="text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1">
                      View all <ArrowUpRight className="w-3 h-3" />
                    </Link>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 px-4 pb-4">
                  {statsLoading ? (
                    <div className="space-y-2">
                      <Skeleton className="h-12 w-full bg-white/4 rounded-xl" />
                      <Skeleton className="h-12 w-full bg-white/4 rounded-xl" />
                      <Skeleton className="h-12 w-full bg-white/4 rounded-xl" />
                    </div>
                  ) : !stats?.recentActivity || stats.recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                      <div className="w-10 h-10 rounded-xl bg-white/3 flex items-center justify-center">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500/60" />
                      </div>
                      <p className="text-[11px] text-slate-600">No active work items</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {stats.recentActivity.slice(0, 3).map((ticket) => (
                        <div key={ticket.id} className="p-2.5 bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.05] hover:border-indigo-500/20 rounded-xl flex items-center justify-between gap-3 transition-all duration-200 group/item">
                          <div className="min-w-0">
                            <Link to={`/tickets/${ticket.id}`} className="text-[12px] font-semibold text-slate-200 hover:text-indigo-300 transition-colors truncate block">
                              {ticket.subject}
                            </Link>
                            <span className="text-[10px] text-slate-600 block mt-0.5 font-label-sm">#{ticket.id} · {ticket.senderName}</span>
                          </div>
                          <div className="shrink-0 flex gap-1.5 items-center">
                            <PriorityBadge ticketId={ticket.id} />
                            <StatusBadge status={ticket.status} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* AI Suggestions */}
              <Card className="glass-card border-0 overflow-hidden relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl pointer-events-none" />
                <CardHeader className="pb-3 border-b border-white/[0.04] relative">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 border border-indigo-500/25 flex items-center justify-center">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <div>
                      <CardTitle className="text-[11px] font-label-sm uppercase tracking-[0.1em] text-slate-400">
                        AI Insights
                      </CardTitle>
                      <CardDescription className="text-[10px] text-slate-600">Real-time suggestions</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2.5 pt-3 px-4 pb-4 relative">
                  <div className="p-3 bg-indigo-500/5 border border-indigo-500/15 rounded-xl hover:border-indigo-500/25 transition-all duration-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Zap className="w-3 h-3 text-indigo-400" />
                      <span className="text-[10px] font-label-sm uppercase tracking-[0.1em] text-indigo-400 font-semibold">Knowledge Expansion</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      CORS ticket volume up <span className="text-white font-semibold">+18%</span>. Adjust whitelist articles to auto-resolve 10% more tickets.
                    </p>
                  </div>
                  <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl hover:border-amber-500/25 transition-all duration-200">
                    <div className="flex items-center gap-2 mb-1.5">
                      <ShieldAlert className="w-3 h-3 text-amber-400" />
                      <span className="text-[10px] font-label-sm uppercase tracking-[0.1em] text-amber-400 font-semibold">SLA Risk</span>
                    </div>
                    <p className="text-[11px] leading-relaxed text-slate-400">
                      Ticket <span className="text-white font-semibold">#1042</span> response limit expires in 15 minutes. Dispatching to agent.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Volume Chart */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 overflow-hidden">
                <CardHeader className="pb-4 border-b border-white/[0.04]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                        <BarChart2 className="h-3.5 w-3.5 text-violet-400" />
                      </div>
                      <div>
                        <CardTitle className="text-[11px] font-label-sm uppercase tracking-[0.1em] text-slate-400">
                          Ticket Volume
                        </CardTitle>
                        <CardDescription className="text-[10px] text-slate-600">30-day intake timeline</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-indigo-500" />
                        <span className="text-[10px] text-slate-600 font-label-sm">Tickets</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 px-4 pb-4">
                  {volumeLoading ? (
                    <Skeleton className="h-[200px] w-full bg-white/4 rounded-xl" />
                  ) : (
                    <div className="h-[200px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={volume?.data} barCategoryGap="40%">
                          <defs>
                            <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.9} />
                              <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0.6} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid vertical={false} stroke="rgba(129, 140, 248, 0.05)" strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => {
                              const d = new Date(value);
                              return `${d.getMonth() + 1}/${d.getDate()}`;
                            }}
                            tick={{ fill: "rgba(148, 153, 184, 0.5)", fontSize: 9, fontFamily: "JetBrains Mono" }}
                          />
                          <YAxis
                            tickLine={false}
                            axisLine={false}
                            tick={{ fill: "rgba(148, 153, 184, 0.5)", fontSize: 9, fontFamily: "JetBrains Mono" }}
                            width={28}
                          />
                          <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(129, 140, 248, 0.04)", radius: 6 }} />
                          <Bar dataKey="tickets" fill="url(#barGrad)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Recent Activity Timeline */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 overflow-hidden">
                <CardHeader className="pb-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Activity className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-[11px] font-label-sm uppercase tracking-[0.1em] text-slate-400">
                        Activity Timeline
                      </CardTitle>
                      <CardDescription className="text-[10px] text-slate-600">Latest helpdesk events</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 px-4 pb-4">
                  {statsLoading ? (
                    <div className="space-y-4">
                      <Skeleton className="h-6 w-full bg-white/4 rounded-lg" />
                      <Skeleton className="h-6 w-full bg-white/4 rounded-lg" />
                      <Skeleton className="h-6 w-3/4 bg-white/4 rounded-lg" />
                    </div>
                  ) : (
                    <div className="space-y-4 relative pl-5">
                      {/* Timeline line */}
                      <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gradient-to-b from-indigo-500/30 via-violet-500/20 to-transparent" />
                      
                      {stats?.recentActivity.map((activity) => (
                        <div key={activity.id} className="relative text-[12px] group/activity">
                          {/* Timeline dot */}
                          <span className="absolute -left-[18px] top-1.5 h-2.5 w-2.5 rounded-full bg-indigo-500/30 border border-indigo-500/50 group-hover/activity:bg-indigo-500/60 transition-all" />
                          <div className="flex justify-between items-start gap-4">
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-300">
                                Ticket{" "}
                                <Link to={`/tickets/${activity.id}`} className="text-indigo-400 hover:text-indigo-300 transition-colors">
                                  #{activity.id}
                                </Link>{" "}
                                <span className="text-slate-500 font-normal">updated</span>
                              </p>
                              <p className="text-slate-600 mt-0.5 truncate text-[11px]">{activity.subject}</p>
                            </div>
                            <div className="shrink-0 flex items-center gap-2">
                              <StatusBadge status={activity.status} />
                              <span className="text-[10px] text-slate-700 font-label-sm whitespace-nowrap">
                                {new Date(activity.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>

          </div>

          {/* ── Right Sidebar (4 cols) ──────────────────────────────── */}
          <div className="xl:col-span-4 space-y-5">

            {/* Urgent Tickets */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 overflow-hidden">
                <CardHeader className="pb-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-rose-500/10 border border-rose-500/25 flex items-center justify-center">
                      <Flame className="h-3.5 w-3.5 text-rose-400 animate-pulse" />
                    </div>
                    <div>
                      <CardTitle className="text-[11px] font-label-sm uppercase tracking-[0.1em] text-slate-400">
                        Urgent Tickets
                      </CardTitle>
                      <CardDescription className="text-[10px] text-slate-600">SLA breach warnings</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 px-4 pb-4">
                  <div className="p-3 bg-rose-500/5 border border-rose-500/15 rounded-xl hover:border-rose-500/30 transition-all duration-200 group/urgent relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-rose-500/8 rounded-full blur-xl pointer-events-none" />
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        <span className="text-[10px] font-label-sm uppercase tracking-[0.1em] text-rose-400 font-semibold">Critical</span>
                      </div>
                      <span className="text-[10px] font-label-sm text-slate-600 bg-rose-500/8 border border-rose-500/15 px-2 py-0.5 rounded-full">12m left</span>
                    </div>
                    <Link to="/tickets" className="text-[12px] font-semibold text-slate-200 hover:text-white transition-colors block mb-2 truncate">
                      OAuth Client Login blocks subdomain
                    </Link>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-600">Unassigned</span>
                      <PriorityBadge priority="critical" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Agent Leaderboard */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 overflow-hidden">
                <CardHeader className="pb-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                      <UserCheck className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <div>
                      <CardTitle className="text-[11px] font-label-sm uppercase tracking-[0.1em] text-slate-400">
                        Leaderboard
                      </CardTitle>
                      <CardDescription className="text-[10px] text-slate-600">Top resolvers this week</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 px-4 pb-4 space-y-2.5">
                  {[
                    { initials: "MH", name: "Mosh Hamedani", count: 128, rank: 1, color: "from-amber-500/20 to-yellow-500/20 border-amber-500/25 text-amber-300" },
                    { initials: "JD", name: "John Doe", count: 98, rank: 2, color: "from-slate-500/20 to-slate-600/20 border-slate-500/25 text-slate-300" },
                    { initials: "SR", name: "Sarah Rice", count: 74, rank: 3, color: "from-orange-500/15 to-amber-500/15 border-orange-500/20 text-orange-300" },
                  ].map((agent) => (
                    <div key={agent.name} className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-white/[0.02] transition-all">
                      <span className="text-[10px] font-label-sm text-slate-700 w-3 text-right font-bold">#{agent.rank}</span>
                      <div className={`h-7 w-7 rounded-lg bg-gradient-to-br ${agent.color} border flex items-center justify-center font-bold text-[10px] font-label-sm shrink-0`}>
                        {agent.initials}
                      </div>
                      <span className="text-[12px] font-semibold text-slate-300 flex-1 truncate">{agent.name}</span>
                      <span className="text-[10px] font-label-sm text-slate-600 tabular-nums">{agent.count} resolved</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Category Distribution */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 overflow-hidden">
                <CardHeader className="pb-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <BarChart2 className="h-3.5 w-3.5 text-violet-400" />
                    </div>
                    <div>
                      <CardTitle className="text-[11px] font-label-sm uppercase tracking-[0.1em] text-slate-400">
                        Categories
                      </CardTitle>
                      <CardDescription className="text-[10px] text-slate-600">Distribution breakdown</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 px-4 pb-4 space-y-3.5">
                  {statsLoading ? (
                    <Skeleton className="h-12 w-full bg-white/4 rounded-xl" />
                  ) : (
                    stats?.categoryCounts.map((group, idx) => {
                      const name = group.category ? categoryLabel[group.category as keyof typeof categoryLabel] : "Uncategorized";
                      const percent = stats.totalTickets > 0 ? Math.round((group.count / stats.totalTickets) * 100) : 0;
                      const grad = categoryGradients[idx % categoryGradients.length];
                      return (
                        <div key={group.category ?? "null"} className="space-y-1.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-semibold text-slate-300">{name}</span>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-label-sm text-slate-600 tabular-nums">{group.count}</span>
                              <span className="text-[10px] font-label-sm text-slate-700">·</span>
                              <span className="text-[10px] font-label-sm text-slate-500 tabular-nums">{percent}%</span>
                            </div>
                          </div>
                          <div className="h-1.5 w-full bg-white/[0.04] rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percent}%` }}
                              transition={{ duration: 0.8, delay: idx * 0.1, ease: [0.4, 0, 0.2, 1] }}
                              className={`h-full bg-gradient-to-r ${grad} rounded-full`}
                            />
                          </div>
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Upcoming Reminders */}
            <motion.div variants={itemVariants}>
              <Card className="glass-card border-0 overflow-hidden">
                <CardHeader className="pb-3 border-b border-white/[0.04]">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                      <Calendar className="h-3.5 w-3.5 text-cyan-400" />
                    </div>
                    <div>
                      <CardTitle className="text-[11px] font-label-sm uppercase tracking-[0.1em] text-slate-400">
                        Reminders
                      </CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-3 px-4 pb-4 space-y-3">
                  <div className="flex gap-3 items-start p-2.5 rounded-xl bg-white/[0.02] border border-white/[0.04] hover:border-white/[0.07] transition-all">
                    <div className="shrink-0 text-center px-2 py-1 rounded-lg bg-cyan-500/10 border border-cyan-500/15">
                      <span className="text-[10px] font-label-sm font-bold text-cyan-400 block leading-tight">2:00</span>
                      <span className="text-[8px] font-label-sm text-cyan-500/60 uppercase">PM</span>
                    </div>
                    <div>
                      <p className="text-[12px] font-semibold text-slate-200">Team Sync on Queue Load</p>
                      <p className="text-[10px] text-slate-600 mt-0.5">General meeting link</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </PageTransition>
  );
}
