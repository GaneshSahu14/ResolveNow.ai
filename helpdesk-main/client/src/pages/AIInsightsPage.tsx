import { useState } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
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
  hidden: { opacity: 0, y: 20 },
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

export default function AIInsightsPage() {
  const [confidenceFilter, setConfidenceFilter] = useState<number>(85);

  const accuracyTrend = [
    { date: "Jun 14", accuracy: 98.2, autoResolve: 28.4 },
    { date: "Jun 15", accuracy: 98.5, autoResolve: 29.1 },
    { date: "Jun 16", accuracy: 99.0, autoResolve: 31.0 },
    { date: "Jun 17", accuracy: 99.1, autoResolve: 31.8 },
    { date: "Jun 18", accuracy: 99.3, autoResolve: 32.5 },
    { date: "Jun 19", accuracy: 99.4, autoResolve: 34.2 },
  ];

  const categoryConfidence = [
    { subject: "General Qs", A: 96, fullMark: 100 },
    { subject: "Technical Issues", A: 88, fullMark: 100 },
    { subject: "Refund Requests", A: 94, fullMark: 100 },
    { subject: "APIs & Devs", A: 82, fullMark: 100 },
    { subject: "Billing & Sub", A: 91, fullMark: 100 },
  ];

  return (
    <PageTransition className="flex-1 overflow-y-auto p-8 md:p-12 w-full max-w-[1600px] mx-auto scrollbar-hide">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8"
      >
        {/* Header */}
        <motion.header
          variants={itemVariants}
          className="mb-12 relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-4"
        >
          <div>
            <h2 className="font-headline-lg-mobile md:font-display-lg text-[32px] md:text-[40px] text-on-surface mb-4">Deep Insights</h2>
            <p className="font-body-lg text-[18px] text-on-surface-variant max-w-2xl leading-relaxed">
              Analyzing vast streams of unstructured interaction data to surface latent patterns, predict escalation trajectories, and quantify automated resolution efficacy.
            </p>
          </div>
          
          <div className="flex items-center gap-2 shrink-0 glass-card p-2 rounded-xl border border-outline-variant/10">
            <span className="text-[10px] font-label-md text-on-surface-variant uppercase px-2">
              Confidence threshold
            </span>
            <select
              value={confidenceFilter}
              onChange={(e) => setConfidenceFilter(Number(e.target.value))}
              className="bg-surface border border-outline-variant/30 text-on-surface text-[12px] font-semibold py-1.5 px-3 rounded-lg focus:outline-none focus:border-primary/50 cursor-pointer"
            >
              <option value={75}>75% (Fast Routing)</option>
              <option value={85}>85% (Standard)</option>
              <option value={95}>95% (Strict Approval)</option>
            </select>
          </div>
        </motion.header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Main KPI Gauges */}
          <div className="col-span-1 md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Gauge 1: AI Resolution Rate */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-panel p-8 rounded-2xl glow-card transition-all duration-300 relative overflow-hidden ai-glow bg-surface-container-lowest/40 hover:border-primary/30 group"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="font-label-md text-[14px] text-on-surface-variant uppercase tracking-wider">AI Resolution Rate</h3>
                  <div className="text-[40px] font-display-sm text-primary mt-2 font-bold">78.4%</div>
                </div>
                <span className="material-symbols-outlined text-primary text-[32px] opacity-50">auto_awesome</span>
              </div>
              
              <div className="mt-8 pt-6 border-t border-outline-variant/10 flex justify-between items-center relative z-10">
                <span className="font-label-sm text-[12px] text-on-surface-variant">Live model inference</span>
                <span className="font-label-sm text-[12px] text-tertiary font-bold bg-tertiary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">trending_up</span>
                  +4.2% vs last week
                </span>
              </div>
            </motion.div>

            {/* Gauge 2: Automation Success */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-panel p-8 rounded-2xl glow-card transition-all duration-300 relative overflow-hidden bg-surface-container-lowest/40 hover:border-secondary/30 group"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-secondary/10 rounded-full blur-2xl group-hover:bg-secondary/20 transition-all"></div>
              <div className="flex justify-between items-start mb-6 relative z-10">
                <div>
                  <h3 className="font-label-md text-[14px] text-on-surface-variant uppercase tracking-wider">Automation Success</h3>
                  <div className="text-[40px] font-display-sm text-secondary mt-2 font-bold">92.1%</div>
                </div>
                <span className="material-symbols-outlined text-secondary text-[32px] opacity-50">done_all</span>
              </div>
              
              {/* Faux Bar Chart */}
              <div className="h-16 w-full flex items-end justify-between space-x-2 relative z-10 mt-6">
                <div className="w-1/6 bg-surface-variant h-1/3 rounded-t-sm group-hover:h-1/2 transition-all duration-500 delay-75"></div>
                <div className="w-1/6 bg-surface-variant h-2/3 rounded-t-sm group-hover:h-3/4 transition-all duration-500 delay-100"></div>
                <div className="w-1/6 bg-surface-variant h-1/2 rounded-t-sm group-hover:h-2/3 transition-all duration-500 delay-150"></div>
                <div className="w-1/6 bg-surface-variant h-3/4 rounded-t-sm group-hover:h-[85%] transition-all duration-500 delay-200"></div>
                <div className="w-1/6 bg-surface-variant h-full rounded-t-sm"></div>
                <div className="w-1/6 bg-secondary h-[90%] rounded-t-sm shadow-[0_0_15px_rgba(208,188,255,0.4)]"></div>
              </div>
            </motion.div>
            
            {/* Accuracy Trend Graph */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="md:col-span-2 glass-card p-8 rounded-2xl min-h-[400px] flex flex-col"
            >
              <div className="mb-6 border-b border-outline-variant/10 pb-4">
                <h3 className="font-headline-lg-mobile text-[24px] text-on-surface">Performance Over Time</h3>
                <p className="font-body-md text-[13px] text-on-surface-variant mt-1">Accuracy rates and automatic resolutions</p>
              </div>
              <div className="flex-1 w-full min-h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={accuracyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorAcc" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorAuto" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-tertiary)" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="var(--color-tertiary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-outline)" }} dy={10} />
                    <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: "var(--color-outline)" }} domain={[0, 100]} />
                    <Tooltip 
                      contentStyle={{ background: "rgba(17, 20, 23, 0.9)", borderColor: "rgba(255,255,255,0.1)", borderRadius: "12px", fontSize: 12 }} 
                      itemStyle={{ color: "var(--color-on-surface)" }}
                    />
                    <Area type="monotone" dataKey="accuracy" name="Classification Accuracy (%)" stroke="var(--color-primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAcc)" />
                    <Area type="monotone" dataKey="autoResolve" name="Auto Resolution Rate (%)" stroke="var(--color-tertiary)" strokeWidth={3} fillOpacity={1} fill="url(#colorAuto)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
            
          </div>

          {/* Right Sidebar Modules */}
          <div className="col-span-1 md:col-span-4 space-y-8 flex flex-col">
            
            {/* Escalation Risk */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-panel p-6 rounded-2xl glow-card transition-all duration-300 border border-error/20 hover:border-error/50 bg-surface-container-lowest/40"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className="material-symbols-outlined text-error" style={{ fontVariationSettings: "'FILL' 1" }}>warning</span>
                <h3 className="font-label-md text-[14px] text-on-surface uppercase tracking-wider">Escalation Risk</h3>
              </div>
              <p className="font-body-md text-[15px] text-on-surface-variant mb-6 leading-relaxed">
                Anomaly detection indicates a rising probability of manual intervention required for 'Billing Discrepancies' cluster.
              </p>
              <div className="flex justify-between items-end border-t border-outline-variant/20 pt-4">
                <div>
                  <div className="font-label-sm text-[12px] text-on-surface-variant">Predicted Volume</div>
                  <div className="font-display-sm text-[28px] text-error mt-1 font-bold">420</div>
                </div>
                <button className="text-primary font-label-sm text-[13px] hover:underline cursor-pointer flex items-center gap-1">
                  View Cohort <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            </motion.div>

            {/* Cost Savings */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-panel p-6 rounded-2xl glow-card transition-all duration-300 border border-tertiary/20 hover:border-tertiary/50 bg-surface-container-lowest/40"
            >
              <div className="flex items-center space-x-3 mb-4">
                <span className="material-symbols-outlined text-tertiary" style={{ fontVariationSettings: "'FILL' 1" }}>savings</span>
                <h3 className="font-label-md text-[14px] text-on-surface uppercase tracking-wider">Cost Savings</h3>
              </div>
              <p className="font-body-md text-[15px] text-on-surface-variant mb-6 leading-relaxed">
                Estimated human hours offset by proactive AI resolution and intent deflection models.
              </p>
              <div className="flex justify-between items-end border-t border-outline-variant/20 pt-4">
                <div>
                  <div className="font-label-sm text-[12px] text-on-surface-variant">MTD Deflection Value</div>
                  <div className="font-display-sm text-[28px] text-tertiary mt-1 font-bold">$14.2k</div>
                </div>
                <div className="text-right">
                  <div className="font-label-sm text-[12px] text-on-surface-variant">Hours Saved</div>
                  <div className="font-display-sm text-[20px] text-on-surface mt-1 font-bold">312h</div>
                </div>
              </div>
            </motion.div>
            
            {/* Confidence Radar */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
              className="glass-panel p-6 rounded-2xl glow-card transition-all duration-300 border border-outline-variant/20 hover:border-primary/30 bg-surface-container-lowest/40 flex-1 flex flex-col"
            >
               <div className="mb-4">
                <h3 className="font-label-md text-[14px] text-on-surface uppercase tracking-wider">AI Confidence Radar</h3>
                <p className="font-label-sm text-[11px] text-on-surface-variant mt-1">Precision rating per category</p>
              </div>
              <div className="flex-1 min-h-[220px] w-full flex items-center justify-center -ml-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="75%" data={categoryConfidence}>
                    <PolarGrid stroke="rgba(255,255,255,0.1)" />
                    <PolarAngleAxis dataKey="subject" style={{ fontSize: 9, fill: "var(--color-on-surface-variant)", fontWeight: 600 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} style={{ fontSize: 8 }} stroke="rgba(255,255,255,0.1)" />
                    <Radar name="Confidence score" dataKey="A" stroke="var(--color-primary)" strokeWidth={2} fill="var(--color-primary)" fillOpacity={0.25} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

          </div>
        </div>
      </motion.div>
    </PageTransition>
  );
}
