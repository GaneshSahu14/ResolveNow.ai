import { useState } from "react";
import { Navigate, useNavigate, Link } from "react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signUp, useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import ErrorAlert from "@/components/ErrorAlert";
import ErrorMessage from "@/components/ErrorMessage";
import { Loader2, Sparkles, ArrowRight, CheckCircle2, Users, BarChart3, BookOpen, Star } from "lucide-react";
import { PageTransition } from "../components/PageTransition";
import { motion } from "framer-motion";

const signupSchema = z
  .object({
    name: z.string().min(1, "Full name is required"),
    email: z.email("Please enter a valid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type SignupFormData = z.infer<typeof signupSchema>;

interface StrengthResult {
  score: number;
  label: string;
  segments: number;
  labelColor: string;
}

function getPasswordStrength(password: string): StrengthResult {
  if (!password) return { score: 0, label: "", segments: 0, labelColor: "text-slate-600" };
  
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", segments: 1, labelColor: "text-rose-400" };
  if (score === 2) return { score, label: "Fair", segments: 2, labelColor: "text-amber-400" };
  if (score === 3) return { score, label: "Good", segments: 3, labelColor: "text-blue-400" };
  return { score, label: "Strong", segments: 4, labelColor: "text-emerald-400" };
}

const segmentColors = ["bg-rose-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

const benefits = [
  { icon: Users, text: "Unlimited agent seats on Pro plan", color: "text-blue-400" },
  { icon: BarChart3, text: "Advanced analytics & reporting", color: "text-violet-400" },
  { icon: BookOpen, text: "AI knowledge base auto-sync", color: "text-cyan-400" },
];

const testimonials = [
  { name: "Sarah K.", role: "Head of Support", company: "TechFlow", rating: 5, text: "Cut our ticket resolution time by 60% in the first month." },
];

export default function SignupPage() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password", "");
  const strength = getPasswordStrength(passwordValue);

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
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data: SignupFormData) => {
    setServerError("");

    const { error } = await signUp.email({
      email: data.email,
      password: data.password,
      name: data.name,
    });

    if (error) {
      setServerError(error.message ?? "Registration failed");
      return;
    }

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
          <div className="absolute top-[10%] right-[5%] w-[50%] h-[50%] bg-violet-600/12 rounded-full blur-[100px] animate-glow-pulse pointer-events-none" />
          <div className="absolute bottom-[15%] left-[5%] w-[40%] h-[40%] bg-cyan-600/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute top-[55%] left-[30%] w-[30%] h-[30%] bg-indigo-600/8 rounded-full blur-[80px] pointer-events-none" />

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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                <span className="text-[11px] font-label-sm uppercase tracking-[0.12em] text-violet-400">Free 14-Day Trial</span>
              </div>
              <h2 className="text-[38px] font-bold tracking-tight leading-tight text-white">
                Start for free.<br />
                <span className="gradient-text">Scale with confidence.</span>
              </h2>
              <p className="text-[15px] text-slate-500 leading-relaxed max-w-sm">
                Join hundreds of support teams using ResolveNow.ai to resolve tickets faster, reduce burnout, and delight customers.
              </p>
            </div>

            <div className="space-y-3">
              {benefits.map((b, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05] hover:border-white/[0.08] transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                    <b.icon className={`w-4 h-4 ${b.color}`} />
                  </div>
                  <span className="text-[13px] text-slate-300">{b.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Testimonial */}
            {testimonials.map((t, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.4 }}
                className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-3"
              >
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-[13px] text-slate-300 leading-relaxed italic">"{t.text}"</p>
                <div>
                  <p className="text-[12px] font-semibold text-slate-200">{t.name}</p>
                  <p className="text-[10px] text-slate-600 font-label-sm">{t.role} · {t.company}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom footer */}
          <div className="relative z-10">
            <p className="text-[11px] text-slate-700">© 2025 ResolveNow.ai · No credit card required</p>
          </div>
        </div>

        {/* ── Right Form Panel ──────────────────────────────────────── */}
        <div className="flex-1 flex items-center justify-center px-6 py-10 relative overflow-y-auto">
          
          {/* Mobile background glows */}
          <div className="absolute inset-0 lg:hidden">
            <div className="absolute top-[15%] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-violet-600/8 blur-[100px] pointer-events-none" />
          </div>

          <div className="w-full max-w-[420px] relative z-10 py-4">
            
            {/* Mobile logo */}
            <div className="lg:hidden flex flex-col items-center mb-7">
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
              <div className="mb-6">
                <h1 className="text-[26px] font-bold tracking-tight text-white leading-tight">Create your account</h1>
                <p className="text-[13px] text-slate-500 mt-1.5">Start your free 14-day trial. No credit card required.</p>
              </div>

              {/* Form card */}
              <div className="relative group">
                <div className="absolute -inset-px bg-gradient-to-br from-violet-500/20 via-indigo-500/10 to-cyan-500/15 rounded-2xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                
                <div className="auth-panel rounded-2xl p-7 relative">
                  
                  <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    {serverError && (
                      <ErrorAlert message={serverError} className="mb-2" />
                    )}
                    
                    {/* Full Name */}
                    <div className="space-y-1.5">
                      <Label htmlFor="name" className="text-[12px] font-semibold text-slate-400 uppercase tracking-[0.06em] font-label-sm">
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        type="text"
                        className="input-premium h-10 rounded-xl text-[13px] bg-white/[0.04] border-white/10 text-slate-100 placeholder:text-slate-600 focus-visible:ring-indigo-500/25 focus-visible:border-indigo-500/40"
                        placeholder="John Doe"
                        {...register("name")}
                      />
                      {errors.name && (
                        <ErrorMessage message={errors.name.message} />
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <Label htmlFor="email" className="text-[12px] font-semibold text-slate-400 uppercase tracking-[0.06em] font-label-sm">
                        Work Email
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

                    {/* Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="password" className="text-[12px] font-semibold text-slate-400 uppercase tracking-[0.06em] font-label-sm">
                        Password
                      </Label>
                      <Input
                        id="password"
                        type="password"
                        className="input-premium h-10 rounded-xl text-[13px] bg-white/[0.04] border-white/10 text-slate-100 placeholder:text-slate-600 focus-visible:ring-indigo-500/25 focus-visible:border-indigo-500/40"
                        placeholder="Min. 8 characters"
                        {...register("password")}
                      />

                      {/* Segmented strength bar */}
                      {passwordValue && (
                        <div className="space-y-1.5 mt-2">
                          <div className="flex gap-1">
                            {[0, 1, 2, 3].map((seg) => (
                              <div
                                key={seg}
                                className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                                  seg < strength.segments
                                    ? segmentColors[strength.segments - 1]
                                    : "bg-white/[0.07]"
                                }`}
                              />
                            ))}
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[10px] text-slate-600 font-label-sm">Password strength</span>
                            <span className={`text-[10px] font-label-sm font-semibold ${strength.labelColor}`}>
                              {strength.label}
                            </span>
                          </div>
                        </div>
                      )}
                      {errors.password && (
                        <ErrorMessage message={errors.password.message} />
                      )}
                    </div>

                    {/* Confirm Password */}
                    <div className="space-y-1.5">
                      <Label htmlFor="confirmPassword" className="text-[12px] font-semibold text-slate-400 uppercase tracking-[0.06em] font-label-sm">
                        Confirm Password
                      </Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        className="input-premium h-10 rounded-xl text-[13px] bg-white/[0.04] border-white/10 text-slate-100 placeholder:text-slate-600 focus-visible:ring-indigo-500/25 focus-visible:border-indigo-500/40"
                        placeholder="Repeat your password"
                        {...register("confirmPassword")}
                      />
                      {errors.confirmPassword && (
                        <ErrorMessage message={errors.confirmPassword.message} />
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
                          Creating account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </Button>

                    <p className="text-[10px] text-slate-700 text-center leading-relaxed">
                      By creating an account you agree to our{" "}
                      <span className="text-slate-600 hover:text-slate-400 cursor-pointer transition-colors">Terms of Service</span>
                      {" "}and{" "}
                      <span className="text-slate-600 hover:text-slate-400 cursor-pointer transition-colors">Privacy Policy</span>.
                    </p>
                  </form>

                  <div className="mt-4 pt-4 border-t border-white/[0.06] text-center">
                    <p className="text-[12px] text-slate-600">
                      Already have an account?{" "}
                      <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                        Sign in
                      </Link>
                    </p>
                  </div>
                </div>
              </div>

              {/* Trust indicators */}
              <div className="mt-5 flex items-center justify-center gap-4 flex-wrap">
                {["14-day free trial", "No credit card", "Cancel anytime"].map((badge) => (
                  <div key={badge} className="flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
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
