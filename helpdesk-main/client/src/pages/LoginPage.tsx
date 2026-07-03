import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorAlert from "@/components/ErrorAlert";
import ErrorMessage from "@/components/ErrorMessage";
import { Loader2, Sparkles, Brain, ShieldCheck, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import { PageTransition } from "../components/PageTransition";
import { motion } from "framer-motion";

const loginSchema = z.object({
  email: z.email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

const features = [
  { icon: Brain, text: "AI-powered auto-resolution engine", color: "text-indigo-400" },
  { icon: ShieldCheck, text: "Enterprise-grade SLA monitoring", color: "text-emerald-400" },
  { icon: Zap, text: "Real-time inbox & ticket routing", color: "text-amber-400" },
];

export default function LoginPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  console.log("LoginPage render: isPending=", isPending, "session=", session ? session.user.email : "null");

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#080B14]">
        <div className="flex items-center gap-2.5 text-slate-500">
          <Loader2 className="animate-spin h-4 w-4 text-indigo-400" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  if (session) {
    console.log("LoginPage: Session exists, navigating to /dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setServerError("");

    console.log("LoginPage: Calling signIn.email");
    const { data: signInData, error } = await signIn.email(data);
    console.log("LoginPage: signIn result error=", error, "data=", signInData);

    if (error) {
      setServerError(error.message ?? "Login failed");
      return;
    }

    console.log("LoginPage: signIn success, waiting for store sync before navigating");
    await new Promise((resolve) => setTimeout(resolve, 150));
    navigate("/dashboard", { replace: true });
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-[#080B14] flex overflow-hidden">
        
        {/* ── Left Branding Panel ──────────────────────────────────── */}
        <div className="hidden lg:flex lg:w-[52%] auth-left-panel flex-col justify-between p-12 relative">
          {/* Dot grid overlay */}
          <div className="absolute inset-0 dot-grid-bg opacity-40" />
          
          {/* Animated glow orbs */}
          <div className="absolute top-[15%] left-[10%] w-[50%] h-[50%] bg-indigo-600/12 rounded-full blur-[100px] animate-glow-pulse pointer-events-none" />
          <div className="absolute bottom-[10%] right-[5%] w-[40%] h-[40%] bg-violet-600/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute top-[50%] right-[20%] w-[30%] h-[30%] bg-cyan-600/7 rounded-full blur-[80px] pointer-events-none" />

          {/* Logo */}
          <div className="relative z-10">
            <Link to="/" className="flex items-center gap-3 hover:no-underline group w-fit">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center shadow-xl shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                ResolveNow<span className="text-cyan-400 font-black">.ai</span>
              </span>
            </Link>
          </div>

          {/* Main content */}
          <div className="relative z-10 space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                <span className="text-[11px] font-label-sm uppercase tracking-[0.12em] text-indigo-400">Enterprise AI Platform</span>
              </div>
              <h2 className="text-[38px] font-bold tracking-tight leading-tight text-white">
                Resolve smarter.<br />
                <span className="gradient-text-cyan">Support faster.</span>
              </h2>
              <p className="text-[15px] text-slate-500 leading-relaxed max-w-sm">
                The AI-native helpdesk that learns from every ticket, automates resolutions, and keeps your team at peak performance.
              </p>
            </div>

            <div className="space-y-3">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.08] transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                    <f.icon className={`w-4 h-4 ${f.color}`} />
                  </div>
                  <span className="text-[13px] text-slate-300">{f.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { value: "94%", label: "AI Resolve Rate" },
                { value: "< 2m", label: "Avg Response" },
                { value: "4.9★", label: "CSAT Score" },
              ].map((stat, i) => (
                <div key={i} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                  <p className="text-[20px] font-bold text-white leading-tight">{stat.value}</p>
                  <p className="text-[10px] text-slate-600 mt-0.5 font-label-sm">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom footer */}
          <div className="relative z-10">
            <p className="text-[11px] text-slate-700">© 2025 ResolveNow.ai · Enterprise Support Platform</p>
          </div>
        </div>

        {/* ── Right Form Panel ──────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-12 relative">
          
          {/* Mobile background glows */}
          <div className="absolute inset-0 lg:hidden">
            <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-indigo-600/8 blur-[100px] pointer-events-none" />
          </div>

          <div className="w-full max-w-[420px] relative z-10">
            
            {/* Mobile logo */}
            <div className="lg:hidden flex flex-col items-center mb-8">
              <Link to="/" className="flex items-center gap-2.5 hover:no-underline mb-2">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-violet-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-bold tracking-tight text-white">
                  ResolveNow<span className="text-cyan-400 font-black">.ai</span>
                </span>
              </Link>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            >
              {/* Form header */}
              <div className="mb-7">
                <h1 className="text-[26px] font-bold tracking-tight text-white leading-tight">Welcome back</h1>
                <p className="text-[13px] text-slate-500 mt-1.5">Sign in to your workspace to continue</p>
              </div>

              {/* Form card */}
              <div className="relative group">
                {/* Ambient gradient border glow */}
                <div className="absolute -inset-px bg-gradient-to-br from-indigo-500/20 via-violet-500/10 to-cyan-500/15 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="auth-panel rounded-2xl p-7 relative">
                  
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    {serverError && (
                      <ErrorAlert message={serverError} className="mb-2" />
                    )}
                    
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-[12px] font-semibold text-slate-400 uppercase tracking-[0.06em] font-label-sm">
                        Email address
                      </Label>
                      <Input
                        id="email"
                        type="email"
                        className="input-premium h-10 rounded-xl text-[13px] bg-white/[0.04] border-white/10 text-slate-100 placeholder:text-slate-600 focus-visible:ring-indigo-500/25 focus-visible:border-indigo-500/40"
                        placeholder="name@company.com"
                        {...register("email")}
                      />
                      {errors.email && (
                        <ErrorMessage message={errors.email.message} />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="password" className="text-[12px] font-semibold text-slate-400 uppercase tracking-[0.06em] font-label-sm">
                          Password
                        </Label>
                        <button type="button" className="text-[11px] text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer">
                          Forgot password?
                        </button>
                      </div>
                      <Input
                        id="password"
                        type="password"
                        className="input-premium h-10 rounded-xl text-[13px] bg-white/[0.04] border-white/10 text-slate-100 placeholder:text-slate-600 focus-visible:ring-indigo-500/25 focus-visible:border-indigo-500/40"
                        placeholder="••••••••••"
                        {...register("password")}
                      />
                      {errors.password && (
                        <ErrorMessage message={errors.password.message} />
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-10 glow-button-primary text-white font-semibold text-[13px] rounded-xl mt-2 cursor-pointer border-0 hover:scale-[1.01] active:scale-[0.99] transition-transform duration-150 flex items-center justify-center gap-2"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="animate-spin h-4 w-4" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          Sign in
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>
                  </form>

                  <div className="mt-4 pt-4 border-t border-white/[0.06] text-center">
                    <p className="text-[12px] text-slate-600">
                      Don't have an account?{" "}
                      <Link to="/signup" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                        Create account
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="mt-6 flex items-center justify-center gap-4">
                {["SOC 2 Compliant", "256-bit AES", "GDPR Ready"].map((badge) => (
                  <div key={badge} className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-slate-700" />
                    <span className="text-[10px] text-slate-700 font-label-sm">{badge}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </PageTransition>
  );
}
