import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  AreaChart,
  Area,
} from "recharts";
import { PageTransition } from "../components/PageTransition";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
    },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 110,
      damping: 15,
    },
  },
} as const;

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "productivity" | "satisfaction">("overview");

  // Mock charts data
  const volumeData = [
    { name: "Mon", tickets: 23, resolved: 18 },
    { name: "Tue", tickets: 34, resolved: 31 },
    { name: "Wed", tickets: 45, resolved: 38 },
    { name: "Thu", tickets: 39, resolved: 42 },
    { name: "Fri", tickets: 56, resolved: 48 },
    { name: "Sat", tickets: 18, resolved: 22 },
    { name: "Sun", tickets: 12, resolved: 15 },
  ];

  const resolutionTimeData = [
    { name: "General Qs", time: 4.2 },
    { name: "Technical Qs", time: 12.8 },
    { name: "Refund Requests", time: 2.1 },
    { name: "APIs & Devs", time: 18.5 },
    { name: "Billing Issues", time: 6.4 },
  ];

  const csatData = [
    { week: "Week 20", score: 4.2 },
    { week: "Week 21", score: 4.5 },
    { week: "Week 22", score: 4.4 },
    { week: "Week 23", score: 4.6 },
    { week: "Week 24", score: 4.8 },
  ];

  const agentLeaderboard = [
    { name: "Mosh Hamedani", resolved: 128, csat: 4.9 },
    { name: "John Doe", resolved: 98, csat: 4.7 },
    { name: "Sarah Connor", resolved: 87, csat: 4.8 },
    { name: "Alex Mercer", resolved: 74, csat: 4.5 },
  ];

  const categoryShare = [
    { name: "General Qs", value: 384 },
    { name: "Technical Issues", value: 520 },
    { name: "Refund Requests", value: 189 },
    { name: "Billing Issues", value: 242 },
  ];

  const COLORS = ["#b8c3ff", "#d0bcff", "#00dce5", "#ffb4ab"];

  return (
    <PageTransition className="flex-1 overflow-y-auto p-4 md:p-margin-desktop scrollbar-hide">
      <div className="max-w-container-max mx-auto space-y-8">
        {/* Header Section */}
        <motion.div
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div>
            <h2 className="font-headline-lg-mobile md:font-headline-lg text-[28px] md:text-[32px] text-on-background mb-2">
              Performance Analytics
            </h2>
            <p className="font-body-lg text-[18px] text-on-surface-variant max-w-2xl">
              High-level insights into resolution velocity, volume trends, and AI classification accuracy.
            </p>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-3">
              <span className="font-label-sm text-[12px] text-outline tracking-widest uppercase">Last 30 Days</span>
              <button className="px-4 py-2 rounded-full border border-outline-variant/20 bg-surface-variant/10 hover:border-primary/50 text-on-surface font-label-md transition-all flex items-center gap-2 cursor-pointer">
                <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                Filter Date
              </button>
            </div>

            {/* Custom Tab Switcher */}
            <div className="bg-surface-variant/20 p-1 rounded-xl flex gap-1 border border-outline-variant/10 shrink-0">
              <button
                onClick={() => setActiveTab("overview")}
                className={`text-[13px] font-label-md px-4 py-1.5 rounded-lg cursor-pointer transition-all ${
                  activeTab === "overview"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30"
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setActiveTab("productivity")}
                className={`text-[13px] font-label-md px-4 py-1.5 rounded-lg cursor-pointer transition-all ${
                  activeTab === "productivity"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30"
                }`}
              >
                Productivity
              </button>
              <button
                onClick={() => setActiveTab("satisfaction")}
                className={`text-[13px] font-label-md px-4 py-1.5 rounded-lg cursor-pointer transition-all ${
                  activeTab === "satisfaction"
                    ? "bg-primary text-on-primary shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface hover:bg-surface-variant/30"
                }`}
              >
                CSAT & SLA
              </button>
            </div>
          </div>
        </motion.div>

        {/* Tab Panels with AnimatePresence */}
        <AnimatePresence mode="wait">
          {activeTab === "overview" && (
            <motion.div
              key="overview"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -15, transition: { duration: 0.15 } }}
              className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-min"
            >
              {/* KPI Cards */}
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="md:col-span-4 glass-card rounded-xl p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden group cursor-default"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-colors"></div>
                <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                  <span className="material-symbols-outlined text-[20px] text-primary">speed</span>
                  <span className="font-label-md text-[14px]">Avg Resolution Time</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display-sm text-[40px] text-on-background font-bold">1.8</span>
                  <span className="font-body-md text-[16px] text-on-surface-variant">hours</span>
                </div>
                <div className="mt-2 text-tertiary flex items-center gap-1 font-label-sm text-[12px]">
                  <span className="material-symbols-outlined text-[14px]">trending_down</span>
                  <span>-12% vs last month</span>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="md:col-span-4 glass-card rounded-xl p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden group cursor-default"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-secondary/5 rounded-full blur-2xl group-hover:bg-secondary/10 transition-colors"></div>
                <div className="flex items-center gap-2 text-on-surface-variant mb-4">
                  <span className="material-symbols-outlined text-[20px] text-secondary">forum</span>
                  <span className="font-label-md text-[14px]">Total Volume</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display-sm text-[40px] text-on-background font-bold">8,492</span>
                </div>
                <div className="mt-2 text-error flex items-center gap-1 font-label-sm text-[12px]">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  <span>+5% vs last month</span>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                className="md:col-span-4 glass-card rounded-xl p-6 flex flex-col justify-between min-h-[140px] relative overflow-hidden group ai-processing cursor-default"
              >
                <div className="absolute -right-10 -top-10 w-32 h-32 bg-primary/5 rounded-full blur-2xl"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2 text-on-surface-variant">
                    <span className="material-symbols-outlined text-[20px] text-primary">psychology</span>
                    <span className="font-label-md text-[14px]">AI Deflection Rate</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full border border-primary/30 text-primary font-label-sm text-[10px] bg-primary/5 tracking-wider">
                    LIVE
                  </span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="font-display-sm text-[40px] text-on-background font-bold">64.2%</span>
                </div>
                <div className="mt-2 text-tertiary flex items-center gap-1 font-label-sm text-[12px]">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  <span>+2.4% vs last month</span>
                </div>
              </motion.div>

              {/* Main Volume Chart */}
              <motion.div
                variants={itemVariants}
                whileHover="hover"
                className="md:col-span-8 glass-card rounded-xl p-8 min-h-[400px] flex flex-col relative overflow-hidden group cursor-default"
              >
                <motion.div
                  variants={{ hover: { opacity: 0.1, scale: 1.1 } }}
                  initial={{ opacity: 0.03, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -right-20 -bottom-20 w-80 h-80 bg-primary/20 rounded-full blur-3xl pointer-events-none"
                />

                <div className="flex justify-between items-center mb-8 border-b border-outline-variant/10 pb-4 relative z-10">
                  <div>
                    <motion.h3 
                      variants={{ hover: { x: 4 } }} 
                      transition={{ duration: 0.2 }}
                      className="font-headline-lg-mobile text-[24px] text-on-background"
                    >
                      Ticket Volume Trends
                    </motion.h3>
                    <p className="font-body-md text-[13px] text-on-surface-variant mt-1">Weekly intake traffic comparison</p>
                  </div>
                  <button className="text-on-surface-variant hover:text-primary cursor-pointer">
                    <span className="material-symbols-outlined">more_horiz</span>
                  </button>
                </div>

                <div className="flex-1 w-full min-h-[250px] relative z-10">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={volumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIntake" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-outline)" }} dy={10} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-outline)" }} />
                      <Tooltip
                        contentStyle={{
                          background: "rgba(17, 20, 23, 0.9)",
                          borderColor: "rgba(255,255,255,0.1)",
                          borderRadius: "12px",
                          fontSize: 12,
                          backdropFilter: "blur(8px)",
                        }}
                        itemStyle={{ color: "var(--color-on-surface)" }}
                      />
                      <Area
                        type="monotone"
                        dataKey="tickets"
                        name="New Tickets"
                        stroke="var(--color-primary)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorIntake)"
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                      <Area
                        type="monotone"
                        dataKey="resolved"
                        name="Resolved Tickets"
                        stroke="var(--color-secondary)"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorResolved)"
                        animationDuration={1500}
                        animationEasing="ease-out"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              {/* Classification Donut Chart */}
              <motion.div
                variants={itemVariants}
                whileHover="hover"
                className="md:col-span-4 glass-card rounded-xl p-8 min-h-[400px] flex flex-col relative overflow-hidden group cursor-default"
              >
                <motion.div
                  variants={{ hover: { opacity: 0.1, scale: 1.1 } }}
                  initial={{ opacity: 0.03, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="absolute -left-20 -top-20 w-64 h-64 bg-secondary/20 rounded-full blur-2xl pointer-events-none"
                />

                <div className="mb-8 border-b border-outline-variant/10 pb-4 relative z-10">
                  <motion.h3 
                    variants={{ hover: { x: 4 } }}
                    transition={{ duration: 0.2 }}
                    className="font-headline-lg-mobile text-[24px] text-on-background"
                  >
                    Issue Classification
                  </motion.h3>
                  <p className="font-body-md text-[13px] text-on-surface-variant mt-1">Overall tickets split by feature</p>
                </div>
                <div className="flex-1 flex flex-col items-center justify-center relative z-10">
                  <div className="w-full h-[220px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryShare}
                          cx="50%"
                          cy="50%"
                          innerRadius={65}
                          outerRadius={85}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                          animationDuration={1200}
                          animationEasing="ease-out"
                        >
                          {categoryShare.map((_entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            background: "rgba(17, 20, 23, 0.9)",
                            borderColor: "rgba(255,255,255,0.1)",
                            borderRadius: "12px",
                            fontSize: 12,
                          }}
                          itemStyle={{ color: "var(--color-on-surface)" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>

                    {/* Center Text */}
                    <motion.div 
                      variants={{ hover: { scale: 1.08 } }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none mt-1"
                    >
                      <span className="font-display-sm text-[28px] font-bold text-on-background leading-none">1,335</span>
                      <span className="font-label-sm text-[10px] text-outline uppercase tracking-wider mt-1">Tickets</span>
                    </motion.div>
                  </div>

                  {/* Legend */}
                  <div className="w-full mt-6 space-y-2.5 px-2 relative z-10">
                    {categoryShare.map((entry, index) => (
                      <motion.div 
                        key={entry.name} 
                        whileHover={{ x: 6, transition: { duration: 0.15 } }}
                        className="flex justify-between items-center font-label-md text-[13px] cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index] }}></div>
                          <span className="text-on-surface hover:text-primary transition-colors">{entry.name}</span>
                        </div>
                        <span className="text-on-surface-variant font-mono">{entry.value}</span>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "productivity" && (
            <motion.div
              key="productivity"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -15, transition: { duration: 0.15 } }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-6"
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="lg:col-span-7 glass-card rounded-xl p-8 min-h-[400px] flex flex-col"
              >
                <div className="mb-8 border-b border-outline-variant/10 pb-4">
                  <h3 className="font-headline-lg-mobile text-[24px] text-on-background">Average Resolution Time (hrs)</h3>
                  <p className="font-body-md text-[13px] text-on-surface-variant mt-1">SLA response times sorted by category</p>
                </div>
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={resolutionTimeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-outline)" }} dy={10} />
                      <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-outline)" }} />
                      <Tooltip
                        cursor={{ fill: "rgba(255,255,255,0.05)" }}
                        contentStyle={{ background: "rgba(17, 20, 23, 0.9)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 12 }}
                      />
                      <Bar dataKey="time" fill="var(--color-primary)" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="lg:col-span-5 glass-card rounded-xl p-8 flex flex-col"
              >
                <div className="mb-6 border-b border-outline-variant/10 pb-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-[20px]">military_tech</span>
                  </div>
                  <div>
                    <h3 className="font-headline-lg-mobile text-[20px] text-on-background leading-tight">Agent Leaderboard</h3>
                    <p className="font-body-md text-[13px] text-on-surface-variant">Weekly resolving activity levels</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {agentLeaderboard.map((agent, i) => (
                    <motion.div
                      key={agent.name}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-surface-variant/20 transition-colors border border-transparent hover:border-outline-variant/10 cursor-default"
                      variants={itemVariants}
                      whileHover={{ x: 4, transition: { duration: 0.15 } }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="font-display-sm text-[16px] text-outline w-4 text-center font-bold">{i + 1}</div>
                        <div className="h-10 w-10 rounded-full bg-surface-variant border border-outline-variant/30 text-on-surface flex items-center justify-center font-bold text-[14px]">
                          {agent.name[0]}
                        </div>
                        <div>
                          <p className="font-label-md text-[14px] text-on-surface font-bold">{agent.name}</p>
                          <p className="font-body-sm text-[11px] text-on-surface-variant mt-0.5">Active support tier</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-label-md text-[14px] text-on-surface font-bold">{agent.resolved}</p>
                        <p className="text-tertiary font-label-sm text-[11px] flex items-center justify-end gap-1 mt-0.5">
                          <span className="material-symbols-outlined text-[12px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                          {agent.csat}
                        </p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}

          {activeTab === "satisfaction" && (
            <motion.div
              key="satisfaction"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -15, transition: { duration: 0.15 } }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="glass-card rounded-xl p-8 min-h-[400px] flex flex-col"
              >
                <div className="mb-8 border-b border-outline-variant/10 pb-4">
                  <h3 className="font-headline-lg-mobile text-[24px] text-on-background">Customer Satisfaction (CSAT)</h3>
                  <p className="font-body-md text-[13px] text-on-surface-variant mt-1">Weekly CSAT score trend (Target: 4.5+)</p>
                </div>
                <div className="flex-1 w-full min-h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={csatData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="week" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-outline)" }} dy={10} />
                      <YAxis tickLine={false} axisLine={false} domain={[3.0, 5.0]} tick={{ fontSize: 11, fill: "var(--color-outline)" }} />
                      <Tooltip contentStyle={{ background: "rgba(17, 20, 23, 0.9)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 12 }} />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="var(--color-tertiary)"
                        strokeWidth={4}
                        dot={{ r: 6, fill: "var(--color-background)", strokeWidth: 2 }}
                        activeDot={{ r: 8, fill: "var(--color-tertiary)" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div
                variants={itemVariants}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className="glass-card rounded-xl p-8 flex flex-col"
              >
                <div className="mb-6 border-b border-outline-variant/10 pb-4">
                  <h3 className="font-headline-lg-mobile text-[24px] text-on-background">SLA Breach Incidents</h3>
                  <p className="font-body-md text-[13px] text-on-surface-variant mt-1">Incidents failing target response metrics</p>
                </div>

                <div className="space-y-4">
                  {[
                    {
                      title: "First Response SLA",
                      target: "Target limit: 4 hours",
                      value: "99.1%",
                      meta: "9 breaches",
                      metaClass: "text-tertiary",
                    },
                    {
                      title: "Resolution SLA",
                      target: "Target limit: 24 hours",
                      value: "97.8%",
                      meta: "21 breaches",
                      metaClass: "text-error",
                    },
                    {
                      title: "Escalation Mitigation Time",
                      target: "Target limit: 1 hour",
                      value: "100%",
                      meta: "0 breaches",
                      metaClass: "text-tertiary",
                    },
                  ].map((m) => (
                    <motion.div
                      key={m.title}
                      className="flex items-center justify-between p-5 bg-surface-variant/20 border border-outline-variant/10 rounded-xl transition-colors hover:border-outline-variant/30 cursor-default"
                      variants={itemVariants}
                      whileHover={{ x: 4, transition: { duration: 0.15 } }}
                    >
                      <div className="space-y-1">
                        <p className="font-label-md text-[15px] text-on-surface font-bold">{m.title}</p>
                        <p className="font-body-sm text-[12px] text-on-surface-variant">{m.target}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display-sm text-[20px] text-on-surface font-bold">{m.value}</p>
                        <p className={`font-label-sm text-[11px] ${m.metaClass}`}>{m.meta}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
